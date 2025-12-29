const TRADEMARK_GEOM = {
  positions: [
    [-1, -1], [ 1, -1], [ 1,  1],
    [-1, -1], [ 1,  1], [-1,  1]
  ],
  uvs: [
    [0, 0], [1, 0], [1, 1], // Bottom-left triangle
    [0, 0], [1, 1], [0, 1]  // Top-right triangle
  ]
};

function createTextTexture(regl, text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // High-res internal dimensions for sharpness
  canvas.width = 1024;
  canvas.height = 128;

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = 'bold 40px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, canvas.height / 2);

  return regl.texture(canvas);
}

export function createTrademark(regl) {
  const texture = createTextTexture(regl, "Deepfield JS — Tsogt © 2025");

  return regl({
    vert: `
      precision mediump float;
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      uniform float uAspect;
      void main() {
        vUv = uv;
        // Position logic: Bottom Right
        vec2 uAnchor = vec2(0.65, -0.85); 
        vec2 uScale = vec2(0.35, 0.07); // Width and Height of the label
        
        vec2 pos = uAnchor + (position * uScale);
        gl_Position = vec4(pos, 0.0, 1.0);
      }`,
    frag: `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main() {
      // We flip the Y coordinate here (1.0 - vUv.y) 
      // to match Canvas's top-down coordinate system.
      vec4 texColor = texture2D(uTexture, vec2(vUv.x, 1.0 - vUv.y));
      gl_FragColor = texColor;
    }`,
    attributes: {
      position: TRADEMARK_GEOM.positions,
      uv: TRADEMARK_GEOM.uvs
    },
    uniforms: {
      uTexture: texture
    },
    count: 6,
    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 1,
        dstRGB: 'one minus src alpha',
        dstAlpha: 1
      }
    }
  });
}

/**
 * renderer.js
 * 

import background_vert from "../shaders/background.vert.js";
import background_frag from "../shaders/background.frag.js";
import { BASIC, CIRCLE, SQUARE, STAR, GIZMO } from "../data/brushes.js";
import { createGizmoGroup } from "../meshes/gizmo.js";
import { createTrademark } from "../meshes/trademark.js";

export function createPointRenderer(regl) {
  const globalScope = regl({
    uniforms: {
      uTime: regl.prop("uTime"),
      uAspect: (ctx) => ctx.viewportWidth / ctx.viewportHeight,
      uViewportHeight: (ctx) => ctx.viewportHeight,
    }
  });

  const drawBackground = regl({
    vert: background_vert,
    frag: background_frag,
    attributes: { position: [[-1, -1], [1, -1], [1, 1], [-1, 1]] },
    elements: [[0, 1, 2], [0, 2, 3]],
    uniforms: {
      colorTop: regl.prop("colorTop"),
      colorBottom: regl.prop("colorBottom"),
    },
    depth: { enable: false },
  });

  const createPointCommand = (config) => regl({
    vert: config.vert,
    frag: config.frag,
    blend: config.blend,
    depth: config.depth,
    attributes: {
      position: regl.prop("position"),
      color: regl.prop("color"),
    },
    uniforms: {
      projection: regl.prop("projection"),
      view: regl.prop("view"),
      model: regl.prop("model"),
      uIsSnow: regl.prop("uIsSnow"),
    },
    count: regl.prop("count"),
    primitive: "points",
  });

  const brushes = {
    basic:  createPointCommand(BASIC),
    circle: createPointCommand(CIRCLE),
    square: createPointCommand(SQUARE),
    star:   createPointCommand(STAR),
  };

  const drawGizmoGroup = createGizmoGroup(regl, GIZMO.vert, GIZMO.frag);

  const drawTradeMark = createTrademark(regl);

  return function render(
    camera, time, 
    brushType = 'circle', 
    activeObjects = [], 
    passiveObjects = [],
    showGizmo = true
  ) {
    globalScope({ uTime: time }, () => {
      
      drawBackground({ colorTop: [0, 0, 0], colorBottom: [0, 0, 0] });

      passiveObjects.forEach(obj => {
        brushes.circle({
          projection: camera.projection,
          view: camera.view,
          model: obj.modelMatrix,
          position: obj.buffer,
          color: obj.colorBuffer,
          count: obj.count,
          uIsSnow: obj.id === 'snow' ? 1.0 : 0.0
        });
      });

      const drawActive = brushes[brushType] || brushes.basic;
      activeObjects.forEach(obj => {
        drawActive({
          projection: camera.projection,
          view: camera.view,
          model: obj.modelMatrix, 
          position: obj.buffer,
          color: obj.colorBuffer,
          count: obj.count,
          uIsSnow: 0.0,
        });
      });

      if (showGizmo) {
        regl.clear({ depth: 1 });
        drawGizmoGroup({ view: camera.view });
      }
      
      drawTradeMark();

    });
  };
}


 */

