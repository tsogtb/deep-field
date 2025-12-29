import { ParticleState } from "../core/state.js";


export function integrateSemiImplicitEuler(
  state: ParticleState,
  dt: number
): void {

  const { position, velocity, acceleration, count } = state;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;

    velocity[idx]     += acceleration[idx]     * dt;
    velocity[idx + 1] += acceleration[idx + 1] * dt;
    velocity[idx + 2] += acceleration[idx + 2] * dt;

    position[idx]     += velocity[idx]     * dt;
    position[idx + 1] += velocity[idx + 1] * dt;
    position[idx + 2] += velocity[idx + 2] * dt;
  }
}