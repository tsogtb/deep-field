import { Derivative } from "../core/derivative.js"
import { ParticleState } from "../core/state.js"

const G = 1.0;

const EPS = 0.00001; 

export function gravityCentral(M: number): Derivative<ParticleState> {
  return (state: ParticleState, t: number) => {
    const { position, acceleration, count } = state;
    const epsSq = EPS * EPS;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = position[idx];
      const y = position[idx + 1];
      const z = position[idx + 2];

      const r2 = x*x + y*y + z*z + epsSq;
      const r = Math.sqrt(r2);
      
      const strength = -(G * M) / (r2 * r);

      acceleration[idx]     = x * strength;
      acceleration[idx + 1] = y * strength;
      acceleration[idx + 2] = z * strength;
    }

    return { acceleration };
  }
}