import { Path1D } from "../../geometry/curves1d.js";
import { Cone3D } from "../../geometry/shapes3d.js"; 

const LETTER_POINTS = 50; 
const POINTS_PER_CONE = 350; 
const POINTS_PER_AXIS = 75;
const CONE_RADIUS = 0.075;
const CONE_HEIGHT = 0.15;
const STEM_LENGTH = 0.60;

const GIZMO_DATA = (() => {
  const geoPos = [];
  const geoCol = [];
  const labelAnchors = [];
  const labelOffsets = [];
  const labelCol = [];
  const axes = [
    { name: 'x', dir: [1, 0, 0], color: [1.0, 0.35, 0.4] },
    { name: 'y', dir: [0, 1, 0], color: [0.3, 1.0, 0.6] },
    { name: 'z', dir: [0, 0, 1], color: [0.2, 0.7, 1.0] }
  ];
  axes.forEach(axis => {
    const tipPos = {
      x: axis.dir[0] * (STEM_LENGTH - CONE_HEIGHT),
      y: axis.dir[1] * (STEM_LENGTH - CONE_HEIGHT),
      z: axis.dir[2] * (STEM_LENGTH - CONE_HEIGHT)
    };
    const stemPath = new Path1D([
      { start: {x: 0, y: 0, z: 0}, end: tipPos }
    ]);
    for (let i = 0; i < POINTS_PER_AXIS; i++) {
      const p = stemPath.sample(); 
      const jitter = 0.005;
      geoPos.push([
        p.x + (Math.random()-0.5) * jitter, 
        p.y + (Math.random()-0.5) * jitter, 
        p.z + (Math.random()-0.5) * jitter
      ]);
      geoCol.push(axis.color);
    }
    for (let i = 0; i < POINTS_PER_AXIS; i++) {
      const t = i / (POINTS_PER_AXIS - 1);
      const len = t * (STEM_LENGTH - CONE_HEIGHT); 
      geoPos.push([axis.dir[0] * len, axis.dir[1] * len, axis.dir[2] * len]);
      geoCol.push(axis.color);
    }
    const outerCone = new Cone3D(
      { x: 0, y: 0, z: STEM_LENGTH - 2 * CONE_HEIGHT }, 
      CONE_RADIUS, 
      CONE_HEIGHT
    );
    const thickness = 0.001; 
    const innerCone = new Cone3D(
      { x: 0, y: 0, z: STEM_LENGTH - 2.02 * CONE_HEIGHT }, 
      CONE_RADIUS,
      CONE_HEIGHT,
      CONE_RADIUS - thickness, 
      CONE_HEIGHT - thickness
    );
    for (let i = 0; i < POINTS_PER_CONE; i++) {
      const p = innerCone.sample(); 
      
      if (axis.name === 'x') {
        geoPos.push([p.z, p.y, -p.x]); 
      } else if (axis.name === 'y') {
        geoPos.push([p.x, p.z, -p.y]); 
      } else {
        geoPos.push([p.x, p.y, p.z]);
      }
      
      geoCol.push(axis.color);
    }
    const sizeMultiplier = (axis.name === 'x' || axis.name === 'y') ? 0.17 : 0.3;
    const labelPadding = 0.0; 
    const anchor = [
      axis.dir[0] * (STEM_LENGTH + labelPadding), 
      axis.dir[1] * (STEM_LENGTH + labelPadding), 
      axis.dir[2] * (STEM_LENGTH + labelPadding)
    ];
    for (let i = 0; i < LETTER_POINTS; i++) {
      const t = i / (LETTER_POINTS - 1);
      let lp = { x: 0, y: 0 };
      
      if (axis.name === 'x') {
        lp = t < 0.5 ? {x: t*4.-1., y: t*4.-1.} : {x: (t-0.5)*4.-1., y: 1.-(t-0.5)*4.};
      } else if (axis.name === 'y') {
        if (t < 0.33) lp = {x: t*3.-1., y: 1.-t*3.};
        else if (t < 0.66) lp = {x: 1.-(t-0.33)*3., y: 1.-(t-0.33)*3.};
        else lp = {x: 0., y: -(t-0.66)*3.};
      } else {
        if (t < 0.33) lp = {x: t*3.-0.5, y: 0.5};
        else if (t < 0.66) lp = {x: 0.5-(t-0.33)*3., y: 0.5-(t-0.33)*3.};
        else lp = {x: (t-0.66)*3.-0.5, y: -0.5};
      }

      labelAnchors.push(anchor);
      labelOffsets.push([lp.x * sizeMultiplier, lp.y * sizeMultiplier]);
      labelCol.push(axis.color);
    }
  });
  return {
    geometry: { positions: geoPos, colors: geoCol, count: geoPos.length },
    labels: { anchors: labelAnchors, offsets: labelOffsets, colors: labelCol, count: labelAnchors.length }
  };
})();

export function createGizmoGroup(regl, vert, frag) {
  const uAnchor = [0.92, 0.85]; 
  const uGizmoScale = 0.12;

  const drawAxes = regl({
    vert: vert, 
    frag: frag,
    attributes: {
      position: GIZMO_DATA.geometry.positions,
      color: GIZMO_DATA.geometry.colors,
    },
    uniforms: { 
      view: regl.prop("view"),
      uAspect: ({viewportWidth, viewportHeight}) => viewportWidth / viewportHeight,
      uViewportHeight: regl.context('viewportHeight'),
      uGizmoScale: uGizmoScale,
      uAnchor: uAnchor
    },
    count: GIZMO_DATA.geometry.count,
    primitive: "points",

    depth: {
      enable: true,  
      mask: true,    
      func: 'less',
    },
  });

  const drawLabels = regl({
    vert: `
      precision mediump float;
      attribute vec3 anchor;
      attribute vec2 offset;
      attribute vec3 color;
      varying vec3 vColor;
      uniform mat4 view;
      uniform float uAspect, uGizmoScale;
      uniform vec2 uAnchor;
      
      void main() {
        vColor = color;
        vec3 rotatedAnchor = mat3(view) * anchor;
        
        // Match the axis math exactly
        vec2 hudBase = rotatedAnchor.xy * uGizmoScale; 
        hudBase.x /= uAspect; 
        
        // Scale labels down for "Engineer" look
        vec2 labelOffset = offset * 0.03; 
        labelOffset.x /= uAspect;

        float z = -rotatedAnchor.z * 0.01;

        // Push labels slightly forward so they never fight axes
        z -= 0.001;

        gl_Position = vec4(
          hudBase + labelOffset + uAnchor,
          z,
          1.0
        );
        gl_PointSize = 2.0; 
      }`,
    frag: frag,
    attributes: {
      anchor: GIZMO_DATA.labels.anchors,
      offset: GIZMO_DATA.labels.offsets,
      color: GIZMO_DATA.labels.colors
    },
    uniforms: { 
      view: regl.prop("view"),
      uAspect: ({viewportWidth, viewportHeight}) => viewportWidth / viewportHeight,
      uGizmoScale: uGizmoScale,
      uAnchor: uAnchor
    },
    count: GIZMO_DATA.labels.count,
    primitive: "points",
    depth: {
      enable: true, 
      mask: true,    
    },
  });

  return (props) => {
    drawAxes(props);
    drawLabels(props);
  };
}
