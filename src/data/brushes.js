/**
 * Shader imports
 */
import point_vert from "../render/shaders/point.vert.js";
import circle_frag from "../render/shaders/circle.point.frag.js";
import square_frag from "../render/shaders/square.point.frag.js";
import star_frag from "../render/shaders/star.point.frag.js";
import basic_vert from "../render/shaders/basic.vert.js";
import basic_frag from "../render/shaders/basic.frag.js";
import gizmo_vert from "../render/shaders/gizmo.vert.js";
import gizmo_frag from "../render/shaders/gizmo.frag.js";
import physics_vert from "../render/shaders/physics.vert.js";
import physics_frag from "../render/shaders/physics.frag.js";
import point_highlight_vert from "../render/shaders/point_highlight.vert.js";
import point_highlight_frag from "../render/shaders/point_highlight.frag.js";

/**
 * Blending modes
 */
const BLEND = {
  none: {
    enable: true,
    func: { srcRGB: 'src alpha', dstRGB: 'one minus src alpha', srcAlpha: 1, dstAlpha: 1 },
    equation: 'add',
  },
  glow: {
    enable: true,
    func: { srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 'one', dstAlpha: 1 },
    equation: { rgb: 'add', alpha: 'add' },
  },
};

/**
 * Depth / stencil configurations
 */
const DEPTH = {
  none: {},
  occlude: { enable: true, mask: true },
  glow: { enable: true, mask: false },
  ui: { enable: false, mask: false },
};

/**
 * Brush definitions
 */
export const BASIC = { vert: basic_vert, frag: basic_frag, blend: BLEND.none, depth: DEPTH.none };
export const GIZMO = { vert: gizmo_vert, frag: gizmo_frag, blend: BLEND.glow, depth: DEPTH.ui };
export const CIRCLE = { vert: point_vert, frag: circle_frag, blend: BLEND.glow, depth: DEPTH.glow };
export const SQUARE = { vert: point_vert, frag: square_frag, blend: BLEND.glow, depth: DEPTH.glow };
export const STAR = { vert: point_vert, frag: star_frag, blend: BLEND.glow, depth: DEPTH.glow };
export const PHYSICS = { vert: physics_vert, frag: physics_frag, blend: BLEND.glow, depth: DEPTH.glow };
export const GEOMETRY = { vert: point_highlight_vert, frag: point_highlight_frag, blend: BLEND.glow, depth: DEPTH.glow };
