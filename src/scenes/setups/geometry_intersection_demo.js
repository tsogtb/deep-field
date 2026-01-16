import { Box3D, Cone3D, Cylinder3D, Ellipsoid3D } from "../../../geometry/shapes3d.js";
import { CompositeShape, RotatedShape } from "../../../geometry/composites.js";
import { COLORS } from "../../data/colors.js";
import { Circle2D } from "../../../geometry/shapes2d.js";
import { BoxWireframe } from "../../../geometry/path1d.js";

/* ---------------------------------------------------------
 * HERO INTERSECTION GEOMETRY — Located at y: +6
 * --------------------------------------------------------- */

const ellipsoidShell = new Ellipsoid3D( 
  { x: 0, y: -5.0, z: 0, }, 
  5, 5, 5,
  4.99, 4.99, 4.99,
)



// --- Boxes (stacked) ---
const bigBox =   new RotatedShape(new Box3D(
  { x: 0, y: -5.0, z: 0 },
  6.0, 9.0, 6.0,
  ), 0, Math.PI / 4, 0);

const bigBoxInner = new RotatedShape(new Box3D(
  { x: 0, y: -5.0, z: 0 },
  5.99, 8.99, 5.99
), 0, Math.PI / 4, 0);

const bigBoxShell = new CompositeShape("difference", [bigBox, bigBoxInner]);

/*
const smallBox = new Box3D(
  { x: 0, y: -10.0, z: 0 },
  5.0, 5.0, 5.0
);


const smallBoxInner = new Box3D(
  { x: 0, y: -10.0, z: 0 },
  4.99, 4.99, 4.99
);

const smallBoxShell = new CompositeShape("difference", [smallBox, smallBoxInner])


const tinyBox = new Box3D(
  { x: 0, y: -15.0, z: 0 },
  2.5, 5.0, 2.5
);


const tinyBoxInner = new Box3D(
  { x: 0, y: -15.0, z: 0 },
  2.49, 4.99, 2.49
);

const tinyBoxShell = new CompositeShape("difference", [tinyBox, tinyBoxInner])
*/

const bigBoxWireframe = new RotatedShape(BoxWireframe(
  { x: 0, y: -5.0, z: 0 },
  6.0, 9.0, 6.0
), 0, Math.PI / 4, 0);

/*
const smallBoxWireframe = BoxWireframe(
  { x: 0, y: -10.0, z: 0 },
  5.0, 5.0, 5.0
);

const tinyBoxWireframe = BoxWireframe(
  { x: 0, y: -15.0, z: 0 },
  2.5, 5.0, 2.5
);
*/



// --- Cone (base contains box square, tip touches ceiling) ---
const coneShell = new RotatedShape(new Cone3D(
  { x: 0, y: 0, z: 0 }, // base sits at bottom of box
  5.0,                // circumscribed square radius
  5.0,                 // exactly box height
  4.99,
  4.9,
), Math.PI / 2, 0, 0);

const coneBase = new RotatedShape(new Circle2D({ x: 0, y: 0, z: 0 }, 5), Math.PI/2, 0, 0);
const coneBaseRim = new RotatedShape(new Circle2D({ x: 0, y: 0, z: 0 }, 5, 4.99), Math.PI/2, 0, 0);


// --- FINAL INTERSECTION ---


// --- Cone (base contains box square, tip touches ceiling) ---
const cone = new RotatedShape(new Cone3D(
  { x: 0, y: -6, z: 0 }, // base sits at bottom of box
  4.3,                // circumscribed square radius
  8.0,                 // exactly box height
  4.29,
  7.9,
), -Math.PI / 2, 0, 0);


const result = new CompositeShape("intersection", [
  new CompositeShape("union", [
    new Box3D(
      { x: 0, y: 5.0, z: 0 },
      6.0, 9.0, 6.0,
      ),
      /*
      new Box3D(
      { x: 0, y: 10.0, z: 0 },
      5.0, 5.0, 5.0
    ),
    new Box3D(
      { x: 0, y: 5.0, z: 0 },
      2.5, 5.0, 2.5
    ),
    */
  ]),
  new RotatedShape(new Box3D(
    { x: 0, y: 2.0, z: 0 },
    6.0, 9.0, 6.0,
    ), 0, Math.PI / 4, 0),
  new RotatedShape(new Cone3D(
    { x: 0, y: 7.0, z: 0 }, // base sits at bottom of box
    5.0,                // circumscribed square radius
    5.0,                 // exactly box height
  ), Math.PI / 2, 0, 0),

  new Ellipsoid3D( 
    { x: 0, y: 2.0, z: 0, }, 
    5, 5, 5,
  )
]);


/* ---------------------------------------------------------
 * DEMO CONFIG
 * --------------------------------------------------------- */

export const geometryIntersectionDemoConfig = {
  name: "geometryIntersectionDemo",
  brush: "square",

  config: {
    samplers: [
      () => ellipsoidShell.sample(),
      () => bigBoxWireframe.sample(),
      /*
      () => smallBoxWireframe.sample(),
      () => tinyBoxWireframe.sample(),
       */
      () => coneBaseRim.sample(),
      () => coneBase.sample(),
      () => coneShell.sample(),
      () => bigBoxShell.sample(),     
      /*
      () => smallBoxShell.sample(),  
      () => tinyBoxShell.sample(),
      */  
      () => result.sample(),  
    ],

    counts: [
      10000,
      3000,
      /*
      1000,
      500,
      */
      1000,
      5000,
      7000,
      15000,
      /*
      10000,
      5000,
      */
      55000,
    ],

    sceneColors: [
      COLORS.SILVER_MIST,
      COLORS.SILVER_MIST,  
      /*
      COLORS.BLUE_CORE,  
      COLORS.BLUE_CORE,  
      */
      COLORS.SILVER_MIST,   
      COLORS.SILVER_MIST,   
      COLORS.SILVER_MIST,  
      COLORS.SILVER_MIST,   
      /* 
      COLORS.BLUE_CORE,    
      COLORS.BLUE_CORE,   
      */
      COLORS.SILVER_MIST,     
    ]
  }
};