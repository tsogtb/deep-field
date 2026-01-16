import { Box3D, Cylinder3D, Sphere3D } from "../../../geometry/shapes3d.js";
import { CompositeShape, RotatedShape } from "../../../geometry/composites.js";
import { Circle2D } from "../../../geometry/shapes2d.js";
import { COLORS } from "../../data/colors.js";
import { BoxWireframe } from "../../../geometry/path1d.js";


// --- SKELETON COMPONENTS (Located at y: -10) ---
const sphere1Shell = new Sphere3D({ x: 2.5, y: -5, z: 0 }, 2.5, 2.49);
const sphere2Shell = new Sphere3D({ x: -2.5, y: -5, z: 0 }, 2.5, 2.49);

const cylinderLateral = new RotatedShape(new Cylinder3D({ x: 0, y: -5, z: 0 }, 2.5, 5, 2.49), 0, Math.PI / 2, 0);
const cylinderBase = new RotatedShape(new Circle2D({ x: -2.5, y: -5, z: 0 }, 2.5), 0, -Math.PI / 2, 0);
const cylinderTop = new RotatedShape(new Circle2D({ x: 2.5, y: -5, z: 0 }, 2.5), 0, -Math.PI / 2, 0);
const cylinderBaseRim = new RotatedShape(new Circle2D({ x: -2.5, y: -5, z: 0 }, 2.5, 2.49), 0, -Math.PI / 2, 0);
const cylinderTopRim = new RotatedShape(new Circle2D({ x: 2.5, y: -5, z: 0 }, 2.5, 2.49), 0, -Math.PI / 2, 0);

const boxBase = new Box3D({ x: 0, y: -5, z: 0 }, 4.0, 0.3, 25.0);
const boxBaseInner = new Box3D({ x: 0, y: -5, z: 0 }, 3.99, 0.29, 24.99);
const boxShell = new CompositeShape('difference', [boxBase, boxBaseInner]);

const boxWireframe = BoxWireframe(
  { x: 0, y: -5, z: 0 },
  4.0,
  0.3,
  25.0
);

// --- SOLID COMPONENTS FOR UNION (Located at y: 10) ---
const box = new Box3D({ x: 0, y: 5, z: 0 }, 4.0, 0.3, 25.0);
const cylinder = new RotatedShape(new Cylinder3D({ x: 0, y: 5, z: 0 }, 2.5, 5), 0, Math.PI / 2, 0);
const sphere1 = new Sphere3D({ x: 2.5, y: 5, z: 0 }, 2.5);
const sphere2 = new Sphere3D({ x: -2.5, y: 5, z: 0 }, 2.5);
const boxxWireframe = BoxWireframe(
  { x: 0, y: 5, z: 0 },
  4.0,
  0.3,
  25.0
);

const result = new CompositeShape("union", [cylinder, sphere1, sphere2, box,]);

export const geometryUnionDemoConfig = {
  name: "geometryUnionDemo",
  brush: "square",

  config: {
    samplers: [
      () => boxWireframe.sample(),
      () => boxShell.sample(),        // The Solar Wings
      () => cylinderLateral.sample(), // The Main Body
      () => cylinderBase.sample(),    // Left Cap Face
      () => cylinderTop.sample(),     // Right Cap Face
      () => cylinderBaseRim.sample(),
      () => cylinderTopRim.sample(),
      () => sphere1Shell.sample(),    // Left Sphere
      () => sphere2Shell.sample(),    // Right Sphere
      //() => boxxWireframe.sample(),
      () => result.sample(),          // The Final Union
    ],

    counts: [
      3500,
      10500, // box
      3500, // cylinder
      1000,  // base
      1000,  // top
      650,
      650,
      3500, // sphere1
      3500, // sphere2
      //7500,
      100000 // result (High density for the hero object)
    ],

    sceneColors: [
      COLORS.SILVER_MIST,
      COLORS.SILVER_MIST, // box
      COLORS.SILVER_MIST,  // cylinder
      COLORS.SILVER_MIST,  // base
      COLORS.SILVER_MIST,  // top
      COLORS.SILVER_MIST,  // base
      COLORS.SILVER_MIST,  // top
      COLORS.SILVER_MIST,  // sphere1
      COLORS.SILVER_MIST,  // sphere2
      //COLORS.SILVER_SHADOW, // result
      COLORS.SILVER_MIST, // result
    ]
  } 
};