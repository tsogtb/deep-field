import { integrateSemiImplicitEuler } from "../../../dist/physics/mechanics/integrators.js";
import { syncParticlesToBuffer, toFloat32 } from "../../../dist/physics/util/buffers.js";
import { BoxWireframe, helix, Path1D } from "../../../geometry/path1d.js";
import { Sphere3D } from "../../../geometry/shapes3d.js";
import { simulationClock } from "../../app/simulation_clock.js";
import { COLORS } from "../../data/colors.js";


/* ---------------------------------------------
 * High-Performance Spatial Hash
 * --------------------------------------------- */
class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  _key(x, y, z) {
    const gx = Math.floor(x / this.cellSize) | 0;
    const gy = Math.floor(y / this.cellSize) | 0;
    const gz = Math.floor(z / this.cellSize) | 0;
    return (gx * 73856093) ^ (gy * 19349663) ^ (gz * 83492791);
  }

  clear() { this.grid.clear(); }

  add(x, y, z, id) {
    const key = this._key(x, y, z);
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key).push(id);
  }

  getNeighbors(x, y, z) {
    const gx = Math.floor(x / this.cellSize);
    const gy = Math.floor(y / this.cellSize);
    const gz = Math.floor(z / this.cellSize);
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const key = this._key((gx+i)*this.cellSize, (gy+j)*this.cellSize, (gz+k)*this.cellSize);
          const cell = this.grid.get(key);
          if (cell) neighbors.push(...cell);
        }
      }
    }
    return neighbors;
  }
}

/* ---------------------------------------------
 * Constants & Config
 * --------------------------------------------- */

const SPHERE_COUNT = 1000;
const LINE_COUNT = 1000;
const ARC_COUNT = 1000;
const HELIX_COUNT = 2000;
const TRIANGLE_COUNT = 2000;
const regionCounts = [
  //SPHERE_COUNT,
  //LINE_COUNT,
  //ARC_COUNT,
  //HELIX_COUNT,
  TRIANGLE_COUNT,
]
const TOTAL_COUNT = regionCounts.reduce((sum, n) => sum + n, 0); 


const BOND_LENGTH = 0.3;
const INTERACTION_RADIUS = 1.155;
const CONFIG = {
  DT: 0.016,
  BOND_STRENGTH: 120.0,
  BENDING_STRENGTH: 25.0,  
  VISCOSITY: 0.8,      
  OPTIMAL_DIST: 0.95,
  FORCE_STRENGTH: 129.0,  
  REPULSION_K: 40.0,    
  JITTER: 0.02,        
};



// ---------------------------------------------
// HP Sequence Generation
// ---------------------------------------------
const charges = new Float32Array(TOTAL_COUNT);
for (let i = 0; i < TOTAL_COUNT; i++) {
  //charges[i] = (Math.floor(i / 2) % 2 === 0) ? 1.0 : 0.0;
  charges[i] = (Math.random() > 0.6) ? 1.0 : 0.0;
}

const colors = new Float32Array(TOTAL_COUNT * 3); 

for (let i = 0; i < TOTAL_COUNT; i++) {
  const isHydrophobic = charges[i] > 0.5;

  if (isHydrophobic) {
    // Hydrophobic = red/orange
    colors[i*3 + 0] = COLORS.SUNSET_ORANGE_CORE[0];
    colors[i*3 + 1] = COLORS.SUNSET_ORANGE_CORE[1];
    colors[i*3 + 2] = COLORS.SUNSET_ORANGE_CORE[2];
    
  } else {
    // Polar = blue/cyan
    colors[i*3 + 0] = COLORS.UV_CORE[0];
    colors[i*3 + 1] = COLORS.UV_CORE[1];
    colors[i*3 + 2] = COLORS.UV_CORE[2];
    
  }
}


const hash = new SpatialHash(INTERACTION_RADIUS);

const Initializers = {
  randomChain: (count, len) => {
    const pos = [[0,0,0]];
    for (let i = 1; i < count; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(2 * Math.random() - 1);
      pos.push([
        pos[i-1][0] + Math.sin(theta) * Math.cos(phi) * len,
        pos[i-1][1] + Math.sin(theta) * Math.sin(phi) * len,
        pos[i-1][2] + Math.cos(theta) * len
      ]);
    }
    return pos;
  },
};

const radius = 50
const triSide = Math.sqrt(3) * radius; // side length
const triangleWireframe = new Path1D([
  { start: { x: -triSide / 2, y: -radius / 2, z: -15 }, end: { x: triSide / 2, y: -radius / 2, z: -15 } },
  { start: { x: triSide / 2, y: -radius / 2, z: -15 }, end: { x: 0, y: radius, z: -15 } },
  { start: { x: 0, y: radius, z: -15 }, end: { x: -triSide / 2, y: -radius / 2, z: -15 } }
]);

