import { integrateSemiImplicitEuler } from "../../dist/physics/mechanics/integrators.js";
import { gravityCentral } from "../../dist/physics/mechanics/gravity-central.js";
import { syncParticlesToBuffer, toFloat32 } from "../../dist/physics/util/buffers.js";
import { Path1D } from "../../geometry/path1d.js";

const TOTAL_COUNT = 20000;
const SEGMENT_COUNT = 5;
const COUNT_PER_SEGMENT = TOTAL_COUNT / SEGMENT_COUNT;

const CONFIG = {
  MASS: 700.0, // High mass for strong "spaghettification"
  DT: 0.016,
  COLORS: [
    [1.0, 0.647, 0.1], // Orange
    [0.2, 1.0, 0.4],   // Green
    [1.0, 0.2, 0.2],   // Red
    [0.1, 0.8, 1.0],   // Cyan
    [0.8, 0.1, 1.0],   // Purple
  ]
};

// Define 5 vertical lines staggered in the negative X/positive Y quadrant
const regions = [
  new Path1D([{ start: { x: -12.0, y: 2, z: 0 }, end: { x: -12.0, y: 8, z: 0 } }]),
  new Path1D([{ start: { x: -11.0, y: 2, z: 0 }, end: { x: -11.0, y: 8, z: 0 } }]),
  new Path1D([{ start: { x: -10.0, y: 2, z: 0 }, end: { x: -10.0, y: 8, z: 0 } }]),
  new Path1D([{ start: { x: -9.0, y: 2, z: 0 }, end: { x: -9.0, y: 8, z: 0 } }]),
  new Path1D([{ start: { x: -8.0, y: 2, z: 0 }, end: { x: -8.0, y: 8, z: 0 } }])
];

const initialPos = [];
const initialVel = [];

for (let r = 0; r < SEGMENT_COUNT; r++) {
  for (let i = 0; i < COUNT_PER_SEGMENT; i++) {
    const p = regions[r].sample();
    initialPos.push([p.x, p.y, p.z]);

    const vX = 2.5; 
    const vY = -4.0; 
    
    initialVel.push([vX, vY, 0.0]);
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
  brush: "square",
  config: {
    samplers: Array(SEGMENT_COUNT).fill(() => ({ x: 0, y: 0, z: 0 })),
    counts: Array(SEGMENT_COUNT).fill(COUNT_PER_SEGMENT),
    sceneColors: CONFIG.COLORS
  },
  
  animate: (pointData, time, mat4) => {
    gravity(simState, simState.t);
    integrateSemiImplicitEuler(simState, CONFIG.DT);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      if (pointData[i]?.buffer) {
        const segmentState = {
          count: COUNT_PER_SEGMENT,
          position: simState.position.subarray(i * COUNT_PER_SEGMENT * 3, (i + 1) * COUNT_PER_SEGMENT * 3),
          velocity: simState.velocity.subarray(i * COUNT_PER_SEGMENT * 3, (i + 1) * COUNT_PER_SEGMENT * 3)
        };
        syncParticlesToBuffer(segmentState, pointData[i].buffer);
      }
      if (pointData[i]) {
        mat4.identity(pointData[i].modelMatrix);
      }
    }
    simState.t += CONFIG.DT;
  }
};