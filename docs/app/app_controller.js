import { getSceneConfig } from "/deep-field/scenes/scene_manager.js";

const GEOMETRY_SCENES = {
  "manifolds": "geometryManifoldsDemo",
  "union": "geometryUnionDemo",
  "difference": "geometryDifferenceDemo",
  "intersection": "geometryIntersectionDemo",
};

export class AppController {
  constructor({ sceneController, camera, passiveManager, ui }) {
    this.sceneController = sceneController;
    this.camera = camera;
    this.passiveManager = passiveManager;
    this.ui = ui;

    this.mode = "app"; // app | hero | geometry
    this._prevSceneIndex = -1;
    this._prevOverlayVisible = null;
    this._prevPassiveVisible = null;
    this._sceneInfo = null;
    this._prevCameraOverlayVisible = null;
  }

  setMode(mode, geometryMode = "none") {
    this.mode = mode;
    
    if (mode === "hero") {
      this.sceneController.goToScene({ name: "blankScene", reason: "hero" });
      this._hideUI();
      this.sceneController.showGizmo = false;
    } else if (mode === "geometry") {
      this.sceneController.goToScene({ 
        name: GEOMETRY_SCENES[geometryMode] ?? "geometryUnionDemo",
        reason: "geometry"
      });
      this._hideUI();
      this.sceneController.showGizmo = false;
    } else if (mode === "physics") {
      this.sceneController.goToScene({ name: "spaghettiSimulation", reason: "geometry" });
      this._hideUI();
      this.sceneController.showGizmo = false;
    } else if (mode === "app") {
      this.sceneController.goToScene({ index: 0, reason: "startup" });
      this._showUI();
    }
  }
  
  updatePerFrame(time) {
    // --- Cache scene info only when the scene changes ---
    const currentIndex = this.sceneController.currentSceneIndex;
    if (this._prevSceneIndex !== currentIndex) {
      this._sceneInfo = getSceneConfig(currentIndex);
      this._prevSceneIndex = currentIndex;
    }
    const sceneInfo = this._sceneInfo;
    if (!sceneInfo) return;
  
    const { name: sceneName } = sceneInfo;
  
    // --- Determine passive visibility ---
    const showPassive =
      this.mode === "hero"
  
    // Only update if visibility changed
    if (this._prevPassiveVisible !== showPassive) {
      this.passiveManager.setVisibility(showPassive);
      this._prevPassiveVisible = showPassive;
    }
    
    // --- Start overlay visibility ---
    const shouldShowOverlay = this.mode === "app" && sceneName === "blankScene";
  
    if (this.ui.startOverlay && this._prevOverlayVisible !== shouldShowOverlay) {
      this.ui.startOverlay.style.display = shouldShowOverlay ? "block" : "none";
      this._prevOverlayVisible = shouldShowOverlay;
    }
  
    // --- Optional: Gizmo visibility (if toggled by scene) ---
    if (sceneInfo.showGizmo !== undefined && this.sceneController.showGizmo !== sceneInfo.showGizmo) {
      this.sceneController.showGizmo = sceneInfo.showGizmo;
    }
  }
  

  _showUI() {
    document.body.classList.add("ui-ready");
    if (this.camera.overlay && this._prevCameraOverlayVisible !== true) {
      this.camera.overlay.style.display = "block";
      this._prevCameraOverlayVisible = true;
    }
  }
  _hideUI() {
    document.body.classList.remove("ui-ready");
    if (this.ui.startOverlay) this.ui.startOverlay.style.display = "none";
    if (this.camera.overlay && this._prevCameraOverlayVisible !== false) {
      this.camera.overlay.style.display = "none";
      this._prevCameraOverlayVisible = false;
    }
    window.dispatchEvent(new CustomEvent('close-settings'));
  }
}
