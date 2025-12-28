export type Vec3 = [number, number, number]

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function scale(v: Vec3, s: number): Vec3 {
  return [v[0]*s, v[1]*s, v[2]*s]
}

export function length(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2])
}

export function negate(v: Vec3): Vec3 {
  return scale(v, -1)
}

export function toFloat32(vecs: Vec3[]): Float32Array {
  const arr = new Float32Array(vecs.length * 3)
  for (let i = 0; i < vecs.length; i++) {
    arr[i*3 + 0] = vecs[i][0]
    arr[i*3 + 1] = vecs[i][1]
    arr[i*3 + 2] = vecs[i][2]
  }
  return arr
}


/**
 * Right now all your functions allocate new arrays.

That’s fine for now.

Later, if you want to optimize:

add(a, b, out?)


But do not do that yet.

Correctness and clarity first.
You can optimize when trails start stuttering.

6. Philosophy checkpoint (important)

Helpers are not unprofessional.
Over-abstraction is.

You’re doing the former, not the latter.

✅ Good abstraction

Names intent

Hides complexity

Improves readability

Reflects physics concepts

❌ Bad abstraction

Adds indirection without reducing complexity

Obscures simple math

Creates dependency chains

Makes debugging harder

Your subtract example falls into the second category.
 */