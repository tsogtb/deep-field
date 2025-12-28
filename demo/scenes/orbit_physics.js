/* orbit_physics.js */
import { integrateEulerParticles } from "../../dist/physics/mechanics/integrators.js";
import { gravityCentral } from "../../dist/physics/mechanics/gravity-central.js";
import { syncParticlesToBuffer } from "../../dist/physics/util/render_adapter.js";
import { Sphere3D } from "../../geometry/shapes3d.js"; // Assume your geometry code is here

const COUNT = 5000; // Number of particles in the sphere
const CONFIG = {
  MASS: 10.0,
  DT: 0.016,
  COLOR: [0.2, 0.7, 1.0]
};

// 1. Create the Sphere Geometry
// We place it at X=2.5, with a radius of 0.5
const startRegion = new Sphere3D({ x: 2.5, y: 0, z: 0 }, 1.5);

// 2. Initialize simulation arrays
const positions = [];
const velocities = [];

for (let i = 0; i < COUNT; i++) {
  const p = startRegion.sample();
  positions.push([p.x, p.y, p.z]);
  
  // Give them all the circular orbit velocity we calculated (sqrt(10/2.5) = 2.0)
  // Moving in Y direction (Vertical Orbit)
  velocities.push([0.0, 1.0, 0.0]);
}

let simState = {
  t: 0.0,
  position: positions, 
  velocity: velocities, 
};

const deriv = gravityCentral(CONFIG.MASS);

export const orbitSceneConfig = {
  name: "orbitSimulation",
  brush: "star",
  config: {
    // We provide a dummy sampler for the config, 
    // but the actual data comes from our loop above
    samplers: [() => ({ x: 0, y: 0, z: 0 })],
    counts: [COUNT], 
    sceneColors: [CONFIG.COLOR]
  },
  
  animate: (pointData, time, mat4) => {
    // Advance physics for ALL particles at once
    simState = integrateEulerParticles(simState, deriv, CONFIG.DT);

    // Sync the entire array to the GPU
    if (pointData[0]?.buffer) {
      syncParticlesToBuffer(simState, pointData[0].buffer);
    }

    if (pointData[0]) {
      mat4.identity(pointData[0].modelMatrix);
    }
  }
};