const regions = [
  /*
  //new Sphere3D({ x: 0.0, y: 0.0, z: 0.0 }, 100),
  new Path1D([ 
    {start: {x: -30.0, y: 0.0, z: 0.0}, end: {x: 0.0, y: 0.0, z: 0.0}}
  ]),
  new Path1D([
    {center: { x: 0.0, y: -10.0, z: 0.0 }, radius: 10.0}
  ]),
  /*
  new Path1D([
    helix({center: {x: 0.0, y: 0.0, z: 0.0, }, radius: 5, height: 250, turns: 5})
  ])
  */
  triangleWireframe,
]


const BiologyInitializers = {
  randomTree: () => {
    simState.position = toFloat32(
      Initializers.randomChain(TOTAL_COUNT, BOND_LENGTH)
    );
    simState.velocity.fill(0);
    simState.t = 0;
  },

  uniformTorus: () => {
    const R = 9; // major radius
    const r = 3;  // minor radius
    const pos = [];
  
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const t = (i / TOTAL_COUNT) * 2 * Math.PI * 9; // 3 loops
      const u = (i / TOTAL_COUNT) * 2 * Math.PI;     // rotation around minor radius
  
      const x = (R + r * Math.cos(u)) * Math.cos(t);
      const y = (R + r * Math.cos(u)) * Math.sin(t);
      const z = r * Math.sin(u);
  
      pos.push([x, y, z]);
    }
    
    simState.position = toFloat32(pos);
    simState.velocity.fill(0);
    simState.t = 0;
  },

  uniformHelix: () => {
    const radius = 10;        // helix radius
    const turns = 30;         // number of full 360° turns
    const height = 30; // approximate helix height
  
    const pos = [];
  
    // Angle increment per residue
    const dTheta = (2 * Math.PI * turns) / TOTAL_COUNT;
    const dz = height / TOTAL_COUNT;
  
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const theta = i * dTheta;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      const z = i * dz;
  
      pos.push([x, y, z]);
    }
  
    simState.position = toFloat32(pos);
    simState.velocity.fill(0);
    simState.t = 0;
  },
  
  
  
};



const initialPos = [];
//const initialVel = [];

for (let i = 0; i < regionCounts.length; i++) {
  for (let j = 0; j < regionCounts[i]; j++) {
    const p = regions[i].sample();
    initialPos.push([p.x, p.y, p.z]);
  }
}

const simState = {
  t: 0.0,
  count: TOTAL_COUNT,
  position: toFloat32(Initializers.randomChain(TOTAL_COUNT, BOND_LENGTH)),
  //position: toFloat32(initialPos),
  velocity: toFloat32(new Array(TOTAL_COUNT).fill([0,0,0])),
  acceleration: new Float32Array(TOTAL_COUNT * 3),
  charge: charges,
};

/* ---------------------------------------------
 * HP Force Field Logic
 * --------------------------------------------- */
