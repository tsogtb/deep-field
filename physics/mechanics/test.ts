import { Derivative } from "../core/derivative.js";
import { ParticleState } from "../core/state.js";
import { gravityCentral } from "./gravity-central.js";
import { integrateEulerParticles } from "./integrators.js";

const MASS = 1.0
const dt = 0.01
const elapsedTime = 1.0

let state: ParticleState = {
  t: 0.0,
  position: [[0, 0, 1]],
  velocity: [[1, 0, 0]],
}

const deriv: Derivative<ParticleState> = gravityCentral(MASS)

// Trajectory

const trail: ParticleState[] = [state]


while (state.t < elapsedTime) {
  // Compute derivative and advance state by dt
  state = integrateEulerParticles(state, deriv, dt)
  trail.push(state)
}
