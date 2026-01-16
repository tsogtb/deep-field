import { getSceneConfig } from "../scenes/scene_manager.js";

const GEOMETRY_SCENES = {
  manifolds: "geometryManifoldsDemo",
  union: "geometryUnionDemo",
  difference: "geometryDifferenceDemo",
  intersection: "geometryIntersectionDemo",
};

const BIOLOGY_SCENES = {
  secondary: "proteinFoldingDemo",
  tertiary: "proteinFoldingExperimentalDemo",
}

export class AppController {
  constructor({ sceneController, camera, passiveManager, ui }) {
    this.sceneController = sceneController;
    this.camera = camera;
    this.passiveManager = passiveManager;
    this.ui = ui;

    this.mode = "app"; 
    this._prevSceneIndex = -1;
    this._prevOverlayVisible = null;
    this._prevPassiveVisible = null;
    this._prevCameraOverlayVisible = null;
    this._sceneInfo = null;
  }

  /* --------------------------------
     Switch app mode and load corresponding scene
  -------------------------------- */
  setMode(mode, subMode = "none") {
    this.mode = mode;

    // Default: hide UI & gizmo for most special modes
    const hideUIAndGizmo = () => {
      this._hideUI();
      this.sceneController.showGizmo = false;
    };

    if (mode === "hero") {
      this.sceneController.goToScene({ name: "starField", reason: "hero" });
      hideUIAndGizmo();

    } else if (mode === "geometry") {
      this.sceneController.goToScene({
        name: GEOMETRY_SCENES[subMode] ?? "geometryUnionDemo",
        reason: "geometry",
      });
      hideUIAndGizmo();
    } else if (mode === "jelly") {
      this.sceneController.goToScene({ name: "physicsJellyConfig", reason: "lab" });
      //hideUIAndGizmo();

    } else if (mode === "physics") {
      this.sceneController.goToScene({ name: "orbitSceneDemo", reason: "geometry" });
      hideUIAndGizmo();

    } else if (mode === "biology") {
      this.sceneController.goToScene({ 
        name: BIOLOGY_SCENES[subMode] ?? "proteinFoldingDemo", 
        reason: "biology",
      })
      hideUIAndGizmo();
      
    } else if (mode === "app") {
      this.sceneController.goToScene({ index: 0, reason: "startup" });
      this._showUI();
    }
    
  }

  /* --------------------------------
     Update per-frame UI and scene-related states
  -------------------------------- */
  updatePerFrame(time) {
    const currentIndex = this.sceneController.currentSceneIndex;

    // --- Cache scene info only when scene changes ---
    if (this._prevSceneIndex !== currentIndex) {
      this._sceneInfo = getSceneConfig(currentIndex);
      this._prevSceneIndex = currentIndex;
    }
    const sceneInfo = this._sceneInfo;
    if (!sceneInfo) return;

    const { name: sceneName } = sceneInfo;

    // --- Passive elements visibility ---
    const showPassive = this.mode === "biology";
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

    // --- Optional: Gizmo visibility per scene ---
    if (
      sceneInfo.showGizmo !== undefined &&
      this.sceneController.showGizmo !== sceneInfo.showGizmo
    ) {
      this.sceneController.showGizmo = sceneInfo.showGizmo;
    }
  }

  /* --------------------------------
     Show UI & camera overlay
  -------------------------------- */
  _showUI() {
    document.body.classList.add("ui-ready");

    this._showCameraOverlay();

    if (this.camera.overlay && this._prevCameraOverlayVisible !== true) {
      this.camera.overlay.style.display = "block";
      this._prevCameraOverlayVisible = true;
    }
  }

  /* --------------------------------
     Hide UI & camera overlay
  -------------------------------- */
  _hideUI() {
    document.body.classList.remove("ui-ready");

    if (this.ui.startOverlay) this.ui.startOverlay.style.display = "none";

    if (this.camera.overlay && this._prevCameraOverlayVisible !== false) {
      this.camera.overlay.style.display = "none";
      this._prevCameraOverlayVisible = false;
    }

    this._showCameraOverlay(); // will hide if checkbox unchecked
    window.dispatchEvent(new CustomEvent("close-settings"));
  }

  _showCameraOverlay() {
    if (!this.camera.overlay) return;
  
    const enabled = document.getElementById("ui-camera")?.checked;
    this.camera.overlay.style.display = enabled ? "block" : "none";
    this._prevCameraOverlayVisible = enabled;
  }
  
}
