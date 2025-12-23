/**
 * renderer.js
 * 
 * Renderer for point clouds and background gradient.
 */

import point_vert from "./shaders/point.vert.js";
import circle_point_frag from "./shaders/circle.point.frag.js";
import square_point_frag from "./shaders/square.point.frag.js"
import background_vert from "./shaders/background.vert.js";
import background_frag from "./shaders/background.frag.js";

/**
 * Create a point cloud renderer with a background.
 * @param {REGL} regl - Initialized REGL instance
 * @param {{buffer: REGL.Buffer, colorBuffer: REGL.Buffer, count: number}} pointData
 * @param {string} fragShader - The imported fragment shader string to use
 * @returns {Function} render(camera, time)
 */
export function createPointRenderer(regl, pointData) {

  // ------------------------------
  // Draw Points
  // ------------------------------
  const baseConfig = {
    vert: point_vert,
    attributes: {
      // Use regl.prop to make these dynamic and safer during transitions
      position: regl.prop("position"),
      color: regl.prop("color"),
    },
    uniforms: {
      projection: regl.prop("projection"),
      view: regl.prop("view"),
      uTime: regl.prop("uTime"),
    },
    // Ensure count is also passed as a prop since it changes per scene
    count: regl.prop("count"), 
    primitive: "points",
    blend: {
      enable: true,
      func: { srcRGB: "src alpha", srcAlpha: 1, dstRGB: "one", dstAlpha: 1 },
      equation: { rgb: "add", alpha: "add" },
    },
    depth: { enable: true, mask: false },
  };

  const drawCircle = regl({ ...baseConfig, frag: circle_point_frag });
  const drawSquare = regl({ ...baseConfig, frag: square_point_frag });

  // ------------------------------
  // Draw Background (full-screen quad gradient)
  // ------------------------------
  const drawBackground = regl({
    vert: background_vert,
    frag: background_frag,
    attributes: {
      position: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    },
    elements: [[0, 1, 2], [0, 2, 3]],
    uniforms: {
      colorTop: regl.prop("colorTop"),
      colorBottom: regl.prop("colorBottom"),
    },
    depth: { enable: false },
    cull: { enable: false },
  });

  // ------------------------------
  // Render function
  // ------------------------------
  return function render(camera, time, brushType = 'circle') {
    // Background first
    drawBackground({
      colorTop: [0.0, 0.0, 0.0],
      colorBottom: [0.0, 0.0, 0.0],
    });

    const props = {
      projection: camera.projection,
      view: camera.view,
      uTime: time,
      position: pointData.buffer,     
      color: pointData.colorBuffer,   
      count: pointData.count         
    };

    // Points on top
    if (brushType === 'square') {
      drawSquare(props);
    } else {
      drawCircle(props);
    }
  };
}
