import background_vert from "./shaders/background.vert.js";
import background_frag from "./shaders/background.frag.js";
import { BASIC, CIRCLE, SQUARE, STAR, GIZMO, PHYSICS } from "../data/brushes.js";
import { createGizmoGroup } from "../render/meshes/gizmo.js";

export function createPointRenderer(regl) {
  // Global uniforms for time and viewport
  const globalScope = regl({
    uniforms: {
      uTime: regl.prop("uTime"),
      uAspect: (ctx) => ctx.viewportWidth / ctx.viewportHeight,
      uViewportHeight: (ctx) => ctx.viewportHeight,
    },
  });

  // Background quad
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

  // Factory for point-drawing commands
  const createPointCommand = (config) =>
    regl({
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

  // Brush commands
  const brushes = {
    basic: createPointCommand(BASIC),
    circle: createPointCommand(CIRCLE),
    square: createPointCommand(SQUARE),
    star: createPointCommand(STAR),
    physics: createPointCommand(PHYSICS),
  };

  // Gizmo
  const drawGizmoGroup = createGizmoGroup(regl, GIZMO.vert, GIZMO.frag);

  // --- Main renderer function ---
  return function render(
    camera,
    time,
    brushType = "circle",
    activeObjects = [],
    passiveObjects = [],
    showGizmo = true
  ) {
    globalScope({ uTime: time }, () => {
      // Clear background
      drawBackground({ colorTop: [0, 0, 0], colorBottom: [0, 0, 0] });

      // Passive objects (always circle brush)
      passiveObjects.forEach((obj) => {
        brushes.circle({
          projection: camera.projection,
          view: camera.view,
          model: obj.modelMatrix,
          position: obj.buffer,
          color: obj.colorBuffer,
          count: obj.count,
          uIsSnow: obj.id === "snow" ? 1.0 : 0.0,
        });
      });

      // Active objects (selected brush)
      const drawActive = brushes[brushType] || brushes.basic;
      activeObjects.forEach((obj) => {
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

      // Gizmo overlay
      if (showGizmo) {
        regl.clear({ depth: 1 });
        drawGizmoGroup({ view: camera.view });
      }
    });
  };
}
