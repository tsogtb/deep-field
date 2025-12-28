import { Derivative } from "../core/derivative"
import { ParticleState } from "../core/state"
import { Vec3, length, scale } from "../math/vec3"

const G = 1.0 //for now

// const G = 6.67430e-11
/**
 * Tip: Start with G = 1 and scale masses and positions for visibility. You can always switch to “real physics units” later.
 * 
 * A derivative is the source of change. You can overwrite fields if your system fully defines them. If multiple sources exist, sum their contributions.
 */

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

// G * M *m / (r^2) => a = G*M/(r^2) 
// assuming M sits at the origin

/**
 * 2. Time step dt and precision

Euler integration is first-order. Its error is proportional to 
dt
dt per step.

Smaller dt → more precise integration

Larger dt → bigger errors, possible instabilities

Compared to what?

Compare dt to the timescale of the fastest motion in your system.

Example: if the particle is orbiting at velocity ~1, radius ~1, orbital period ~6.28 (2π), then dt = 0.01 is ~1/600 of a full orbit → small enough for Euler.

If dt is too large, the orbit spirals out/in instead of being stable.

Rule of thumb:

Start small (0.001–0.01)

Watch motion visually

Increase dt until error becomes noticeable

Later, you can switch to Verlet or RK4 for more stability with larger dt.
 */