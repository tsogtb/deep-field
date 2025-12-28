import { mat4 } from "https://esm.sh/gl-matrix";

export function animatePassiveObjects(passiveObjects, time) {
  passiveObjects.forEach(obj => {
    mat4.identity(obj.modelMatrix);

    if (obj.id === "snow") {
      const yOffset = -((time * 1.5) % 10.0);
      mat4.translate(obj.modelMatrix, obj.modelMatrix, [0, yOffset, 0]);
    }

    if (obj.id === "stars") {
      mat4.rotateY(obj.modelMatrix, obj.modelMatrix, time * 0.02);
    }
  });
}