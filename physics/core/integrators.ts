import { Derivative } from "./derivative";
import { BaseState } from "./state";

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