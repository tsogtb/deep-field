import { integrateSemiImplicitEuler } from "../../dist/physics/mechanics/integrators.js";
import { gravityCentral } from "../../dist/physics/mechanics/gravity-central.js";
import { syncParticlesToBuffer, toFloat32 } from "../../dist/physics/util/buffers.js";
import { Sphere3D } from "../../geometry/shapes3d.js";

const COUNT = 20000;
const CONFIG = {
  MASS: 50.0,
  DT: 0.016,
  COLOR: [0.2, 0.7, 1.0]
};

const startRegion = new Sphere3D({ x: 3.5, y: 0, z: 0 }, 1.5);
const startRegion_0 = new Sphere3D({ x: -3.5, y: 0, z: 0 }, 1.5);
const initialPos = [];
const initialVel = [];

for (let i = 0; i < COUNT/2; i++) {
  const p = startRegion.sample();
  initialPos.push([p.x, p.y, p.z]);
  initialVel.push([0.0, 2.0, 0.0]);
}

for (let i = 0; i < COUNT/2; i++) {
  const p = startRegion_0.sample();
  initialPos.push([p.x, p.y, p.z]);
  initialVel.push([0.0, -2.0, 0.0]);
}

const simState = {
  t: 0.0,
  count: COUNT,
  position: toFloat32(initialPos),
  velocity: toFloat32(initialVel),
  acceleration: new Float32Array(COUNT * 3)
};

const gravity = gravityCentral(CONFIG.MASS);

export const orbitSceneConfig = {
  name: "orbitSimulation",
  brush: "square",
  config: {
    samplers: [() => ({ x: 0, y: 0, z: 0 })],
    counts: [COUNT],
    sceneColors: [CONFIG.COLOR]
  },
  
  animate: (pointData, time, mat4) => {

    gravity(simState, simState.t);

    integrateSemiImplicitEuler(simState, CONFIG.DT);

    if (pointData[0]?.buffer) {
      syncParticlesToBuffer(simState, pointData[0].buffer);
    }

    if (pointData[0]) {
      mat4.identity(pointData[0].modelMatrix);
    }
  }
};