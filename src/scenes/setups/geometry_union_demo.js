import { Box3D, Cylinder3D, Sphere3D } from "../../../geometry/shapes3d.js";
import { CompositeShape, RotatedShape } from "../../../geometry/composites.js";
import { Circle2D } from "../../../geometry/shapes2d.js";
import { COLORS } from "../../data/colors.js";
import { BoxWireframe } from "../../../geometry/path1d.js";


// --- SKELETON COMPONENTS (Located at y: -10) ---
const sphere1Shell = new Sphere3D({ x: 2.5, y: -5, z: 0 }, 2.5, 2.48);
const sphere2Shell = new Sphere3D({ x: -2.5, y: -5, z: 0 }, 2.5, 2.48);

const cylinderLateral = new RotatedShape(new Cylinder3D({ x: 0, y: -5, z: 0 }, 2.5, 5, 2.48), 0, Math.PI / 2, 0);
const cylinderBase = new RotatedShape(new Circle2D({ x: -2.5, y: -5, z: 0 }, 2.5), 0, -Math.PI / 2, 0);
const cylinderTop = new RotatedShape(new Circle2D({ x: 2.5, y: -5, z: 0 }, 2.5), 0, -Math.PI / 2, 0);
const cylinderBaseRim = new RotatedShape(new Circle2D({ x: -2.5, y: -5, z: 0 }, 2.5, 2.49), 0, -Math.PI / 2, 0);
const cylinderTopRim = new RotatedShape(new Circle2D({ x: 2.5, y: -5, z: 0 }, 2.5, 2.49), 0, -Math.PI / 2, 0);

const boxBase = new Box3D({ x: 0, y: -5, z: 0 }, 4.0, 0.5, 25.0);
const boxBaseInner = new Box3D({ x: 0, y: -5, z: 0 }, 3.98, 0.48, 24.98);
const boxShell = new CompositeShape('difference', [boxBase, boxBaseInner]);

const boxWireframe = BoxWireframe(
  { x: 0, y: -5, z: 0 },
  4.0,
  0.5,
  25.0
);

// --- SOLID COMPONENTS FOR UNION (Located at y: 10) ---
const box = new Box3D({ x: 0, y: 5, z: 0 }, 4.0, 0.5, 25.0);
const cylinder = new RotatedShape(new Cylinder3D({ x: 0, y: 5, z: 0 }, 2.5, 5), 0, Math.PI / 2, 0);
const sphere1 = new Sphere3D({ x: 2.5, y: 5, z: 0 }, 2.5);
const sphere2 = new Sphere3D({ x: -2.5, y: 5, z: 0 }, 2.5);
const boxxWireframe = BoxWireframe(
  { x: 0, y: 5, z: 0 },
  4.0,
  0.5,
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
      () => boxxWireframe.sample(),
      () => result.sample(),          // The Final Union
    ],

    counts: [
      7500,
      7500, // box
      2500, // cylinder
      1000,  // base
      1000,  // top
      2000,
      2000,
      7500, // sphere1
      7500, // sphere2
      2500,
      75000 // result (High density for the hero object)
    ],

    sceneColors: [
      COLORS.BLUE_MIST,
      COLORS.BLUE_CORE, // box
      COLORS.CYAN_CORE,  // cylinder
      COLORS.CYAN_CORE,  // base
      COLORS.CYAN_CORE,  // top
      COLORS.SUNSET_ORANGE_CORE,  // base
      COLORS.SUNSET_ORANGE_CORE,  // top
      COLORS.UV_CORE,  // sphere1
      COLORS.UV_CORE,  // sphere2
      COLORS.SILVER_MIST, // result
      COLORS.SILVER_CORE, // result
    ]
  } 
};