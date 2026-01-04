export class TrailBuffer {
  private history: Float32Array[];
  private cursor: number = 0;
  private isFull: boolean = false;

  constructor(particleCount: number, private maxLength: number) {
    
    this.history = Array.from({ length: maxLength }, () => 
      new Float32Array(particleCount * 3)
    );
  }

  pushSnapshot(currentPositions: Float32Array) {
    
    this.history[this.cursor].set(currentPositions);

    this.cursor = (this.cursor + 1) % this.maxLength;
    if (this.cursor === 0) this.isFull = true;
  }

  getOrderedHistory(): Float32Array[] {
    if (!this.isFull) return this.history.slice(0, this.cursor);
    
    return [
      ...this.history.slice(this.cursor),
      ...this.history.slice(0, this.cursor)
    ];
  }
}