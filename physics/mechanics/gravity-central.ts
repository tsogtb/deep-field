import { Derivative } from "../core/derivative.js"
import { ParticleState } from "../core/state.js"

const G = 1.0;
/** * Softening factor: prevents infinite force at the center (r -> 0) 
 * and numerical instability in the integrator.
 */
const EPS = 0.0001; 

/**
Large EPS (0.5 - 1.0): The center feels "soft" and "mushy." Particles glide through the middle smoothly. It looks like a galaxy of gas.

Medium EPS (0.1): The "Standard." It feels like a solid sun. Most particles orbit safely, but some get a nice "swing" when they pass close.

Small EPS (0.01 - 0.005): The "Black Hole." The center is violent and sharp. This brings back your Spaghetti because the "slingshot" force is so high that it overwhelms the integrator's ability to keep the orbit closed.
 */

/**
 * gravityCentral
 * Creates a derivative function that applies a central gravitational pull.
 * * * Logic: Every particle is pulled toward the origin [0, 0, 0] based on 
 * Newton's Law of Universal Gravitation: F = G * (m1 * m2) / r².
 * * * Refactor: Instead of .map(), we use a high-speed for-loop to 
 * update the state.acceleration Float32Array in-place.
 */
export function gravityCentral(M: number): Derivative<ParticleState> {
  return (state: ParticleState, t: number) => {
    const { position, acceleration, count } = state;
    const epsSq = EPS * EPS;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = position[idx];
      const y = position[idx + 1];
      const z = position[idx + 2];

      // Calculate squared distance r² plus softening factor
      const r2 = x*x + y*y + z*z + epsSq;
      const r = Math.sqrt(r2);
      
      /** * Calculate acceleration magnitude: a = (G * M) / r²
       * To get the vector, we multiply the direction (-p/r) by magnitude:
       * a_vec = -p * (G * M) / (r² * r)
       */
      const strength = -(G * M) / (r2 * r);

      // Write directly into the pre-allocated acceleration buffer
      acceleration[idx]     = x * strength;
      acceleration[idx + 1] = y * strength;
      acceleration[idx + 2] = z * strength;
    }

    /** * We return the modified acceleration buffer. 
     * Note: We don't return 'velocity' here because the Integrator 
     * handles p = p + v * dt independently.
     */
    return { acceleration };
  }
}