/**
 * BaseState
 * The foundational requirement for any temporal simulation.
 * * Logic: Tracking absolute time 't' is essential for handling 
 * time-dependent forces and maintaining synchronization across 
 * different integrators.
 */
export interface BaseState {
  t: number;
}

/**
 * ParticleState
 * A high-performance state container designed for N-body simulations.
 * * * Design Strategy: Structure of Arrays (SoA).
 * Instead of storing particles as individual objects, this interface 
 * packs all kinematic data into flat Float32Arrays. 
 * * * Performance: This layout ensures "Cache Locality." When the CPU 
 * loads a position coordinate, the neighboring coordinates are pulled 
 * into the L1 cache automatically, drastically reducing memory latency.
 */
export interface ParticleState extends BaseState {
  /** The total number of particles managed by this state. */
  count: number;      

  /** * Flat buffer of 3D coordinates: [x0, y0, z0, x1, y1, z1, ...]
   * Units: Meters (m)
   */
  position: Float32Array; 

  /** * Flat buffer of 3D vectors: [vx0, vy0, vz0, ...]
   * Units: Meters per second (m/s)
   */
  velocity: Float32Array;

  /** * Flat buffer of 3D vectors: [ax0, ay0, az0, ...]
   * Units: Meters per second squared (m/s²)
   */
  acceleration: Float32Array;

  /** Optional scalar properties stored in parallel flat buffers. */
  mass?: Float32Array;   // Units: Kilograms (kg)
  charge?: Float32Array; // Units: Coulombs (C)
}