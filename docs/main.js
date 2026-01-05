/*
(c) 2026 Tsogt
This code is licensed under the MIT License.
Created: 12/20/2025
Last modified: 01/04/2026
*/

// --- Imports ---
import { mat4, vec3, quat } from "https://esm.sh/gl-matrix";
import { setupCanvasAndREGL } from "/deep-field/render/graphics_setup.js";
import { Camera, lookAtQuat } from "/deep-field/camera/camera.js";
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
import { CameraLerp } from "/deep-field/camera/drivers/camera_lerp.js";

// --- Core setup ---
const { canvas, regl } = setupCanvasAndREGL();
const camera = new Camera(canvas, DefaultCameraConfig);

camera.controller =
  DefaultCameraConfig.mode === "orbit"
    ? new OrbitController(DefaultCameraConfig)
    : new FreeFlyController();

// Sync FreeFly orientation to camera
if (camera.controller?.setPositionAndOrientation) {
  camera.controller.setPositionAndOrientation(camera.position, camera.orientation);
}
    
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

  const target = vec3.fromValues(0, 0, 0);

  // Define start and end positions
  const startPos = vec3.fromValues(0, 5, 20); // start farther back
  const endPos   = vec3.fromValues(0, 0, 5); // zoom in closer

  // Immediately place the camera at the start
  camera.position = vec3.clone(startPos);
  lookAtQuat(camera.orientation, startPos, target, [0, 1, 0]);

  // Smooth camera lerp
  camera.driver = new CameraLerp(
    { position: startPos, orientation: quat.clone(camera.orientation) },
    { position: endPos, orientation: quat.clone(camera.orientation) },
    3.0, // duration in seconds
    {
      lookAtTarget: target, // always look at hero
      loop: false,          // do not loop
      onComplete: (cam) => {
        // After lerp ends, keep the final position and orientation
        // Simply remove the driver; don't reset the camera
        camera.driver = null;

        // Optionally re-enable controller (if you want manual orbit/free fly after)
        if (camera.controller) {
          // Start from the final lerp state
          camera.controller.setPositionAndOrientation?.(cam.position, cam.orientation);
        }
      }
    }
  );
}
else if (params.get("scene") === "geometry") app.setMode("geometry");


else if (params.get("scene") === "physics") { 
  app.setMode("physics");
  const target = vec3.fromValues(0, 0, 0); 
  const startPos = vec3.fromValues(100, 60, 100); // far away 
  const endPos = vec3.fromValues(30, 20, 30); // closer 
  camera.driver = new CameraLerp(
    { position: startPos, orientation: quat.create() },
    { position: endPos, orientation: quat.create() },
    7.0,
    {
      lookAtTarget: target,
      orbitSpeed: 0.05,             // rotate horizontally
      tiltRange: [0, Math.PI], // tilt between 30° and 60°
      tiltSpeed: 0.15,              // speed of up/down tilt
      loop: true
    }
  ); 
}
else app.setMode("app");

// --- Render loop ---
let lastFrameTime = 0;

const rotScratch = [0, 0];
const moveScratch = { move: vec3.create(), roll: 0, level: false };


regl.frame(({ time }) => {
  const dt = Math.min(time - lastFrameTime, 0.1);
  lastFrameTime = time;

  // Camera
  getMovementVector(InputState, camera, moveScratch); // modify in-place

  rotScratch[0] = InputState.mouse.movementX;
  rotScratch[1] = InputState.mouse.movementY;
  camera.update(dt, moveScratch, rotScratch);
  
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
