import { Derivative } from "../core/derivative.js";
import { ParticleState } from "../core/state.js";
import { add, scale } from "../math/vec3.js";

export function integrateEulerParticles(
  state: ParticleState,
  deriv: Derivative<ParticleState>,
  dt: number,
): ParticleState {
  const { acceleration = [] } = deriv(state, state.t);

  // 1. Update Velocity first
  const velocity = state.velocity.map((v, i) =>
    acceleration[i] ? add(v, scale(acceleration[i], dt)) : v
  );

  // 2. USE THE NEW VELOCITY to update position
  // (In standard Euler, this would have used state.velocity[i])
  const position = state.position.map((p, i) => 
    add(p, scale(velocity[i], dt))
  );

  return {
    ...state,
    t: state.t + dt,
    position,
    velocity,
    acceleration
  };
}