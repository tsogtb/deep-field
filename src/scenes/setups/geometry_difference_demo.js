import { Box3D, Ellipsoid3D } from "../../../geometry/shapes3d.js";
import { CompositeShape } from "../../../geometry/composites.js";
import { COLORS } from "../../data/colors.js";
import { BoxWireframe } from "../../../geometry/path1d.js";


// Primary shape (what remains)
const boxOuter = new Box3D(
  { x: 0, y: -5, z: 0 },
  12.0, 4.0, 8.0
);

// Subtractor (what is removed)
const ellipsoidShell = new Ellipsoid3D(
  { x: 0, y: -5, z: 0 },
  6.6, 2.2, 4.4,
  6.59, 2.19, 4.39,
);

// Visual-only shell (optional, helps explain subtraction)
const boxInner = new Box3D(
  { x: 0, y: -5, z: 0 },
  11.99, 3.99, 7.999
);

const boxShell = new CompositeShape("difference", [
  boxOuter,
  boxInner
]);

const boxWireframe = BoxWireframe(
  { x: 0, y: -5, z: 0 },
  12.0,
  4.0,
  8.0
);

/* ---------------------------------------------------------
 * FINAL DIFFERENCE RESULT (Located at y: +5)
 * --------------------------------------------------------- */

const result = new CompositeShape("difference", [
  new Box3D({ x: 0, y: 5, z: 0 }, 12.0, 4.0, 8.0),
  new Ellipsoid3D({ x: 0, y: 5, z: 0 }, 6.6, 2.2, 4.4)
]);

/* ---------------------------------------------------------
 * DEMO CONFIG
 * --------------------------------------------------------- */

export const geometryDifferenceDemoConfig = {
  name: "geometryDifferenceDemo",
  brush: "square",

  config: {
    samplers: [
      () => boxWireframe.sample(),
      () => boxShell.sample(), // Base volume reference
      () => ellipsoidShell.sample(),
      () => result.sample(),   // Final difference (hero)
    ],

    counts: [
      7500,
      12500,   // shell (context)
      12500,
      75000,  // result (hero density)
    ],

    sceneColors: [
      COLORS.BLUE_MIST,  
      COLORS.BLUE_CORE,     
      COLORS.SILVER_CORE,       
      COLORS.UV_CORE // result
    ]
  }
};