function proteinForceField(state) {
  const { count, position, velocity, acceleration, charge } = state;
  acceleration.fill(0);

  hash.clear();
  for (let i = 0; i < count; i++) {
    hash.add(position[i*3], position[i*3+1], position[i*3+2], i);
  }

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    /* Solvent pressure 
    const centripetalForce = 0.1; 
    acceleration[idx]   -= position[idx]   * centripetalForce;
    acceleration[idx+1] -= position[idx+1] * centripetalForce;
    acceleration[idx+2] -= position[idx+2] * centripetalForce;
    */
    // A. Damping & Thermal Jitter (Brownian Motion)
    for (let d = 0; d < 3; d++) {
      acceleration[idx+d] -= velocity[idx+d] * CONFIG.VISCOSITY;
      acceleration[idx+d] += (Math.random() - 0.5) * CONFIG.JITTER;
    }

    // B. HP Non-Bonded Interactions
    const neighbors = hash.getNeighbors(position[idx], position[idx+1], position[idx+2]);
    for (const j of neighbors) {
      if (j <= i + 4) continue; // Skip local sequence neighbors

      const jdx = j * 3;
      const dx = position[jdx] - position[idx];
      const dy = position[jdx+1] - position[idx+1];
      const dz = position[jdx+2] - position[idx+2];
      const d2 = dx*dx + dy*dy + dz*dz;

      if (d2 < INTERACTION_RADIUS * INTERACTION_RADIUS) {
        const dist = Math.sqrt(d2) + 1e-6;
        let f = 0;

        // Steric Repulsion (Always happens if too close)
        if (dist < CONFIG.OPTIMAL_DIST) {
          f = (dist - CONFIG.OPTIMAL_DIST) * CONFIG.REPULSION_K;
        } 
        // Hydrophobic Attraction (Only between H-H pairs)
        else if (charge[i] > 0.5 && charge[j] > 0.5) {
          f = (dist - CONFIG.OPTIMAL_DIST) * CONFIG.FORCE_STRENGTH;
        }

        const mag = f / dist;
        acceleration[idx] += dx * mag;
        acceleration[idx+1] += dy * mag;
        acceleration[idx+2] += dz * mag;
        acceleration[jdx] -= dx * mag;
        acceleration[jdx+1] -= dy * mag;
        acceleration[jdx+2] -= dz * mag;
      }
    }

    // C. Chain Topology (Harmonic Bonds & Persistence Length)
    if (i < count - 1) {
      const nIdx = (i + 1) * 3;
      const dx = position[nIdx] - position[idx];
      const dy = position[nIdx+1] - position[idx+1];
      const dz = position[nIdx+2] - position[idx+2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 1e-6;
      const stretch = (dist - BOND_LENGTH) * CONFIG.BOND_STRENGTH / dist;

      acceleration[idx] += dx * stretch;
      acceleration[idx+1] += dy * stretch;
      acceleration[idx+2] += dz * stretch;
      acceleration[nIdx] -= dx * stretch;
      acceleration[nIdx+1] -= dy * stretch;
      acceleration[nIdx+2] -= dz * stretch;

      // Persistence bending
      if (i > 0) {
        const pIdx = (i - 1) * 3;
        const midX = (position[pIdx] + position[nIdx]) * 0.5;
        const midY = (position[pIdx+1] + position[nIdx+1]) * 0.5;
        const midZ = (position[pIdx+2] + position[nIdx+2]) * 0.5;
        acceleration[idx] += (midX - position[idx]) * CONFIG.BENDING_STRENGTH;
        acceleration[idx+1] += (midY - position[idx+1]) * CONFIG.BENDING_STRENGTH;
        acceleration[idx+2] += (midZ - position[idx+2]) * CONFIG.BENDING_STRENGTH;
      }
    }
  }
}

function centerOfMass(state) {
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < state.count; i++) {
    cx += state.position[i*3];
    cy += state.position[i*3+1];
    cz += state.position[i*3+2];
  }
  cx /= state.count; cy /= state.count; cz /= state.count;
  for (let i = 0; i < state.count; i++) {
    state.position[i*3] -= cx;
    state.position[i*3+1] -= cy;
    state.position[i*3+2] -= cz;
  }
}

/* ---------------------------------------------
 * Scene Export
 * --------------------------------------------- */
export const proteinFoldingDemoConfig = {

  updateSequence(pattern) {
    const { count, charge } = simState;
    
    for (let i = 0; i < count; i++) {
      let val = 0;
      switch (pattern) {
        case 'alt1': val = (i % 2 === 0) ? 1.0 : 0.0; break;
        case 'alt2': val = (Math.floor(i / 2) % 2 === 0) ? 1.0 : 0.0; break;
        case 'alt4': val = (Math.floor(i / 4) % 2 === 0) ? 1.0 : 0.0; break;
        case 'rand50': val = Math.random() > 0.5 ? 1.0 : 0.0; break;
        case 'rand60': val = Math.random() > 0.4 ? 1.0 : 0.0; break; // 60% H
        case 'rand40': val = Math.random() > 0.6 ? 1.0 : 0.0; break; // 40% H
      }
      charge[i] = val;

      // Update color buffer immediately
      const isH = val > 0.5;
      colors[i * 3 + 0] = isH ? COLORS.SUNSET_ORANGE_CORE[0] : COLORS.UV_CORE[0]; // R
      colors[i * 3 + 1] = isH ? COLORS.SUNSET_ORANGE_CORE[1] : COLORS.UV_CORE[1]; // G
      colors[i * 3 + 2] = isH ? COLORS.SUNSET_ORANGE_CORE[2] : COLORS.UV_CORE[2]; // B
    }
  },

  reinitialize(mode, currentSequence) {
    BiologyInitializers[mode]?.();
    this.updateSequence(currentSequence)
  },

  name: "proteinFoldingDemo",
  brush: "physics",
  config: {
    samplers: [
      () => ( { x: 0, y: 0, z: 0 } ),
    ],
    counts: [
      TOTAL_COUNT,
    ],
    sceneColors: [
      COLORS.UV_CORE,
    ],
  },

  animate: (pointData, time, mat4) => {
    centerOfMass(simState);

    if (simulationClock.running) {
      proteinForceField(simState);
      integrateSemiImplicitEuler(simState, CONFIG.DT);
      simState.t += CONFIG.DT;
    }

    if (pointData[0]?.buffer) {
      syncParticlesToBuffer(simState, pointData[0].buffer);

      pointData[0].colorBuffer = colors;
    }
    if (pointData[0]) {
      mat4.identity(pointData[0].modelMatrix);
    }
  },
};