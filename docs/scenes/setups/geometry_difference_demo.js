import {
  Box3D,
  Ellipsoid3D,
} from "../../../geometry/shapes3d.js";

import { CompositeShape, RotatedShape, TranslatedShape } from "../../../geometry/composites.js";

import { Path1D } from "../../../geometry/path1d.js";

/* ---------------------------------------------------------
 * Helpers
 * --------------------------------------------------------- */

// Create wireframe edges for an AABB box
const createBoxWire = ({ x, y, z }, w, h, d) => {
  const [x0, x1] = [x - w / 2, x + w / 2];
  const [y0, y1] = [y - h / 2, y + h / 2];
  const [z0, z1] = [z - d / 2, z + d / 2];

  return [
    // bottom
    { start: { x: x0, y: y0, z: z0 }, end: { x: x1, y: y0, z: z0 } },
    { start: { x: x1, y: y0, z: z0 }, end: { x: x1, y: y1, z: z0 } },
    { start: { x: x1, y: y1, z: z0 }, end: { x: x0, y: y1, z: z0 } },
    { start: { x: x0, y: y1, z: z0 }, end: { x: x0, y: y0, z: z0 } },

    // top
    { start: { x: x0, y: y0, z: z1 }, end: { x: x1, y: y0, z: z1 } },
    { start: { x: x1, y: y0, z: z1 }, end: { x: x1, y: y1, z: z1 } },
    { start: { x: x1, y: y1, z: z1 }, end: { x: x0, y: y1, z: z1 } },
    { start: { x: x0, y: y1, z: z1 }, end: { x: x0, y: y0, z: z1 } },

    // verticals
    { start: { x: x0, y: y0, z: z0 }, end: { x: x0, y: y0, z: z1 } },
    { start: { x: x1, y: y0, z: z0 }, end: { x: x1, y: y0, z: z1 } },
    { start: { x: x0, y: y1, z: z0 }, end: { x: x0, y: y1, z: z1 } },
    { start: { x: x1, y: y1, z: z0 }, end: { x: x1, y: y1, z: z1 } }
  ];
};

/* ---------------------------------------------------------
 * Colors
 * --------------------------------------------------------- */

const C = {
  WHITE: [1.0, 1.0, 1.0],
  CYAN:  [0.2, 0.8, 1.0],
  ORANGE:[1.0, 0.6, 0.2],
  PURPLE:[0.7, 0.4, 1.0]
};

/* ---------------------------------------------------------
 * Geometry Setup
 * --------------------------------------------------------- */

// --- Wireframe Cube ---
const cubeCenter = { x: 0, y: 0, z: 0 };
const cubeSize = 6;

const cubeWire = new Path1D(
  createBoxWire(cubeCenter, cubeSize, cubeSize, cubeSize)
);

// --- Solid Box (for comparison) ---
const solidBox = new Box3D(cubeCenter, cubeSize, cubeSize, cubeSize);

// --- Ellipsoid Shell ---
const ellipsoidShell = new Ellipsoid3D(
  { x: 0, y: 0, z: 0 },
  3.5, 2.5, 4.0,   // outer radii
  2.8, 1.8, 3.2    // inner radii (hollow)
);

// --- Optional rotation ---
const rotatedEllipsoid = new RotatedShape(
  ellipsoidShell,
  Math.PI * 0.25,
  Math.PI * 0.25,
  0
);

// --- Optional translation ---
const shiftedEllipsoid = new TranslatedShape(
  rotatedEllipsoid,
  0, 0, 0
);

/* ---------------------------------------------------------
 * Scene Export
 * --------------------------------------------------------- */

export const geometryDifferenceDemoConfig = {
  name: "geometryDifferenceDemo",
  brush: "basic",

  config: {
    samplers: [
      () => cubeWire.sample(),        // id 0
      () => solidBox.sample(),        // id 1
      () => ellipsoidShell.sample() // id 2
    ],

    counts: [
      2000,   // wireframe
      12000,  // solid cube
      18000   // ellipsoid shell
    ],

    sceneColors: [
      C.WHITE,
      C.CYAN,
      C.ORANGE
    ]
  },

  /* -----------------------------------------------------
   * Animation Hook
   * ----------------------------------------------------- */

  animate: (pointData, time, mat4) => {
    pointData.forEach(obj => {
      mat4.identity(obj.modelMatrix);

      // slow global spin
      mat4.rotateY(obj.modelMatrix, obj.modelMatrix, time * 0.2);

      // subtle breathing on ellipsoid
      if (obj.id === 2) {
        const s = 1 + Math.sin(time * 2.0) * 0.05;
        mat4.scale(obj.modelMatrix, obj.modelMatrix, [s, s, s]);
      }
    });
  }
};
