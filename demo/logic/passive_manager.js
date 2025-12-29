import { createPassiveLayer } from "../data/passive_layer.js";

export class PassiveManager {
  constructor(regl) {
    this.regl = regl;
    this.layers = [];
    this.isVisible = true;
  }

  init() {
    this.layers = createPassiveLayer(this.regl);
  }

  destroy() {
    this.layers.forEach(layer => {
      layer.buffer?.destroy();
      layer.colorBuffer?.destroy();
    });
    this.layers = [];
  }

  setVisibility(visible) {
    this.isVisible = visible;
  }

  getVisibleLayers() {
    return this.isVisible ? this.layers : [];
  }
}