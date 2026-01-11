import { Path1D, bezierQuadratic, helix, conicHelix } from "../../../geometry/path1d.js";
import {
  Circle2D,
  Rectangle2D,
  Polygon2D,
  Triangle2D
} from "../../../geometry/shapes2d.js";
import { COLORS } from "../../data/colors.js";

/* ---------------------------------------------------------
 * 1D MANIFOLDS — PATHS (Z-stacked)
 * --------------------------------------------------------- */

// Desired circle radius for inscribing shapes
const radius = 2.5;

// HEXAGON wireframe (already inscribed)
const hexagonVertices = [];
for (let i = 0; i < 6; i++) {
  const angle = Math.PI / 3 * i;
  hexagonVertices.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 5 });
}
const hexagonWireframeEdges = [];
for (let i = 0; i < hexagonVertices.length; i++) {
  hexagonWireframeEdges.push({
    start: hexagonVertices[i],
    end: hexagonVertices[(i + 1) % hexagonVertices.length]
  });
}
const hexagonWireframe = new Path1D(hexagonWireframeEdges);

// SQUARE wireframe, inscribed (diagonal = 2*radius → side = radius * sqrt(2))
const squareSide = radius * Math.sqrt(2);
const squareWireframe = new Path1D([
  { start: { x: -squareSide / 2, y: -squareSide / 2, z: -5 }, end: { x: squareSide / 2, y: -squareSide / 2, z: -5 } },
  { start: { x: squareSide / 2, y: -squareSide / 2, z: -5 }, end: { x: squareSide / 2, y: squareSide / 2, z: -5 } },
  { start: { x: squareSide / 2, y: squareSide / 2, z: -5 }, end: { x: -squareSide / 2, y: squareSide / 2, z: -5 } },
  { start: { x: -squareSide / 2, y: squareSide / 2, z: -5 }, end: { x: -squareSide / 2, y: -squareSide / 2, z: -5 } }
]);

// TRIANGLE wireframe, equilateral, inscribed (distance from center to vertex = radius)
const triSide = Math.sqrt(3) * radius; // side length
const triangleWireframe = new Path1D([
  { start: { x: -triSide / 2, y: -radius / 2, z: -15 }, end: { x: triSide / 2, y: -radius / 2, z: -15 } },
  { start: { x: triSide / 2, y: -radius / 2, z: -15 }, end: { x: 0, y: radius, z: -15 } },
  { start: { x: 0, y: radius, z: -15 }, end: { x: -triSide / 2, y: -radius / 2, z: -15 } }
]);

// Thin circular ring as a wireframe for circle, z = 15
const circleWireframe = new Circle2D({ x: 0, y: 0, z: 15 }, radius, radius - 0.01);

// Regular helix wrapping around radius = 2.5, z from -15 → 15
const regularHelix = new Path1D([
  helix({
    center: { x: 0, y: 0, z: -15 },
    radius: radius,
    height: 30,
    turns: 6,
  })
]);

// --- Conic helices at the ends of the main helix ---

// Bottom conic helix (z = -15 start, tapering inward)
const conicHelixBottom = new Path1D([
  conicHelix({
    center: { x: 0, y: 0, z: -25 },
    radiusStart: 0.0,
    radiusEnd: radius,
    height: 10,       // small extension beyond main helix
    turns: 2,
  })
]);

// Top conic helix (z = 15 end, tapering outward)
const conicHelixTop = new Path1D([
  conicHelix({
    center: { x: 0, y: 0, z: 15 }, // start slightly below top
    radiusStart: radius,
    radiusEnd: 0.0,
    height: 10,       // small extension beyond main helix
    turns: 2,
  })
]);


// Quadratic Bézier path (scaled to fit radius)
const quadraticBezierPath = new Path1D([
  bezierQuadratic({
    p0: { x: -radius, y: -radius, z: 1 },
    p1: { x: 0, y: radius, z: 3 },
    p2: { x: radius, y: -radius, z: 1 }
  })
]);

/* ---------------------------------------------------------
 * 2D MANIFOLDS — POLYGONS / SHAPES (Z-stacked)
 * --------------------------------------------------------- */

// Filled triangle, inscribed
const triangle = new Triangle2D(
  { x: -triSide / 2, y: -radius / 2, z: -15 },
  { x: triSide / 2, y: -radius / 2, z: -15 },
  { x: 0, y: radius, z: -15 }
);

// Filled square, inscribed
const square = new Rectangle2D(
  { x: 0, y: 0, z: -5 },
  squareSide,
  squareSide
);

// Filled hexagon, already inscribed
const hexagon = new Polygon2D(hexagonVertices);

// Filled circle
const circle = new Circle2D({ x: 0, y: 0, z: 15 }, radius);

const conicHelixConnector = new Path1D([
  { start: { x: 0, y: 0, z: -25 }, end: { x: 0, y: 0, z: 25 } }
]);

/* ---------------------------------------------------------
 * DEMO CONFIG
 * --------------------------------------------------------- */

export const geometryManifoldsDemoConfig = {
  name: "geometryManifoldsDemo",
  brush: "square",

  config: {
    samplers: [
      () => conicHelixConnector.sample(),
      () => conicHelixBottom.sample(),
      () => conicHelixTop.sample(),
      () => triangleWireframe.sample(),
      () => squareWireframe.sample(),
      () => hexagonWireframe.sample(),
      () => circleWireframe.sample(),
      () => regularHelix.sample(),
      //() => quadraticBezierPath.sample(),
      () => triangle.sample(),
      () => square.sample(),
      () => hexagon.sample(),
      () => circle.sample()
    ],

    counts: [
      1_000,
      500,
      500,
      1_000,
      1_000,
      1_000,
      1_000,
      2_500,  // regular helix
      //5_000,   // quadratic Bézier
      2_500,  // triangle fill
      2_500,  // square fill
      2_500,  // hexagon fill
      2_500   // circle fill
    ],

    sceneColors: [
      COLORS.SILVER_CORE,
      COLORS.BLUE_CORE,
      COLORS.BLUE_CORE,
      COLORS.CYAN_CORE,     // triangle wireframe
      COLORS.CYAN_CORE,      // square wireframe
      COLORS.CYAN_CORE,      // hexagon wireframe
      COLORS.CYAN_CORE,      // circle wireframe
      COLORS.BLUE_CORE,        // regular helix
      //COLORS.UV_MIST,        // quadratic Bézier
      COLORS.UV_CORE,     // triangle fill
      COLORS.UV_CORE,      // square fill
      COLORS.UV_CORE,      // hexagon fill
      COLORS.UV_CORE       // circle fill
    ]
  }
};
