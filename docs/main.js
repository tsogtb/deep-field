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

// --- Core setup ---
const { canvas, regl } = setupCanvasAndREGL();
const camera = new Camera(canvas, DefaultCameraConfig);

camera.controller =
  DefaultCameraConfig.mode === "orbit"
    ? new OrbitController(DefaultCameraConfig)
    : new FreeFlyController();
    
const render = createPointRenderer(regl);

// --- State ---
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

const app = new AppController({
  sceneController,
  camera,
  passiveManager,
  ui,
});

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

// --- URL mode resolution ---
const params = new URLSearchParams(window.location.search);
if (params.get("mode") === "hero") {
  app.setMode("hero");
  const heroTarget = {
    position: vec3.fromValues(0, 0, 0),
    //orientation: quat.create() 
  };
  /*
  const viewMat = mat4.lookAt(mat4.create(), heroTarget.position, [0,0,0], [1,1,1]);
  mat4.getRotation(heroTarget.orientation, viewMat);
  quat.invert(heroTarget.orientation, heroTarget.orientation);
  */
  camera.driver = new CameraLerp(
    camera.snapshot(),
    heroTarget,
    3.0,
  )
}
else if (params.get("scene") === "geometry") app.setMode("geometry");
else if (params.get("scene") === "physics") app.setMode("app");
else app.setMode("app");

// --- Render loop ---
let lastFrameTime = 0;

regl.frame(({ time }) => {
  const dt = Math.min(time - lastFrameTime, 0.1);
  lastFrameTime = time;

  // Camera
  const move = getMovementVector(InputState, camera);
  const rot = [InputState.mouse.movementX, InputState.mouse.movementY];
  camera.update(dt, move, rot);
  InputState.mouse.movementX = 0;
  InputState.mouse.movementY = 0;

  // App logic
  app.updatePerFrame(time);

  // Animation
  const passiveLayers = passiveManager.getVisibleLayers();
  animatePassiveObjects(passiveLayers, time);

  const sceneInfo = sceneController.getCurrentScene?.();
  sceneInfo?.animate?.(sceneController.pointData, time, mat4);

  // Render
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
