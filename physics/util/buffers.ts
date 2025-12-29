import { ParticleState } from "../core/state.js";

/**
 * syncParticlesToBuffer
 * Bridges the physical simulation and the rendering pipeline.
 * * * Logic: This function uploads the state's internal Float32Array directly 
 * to a target buffer (such as a WebGL Vertex Buffer). 
 * * * Optimization: Since the 'ParticleState' was refactored to use typed 
 * arrays natively, this operation is "Zero Allocation." It simply passes a 
 * reference to existing memory, allowing for massive particle counts 
 * to be rendered without creating any Garbage Collection (GC) pressure.
 */
export function syncParticlesToBuffer(
  state: ParticleState,
  buffer: { subdata(data: Float32Array): void }
): void {
  // Directly upload the existing typed array. 
  // This is a bulk-copy operation that the GPU can process extremely fast.
  buffer.subdata(state.position);
}



/**
 * toFloat32 (Setup Utility)
 * A conversion helper used to bootstrap the simulation.
 * * * Logic: Converts a user-friendly array of [x, y, z] tuples into the 
 * high-performance flat-buffer format required by the core engine. 
 * * * Strategy: This should only be called during initialization or when 
 * adding new particles. It "unpacks" heap-allocated objects into a 
 * contiguous block of memory to prepare them for the fast-path integrator.
 */
export function toFloat32(vecs: [number, number, number][]): Float32Array {
  // Allocate a single contiguous block of memory.
  const arr = new Float32Array(vecs.length * 3);
  
  for (let i = 0; i < vecs.length; i++) {
    const idx = i * 3;
    // Map individual vector components to the flat array indices.
    arr[idx + 0] = vecs[i][0];
    arr[idx + 1] = vecs[i][1];
    arr[idx + 2] = vecs[i][2];
  }
  return arr;
}