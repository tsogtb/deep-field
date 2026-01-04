import { EllipsoidSector3D } from "../../../geometry/shapes3d.js";
import { Path1D, helix, bezierQuadratic } from "../../../geometry/path1d.js";
import { RotatedShape } from "../../../geometry/composites.js";
import { Circle2D } from "../../../geometry/shapes2d.js";
import { vectorField, waveField } from "../../../dist/physics/fields/vector-field.js";
import { syncParticlesToBuffer, toFloat32 } from "../../../dist/physics/util/buffers.js";
import { integrateSemiImplicitEuler } from "../../../dist/physics/mechanics/integrators.js";


const WAVE_FREQ = 5.5; 
const WAVE_AMP = 25.0; 

const radialCanals = [];
const numCanals = 8;
const bellHeight = 1.7;
const rimRadius = 1.0;

const tentacles = [];
const numTentacles = 20;
const TENTACLE_RADIUS = 0.03;

const OUTER_BELL_COUNT = 20000;
const INNER_BELL_COUNT = 18000;
const OUTER_RIM_COUNT = 5000;
const INNER_RIM_COUNT = 4000;
const CANAL_COUNT = 1500;
const TENTACLE_COUNT = 1000;

const TOTAL_COUNT = OUTER_BELL_COUNT + INNER_BELL_COUNT + OUTER_RIM_COUNT + INNER_RIM_COUNT
+ CANAL_COUNT*numCanals + TENTACLE_COUNT*numTentacles

const C = {
  BELL_CYAN: [0.0, 0.83, 1.0], 
  RIM_NEON: [0.0, 1.0, 0.9],
  GHOST_WHITE: [0.82, 0.97, 1.0],
  HEART_RED: [1.0, 0.3, 0.43],
  ABYSS_BLUE: [0.0, 0.15, 0.25]
};

// 1. The Bell Shells
// Adjusted to match your rotated orientation
const outerBell = new RotatedShape(
  new EllipsoidSector3D({x: 0, y: 0, z: 0}, 1, 1.7, 1, 0, Math.PI, 0, Math.PI, 0.95, 1.65, 0.95), 
  Math.PI/2, 0, 0
);

const innerBell = new RotatedShape(
  new EllipsoidSector3D({x: 0, y: 0, z: 0}, 0.8, 1.5, 0.8, 0, Math.PI, 0, Math.PI, 0.75, 1.45, 0.75), 
  Math.PI/2, 0, 0
);

const outerRim = new RotatedShape(
  new Circle2D({ x: 0, y: 0, z: 0 }, 1, 0.95)
)
const innerRim = new RotatedShape(
  new Circle2D({ x: 0, y: 0, z: -0.2 }, 0.8, 0.75)
)

// 2. Radial Canals (Replaces bellLine)
// These follow the curvature of the bell from top to rim


for (let i = 0; i < numCanals; i++) {
const angle = (i / numCanals) * Math.PI * 2;
  
  // Terminal point on the rim (XY plane)
  const px = Math.cos(angle) * rimRadius;
  const py = Math.sin(angle) * rimRadius;

  const canalPath = new Path1D([
    bezierQuadratic({
      // P0: The "Apex" or top of the jellyfish
      p0: { x: 0, y: 0, z: bellHeight - 0.3 }, 
      
      // P1: The "Shoulder" control point. 
      // Positioned out and up to give the bell its curved volume.
      p1: { x: px * 1.2, y: py * 1.2, z: bellHeight * 0.8 }, 
      
      // P2: The "Anchor" on the rim
      p2: { x: px, y: py, z: 0 } 
    })
  ]);
  radialCanals.push(canalPath);
}

// 3. Physics-Ready Tentacles
// We use Path1D with conicHelix to create trailing strands



for (let i = 0; i < numTentacles; i++) {
  // We want to distribute them around the rim of the bell
  const angle = (i / numTentacles) * Math.PI * 2;
  
  // Placement on the rim:
  // x: 0 (The open face of your rotated bell)
  // y: sin(angle) * rimRadius
  // z: cos(angle) * rimRadius
  const rimRadius = 0.85;
  const startY = Math.sin(angle) * rimRadius;
  const startZ = Math.cos(angle) * rimRadius;

  const tPath = new Path1D([
    helix({
      center: { x: startY, y: startZ, z: 0 },
      radius: TENTACLE_RADIUS,
      height: -3.5 - Math.random() * 1.0, // Extends "away" from the bell face
      turns: 2.0 + Math.random() * 1.0
    })
  ]);

  // If you need them strictly restricted to the XY plane (flat), 
  // you would set startZ to 0.
  tentacles.push(tPath); 
}

