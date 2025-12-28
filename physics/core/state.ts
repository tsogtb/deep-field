import { Vec3 } from "../math/vec3"

// Time belongs to all states.
export interface BaseState {
  t: number //simulation time
}

/**
 * position and velocity are mandatory
 * acceleration is optional (computed by dynamics)
 * mass, charge are optional properties, not behavior
 * this already covers, gravity, EM, ray packets, test particles in fields
 */
export interface ParticleState extends BaseState {
  position: Vec3[]
  velocity: Vec3[]
  acceleration?: Vec3[]
  
  mass?: number[]
  charge?: number[]
}

/**
 * Because integrators don’t care what physics you’re doing

An integrator only needs to know:

which quantities evolve

how derivatives map to updates
Derivative<ParticleState> → { acceleration }
Derivative<WaveState> → { phase }
 */
