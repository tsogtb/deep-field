import { vec3 } from "https://esm.sh/gl-matrix";

const moveScratch = { move: vec3.create(), roll: 0, level: false };


/**
 * Generates a normalized movement vector and roll for the current controller type.
 * Supports FreeFly and Orbit seamlessly.
 */
export function getMovementVector(InputState, camera, out = moveScratch) {
  const { move } = out;
  vec3.set(move, 0, 0, 0);
  out.roll = 0;
  out.level = InputState.keys.has("KeyR");

  if (camera.controller?.constructor.name === "FreeFlyController") {
    if (InputState.keys.has("KeyW")) vec3.add(move, move, camera.getForward());
    if (InputState.keys.has("KeyS")) vec3.sub(move, move, camera.getForward());
    if (InputState.keys.has("KeyD")) vec3.add(move, move, camera.getRight());
    if (InputState.keys.has("KeyA")) vec3.sub(move, move, camera.getRight());
    if (InputState.keys.has("Space")) vec3.add(move, move, camera.getUp());
    if (InputState.keys.has("ShiftLeft")) vec3.sub(move, move, camera.getUp());
  }
  else if (camera.controller?.constructor.name === "OrbitController") {
    if (InputState.keys.has("KeyW")) move[2] -= 1;
    if (InputState.keys.has("KeyS")) move[2] += 1;
    if (InputState.keys.has("KeyA")) camera.controller.theta -= 0.05;
    if (InputState.keys.has("KeyD")) camera.controller.theta += 0.05;
  }

  if (vec3.length(move) > 0) vec3.normalize(move, move);

  if (InputState.keys.has("KeyQ")) out.roll -= 1;
  if (InputState.keys.has("KeyE")) out.roll += 1;
  if (camera.controller?.constructor.name !== "FreeFlyController") out.roll = 0;

  if (InputState.keys.has("KeyO")) camera.isReturning = true;

  return out; // reuse the object
}

