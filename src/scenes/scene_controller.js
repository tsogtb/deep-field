import { getSceneConfig, SCENES } from "./scene_manager.js";
import { createPointData } from "../data/point_data.js";

export class SceneController {
  constructor(regl) {
    this.regl = regl;

    this.currentSceneIndex = 0;
    this.currentBrush = "star";
    this.pointData = [];

    this.showGizmo = false;

    // Scene is intentionally not auto-loaded here
    // Routing / AppController controls initial scene
  }

  /* --- Scene navigation --- */
  
  setSceneByName(name) {
    this.goToScene({ name, reason: "direct" });
  }

  nextScene() {
    this.goToScene({
      index: this.currentSceneIndex + 1,
      reason: "cycle",
    });
  }

  goToScene({ index = null, name = null, reason = "unknown" } = {}) {
    let targetIndex = index;

    if (name !== null) {
      targetIndex = SCENES.findIndex(scene => scene.name === name);
    }

    if (targetIndex == null || targetIndex === -1) {
      console.warn(
        `Scene not found (${name ?? index}), falling back to index 0`
      );
      targetIndex = 0;
    }

    this._loadScene(targetIndex);
    this._onSceneChanged(reason);
  }

  /* --- Scene loading --- */

  _loadScene(index) {
    this._destroyPointBuffers();

    this.currentSceneIndex = index % SCENES.length;
    const scene = getSceneConfig(this.currentSceneIndex);

    if (scene.brush) {
      this.currentBrush = scene.brush;
    }

    this.pointData = createPointData(this.regl, scene.config);
  }

  _destroyPointBuffers() {
    for (const obj of this.pointData) {
      obj.buffer?.destroy();
      obj.colorBuffer?.destroy();
    }
  }

  /* --- Scene state hooks --- */

  _onSceneChanged(reason) {
    const scene = this.getCurrentScene();

    if (this.showGizmo === undefined) {
      this.showGizmo = scene.hideGizmo ? false : true;
    }

    // Reserved:
    // - camera transitions
    // - UI state sync
    // - analytics / logging
  }

  /* --- Brush control --- */

  swapBrush() {
    const brushes = ["basic", "circle", "square", "star", "physics", "geometry"];
    const idx = brushes.indexOf(this.currentBrush);

    this.currentBrush = brushes[(idx + 1) % brushes.length];
  }

  /* --- Debug / helpers --- */

  toggleGizmo() {
    this.showGizmo = !this.showGizmo;
  }

  getCurrentScene() {
    return getSceneConfig(this.currentSceneIndex);
  }
}
