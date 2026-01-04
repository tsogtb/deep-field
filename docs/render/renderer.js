import background_vert from "/deep-field/render/shaders/background.vert.js";
import background_frag from "/deep-field/render/shaders/background.frag.js";
import { BASIC, CIRCLE, SQUARE, STAR, GIZMO } from "/deep-field/data/brushes.js";
import { createGizmoGroup } from "/deep-field/render/meshes/gizmo.js";

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

  return function render(camera, time, brushType = 'circle', activeObjects = [], passiveObjects = [], showGizmo = true) {
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
    });
  };
}