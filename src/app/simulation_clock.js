export class SimulationClock {
  constructor() {
    this.running = false;
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  toggle() {
    this.running = !this.running;
  }
}

export const simulationClock = new SimulationClock();
