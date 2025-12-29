/**
 * TrailBuffer
 * Manages a fixed-length history of particle positions for visualization.
 * * Logic: Instead of storing the "Whole History," we maintain a 
 * "Rolling Window" of the last N frames. 
 * * Performance: We pre-allocate the memory once. As the simulation 
 * progresses, we overwrite the oldest frame with the latest data.
 */
export class TrailBuffer {
  private history: Float32Array[];
  private cursor: number = 0;
  private isFull: boolean = false;

  constructor(particleCount: number, private maxLength: number) {
    // Pre-allocate N buffers to avoid mid-simulation garbage collection
    this.history = Array.from({ length: maxLength }, () => 
      new Float32Array(particleCount * 3)
    );
  }

  /**
   * pushSnapshot
   * Copies the current state positions into the history ring.
   */
  pushSnapshot(currentPositions: Float32Array) {
    // Copy current positions into the buffer at the current cursor
    this.history[this.cursor].set(currentPositions);

    // Advance cursor and wrap around
    this.cursor = (this.cursor + 1) % this.maxLength;
    if (this.cursor === 0) this.isFull = true;
  }

  /**
   * getHistory
   * Returns the frames in order from oldest to newest.
   */
  getOrderedHistory(): Float32Array[] {
    if (!this.isFull) return this.history.slice(0, this.cursor);
    
    // Combine the two halves of the ring buffer to get chronological order
    return [
      ...this.history.slice(this.cursor),
      ...this.history.slice(0, this.cursor)
    ];
  }
}