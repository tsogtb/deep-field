import { ParticleState } from "../core/state.js";


export function syncParticlesToBuffer(
  state: ParticleState,
  buffer: { subdata(data: Float32Array): void }
): void {

  buffer.subdata(state.position);
}

export function toFloat32(vecs: [number, number, number][]): Float32Array {
  const arr = new Float32Array(vecs.length * 3);
  
  for (let i = 0; i < vecs.length; i++) {
    const idx = i * 3;
    
    arr[idx + 0] = vecs[i][0];
    arr[idx + 1] = vecs[i][1];
    arr[idx + 2] = vecs[i][2];
  }
  return arr;
}