import point_vert from "/deep-field/render/shaders/point.vert.js";
import circle_frag from "/deep-field/render/shaders/circle.point.frag.js";
import square_frag from "/deep-field/render/shaders/square.point.frag.js";
import star_frag from "/deep-field/render/shaders/star.point.frag.js";
import basic_vert from "/deep-field/render/shaders/basic.vert.js";
import basic_frag from "/deep-field/render/shaders/basic.frag.js";
import gizmo_vert from "/deep-field/render/shaders/gizmo.vert.js";
import gizmo_frag from "/deep-field/render/shaders/gizmo.frag.js";

const BLEND = {
  none: {
    enable: true,
    func: { srcRGB: 'src alpha', dstRGB: 'one minus src alpha', srcAlpha: 1, dstAlpha: 1 },
    equation: 'add'
  },
  glow: {
    enable: true,
    func: { srcRGB: 'src alpha', srcAlpha: 1, dstRGB: 'one', dstAlpha: 1 },
    equation: { rgb: 'add', alpha: 'add' }
  }
};

const DEPTH = {
  none: {},
  occlude: { enable: true, mask: true },
  glow: { enable: true, mask: false },
  ui: { enable: false, mask: false }
};

export const BASIC = { 
  vert: basic_vert, 
  frag: basic_frag, 
  blend: BLEND.none, 
  depth: DEPTH.none 
};

export const GIZMO = { 
  vert: gizmo_vert, 
  frag: gizmo_frag, 
  blend: BLEND.glow, 
  depth: DEPTH.ui 
};

export const CIRCLE = { 
  vert: point_vert, 
  frag: circle_frag, 
  blend: BLEND.glow, 
  depth: DEPTH.glow 
};

export const SQUARE = { 
  vert: point_vert, 
  frag: square_frag, 
  blend: BLEND.glow, 
  depth: DEPTH.glow 
};

export const STAR = { 
  vert: point_vert, 
  frag: star_frag, 
  blend: BLEND.glow, 
  depth: DEPTH.glow 
};