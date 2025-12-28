import { Derivative } from "./derivative.js";
import { BaseState } from "./state.js";

export function integrateEuler<S extends BaseState>(
  state: S,
  deriv: Derivative<S>,
  dt: number,
): S {
  const delta = deriv(state, state.t)

  return {
    ...state,
    t: state.t + dt,
    ...delta
  }
}