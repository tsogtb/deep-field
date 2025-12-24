/**
 * renderer.js
 * 
 * Renderer for point clouds and background gradient.
 */

import point_vert from "./shaders/point.vert.js";
import circle_point_frag from "./shaders/circle.point.frag.js";
import square_point_frag from "./shaders/square.point.frag.js"
import star_point_frag from "./shaders/star.point.frag.js";
import background_vert from "./shaders/background.vert.js";
import background_frag from "./shaders/background.frag.js";
import basic_vert from "./shaders/basic.vert.js";
import basic_frag from "./shaders/basic.frag.js";


export function createPointRenderer(regl, pointData) {

  // Define the shared logic to avoid repetition
  const createPointCommand = (vert, frag) => regl({
    vert,
    frag,
    attributes: {
      position: regl.prop("position"),
      color: regl.prop("color"),
    },
    uniforms: {
      projection: regl.prop("projection"),
      view: regl.prop("view"),
      uTime: regl.prop("uTime"),
    },
    count: regl.prop("count"),
    primitive: "points",
    blend: {
      enable: true,
      func: { srcRGB: "src alpha", srcAlpha: 1, dstRGB: "one", dstAlpha: 1 },
      equation: { rgb: "add", alpha: "add" },
    },
    depth: { enable: true, mask: false },
  });

  // Now pair them up!
  const drawCircle = createPointCommand(basic_vert, basic_frag);
  const drawSquare = createPointCommand(point_vert, square_point_frag);
  const drawStar   = createPointCommand(point_vert, star_point_frag);
  
  // Example: A brush that uses a DIFFERENT vertex shader
  // const drawGridStyle = createPointCommand(grid_vert, circle_point_frag);

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
  
  return function render(camera, time, brushType = 'circle') {
    drawBackground({ colorTop: [0,0,0], colorBottom: [0,0,0] });

    const props = {
      projection: camera.projection,
      view: camera.view,
      uTime: time,
      position: pointData.buffer,     
      color: pointData.colorBuffer,   
      count: pointData.count         
    };

    // This switch now controls the VERTEX + FRAGMENT pair 
    switch(brushType) {
      case 'square': drawSquare(props); break;
      case 'star':   drawStar(props);   break;
      // case 'grid':   drawGridStyle(props); break;
      default:       drawCircle(props);
    }
  };
}