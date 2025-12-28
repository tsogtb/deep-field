import { Derivative } from "../core/derivative.js"
import { ParticleState } from "../core/state.js"
import { Vec3, length, scale } from "../math/vec3.js"

const G = 1.0
const EPS = 0.1; // Softening factor: prevents infinite force

export function gravityCentral(M: number): Derivative<ParticleState> {
  return (state: ParticleState, t: number) => {
    const acceleration: Vec3[] = state.position.map((p) => {
      //const d = length(p)
      //if (d === 0) return [0, 0, 0] //avoid division by zero
      const x = p[0], y = p[1], z = p[2];
      const d2 = x*x + y*y + z*z + (EPS * EPS);
      const d = Math.sqrt(d2);
      const factor = -G * M / (d2 * d2 * d)
      return scale(p, factor)
    })
    return { acceleration }
  }
}