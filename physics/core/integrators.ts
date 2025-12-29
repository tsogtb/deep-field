import { Derivative } from "./derivative.js";
import { BaseState } from "./state.js";


export function integrateEuler<S extends BaseState>(
  state: S,
  deriv: Derivative<S>,
  dt: number,
): void {
  
  const delta = deriv(state, state.t);

  state.t += dt;

  for (const key in delta) {
    const change = (delta as any)[key];
    const target = (state as any)[key];

    if (change instanceof Float32Array && target instanceof Float32Array) {
      for (let i = 0; i < target.length; i++) {
        target[i] += change[i] * dt;
      }
    }
  }
}