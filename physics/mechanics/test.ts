import { Derivative } from "../core/derivative";
import { ParticleState } from "../core/state";
import { gravityCentral } from "./gravity-central";
import { integrateEulerParticles } from "./integrators";

const MASS = 1.0
const dt = 0.01
const elapsedTime = 1.0

let state: ParticleState = {
  t: 0.0,
  position: [[0, 0, 1]],
  velocity: [[1, 0, 0]],
}

const deriv: Derivative<ParticleState> = gravityCentral(MASS)



/**
 * 3. Optional: storing states for visualization

If you want to render the trajectory or color-code speed later:
 */
const trail: ParticleState[] = [state]


while (state.t < elapsedTime) {
  // Compute derivative and advance state by dt
  state = integrateEulerParticles(state, deriv, dt)
  trail.push(state)
}

/**
 * dt = 0.01 is fine for simple unit-mass orbits.

If you increase MASS or want faster motion, reduce dt or switch to Verlet/RK4 for stability.
 */

//https://en.wikipedia.org/wiki/Three-body_problem#/media/File:5_4_800_36_downscaled.gif