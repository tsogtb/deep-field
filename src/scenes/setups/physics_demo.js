import { integrateSemiImplicitEuler } from "../../../dist/physics/mechanics/integrators.js";
import { gravityCentral } from "../../../dist/physics/mechanics/gravity-central.js";
import { syncParticlesToBuffer, toFloat32 } from "../../../dist/physics/util/buffers.js";
import { Sphere3D } from "../../../geometry/shapes3d.js";
import { Circle2D } from "../../../geometry/shapes2d.js"; 
import { COLORS } from "../../data/colors.js";
import { RotatedShape } from "../../../geometry/composites.js";

/* ---------------------------------------------
 * Horizon (wide circular ring)
 * --------------------------------------------- */

const HORIZON_RADIUS = 500.0;
const HORIZON_COUNT = 10000;

const horizon = new RotatedShape( new Circle2D(
  { x: 0, y: 0, z: 0 },
  HORIZON_RADIUS,
  HORIZON_RADIUS-50,
), Math.PI / 2, 0, 0);


/* ---------------------------------------------
 * Particle config (unchanged)
 * --------------------------------------------- */

const TOTAL_COUNT = 13000;
const SEGMENT_COUNT = 4;
const COUNT_PER_SEGMENT = TOTAL_COUNT / SEGMENT_COUNT;

const CONFIG = {
  MASS: 700.0,
  DT: 0.016,
  COLORS: [
    COLORS.BLUE_CORE,
    //COLORS.SUNSET_ORANGE_CORE,
    COLORS.UV_CORE,
    COLORS.CYAN_CORE,
    COLORS.SILVER_CORE,
  ]
};

/* ---------------------------------------------
 * Initial regions
 * --------------------------------------------- */

const regions = Array.from({ length: SEGMENT_COUNT }, () =>
  new Sphere3D({ x: 6.5, y: 0.0, z: 0.0 }, 0.0001)
);

const initialPos = [];
const initialVel = [];

const cx = 0, cy = 0, cz = 0;

const ORBITAL_SCALE = [1.0, 1.25, 1.0, -0.9];

const segmentNormals = Array.from({ length: SEGMENT_COUNT }, () => {
  const u = Math.random() * 2 - 1;
  const phi = Math.random() * 2 * Math.PI;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(phi), s * Math.sin(phi), u];
});

/* ---------------------------------------------
 * Particle generation
 * --------------------------------------------- */

for (let r = 0; r < SEGMENT_COUNT; r++) {
  const [Lx, Ly, Lz] = segmentNormals[r];

  for (let i = 0; i < COUNT_PER_SEGMENT; i++) {
    const p = regions[r].sample();
    initialPos.push([p.x, p.y, p.z]);

    const dx = p.x - cx;
    const dy = p.y - cy;
    const dz = p.z - cz;

    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;

    const rx = dx / dist;
    const ry = dy / dist;
    const rz = dz / dist;

    let tx = Ly * rz - Lz * ry;
    let ty = Lz * rx - Lx * rz;
    let tz = Lx * ry - Ly * rx;

    const tLen = Math.sqrt(tx * tx + ty * ty + tz * tz) + 1e-6;
    tx /= tLen; ty /= tLen; tz /= tLen;

    const vCirc = Math.sqrt(CONFIG.MASS / dist);
    const vr = (Math.random() * 2 - 1) * 0.05;
    const noise = 0.15;
    const scale = ORBITAL_SCALE[r];

    initialVel.push([
      tx * vCirc * scale + rx * vr + (Math.random() * 2 - 1) * noise,
      ty * vCirc * scale + ry * vr + (Math.random() * 2 - 1) * noise,
      tz * vCirc * scale + rz * vr + (Math.random() * 2 - 1) * noise
    ]);
  }
}

/* ---------------------------------------------
 * Simulation state
 * --------------------------------------------- */

const simState = {
  t: 0.0,
  count: TOTAL_COUNT,
  position: toFloat32(initialPos),
  velocity: toFloat32(initialVel),
  acceleration: new Float32Array(TOTAL_COUNT * 3)
};

const gravity = gravityCentral(CONFIG.MASS);

/* ---------------------------------------------
 * Scene config (GRID REMOVED, HORIZON ADDED)
 * --------------------------------------------- */

export const orbitSceneConfig = {
  name: "spaghettiSimulation",
  brush: "geometry",

  config: {
    samplers: [
      ...Array(SEGMENT_COUNT).fill(() => ({ x: 0, y: 0, z: 0 })),
      () => horizon.sample()
    ],

    counts: [
      ...Array(SEGMENT_COUNT).fill(COUNT_PER_SEGMENT),
      HORIZON_COUNT
    ],

    sceneColors: [
      ...CONFIG.COLORS,
      COLORS.NEUTRAL_HAZE, // horizon
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

    // Horizon (static)
    if (pointData[SEGMENT_COUNT]) {
      mat4.identity(pointData[SEGMENT_COUNT].modelMatrix);
    }

    simState.t += CONFIG.DT;
  }
};
