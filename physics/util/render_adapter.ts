import { Vec3 } from "../math/vec3"
import { ParticleState } from "../core/state"

export function toFloat32(vecs: Vec3[]): Float32Array {
  const arr = new Float32Array(vecs.length * 3)
  for (let i = 0; i < vecs.length; i++) {
    arr[i*3 + 0] = vecs[i][0]
    arr[i*3 + 1] = vecs[i][1]
    arr[i*3 + 2] = vecs[i][2]
  }
  return arr
}

function syncParticlesToBuffer(
  state: ParticleState,
  buffer: { subdata(data: Float32Array): void }
) {
  buffer.subdata(toFloat32(state.position))
}