const initialPos = [];
const initialVel = [];

// --- Sampling Logic ---

// 1. Sample Outer Rim
for (let i = 0; i < OUTER_RIM_COUNT; i++) {
  const p = outerRim.sample();
  initialPos.push([p.x, p.y, p.z]);
  initialVel.push([0, 0, 0]);
}

// 2. Sample Inner Rim
for (let i = 0; i < INNER_RIM_COUNT; i++) {
  const p = innerRim.sample();
  initialPos.push([p.x, p.y, p.z]);
  initialVel.push([0, 0, 0]);
}

// 3. Sample Outer Bell Shell
for (let i = 0; i < OUTER_BELL_COUNT; i++) {
  const p = outerBell.sample();
  initialPos.push([p.x, p.y, p.z]);
  initialVel.push([0, 0, 0]);
}

// 4. Sample Inner Bell Shell
for (let i = 0; i < INNER_BELL_COUNT; i++) {
  const p = innerBell.sample();
  initialPos.push([p.x, p.y, p.z]);
  initialVel.push([0, 0, 0]);
}

// 5. Sample Radial Canals
// We iterate through the array of Path1D objects we created earlier
for (let c = 0; c < numCanals; c++) {
  for (let i = 0; i < CANAL_COUNT; i++) {
    const p = radialCanals[c].sample();
    initialPos.push([p.x, p.y, p.z]);
    initialVel.push([0, 0, 0]);
  }
}

// 6. Sample Tentacles
// We iterate through the array of helix Path1D objects
for (let t = 0; t < numTentacles; t++) {
  for (let i = 0; i < TENTACLE_COUNT; i++) {
    const p = tentacles[t].sample();
    initialPos.push([p.x, p.y, p.z]);
    initialVel.push([0, 0, 0]);
  }
}

const simState = {
  t: 0.0,
  count: TOTAL_COUNT,
  position: toFloat32(initialPos),
  velocity: toFloat32(initialVel),
  acceleration: new Float32Array(TOTAL_COUNT * 3)
};

const wave = vectorField(waveField(0.00005, 5.0, 2.0))

const counts = [
  OUTER_RIM_COUNT,
  INNER_RIM_COUNT,
  OUTER_BELL_COUNT,
  INNER_BELL_COUNT,
  ...new Array(numCanals).fill(CANAL_COUNT),
  ...new Array(numTentacles).fill(TENTACLE_COUNT)
];


export const physicsJellyConfig = {
  brush: "circle",
  name: "physicsJellyConfig",
  config: {
    samplers: Array(
      4 + numCanals + numTentacles
    ).fill(() => ({ x: 0, y: 0, z: 0 })),
    counts: [
      OUTER_RIM_COUNT,
      INNER_RIM_COUNT,
      OUTER_BELL_COUNT,
      INNER_BELL_COUNT,
      ...new Array(numCanals).fill(CANAL_COUNT),
      ...new Array(numTentacles).fill(TENTACLE_COUNT)
    ],
    sceneColors: [
      C.ABYSS_BLUE,
      C.HEART_RED,
      C.ABYSS_BLUE, 
      C.ABYSS_BLUE,
      ...new Array(numCanals).fill(C.ABYSS_BLUE),
      ...new Array(numTentacles).fill(C.ABYSS_BLUE)
    ]
  },

  animate: (pointData, time, mat4) => {
    // 1. Apply wave field
    wave(simState, simState.t);
  
    // 2. Integrate physics
    integrateSemiImplicitEuler(simState, 0.016);
  
    // 3. Damping (gentle jelly motion)
    const DAMPING = 0.9;
    for (let i = 0; i < simState.count; i++) {
      const idx = i * 3;
      simState.velocity[idx + 2] *= DAMPING;
    }
  
    // 4. Sync segments → GPU buffers
    let offset = 0;
  
    for (let i = 0; i < counts.length; i++) {
      const count = counts[i];
      const start = offset * 3;
      const end = (offset + count) * 3;
  
      if (pointData[i]?.buffer) {
        syncParticlesToBuffer(
          {
            count,
            position: simState.position.subarray(start, end),
            velocity: simState.velocity.subarray(start, end)
          },
          pointData[i].buffer
        );
      }
  
      if (pointData[i]?.modelMatrix) {
        mat4.identity(pointData[i].modelMatrix);
      }
  
      offset += count;
    }
  
    simState.t += 0.016;
  }
  
};