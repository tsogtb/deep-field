/*
(c) 2025 Tsogt
This code is licensed under the MIT License.
Created: 12/20/2025
Last modified: 12/29/2025
*/

import { mat4 } from "https://esm.sh/gl-matrix";
import { setupCanvasAndREGL } from "./core/graphics_setup.js";
import { Camera } from "./core/camera.js";
import { InputState, setupInput } from "./core/input_manager.js";
import { getMovementVector } from "./core/input_processor.js";
import { createPointRenderer } from "./core/renderer.js";
import { SceneController } from "./logic/scene_controller.js";
import { getSceneConfig } from "./logic/scene_manager.js";
import { PassiveManager } from "./logic/passive_manager.js";
import { animatePassiveObjects } from "./logic/animate_passive.js";
import { setupUI } from "./logic/ui_manager.js";
import { setupScreenshot } from "./core/screenshot.js";

// --- 1. Core Engine Setup ---
const { canvas, regl } = setupCanvasAndREGL();
const camera = new Camera(canvas);
const render = createPointRenderer(regl); 

// --- 2. State Management ---
const sceneController = new SceneController(regl);
const passiveManager = new PassiveManager(regl);
passiveManager.init();

// --- 3. Input & UI Interfacing ---
setupInput(canvas, sceneController, camera);
setupUI(sceneController);
setupScreenshot(canvas, regl);

// DOM Overlays
const startOverlay = document.getElementById("start-overlay");
document.getElementById("btn-home")?.addEventListener("click", () => {
  camera.isReturning = true;
});

// --- 4. Main Render Loop ---
let prevTime = 0;

regl.frame(({ time }) => {
  // Timing
  const dt = Math.min(time - prevTime, 0.1);
  prevTime = time;

  // A. Input Handling & Camera Update
  const moveInput = getMovementVector(InputState, camera);
  const rotationInput = [InputState.mouse.movementX, InputState.mouse.movementY];
  camera.update(dt, moveInput, rotationInput);
  
  // Reset mouse delta so we don't spin forever
  InputState.mouse.movementX = 0;
  InputState.mouse.movementY = 0;

  // B. Scene Logic
  const sceneInfo = getSceneConfig(sceneController.currentSceneIndex);
  
  // Global Key Hooks (e.g. Enter to start)
  if (InputState.keys['Enter']) {
    sceneController.nextScene();
    InputState.keys['Enter'] = false; 
  }

  // UI/Layer visibility logic
  const isMenu = sceneInfo.name === "blankScene";
  const isOrbit = sceneInfo.name === "orbitSimulation";
  
  if (startOverlay) startOverlay.style.display = isMenu ? "block" : "none";
  passiveManager.setVisibility(!isMenu && !isOrbit);

  // C. Physics & Animation
  const activePassiveLayer = passiveManager.getVisibleLayers();
  animatePassiveObjects(activePassiveLayer, time);

  if (sceneInfo.animate) {
    sceneInfo.animate(sceneController.pointData, time, mat4);
  }

  // D. Final Render Pass
  regl.clear({ color: [0.02, 0.02, 0.02, 1], depth: 1 });
  
  render(
    camera, 
    time, 
    sceneController.currentBrush, 
    sceneController.pointData, 
    activePassiveLayer
  );
});