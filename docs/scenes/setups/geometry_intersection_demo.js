import { Box3D, Cone3D, Cylinder3D, Ellipsoid3D } from "/deep-field//geometry/shapes3d.js";
import { CompositeShape, RotatedShape } from "/deep-field/geometry/composites.js";
import { COLORS } from "/deep-field/data/colors.js";

/* ---------------------------------------------------------
 * SKELETON COMPONENTS (Hollow Overlap) — Located at y: -6
 * --------------------------------------------------------- */

// 1. The Facetor Shell (Box)
const boxBase = new Box3D({ x: 0, y: -5, z: 0 }, 0.25, 2.5, 30);
const boxInner = new Box3D({ x: 0, y: -5, z: 0 }, 2.49, 0.24, 29.99);
const boxSkeleton = new CompositeShape('difference', [boxBase, boxInner])

// 2. The Taper Shell (Hollow Cone)
// innerRadius 5.9 creates a very thin 0.1 wall
const cone1Skeleton = new RotatedShape(
  new Cone3D({ x: 0, y: -5, z: 0 }, 1.0, 15, 0.99, 14.9), 
  0, 0, 0
);
const cone2Skeleton = new RotatedShape(
  new Cone3D({ x: 0, y: -5, z: 0 }, 1.0, 15, 0.99, 14.9), 
  Math.PI, 0, 0
);

// 3. The Modifier Shell (Hollow Ellipsoid)
const cylinderSkeleton = new Cylinder3D(
  { x: 0, y: -5, z: 0 },
  0.5, 30, 0.49,
);

/* ---------------------------------------------------------
 * THE "STELLAR SHARD" (Solid Hero) — Located at y: +6
 * --------------------------------------------------------- */

const result = new CompositeShape("intersection", [
  /*
  new RotatedShape(
    new Box3D({ x: 0, y: 6, z: 0 }, 10, 4, 10),
    Math.PI / 4, Math.PI / 4, 0
  ),
  */
  new CompositeShape(
    "union",
    [
      new RotatedShape(
        new Cone3D({ x: 0, y: 5, z: 0 }, 1.0, 15), 
        0, 0, 0 
      ),
      new RotatedShape(
        new Cone3D({ x: 0, y: 5, z: 0 }, 1.0, 15), 
        Math.PI, 0, 0 
      ),
    ]
  ),
  
 new Cylinder3D(
    { x: 0, y: 5, z: 0 },
    0.5, 30,
  ),

  //new Box3D({ x: 0, y: 5, z: 0 }, 2.5, 2.5, 30)
]);

/* ---------------------------------------------------------
 * DEMO CONFIG
 * --------------------------------------------------------- */

export const geometryIntersectionDemoConfig = {
  name: "geometryIntersectionDemo",
  brush: "circle",

  config: {
    samplers: [
      //() => boxSkeleton.sample(),      
      () => cone1Skeleton.sample(),   
      () => cone2Skeleton.sample(),   
      () => cylinderSkeleton.sample(),
      () => result.sample(),           
    ],

    counts: [
      //20000, // Box Shell
      20000, // Box Shell
      20000, // Cone Shell
      20000, // Ellipsoid Shell
      150000 // Solid Hero
    ],

    sceneColors: [
      //COLORS.AMBER_MIST,   
      COLORS.TEAL_MIST,
      COLORS.TEAL_MIST,      
      COLORS.SILVER_MIST,  
      COLORS.GOLD_CORE     
    ]
  }
};