/**
 * screenshot.js
 * 


export function setupGifCapture(canvas, regl, options = {}) {
  const {
    frameCount = 120,
    fps = 30,
    basename = "deepfield"
  } = options;

  let capturing = false;
  let frame = 0;

  function start() {
    if (!regl._gl.getContextAttributes().preserveDrawingBuffer) {
      console.warn("preserveDrawingBuffer must be true");
      return;
    }
    capturing = true;
    frame = 0;
    console.log("🎬 GIF capture started");
  }

  function captureFrame() {
    if (!capturing) return;

    const link = document.createElement("a");
    link.download = `${basename}_${String(frame).padStart(4, "0")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    frame++;

    if (frame >= frameCount) {
      capturing = false;
      console.log("✅ Capture finished");
    }
  }

  function isCapturing() {
    return capturing;
  }

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "j") start();
  });

  return {
    captureFrame,
    isCapturing,
    fps
  };
}


// export function setupScreenshot(canvas, regl) {
//   window.addEventListener("keydown", (e) => {
//     if (e.key.toLowerCase() !== "j") return;

//     if (!regl._gl.getContextAttributes().preserveDrawingBuffer) {
//       console.warn("Screenshot failed: preserveDrawingBuffer is false.");
//       return;
//     }

//     try {
//       const link = document.createElement("a");
//       link.download = `deepfield_${Date.now()}.png`;
//       link.href = canvas.toDataURL("image/png");
//       link.click();
//       console.log("🌌 Captured!");
//     } catch (err) {
//       console.error("Capture failed:", err);
//     }
//   });
// }

 * ffmpeg -framerate 30 -i deepfield_%04d.png -filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse" deepfield_line_red.gif

 */

/**
 * index.html
 * see sc_index.html
 */

/**
 * 
 * main.js
 * 

(c) 2025 Tsogt
This code is licensed under the MIT License.
Created: 12/20/2025
Last modified: 12/29/2025

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
import { setupGifCapture } from "./core/screenshot.js";

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
//setupScreenshot(canvas, regl);

// DOM Overlays
const startOverlay = document.getElementById("start-overlay");
document.getElementById("btn-home")?.addEventListener("click", () => {
  camera.isReturning = true;
});

// --- 4. Main Render Loop ---
let prevTime = 0;

const gifCapture = setupGifCapture(canvas, regl, {
  frameCount: 510,
  fps: 30,
  basename: "deepfield"
});

let captureTime = 0;


regl.frame(({ time }) => {
  // Timing
  const CAPTURE_DT = 1 / gifCapture.fps;

  let dt, simTime;
  
  if (gifCapture.isCapturing()) {
    dt = CAPTURE_DT;
    simTime = captureTime;
    captureTime += dt;
  } else {
    dt = Math.min(time - prevTime, 0.1);
    simTime = time;
  }
  
  prevTime = time;

  // A. Input Handling & Camera Update
  const moveInput = getMovementVector(InputState, camera);
  const rotationInput = [InputState.mouse.movementX, InputState.mouse.movementY];
  camera.update(simTime, moveInput, rotationInput);
  
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
  animatePassiveObjects(activePassiveLayer, simTime);

  if (sceneInfo.animate) {
    sceneInfo.animate(sceneController.pointData, simTime, mat4);
  }

  // D. Final Render Pass
  regl.clear({ color: [0.02, 0.02, 0.02, 1], depth: 1 });
  
  render(
    camera, 
    simTime, 
    sceneController.currentBrush, 
    sceneController.pointData, 
    activePassiveLayer,
    sceneController.showGizmo,
  );

  gifCapture.captureFrame();
});

 */

