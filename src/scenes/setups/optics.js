import { Box, air, glass } from "../../../dist/physics/optics/medium.js";
import { syncParticlesToBuffer, toFloat32 } from "../../../dist/physics/util/buffers.js";
import { stepPhotons } from "../../../dist/physics/optics/photon_stepper.js";
import { COLORS } from "../../data/colors.js";
import { Box3D } from "../../../geometry/shapes3d.js";

// -----------------------------
// Define media regions
// -----------------------------
const box1 = new Box({ x: -1, y: -1, z: -1 }, { x: 0, y: 1, z: 1 });
const box2 = new Box({ x: 0, y: -1, z: -1 }, { x: 1, y: 1, z: 1 });

const box1Visual = new Box3D({ x: -0.5, y: 0, z: 0 }, 1, 2, 2)
const box2Visual = new Box3D({ x: 0.5, y: 0, z: 0 }, 1, 2, 2)

const worldMedia = [
  { shape: box1, medium: air },
  { shape: box2, medium: glass },
];

// -----------------------------
// Photon emitter (inside box1)
// -----------------------------
function photonEmitter() {
  // emit photons inside box1
  return {
    x: -0.5 + Math.random() * 0.1,       // inside box1
    y: -0.9 + Math.random() * 1.8,       // y ∈ [-1,1]
    z: -0.9 + Math.random() * 1.8,       // z ∈ [-1,1]
  };
}

// -----------------------------
// Photon state
// -----------------------------
const PHOTON_COUNT = 1000;
const positions = [];
const directions= [];
const energies= [];
const wavelengths = [];
const polarizations = [];
const alive = new Uint8Array(PHOTON_COUNT).fill(1);

for (let i = 0; i < PHOTON_COUNT; i++) {
  // emitter position
  const pos = photonEmitter();
  positions.push([pos.x, pos.y, pos.z]);

  // initial direction along +X
  directions.push([1, 0, 0]);

  energies.push([1]);
  wavelengths.push([550]);
  polarizations.push([1, 0]);
}

const photonState = {
  t: 0,
  count: PHOTON_COUNT,
  position: toFloat32(positions),
  prevPosition: toFloat32(positions),
  direction: toFloat32(directions),
  energy: toFloat32(energies),
  wavelength: toFloat32(wavelengths),
  polarization: toFloat32(polarizations),
  speed: 0.1,
  alive,
  currentMedium: new Uint16Array(PHOTON_COUNT),
};

// -----------------------------
// Initialize currentMedium
// -----------------------------
for (let i = 0; i < PHOTON_COUNT; i++) {
  const pos = {
    x: photonState.position[i * 3],
    y: photonState.position[i * 3 + 1],
    z: photonState.position[i * 3 + 2],
  };
  const region = worldMedia.find(r => r.shape.contains(pos)) ?? worldMedia[0];
  photonState.currentMedium[i] = worldMedia.indexOf(region);
}

// -----------------------------
// Optics scene config
// -----------------------------
export const opticsConfig = {
  name: "opticsSceneConfig",
  brush: "basic",
  config: {
    samplers: [
      () => ({ x: 0, y: 0, z: 0 }),
      () => box1Visual.sample(),
      () => box2Visual.sample(),
    ], // dummy, not used
    counts: [
      PHOTON_COUNT,
      50,
      50,
    ],
    sceneColors: [
      COLORS.SILVER_CORE,
      COLORS.AMBER_CORE,
      COLORS.BRONZE_CORE,
    ],
  },

  animate: (pointData, time, mat4) => {
    
    stepPhotons(photonState, 0.016, worldMedia, {
      min: [-10, -10, -10],
      max: [10, 10, 10],
    });

    
    if (pointData[0]?.buffer) {
      syncParticlesToBuffer(
        { count: photonState.count, position: photonState.position },
        pointData[0].buffer
      );
    }

    if (pointData[0]) mat4.identity(pointData[0].modelMatrix);
  },
};
