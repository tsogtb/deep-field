import { Path1D } from "../../geometry/path1d.js";
import { Cone3D } from "../../geometry/shapes3d.js"; 

const CFG = {
  PTS_LETTER: 50,
  PTS_CONE: 350,
  PTS_AXIS: 75,
  RADIUS: 0.075,
  HEIGHT: 0.15,
  STEM: 0.60
};

const GIZMO_DATA = (() => {
  const pos = [], col = [], anchors = [], offsets = [], lblCol = [];
  const axes = [
    { name: 'x', dir: [1, 0, 0], rgb: [1.0, 0.35, 0.4] },
    { name: 'y', dir: [0, 1, 0], rgb: [0.3, 1.0, 0.6] },
    { name: 'z', dir: [0, 0, 1], rgb: [0.2, 0.7, 1.0] }
  ];

  axes.forEach(axis => {
    const tip = { x: axis.dir[0] * (CFG.STEM - CFG.HEIGHT), y: axis.dir[1] * (CFG.STEM - CFG.HEIGHT), z: axis.dir[2] * (CFG.STEM - CFG.HEIGHT) };
    const stem = new Path1D([{ start: {x: 0, y: 0, z: 0}, end: tip }]);

    for (let i = 0; i < CFG.PTS_AXIS; i++) {
      const p = stem.sample();
      const t = i / (CFG.PTS_AXIS - 1);
      pos.push([p.x, p.y, p.z]);
      col.push(axis.rgb);
      pos.push([axis.dir[0] * t * (CFG.STEM - CFG.HEIGHT), axis.dir[1] * t * (CFG.STEM - CFG.HEIGHT), axis.dir[2] * t * (CFG.STEM - CFG.HEIGHT)]);
      col.push(axis.rgb);
    }

    const cone = new Cone3D({ x: 0, y: 0, z: CFG.STEM - 2 * CFG.HEIGHT }, CFG.RADIUS, CFG.HEIGHT);
    for (let i = 0; i < CFG.PTS_CONE; i++) {
      const p = cone.sample();
      if (axis.name === 'x') pos.push([p.z, p.y, -p.x]);
      else if (axis.name === 'y') pos.push([p.x, p.z, -p.y]);
      else pos.push([p.x, p.y, p.z]);
      col.push(axis.rgb);
    }

    const anchor = [axis.dir[0] * CFG.STEM, axis.dir[1] * CFG.STEM, axis.dir[2] * CFG.STEM];
    const mult = (axis.name === 'z') ? 0.3 : 0.17;

    for (let i = 0; i < CFG.PTS_LETTER; i++) {
      const t = i / (CFG.PTS_LETTER - 1);
      let lp = { x: 0, y: 0 };
      if (axis.name === 'x') lp = t < 0.5 ? {x: t*4.-1., y: t*4.-1.} : {x: (t-0.5)*4.-1., y: 1.-(t-0.5)*4.};
      else if (axis.name === 'y') {
        if (t < 0.33) lp = {x: t*3.-1., y: 1.-t*3.};
        else if (t < 0.66) lp = {x: 1.-(t-0.33)*3., y: 1.-(t-0.33)*3.};
        else lp = {x: 0., y: -(t-0.66)*3.};
      } else {
        if (t < 0.33) lp = {x: t*3.-0.5, y: 0.5};
        else if (t < 0.66) lp = {x: 0.5-(t-0.33)*3., y: 0.5-(t-0.33)*3.};
        else lp = {x: (t-0.66)*3.-0.5, y: -0.5};
      }
      anchors.push(anchor);
      offsets.push([lp.x * mult, lp.y * mult]);
      lblCol.push(axis.rgb);
    }
  });

  return { 
    geo: { pos, col, count: pos.length }, 
    lbl: { anchors, offsets, col: lblCol, count: anchors.length } 
  };
})();

export function createGizmoGroup(regl, vert, frag) {
  const uAnchor = [0.90, -0.85]; 
  const uScale = 0.12;

  const drawAxes = regl({
    vert, frag,
    attributes: { position: GIZMO_DATA.geo.pos, color: GIZMO_DATA.geo.col },
    uniforms: { 
      view: regl.prop("view"), 
      uAspect: (ctx) => ctx.viewportWidth / ctx.viewportHeight,
      uGizmoScale: uScale, uAnchor: uAnchor
    },
    count: GIZMO_DATA.geo.count,
    primitive: "points",
    depth: { enable: true, mask: true }
  });

  const drawLabels = regl({
    vert: `
      precision mediump float;
      attribute vec3 anchor, color;
      attribute vec2 offset;
      varying vec3 vColor;
      uniform mat4 view;
      uniform float uAspect, uGizmoScale;
      uniform vec2 uAnchor;
      void main() {
        vColor = color;
        vec3 rotAnchor = mat3(view) * anchor;
        vec2 hud = (rotAnchor.xy * uGizmoScale) + (offset * 0.03);
        hud.x /= uAspect;
        gl_Position = vec4(hud + uAnchor, -rotAnchor.z * 0.01 - 0.001, 1.0);
        gl_PointSize = 2.0;
      }`,
    frag,
    attributes: { anchor: GIZMO_DATA.lbl.anchors, offset: GIZMO_DATA.lbl.offsets, color: GIZMO_DATA.lbl.col },
    uniforms: { 
      view: regl.prop("view"), 
      uAspect: (ctx) => ctx.viewportWidth / ctx.viewportHeight,
      uGizmoScale: uScale, uAnchor: uAnchor 
    },
    count: GIZMO_DATA.lbl.count,
    primitive: "points",
    depth: { enable: true, mask: true }
  });

  return (props) => { drawAxes(props); drawLabels(props); };
}