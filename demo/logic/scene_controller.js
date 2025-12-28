import { getSceneConfig, SCENES } from "./scene_manager.js";
import { createPointData } from "../data/point_data.js";

export class SceneController {
  constructor(regl) {
    this.regl = regl;
    this.currentSceneIndex = 0;
    this.currentBrush = "star";
    this.pointData = [];
    this.loadScene(0);
  }

  loadScene(index) {
    this.pointData.forEach(obj => {
      obj.buffer?.destroy();
      obj.colorBuffer?.destroy();
    });

    this.currentSceneIndex = index % SCENES.length;
    const scene = getSceneConfig(this.currentSceneIndex);

    if (scene.brush) this.currentBrush = scene.brush;
    this.pointData = createPointData(this.regl, scene.config);
  }

  nextScene() {
    this.loadScene(this.currentSceneIndex + 1);
  }

  swapBrush() {
    const brushes = ["basic", "circle", "square", "star"];
    const idx = brushes.indexOf(this.currentBrush);
    this.currentBrush = brushes[(idx + 1) % brushes.length];
  }
}