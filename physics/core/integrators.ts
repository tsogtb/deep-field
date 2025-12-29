import { Derivative } from "./derivative.js";
import { BaseState } from "./state.js";

/**
 * integrateEuler
 * * The most fundamental numerical integration method, refactored for 
 * high-performance buffer mutation.
 * * * Logic: This function performs a first-order approximation of a 
 * system's future state. It samples the current rate of change 
 * (the derivative) and projects it forward by a fixed time step (dt).
 * * * Optimization: Unlike standard implementations that return a new 
 * state object, this version mutates existing Float32Arrays in-place. 
 * This effectively eliminates Garbage Collection (GC) overhead, 
 * allowing for thousands of updates per second without frame-rate stutters.
 */
export function integrateEuler<S extends BaseState>(
  state: S,
  deriv: Derivative<S>,
  dt: number,
): void {
  
  // 1. Sample the system's "slope" or rate of change at the current time.
  const delta = deriv(state, state.t);

  // 2. Step the simulation clock forward.
  state.t += dt;

  // 3. Apply changes to the State's memory buffers.
  // We iterate through the 'delta' object returned by the derivative. 
  // If a property corresponds to a typed array, we perform bulk addition.
  for (const key in delta) {
    const change = (delta as any)[key];
    const target = (state as any)[key];

    // High-performance path: Direct Float32Array mutation.
    // This allows the engine to handle huge datasets (like 100k particles)
    // by keeping the math localized to contiguous memory blocks.
    if (change instanceof Float32Array && target instanceof Float32Array) {
      for (let i = 0; i < target.length; i++) {
        target[i] += change[i] * dt;
      }
    }
  }
}