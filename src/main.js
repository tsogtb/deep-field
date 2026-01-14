/*
(c) 2026 Tsogt
Licensed under the MIT License.
Created: 2025-12-20
Last modified: 2026-01-08
*/

// --- Imports ---
import { mat4, vec3 } from "https://esm.sh/gl-matrix";

import { setupCanvasAndREGL } from "./render/graphics_setup.js";
import { createPointRenderer } from "./render/renderer.js";

import { Camera } from "./camera/camera.js";
import { DefaultCameraConfig } from "./camera/camera_config.js";
import { FreeFlyController } from "./camera/controllers/free_fly_controller.js";
import { OrbitController } from "./camera/controllers/orbit_controller.js";

import { InputState, setupInput } from "./input/input_manager.js";
import { getMovementVector } from "./input/input_processor.js";

import { SceneController } from "./scenes/scene_controller.js";
import { PassiveManager } from "./render/passive/passive_manager.js";
import { animatePassiveObjects } from "./render/passive/animate_passive.js";

import { setupUI } from "./app/ui_manager.js";
import { setupScreenshot } from "./utils/screenshot.js";
import { AppController } from "./app/app_controller.js";
import { resolveRouteFromURL } from "./app/router.js";


// --- Canvas & REGL setup ---


const { canvas, regl } = setupCanvasAndREGL();
requestAnimationFrame(() => {
  regl.poll();
});

const render = createPointRenderer(regl);

// --- Camera setup ---
const camera = new Camera(canvas, DefaultCameraConfig);

camera.controller =
  DefaultCameraConfig.mode === "orbit"
    ? new OrbitController(DefaultCameraConfig)
    : new FreeFlyController();

if (camera.controller?.setPositionAndOrientation) {
  camera.controller.setPositionAndOrientation(
    camera.position,
    camera.orientation
  );
}

// --- Scene & application state ---
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

// --- Input setup ---
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

// --- Routing ---
resolveRouteFromURL(app, camera);
window.addEventListener("popstate", () =>
  resolveRouteFromURL(app, camera)
);

// --- Animation / render loop ---
let lastFrameTime = 0;

const rotScratch = [0, 0];
const moveScratch = {
  move: vec3.create(),
  roll: 0,
  level: false,
};

let firstFrame = true;

let SIM_ACTIVE = true;

window.addEventListener("message", (e) => {
  if (e.data?.type === "PAUSE_SIM") {
    SIM_ACTIVE = false;
  }
  if (e.data?.type === "RESUME_SIM") {
    SIM_ACTIVE = true;
  }
});

regl.frame(({ time }) => {

  if (!SIM_ACTIVE) {
    InputState.mouse.movementX = 0;
    InputState.mouse.movementY = 0;
  
    lastFrameTime = time; // prevent dt explosion on resume
    return;
  }

  if (firstFrame) {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 800);
    }
    firstFrame = false;
  }
  

  const dt = Math.min(time - lastFrameTime, 0.1);
  lastFrameTime = time;

  // --- Camera movement ---
  getMovementVector(InputState, camera, moveScratch);

  rotScratch[0] = InputState.mouse.movementX;
  rotScratch[1] = InputState.mouse.movementY;

  camera.update(dt, moveScratch, rotScratch);

  InputState.mouse.movementX = 0;
  InputState.mouse.movementY = 0;

  camera.updateOverlay(); 

  // --- App logic ---
  app.updatePerFrame(time);

  // --- Passive layers ---
  const passiveLayers = passiveManager.getVisibleLayers();
  animatePassiveObjects(passiveLayers, time);

  // --- Scene animation ---
  const sceneInfo = sceneController.getCurrentScene?.();
  sceneInfo?.animate?.(
    sceneController.pointData,
    time,
    mat4
  );

  // --- Render ---
  regl.clear({
    color: [0.02, 0.02, 0.02, 1],
    depth: 1,
  });

  render(
    camera,
    time,
    sceneController.currentBrush,
    sceneController.pointData,
    passiveLayers,
    sceneController.showGizmo
  );
});
