import point_vert from "./shaders/point.vert.js";
import circle_point_frag from "./shaders/circle.point.frag.js";
import square_point_frag from "./shaders/square.point.frag.js"
import star_point_frag from "./shaders/star.point.frag.js";
import basic_vert from "./shaders/basic.vert.js";
import basic_frag from "./shaders/basic.frag.js";
import gizmoVert from "./shaders/gizmo.vert.js";
import gizmoFrag from "./shaders/gizmo.frag.js";

const depth_gizmo = { 
  enable: false, 
  mask: false,
}

const depth_none = {};
const blend_none = {
  enable: true,
  func: {
    srcRGB: 'src alpha',
    dstRGB: 'one minus src alpha',
    srcAlpha: 1,
    dstAlpha: 1
  },
  equation: 'add'
};
const depth_glow = { enable: true, mask: false };
const blend_glow = {
  enable: true,
  func: { srcRGB: "src alpha", srcAlpha: 1, dstRGB: "one", dstAlpha: 1 },
  equation: { rgb: "add", alpha: "add" },
};


export const GIZMO = { vert: gizmoVert, frag: gizmoFrag, blend: blend_glow, depth: depth_gizmo };
export const BASIC = { vert: basic_vert, frag: basic_frag, blend: blend_none, depth: depth_none };
export const CIRCLE = { vert: point_vert, frag: circle_point_frag, blend: blend_glow, depth: depth_glow };
export const SQUARE = { vert: point_vert, frag: square_point_frag, blend: blend_glow, depth: depth_glow };
export const STAR = { vert: point_vert, frag: star_point_frag, blend: blend_glow, depth: depth_glow };