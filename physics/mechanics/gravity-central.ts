import { Derivative } from "../core/derivative"
import { ParticleState } from "../core/state"
import { Vec3, length, scale } from "../math/vec3"

const G = 1.0

export function gravityCentral(M: number): Derivative<ParticleState> {
  return (state: ParticleState, t: number) => {
    const acceleration: Vec3[] = state.position.map((p) => {
      const d = length(p)
      if (d === 0) return [0, 0, 0] //avoid division by zero

      const factor = -G * M / (d * d * d)
      return scale(p, factor)
    })
    return { acceleration }
  }
}