/*
(c) 2025 Tsogt
This code is licensed under the MIT License.
Created: 12/20/2025
Last modified: 12/28/2025
 */

import { mat4 } from "https://esm.sh/gl-matrix";
import { setupCanvasAndREGL } from "./core/graphics_setup.js";
import { Camera } from "./core/camera.js";
import { InputState, setupInput } from "./core/input_manager.js";
import { getMovementVector } from "./core/input_processor.js";
import { createPointRenderer } from "./core/renderer.js";
import { SceneController } from "./logic/scene_controller.js";
import { getSceneConfig } from "./logic/scene_manager.js";
import { createPassiveLayer } from "./data/passive_layer.js";
import { animatePassiveObjects } from "./logic/animate_passive.js";
import { setupScreenshot } from "./core/screenshot.js";

const { canvas, regl } = setupCanvasAndREGL();

const camera = new Camera(canvas);
const render = createPointRenderer(regl); 
const sceneController = new SceneController(regl);
let passiveObjects = createPassiveLayer(regl);

setupInput(canvas, sceneController, camera);
setupScreenshot(canvas, regl);

document.getElementById("btn-home")?.addEventListener("click", () => {
  camera.isReturning = true;
});

let prevTime = 0;

regl.frame(({ time }) => {
  const dt = Math.min(time - prevTime, 0.1);
  prevTime = time;
  
  const moveInput = getMovementVector(InputState, camera);
  const rotationInput = [InputState.mouse.movementX, InputState.mouse.movementY];
  
  camera.update(dt, moveInput, rotationInput);

  InputState.mouse.movementX = 0;
  InputState.mouse.movementY = 0;
  
  regl.clear({ color: [0.02, 0.02, 0.02, 1], depth: 1 });

  const sceneInfo = getSceneConfig(sceneController.currentSceneIndex);
  const activePassiveLayer = (sceneInfo.name === "orbitSimulation") ? [] : passiveObjects;

  animatePassiveObjects(activePassiveLayer, time);

  if (sceneInfo.animate) {
    sceneInfo.animate(sceneController.pointData, time, mat4);
  }

  render(
    camera, 
    time, 
    sceneController.currentBrush, 
    sceneController.pointData, 
    activePassiveLayer,
  );
});