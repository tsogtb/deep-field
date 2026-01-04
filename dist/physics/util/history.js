export class TrailBuffer {
    constructor(particleCount, maxLength) {
        this.maxLength = maxLength;
        this.cursor = 0;
        this.isFull = false;
        this.history = Array.from({ length: maxLength }, () => new Float32Array(particleCount * 3));
    }
    pushSnapshot(currentPositions) {
        this.history[this.cursor].set(currentPositions);
        this.cursor = (this.cursor + 1) % this.maxLength;
        if (this.cursor === 0)
            this.isFull = true;
    }
    getOrderedHistory() {
        if (!this.isFull)
            return this.history.slice(0, this.cursor);
        return [
            ...this.history.slice(this.cursor),
            ...this.history.slice(0, this.cursor)
        ];
    }
}
