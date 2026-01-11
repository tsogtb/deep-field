import { Box3D, Ellipsoid3D } from "../../../geometry/shapes3d.js";
import { CompositeShape, RotatedShape } from "../../../geometry/composites.js";
import { COLORS } from "../../data/colors.js";
import { BoxWireframe } from "../../../geometry/path1d.js";
import { Ellipse2D } from "../../../geometry/shapes2d.js";


const R_SMALL = 1.14; // ≈ b * sqrt(1 - (6/6.9)^2)
const R_LARGE = 2.27; // ≈ c * sqrt(1 - (6/6.9)^2)
const R_X = 3.41;     // ≈ a * sqrt(1 - (2/2.3)^2)

const rimXPos = new RotatedShape(
  new Ellipse2D(
    { x: 6, y: -5, z: 0 },
    1.14, // ry
    2.27,  // rz
    1.13,
    2.26,

  ),
  Math.PI / 2,
  Math.PI / 2,
  0
);

const rimXNeg = new RotatedShape(
  new Ellipse2D(
    { x: -6, y: -5, z: 0 },
    R_SMALL,
    R_LARGE,
    R_SMALL - 0.01,
    R_LARGE - 0.01
  ),
  Math.PI / 2,
  Math.PI / 2,
  0
);

const rimYPos = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: -3, z: 0 },
    R_X,
    R_LARGE,
    R_X - 0.01,
    R_LARGE - 0.01
  ),
  Math.PI / 2,
  0,
  0
);

const rimYNeg = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: -7, z: 0 },
    R_X,
    R_LARGE,
    R_X - 0.01,
    R_LARGE - 0.01
  ),
  Math.PI / 2,
  0,
  0
);

const rimZPos = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: -5, z: 4 },
    R_X,
    R_SMALL,
    R_X - 0.01,
    R_SMALL - 0.01
  ),
  0,
  0,
  0
);

const rimZNeg = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: -5, z: -4 },
    R_X,
    R_SMALL,
    R_X - 0.01,
    R_SMALL - 0.01
  ),
  0,
  0,
  0
);


const rimXXPos = new RotatedShape(
  new Ellipse2D(
    { x: 6, y: 5, z: 0 },
    1.14, // ry
    2.27,  // rz
    1.13,
    2.26,

  ),
  Math.PI / 2,
  Math.PI / 2,
  0
);

const rimXXNeg = new RotatedShape(
  new Ellipse2D(
    { x: -6, y: 5, z: 0 },
    R_SMALL,
    R_LARGE,
    R_SMALL - 0.01,
    R_LARGE - 0.01
  ),
  Math.PI / 2,
  Math.PI / 2,
  0
);

const rimYYPos = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: 7, z: 0 },
    R_X,
    R_LARGE,
    R_X - 0.01,
    R_LARGE - 0.01
  ),
  Math.PI / 2,
  0,
  0
);

const rimYYNeg = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: 3, z: 0 },
    R_X,
    R_LARGE,
    R_X - 0.01,
    R_LARGE - 0.01
  ),
  Math.PI / 2,
  0,
  0
);

const rimZZPos = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: 5, z: 4 },
    R_X,
    R_SMALL,
    R_X - 0.01,
    R_SMALL - 0.01
  ),
  0,
  0,
  0
);

const rimZZNeg = new RotatedShape(
  new Ellipse2D(
    { x: 0, y: 5, z: -4 },
    R_X,
    R_SMALL,
    R_X - 0.01,
    R_SMALL - 0.01
  ),
  0,
  0,
  0
);



// Subtractor (what is removed)
const ellipsoidShell = new Ellipsoid3D(
  { x: 0, y: -5, z: 0 },
  6.9, 2.3, 4.6,
  6.89, 2.29, 4.59,
);

// Primary shape (what remains)
const boxOuter = new Box3D(
  { x: 0, y: -5, z: 0 },
  12.0, 4.0, 8.0
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

const boxxWireframe = BoxWireframe(
  { x: 0, y: 5, z: 0 },
  12.0,
  4.0,
  8.0
);

/* ---------------------------------------------------------
 * FINAL DIFFERENCE RESULT (Located at y: +5)
 * --------------------------------------------------------- */

const result = new CompositeShape("difference", [
  new Box3D({ x: 0, y: 5, z: 0 }, 12.0, 4.0, 8.0),
  new Ellipsoid3D({ x: 0, y: 5, z: 0 }, 6.9, 2.3, 4.6)
]);

/* ---------------------------------------------------------
 * DEMO CONFIG
 * --------------------------------------------------------- */

export const geometryDifferenceDemoConfig = {
  name: "geometryDifferenceDemo",
  brush: "square",

  config: {
    samplers: [
      () => rimZZNeg.sample(),
      () => rimZZPos.sample(),
      () => rimYYNeg.sample(),
      () => rimYYPos.sample(),
      () => rimXXNeg.sample(),
      () => rimXXPos.sample(),
      () => rimZNeg.sample(),
      () => rimZPos.sample(),
      () => rimYNeg.sample(),
      () => rimYPos.sample(),
      () => rimXNeg.sample(),
      () => rimXPos.sample(),
      () => boxxWireframe.sample(),
      () => boxWireframe.sample(),
      () => boxShell.sample(), // Base volume reference
      () => ellipsoidShell.sample(),
      () => result.sample(),   // Final difference (hero)
    ],

    counts: [
      250,
      250,
      250,
      250,
      250,
      250,
      1000,
      1000,
      1000,
      1000,
      1000,
      1000,
      1500,
      7500,
      12500,   // shell (context)
      12500,
      75000,  // result (hero density)
    ],

    sceneColors: [
      COLORS.UV_MIST, 
      COLORS.UV_MIST,
      COLORS.UV_MIST, 
      COLORS.UV_MIST,
      COLORS.UV_MIST,
      COLORS.UV_MIST, 
      COLORS.SUNSET_ORANGE_CORE, 
      COLORS.SUNSET_ORANGE_CORE,
      COLORS.SUNSET_ORANGE_CORE, 
      COLORS.SUNSET_ORANGE_CORE,
      COLORS.SUNSET_ORANGE_CORE,
      COLORS.SUNSET_ORANGE_CORE, 
      COLORS.UV_MIST, 
      COLORS.BLUE_MIST,  
      COLORS.BLUE_CORE,     
      COLORS.CYAN_CORE,       
      COLORS.UV_CORE // result
    ]
  }
};
