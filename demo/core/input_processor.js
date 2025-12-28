/*
(c) 2025 Tsogt
This code is licensed under the MIT License.
Created: 12/20/2025
Last modified: 12/28/2025
 */

import { vec3 } from "https://esm.sh/gl-matrix";

const moveVec = vec3.create();

export function getMovementVector(InputState, camera) {
  vec3.set(moveVec, 0, 0, 0);

  if (InputState.keys.has("KeyW")) vec3.add(moveVec, moveVec, camera.getForward());
  if (InputState.keys.has("KeyS")) vec3.sub(moveVec, moveVec, camera.getForward());
  if (InputState.keys.has("KeyD")) vec3.add(moveVec, moveVec, camera.getRight());
  if (InputState.keys.has("KeyA")) vec3.sub(moveVec, moveVec, camera.getRight());
  if (InputState.keys.has("Space")) vec3.add(moveVec, moveVec, camera.getUp());
  if (InputState.keys.has("ShiftLeft")) vec3.sub(moveVec, moveVec, camera.getUp());

  if (vec3.length(moveVec) > 0) {
    vec3.normalize(moveVec, moveVec);
  }

  let roll = 0;
  if (InputState.keys.has("KeyQ")) roll -= 1;
  if (InputState.keys.has("KeyE")) roll += 1;

  if (InputState.keys.has("KeyO")) {
    camera.isReturning = true;
  }

  return {
    move: moveVec,
    roll: roll,
    level: InputState.keys.has("KeyR")
  };
}