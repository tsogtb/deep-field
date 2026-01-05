import { getSceneConfig, SCENES } from "./scene_manager.js";
import { createPointData } from "../data/point_data.js";

export class SceneController {
  constructor(regl) {
    this.regl = regl;
    this.currentSceneIndex = 0;
    this.currentBrush = "star";
    this.pointData = [];
    //this.loadScene(0);

    this.showGizmo = true;
  }

  setSceneByName(name) {
    this.goToScene({ name, reason: "direct" });
  }

  _loadSceneInternal(index) {
    this.pointData.forEach(obj => {
      obj.buffer?.destroy();
      obj.colorBuffer?.destroy();
    });
  
    this.currentSceneIndex = index % SCENES.length;
    const scene = getSceneConfig(this.currentSceneIndex);
  
    if (scene.brush) this.currentBrush = scene.brush;
    this.pointData = createPointData(this.regl, scene.config);
  }

  goToScene({ index = null, name = null, reason = "unknown" } = {}) {
    let targetIndex = index;
  
    if (name !== null) {
      targetIndex = SCENES.findIndex(s => s.name === name);
    }
  
    if (targetIndex == null || targetIndex === -1) {
      console.warn(`Scene not found (${name ?? index}), falling back to 0`);
      targetIndex = 0;
    }
  
    this._loadSceneInternal(targetIndex);
  
    this._onSceneChanged(reason);
  }
  
  _onSceneChanged(reason) {
    const scene = getSceneConfig(this.currentSceneIndex);
  
    // Default state
    this.showGizmo = true;
  
    if (scene.hideGizmo) {
      this.showGizmo = false;
    }
  
    // Later:
    // camera transitions
    // UI state
    // analytics
  }
  
  

  nextScene() {
    this.goToScene({ index: this.currentSceneIndex + 1, reason: "cycle" });
  }

  swapBrush() {
    const brushes = ["basic", "circle", "square", "star", "physics"];
    const idx = brushes.indexOf(this.currentBrush);
    this.currentBrush = brushes[(idx + 1) % brushes.length];
  }

  toggleGizmo() {
    this.showGizmo = !this.showGizmo;
  }

  getCurrentScene() {
    return getSceneConfig(this.currentSceneIndex);
  }
  
}


