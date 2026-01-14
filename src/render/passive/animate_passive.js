import { mat4 } from "https://esm.sh/gl-matrix";

export function animatePassiveObjects(passiveObjects, time) {
  passiveObjects.forEach(obj => {
    mat4.identity(obj.modelMatrix);
  });
}