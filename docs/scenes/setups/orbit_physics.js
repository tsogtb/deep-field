import { integrateSemiImplicitEuler } from "../../../dist/physics/mechanics/integrators.js";
import { gravityCentral } from "../../../dist/physics/mechanics/gravity-central.js";
import { syncParticlesToBuffer, toFloat32 } from "../../../dist/physics/util/buffers.js";
import { Sphere3D } from "../../../geometry/shapes3d.js";
import { Path1D } from "../../../geometry/path1d.js";


// A small, dense sphere at the absolute center
const starManifold = new Sphere3D({ x: 0, y: 0, z: 0 }, 0.1);
const COUNT_FOR_STAR = 500;

// Color Suggestions:
const STAR_COLORS = {
  GOLDEN_GIANT: [1.0, 0.95, 0.7], // Warm bright white
  BLUE_NEUTRON: [0.6, 0.9, 1.0],  // Hot electric blue
  SUPERNOVA:    [1.0, 1.0, 1.0]   // Pure white (maximum brightness)
};

/**
 * Generates a Path1D object representing a grid in the XZ plane.
 * @param {number} size - The total width/depth of the grid.
 * @param {number} steps - How many subdivisions (cells).
 * @param {object} offset - {x, y, z} shift for the grid center.
 */
const createGridManifold = (size = 10, steps = 10, offset = { x: 0, y: 0, z: 0 }) => {
  const segments = [];
  const half = size / 2;
  const stepSize = size / steps;

  for (let i = 0; i <= steps; i++) {
    const coordinate = -half + i * stepSize;

    // Lines parallel to the Z axis (running from -Z to +Z)
    segments.push({
      start: { x: offset.x + coordinate, y: offset.y, z: offset.z - half },
      end:   { x: offset.x + coordinate, y: offset.y, z: offset.z + half }
    });

    // Lines parallel to the X axis (running from -X to +X)
    segments.push({
      start: { x: offset.x - half, y: offset.y, z: offset.z + coordinate },
      end:   { x: offset.x + half, y: offset.y, z: offset.z + coordinate }
    });
  }

  return new Path1D(segments);
};

// Usage:
const myGrid = createGridManifold(500.0, 25); // 5x5 unit grid with 20 subdivisions
const COUNT_FOR_GRID = 200000;



const TOTAL_COUNT = 13000;
const SEGMENT_COUNT = 5;
const COUNT_PER_SEGMENT = TOTAL_COUNT / SEGMENT_COUNT;

const CONFIG = {
  MASS: 700.0,
  DT: 0.016,
  COLORS: [
    [0.40, 0.60, 0.85], // azure blue
    [0.45, 0.80, 0.75], // blue-cyan
    [0.55, 0.75, 0.55], // soft teal
    [0.70, 0.65, 0.45], // muted gold-olive
    [0.65, 0.55, 0.75], // desaturated violet
  ]
};

// Five overlapping manifolds near the origin
const regions = [
  new Sphere3D({ x:  6.5, y:  0.0, z:  0.0 }, 0.15),
  new Sphere3D({ x:  6.5, y:  0.0, z:  0.0 }, 0.15),
  new Sphere3D({ x:  6.5, y:  0.0, z:  0.0 }, 0.15),
  new Sphere3D({ x:  6.5, y:  0.0, z:  0.0 }, 0.15),
  new Sphere3D({ x:  6.5, y:  0.0, z:  0.0 }, 0.15),
];

const initialPos = [];
const initialVel = [];

const cx = 0, cy = 0, cz = 0;

// Angular momentum regimes per segment
const ORBITAL_SCALE = [
  1.0,   // near circular
  0.75,  // elliptical
  1.25,  // wide orbit
  0.4,   // plunging
 -0.9    // retrograde
];

