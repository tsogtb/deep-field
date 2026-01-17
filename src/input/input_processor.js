import { vec3 } from "https://esm.sh/gl-matrix";

// Reusable scratch object to avoid allocations each frame
const moveScratch = { move: vec3.create(), roll: 0, level: false };

/**
 * Computes the movement vector and roll for the current camera controller.
 * Supports both FreeFly and Orbit controllers seamlessly.
 *
 * @param {object} InputState - The current input state (keys, mouse, etc.)
 * @param {Camera} camera - The camera instance
 * @param {object} out - Optional reusable output object
 * @returns {object} - { move: vec3, roll: number, level: boolean }
 */
export function getMovementVector(InputState, camera, out = moveScratch) {
  const { move } = out;
  vec3.set(move, 0, 0, 0);
  out.roll = 0;
  out.level = InputState.keys.has("KeyR");
  out.mouse = InputState.mouse;

  const controllerName = camera.controller?.constructor.name;

  // --- FreeFly movement ---
  if (controllerName === "FreeFlyController") {
    if (InputState.keys.has("KeyW")) vec3.add(move, move, camera.getForward());
    if (InputState.keys.has("KeyS")) vec3.sub(move, move, camera.getForward());
    if (InputState.keys.has("KeyD")) vec3.add(move, move, camera.getRight());
    if (InputState.keys.has("KeyA")) vec3.sub(move, move, camera.getRight());
    if (InputState.keys.has("Space")) vec3.add(move, move, camera.getUp());
    if (InputState.keys.has("ShiftLeft")) vec3.sub(move, move, camera.getUp());
  }

  // --- Orbit movement ---
  else if (controllerName === "OrbitController") {
    if (InputState.keys.has("KeyW")) move[2] -= 1;
    if (InputState.keys.has("KeyS")) move[2] += 1;
    if (InputState.keys.has("KeyA")) camera.controller.theta -= 0.05;
    if (InputState.keys.has("KeyD")) camera.controller.theta += 0.05;
  }

  // Normalize the vector if non-zero
  if (vec3.length(move) > 0) vec3.normalize(move, move);

  // Roll keys (only for FreeFly)
  if (controllerName === "FreeFlyController") {
    if (InputState.keys.has("KeyQ")) out.roll -= 1;
    if (InputState.keys.has("KeyE")) out.roll += 1;
  } else {
    out.roll = 0;
  }

  // Trigger camera return
  if (InputState.keys.has("KeyO")) camera.isReturning = true;

  return out; // reuses the same object each frame
}
