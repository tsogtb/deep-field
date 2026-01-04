import { integrateSemiImplicitEuler } from "/deep-field/dist/physics/mechanics/integrators.js";
import { vectorField, vortexField } from "/deep-field/dist/physics/fields/vector-field.js"; 
import { syncParticlesToBuffer, toFloat32 } from "/deep-field/dist/physics/util/buffers.js";
import { Path1D } from "/deep-field/geometry/path1d.js";

const SEGMENT_COUNT = 301;
const TOTAL_COUNT = 150500; // ~500 particles per strand to maintain performance
const COUNT_PER_SEGMENT = Math.floor(TOTAL_COUNT / SEGMENT_COUNT);

const CONFIG = {
  VORTEX_STRENGTH: 20.4,
  DT: 0.016,
  // High-fidelity natural gradient
  COLORS: Array.from({ length: SEGMENT_COUNT }, (_, i) => {
    const centerIdx = (SEGMENT_COUNT - 1) / 2;
    const distFromCenter = Math.abs(i - centerIdx) / centerIdx;
    
    // Bell curve for highlights: 1.0 at center, 0.0 at edges
    const highlight = Math.pow(1 - distFromCenter, 3.0); 
    
    return [
      0.22 + (0.78 * highlight), // Red: Dark chocolate to bright gold
      0.10 + (0.55 * highlight), // Green: Deep depth to warm amber
      0.03 + (0.07 * highlight)  // Blue: Minimal blue for organic warmth
    ];
  })
};

/* ------------------------------------------------------------------ */
/* Generate 301 Lines with Wide Y-Spread                              */
/* ------------------------------------------------------------------ */

const regions = [];
const ySpread = 4.0; // Increased spread for a wide "curtain" effect
const spacing = ySpread / SEGMENT_COUNT;

for (let i = 0; i < SEGMENT_COUNT; i++) {
  const offset = (i - (SEGMENT_COUNT - 1) / 2) * spacing;
  
  regions.push(new Path1D([{ 
    start: { x: -6, y: offset, z: 0 }, // Slightly longer lines (x: -6 to 6)
    end:   { x: 6,  y: offset, z: 0 } 
  }]));
}

/* ------------------------------------------------------------------ */
/* Initial State                                                      */
/* ------------------------------------------------------------------ */

const initialPos = [];
const initialVel = [];

for (let r = 0; r < SEGMENT_COUNT; r++) {
  for (let i = 0; i < COUNT_PER_SEGMENT; i++) {
    const p = regions[r].sample();
    initialPos.push([p.x, p.y, p.z]);
    initialVel.push([0.0, 0.0, 0.0]); 
  }
}

const simState = {
  t: 0.0,
  count: TOTAL_COUNT,
  position: toFloat32(initialPos),
  velocity: toFloat32(initialVel),
  acceleration: new Float32Array(TOTAL_COUNT * 3)
};

// Wide radius for the vortex to capture the spread-out lines
const vortex = vectorField(vortexField(CONFIG.VORTEX_STRENGTH, 5000.0));

/* ------------------------------------------------------------------ */
/* Scene Config                                                       */
/* ------------------------------------------------------------------ */

export const vortexOnlySceneConfig = {
  name: "vortexOnlySceneConfig",
  brush: "square",
  config: {
    samplers: Array(SEGMENT_COUNT).fill(() => ({ x: 0, y: 0, z: 0 })),
    counts: Array(SEGMENT_COUNT).fill(COUNT_PER_SEGMENT),
    sceneColors: CONFIG.COLORS
  },
  
  animate: (pointData, time, mat4) => {
    vortex(simState, simState.t);
    integrateSemiImplicitEuler(simState, CONFIG.DT);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      if (pointData[i]?.buffer) {
        const offset = i * COUNT_PER_SEGMENT * 3;
        const segmentState = {
          count: COUNT_PER_SEGMENT,
          position: simState.position.subarray(offset, offset + COUNT_PER_SEGMENT * 3),
          velocity: simState.velocity.subarray(offset, offset + COUNT_PER_SEGMENT * 3)
        };
        syncParticlesToBuffer(segmentState, pointData[i].buffer);
        mat4.identity(pointData[i].modelMatrix);
      }
    }
    simState.t += CONFIG.DT;
  }
};