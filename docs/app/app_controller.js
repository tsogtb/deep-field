import { getSceneConfig } from "../scenes/scene_manager.js";

export class AppController {
  constructor({ sceneController, camera, passiveManager, ui }) {
    this.sceneController = sceneController;
    this.camera = camera;
    this.passiveManager = passiveManager;
    this.ui = ui;

    this.mode = "app"; // app | hero | geometry
  }

  setMode(mode) {
    this.mode = mode;

    if (mode === "hero") {
      this.sceneController.goToScene({ name: "blankScene", reason: "hero" });
      this._hideUI();
      this.sceneController.showGizmo = false;
    }

    if (mode === "geometry") {
      this.sceneController.goToScene({ name: "christmasTree", reason: "geometry" });
      this._hideUI();
      this.sceneController.showGizmo = false;
    }

    if (mode === "physics") {
      this.sceneController.goToScene({ name: "spaghettiSimulation", reason: "geometry" });
      this._hideUI();
      this.sceneController.showGizmo = false;
    }

    if (mode === "app") {
      this.sceneController.goToScene({ index: 0, reason: "startup" });
      this._showUI();
    }
  }

  updatePerFrame(time) {
    const sceneInfo = getSceneConfig(this.sceneController.currentSceneIndex);
    if (!sceneInfo) return;

    const isMenu = sceneInfo.name === "blankScene";
    const isOrbit = sceneInfo.name === "orbitSimulation";

    // 1. Passive visibility logic (Stars/Background)
    const showPassive =
      this.mode === "hero" ||
      (!isMenu && !isOrbit && this.mode !== "geometry");
    this.passiveManager.setVisibility(showPassive);

    // 2. Fix: Overlay visibility logic
    // Only show the "Press Enter" overlay if we are in 'app' mode AND on the menu.
    if (this.ui.startOverlay) {
      const shouldShowOverlay = (this.mode === "app" && isMenu);
      this.ui.startOverlay.style.display = shouldShowOverlay ? "block" : "none";
    }
  }

  _hideUI() {
    document.body.classList.remove("ui-ready");
    
    // Clean sweep: Force hide critical overlays
    if (this.ui.startOverlay) this.ui.startOverlay.style.display = "none";
    if (this.camera.overlay) this.camera.overlay.style.display = "none";
    
    window.dispatchEvent(new CustomEvent('close-settings'));
  }
  
  _showUI() {
    document.body.classList.add("ui-ready");
    
    // Note: We don't force show the startOverlay here because 
    // updatePerFrame handles that based on the scene index!
    if (this.camera.overlay) this.camera.overlay.style.display = "block";
  }
}
