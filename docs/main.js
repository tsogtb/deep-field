/*
(c) 2026 Tsogt
This code is licensed under the MIT License.
Created: 12/20/2025
Last modified: 01/04/2026
*/

// --- Imports ---
import { mat4, vec3, quat } from "https://esm.sh/gl-matrix";
import { setupCanvasAndREGL } from "/deep-field/render/graphics_setup.js";
import { Camera } from "/deep-field/camera/camera.js";
import { InputState, setupInput } from "/deep-field/input/input_manager.js";
import { getMovementVector } from "/deep-field/input/input_processor.js";
import { createPointRenderer } from "/deep-field/render/renderer.js";
import { SceneController } from "/deep-field/scenes/scene_controller.js";
import { PassiveManager } from "/deep-field/render/passive/passive_manager.js";
import { animatePassiveObjects } from "/deep-field/render/passive/animate_passive.js";
import { setupUI } from "/deep-field/app/ui_manager.js";
import { setupScreenshot } from "/deep-field/utils/screenshot.js";
import { DefaultCameraConfig } from "/deep-field/camera/camera_config.js";
import { FreeFlyController } from "/deep-field/camera/controllers/free_fly_controller.js";
import { OrbitController } from "/deep-field/camera/controllers/orbit_controller.js";
import { AppController } from "/deep-field/app/app_controller.js";
import { resolveRouteFromURL } from "/deep-field/app/router.js";

// --- Canvas & REGL setup ---
const { canvas, regl } = setupCanvasAndREGL();
const render = createPointRenderer(regl);

// --- Camera setup ---
const camera = new Camera(canvas, DefaultCameraConfig);
camera.controller =
  DefaultCameraConfig.mode === "orbit"
    ? new OrbitController(DefaultCameraConfig)
    : new FreeFlyController();

if (camera.controller?.setPositionAndOrientation) {
  camera.controller.setPositionAndOrientation(camera.position, camera.orientation);
}

// --- Scene & App state ---
const sceneController = new SceneController(regl);
const passiveManager = new PassiveManager(regl);
passiveManager.init();

const ui = {
  startOverlay: document.getElementById("start-overlay"),
  elements: [
    document.querySelector("#settings-toggle"),
    document.querySelector(".hint"),
    document.querySelector("#camera-overlay"),
    document.querySelector("#mobile-controls"),
  ].filter(Boolean),
};

const app = new AppController({ sceneController, camera, passiveManager, ui });

// --- Input ---
setupInput(canvas, {
  onKeyDown: (key) => {
    if (key === "n") sceneController.nextScene();
    if (key === "b") sceneController.swapBrush();
    if (key === "o") camera.isReturning = true;
  },
});

// --- UI helpers ---
setupUI(sceneController);
setupScreenshot(canvas, regl);

// --- Routing & URL resolution ---
resolveRouteFromURL(app, camera);
window.addEventListener("popstate", () => resolveRouteFromURL(app, camera));

// --- Animation / Render loop ---
let lastFrameTime = 0;
const rotScratch = [0, 0];
const moveScratch = { move: vec3.create(), roll: 0, level: false };

regl.frame(({ time }) => {
  const dt = Math.min(time - lastFrameTime, 0.1);
  lastFrameTime = time;

  
  // --- Camera movement ---
  getMovementVector(InputState, camera, moveScratch);
  rotScratch[0] = InputState.mouse.movementX;
  rotScratch[1] = InputState.mouse.movementY;
  camera.update(dt, moveScratch, rotScratch);
  InputState.mouse.movementX = 0;
  InputState.mouse.movementY = 0;

  // --- App logic ---
  app.updatePerFrame(time);

  // --- Animate passive layers ---
  const passiveLayers = passiveManager.getVisibleLayers();
  animatePassiveObjects(passiveLayers, time);

  // --- Scene animations ---
  const sceneInfo = sceneController.getCurrentScene?.();
  sceneInfo?.animate?.(sceneController.pointData, time, mat4);

  // --- Render ---
  regl.clear({ color: [0.02, 0.02, 0.02, 1], depth: 1 });
  render(
    camera,
    time,
    sceneController.currentBrush,
    sceneController.pointData,
    passiveLayers,
    sceneController.showGizmo
  );
});
