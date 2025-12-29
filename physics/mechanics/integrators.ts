import { ParticleState } from "../core/state.js";

/**
 * integrateSemiImplicitEuler
 * A high-performance, symplectic integrator designed specifically for N-body kinematics.
 * * * Logic: Unlike standard "Explicit" Euler, this method updates velocity FIRST, 
 * then uses that updated velocity to calculate the new position.
 * * * Stability: This specific ordering makes the integrator "Symplectic," meaning 
 * it conserves energy much better than standard Euler. It prevents systems 
 * like orbiting planets or oscillating springs from "exploding" or gaining 
 * unphysical energy over time.
 * * * Performance: Directly mutates Float32Array buffers. By processing XYZ 
 * components in a single loop, it maximizes CPU cache efficiency and 
 * maintains zero memory allocation during the physics step.
 */
export function integrateSemiImplicitEuler(
  state: ParticleState,
  dt: number
): void {
  // Destructuring existing buffers to local variables for faster access 
  // and cleaner loop logic.
  const { position, velocity, acceleration, count } = state;

  for (let i = 0; i < count; i++) {
    // Each particle occupies 3 slots in the flat buffer (X, Y, Z).
    const idx = i * 3;

    // 1. Velocity Update: v(t + dt) = v(t) + a(t) * dt
    // We integrate the current acceleration into the momentum.
    velocity[idx]     += acceleration[idx]     * dt;
    velocity[idx + 1] += acceleration[idx + 1] * dt;
    velocity[idx + 2] += acceleration[idx + 2] * dt;

    // 2. Position Update: p(t + dt) = p(t) + v(t + dt) * dt
    // CRITICAL: We use the NEW velocity (calculated above) for this step.
    // This implicit feedback loop is what provides the increased stability.
    position[idx]     += velocity[idx]     * dt;
    position[idx + 1] += velocity[idx + 1] * dt;
    position[idx + 2] += velocity[idx + 2] * dt;
  }
}