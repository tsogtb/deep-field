import { integrateSemiImplicitEuler } from "../../../dist/physics/mechanics/integrators.js";
import { syncParticlesToBuffer, toFloat32 } from "../../../dist/physics/util/buffers.js";
import { helix, Path1D } from "../../../geometry/path1d.js";
import { Sphere3D } from "../../../geometry/shapes3d.js";
import { simulationClock } from "../../app/simulation_clock.js";
import { COLORS } from "../../data/colors.js";

/* ---------------------------------------------
 * Constants & Config
 * --------------------------------------------- */
const TOTAL_COUNT = 1000;
const BOND_LENGTH = 0.5;
const INTERACTION_RADIUS = 1.55;

const CONFIG = {
  DT: 0.008,
  BOND_STRENGTH: 1005.0,
  BENDING_STRENGTH: 0.1,
  VISCOSITY: 10.5,       
  OPTIMAL_DIST: 0.55,    
  FORCE_STRENGTH: 222.2,  
  REPULSION_K: 8.0,
  SOLVENT_PRESSURE: 0.0
};

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

const initialPos = Initializers.randomChain(TOTAL_COUNT, BOND_LENGTH);

const simState = {
  t: 0.0,
  count: TOTAL_COUNT,
  position: toFloat32(initialPos),
  velocity: toFloat32(new Array(TOTAL_COUNT).fill([0,0,0])),
  acceleration: new Float32Array(TOTAL_COUNT * 3),
};


function proteinForceField(state) {
  const { count, position, velocity, acceleration } = state;
  acceleration.fill(0);

  hash.clear();
  for (let i = 0; i < count; i++) {
    hash.add(position[i*3], position[i*3+1], position[i*3+2], i);
  }

  for (let i = 0; i < count; i++) {
    const idx = i * 3;

    // A. Damping & Global Centering (Simulates Hydrophobic Collapse)
    for (let d = 0; d < 3; d++) {
      acceleration[idx+d] -= velocity[idx+d] * CONFIG.VISCOSITY;
      acceleration[idx+d] -= position[idx+d] * CONFIG.SOLVENT_PRESSURE;
    }

    // B. Optimized Non-Bonded Neighbors
    const neighbors = hash.getNeighbors(position[idx], position[idx+1], position[idx+2]);
    for (const j of neighbors) {
      if (j <= i + 2) continue; // Skip self and immediate neighbors

      const jdx = j * 3;
      const dx = position[jdx] - position[idx];
      const dy = position[jdx+1] - position[idx+1];
      const dz = position[jdx+2] - position[idx+2];
      const d2 = dx*dx + dy*dy + dz*dz;

      if (d2 < INTERACTION_RADIUS * INTERACTION_RADIUS) {
        const dist = Math.sqrt(d2) + 1e-6;
        const f = (dist < CONFIG.OPTIMAL_DIST) 
            ? (CONFIG.OPTIMAL_DIST - dist) * -CONFIG.REPULSION_K 
            : (CONFIG.OPTIMAL_DIST - dist) * -CONFIG.FORCE_STRENGTH;
        
        const mag = f / dist;
        acceleration[idx] -= dx * mag;
        acceleration[idx+1] -= dy * mag;
        acceleration[idx+2] -= dz * mag;
        acceleration[jdx] += dx * mag;
        acceleration[jdx+1] += dy * mag;
        acceleration[jdx+2] += dz * mag;
      }
    }

    // C. Chain Topology (Bonds & Bending)
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

const BiologyInitializers = {
  circle: () => {
    const pos = [];
    const radius = 3;
    
    // How many times the ring waves up and down
    const waveCount = 4; 
    // How far it moves out of the plane (keep it subtle)
    const waveAmplitude = 1.5; 

    for (let i = 0; i < TOTAL_COUNT; i++) {
      const theta = (i / TOTAL_COUNT) * 2 * Math.PI;
      
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      
      // The wave logic: trace Z based on theta
      const z = Math.sin(theta * waveCount) * waveAmplitude;
  
      pos.push([x, y, z]);
    }
  
    simState.position = toFloat32(pos);
    simState.velocity.fill(0);
    simState.t = 0;
  },
  trefoil: () => {
    const pos = [];
    const scale = 4.0;
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const t = (i / TOTAL_COUNT) * Math.PI * 2;
      const x = Math.sin(t) + 2 * Math.sin(2 * t);
      const y = Math.cos(t) - 2 * Math.cos(2 * t);
      const z = -Math.sin(3 * t);
      pos.push([x * scale, y * scale, z * scale]);
    }
    simState.position = toFloat32(pos);
    simState.velocity.fill(0);
    simState.t = 0;
  },
  random: () => {
    const pos = Initializers.randomChain(TOTAL_COUNT, BOND_LENGTH);
    simState.position = toFloat32(pos);
    simState.velocity.fill(0);
    simState.t = 0;
  }
};


/* ---------------------------------------------
 * Scene config
 * --------------------------------------------- */

export const proteinFoldingExperimentalDemoConfig = {
  
  reinitialize(mode) {
    BiologyInitializers[mode]?.();
  },

  name: "proteinFoldingExperimentalDemo",
  brush: "physics",
  config: {
    samplers: [() => ( { x: 0, y: 0, z: 0 } )],
    counts: [TOTAL_COUNT],
    sceneColors: [COLORS.BLUE_CORE],
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
    }

    if (pointData[0]) {
      mat4.identity(pointData[0].modelMatrix);
    }
    
    
  },
};
