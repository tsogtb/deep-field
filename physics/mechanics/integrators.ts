import { Derivative } from "../core/derivative";
import { ParticleState } from "../core/state";
import { add, scale } from "../math/vec3";

export function integrateEulerParticles(
  state: ParticleState,
  deriv: Derivative<ParticleState>,
  dt: number,
): ParticleState {
  const { acceleration = [] } = deriv(state, state.t)

  const velocity = state.velocity.map((v, i) =>
    acceleration[i] ? add(v, scale(acceleration[i], dt)) : v
  )

  const position = state.position.map((p, i) => 
    add(p, scale(velocity[i], dt))
  )

  return {
    ...state,
    t: state.t + dt,
    position,
    velocity,
    acceleration
  }
}