// Generate one angular momentum normal per segment for coherent planes
const segmentNormals = Array.from({ length: SEGMENT_COUNT }, () => {
  const u = Math.random() * 2 - 1;        // cos(theta)
  const phi = Math.random() * 2 * Math.PI;
  const s = Math.sqrt(1 - u*u);
  return [s * Math.cos(phi), s * Math.sin(phi), u]; // unit vector
});

for (let r = 0; r < SEGMENT_COUNT; r++) {
  const Lx = segmentNormals[r][0];
  const Ly = segmentNormals[r][1];
  const Lz = segmentNormals[r][2];

  for (let i = 0; i < COUNT_PER_SEGMENT; i++) {

    const p = regions[r].sample();
    initialPos.push([p.x, p.y, p.z]);

    const dx = p.x - cx;
    const dy = p.y - cy;
    const dz = p.z - cz;

    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 1e-6;

    // Radial unit vector
    const rx = dx / dist;
    const ry = dy / dist;
    const rz = dz / dist;

    // Tangential direction = L × r
    let tx = Ly * rz - Lz * ry;
    let ty = Lz * rx - Lx * rz;
    let tz = Lx * ry - Ly * rx;

    // Normalize tangent
    const tLen = Math.sqrt(tx*tx + ty*ty + tz*tz) + 1e-6;
    tx /= tLen;
    ty /= tLen;
    tz /= tLen;

    // Circular velocity magnitude
    const vCirc = Math.sqrt(CONFIG.MASS / dist);
    const noise = 0.15;
    const scale = ORBITAL_SCALE[r];

    // Add a tiny radial noise for thickness
    const vr = (Math.random() * 2 - 1) * 0.05;

    const vX = tx * vCirc * scale + rx * vr + (Math.random()*2 - 1) * noise;
    const vY = ty * vCirc * scale + ry * vr + (Math.random()*2 - 1) * noise;
    const vZ = tz * vCirc * scale + rz * vr + (Math.random()*2 - 1) * noise;

    initialVel.push([vX, vY, vZ]);
  }
}


const simState = {
  t: 0.0,
  count: TOTAL_COUNT,
  position: toFloat32(initialPos),
  velocity: toFloat32(initialVel),
  acceleration: new Float32Array(TOTAL_COUNT * 3)
};

const gravity = gravityCentral(CONFIG.MASS);

export const orbitSceneConfig = {
  name: "spaghettiSimulation",
  brush: "physics",
  config: {
    samplers: [
      ...Array(SEGMENT_COUNT).fill(() => ({ x: 0, y: 0, z: 0 })),
      () => myGrid.sample(),
      () => starManifold.sample(),
    ],
    counts: [
      ...Array(SEGMENT_COUNT).fill(COUNT_PER_SEGMENT),
      COUNT_FOR_GRID,
      COUNT_FOR_STAR,
    ],
    sceneColors: [
      ...CONFIG.COLORS,
      [0.3, 0.3, 0.3],
      STAR_COLORS.SUPERNOVA,
    ]
  },

  animate: (pointData, time, mat4) => {
    gravity(simState, simState.t);
    integrateSemiImplicitEuler(simState, CONFIG.DT);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      if (pointData[i]?.buffer) {
        syncParticlesToBuffer(
          {
            count: COUNT_PER_SEGMENT,
            position: simState.position.subarray(
              i * COUNT_PER_SEGMENT * 3,
              (i + 1) * COUNT_PER_SEGMENT * 3
            ),
            velocity: simState.velocity.subarray(
              i * COUNT_PER_SEGMENT * 3,
              (i + 1) * COUNT_PER_SEGMENT * 3
            )
          },
          pointData[i].buffer
        );
      }

      if (pointData[i]) {
        mat4.identity(pointData[i].modelMatrix);
      }
    }
    if (pointData[5]) mat4.identity(pointData[5].modelMatrix);
    if (pointData[6]) mat4.identity(pointData[6].modelMatrix);

    simState.t += CONFIG.DT;
  }
};
