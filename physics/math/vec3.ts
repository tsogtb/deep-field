/**
 * Vec3
 * A polymorphic type representing a 3D vector.
 * * Logic: It can be a simple literal [x, y, z], a native Array, or a 
 * view into a larger Float32Array (like a slice of the ParticleState).
 */
export type Vec3 = [number, number, number] | Float32Array | number[];

/**
 * add
 * Performs component-wise addition of two 3D vectors.
 * * Logic: Result = [a.x + b.x, a.y + b.y, a.z + b.z].
 * * Use Case: Adding a constant offset to a position or combining forces.
 */
export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * subtract
 * Performs component-wise subtraction (a - b).
 * * Logic: Geometrically, this computes the vector pointing FROM b TO a.
 * * Use Case: Calculating the distance vector between two particles 
 * for gravitational or spring force calculations.
 */
export function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}



/**
 * scale
 * Multiplies a vector by a scalar magnitude.
 * * Logic: Multiplies each component (x, y, z) by s.
 * * Use Case: Scaling a unit direction by a force magnitude or 
 * multiplying velocity by delta-time (dt).
 */
export function scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

/**
 * length
 * Calculates the Euclidean magnitude of the vector.
 * * Logic: Uses Math.hypot(x, y, z) to compute the square root of the 
 * sum of squares.
 * * Performance: Math.hypot is preferred over manual calculation as it 
 * prevents overflow/underflow errors for very large or small values.
 */
export function length(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}