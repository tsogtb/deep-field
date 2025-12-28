import { Cone3D, Cylinder3D, Box3D } from "../../geometry/shapes3d.js";
import { Path1D, conicHelix } from "../../geometry/curves1d.js";
import { RotatedShape } from "../../geometry/rotated_shape.js";
import { Polygon2D, Circle2D, Rectangle2D } from "../../geometry/shapes2d.js";
import { CompositeShape } from "../../geometry/composite_shapes.js";

// --- Helpers ---
const createStar = (cx, cy, or, ir, p = 5) => {
  const pts = [];
  for (let i = 0; i < 2 * p; i++) {
    const r = i % 2 === 0 ? or : ir;
    const a = i * (Math.PI / p) + Math.PI / 2;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), z: 0 });
  }
  return pts;
};

const createWire = (v) => v.map((a, i) => ({ start: a, end: v[(i + 1) % v.length] }));

const createBoxWire = ({x, y, z}, w, h, d) => {
  const [x0, x1, y0, y1, z0, z1] = [x-w/2, x+w/2, y-h/2, y+h/2, z-d/2, z+d/2];
  return [
    {start:{x:x0,y:y0,z:z0}, end:{x:x1,y:y0,z:z0}}, {start:{x:x1,y:y0,z:z0}, end:{x:x1,y:y1,z:z0}},
    {start:{x:x1,y:y1,z:z0}, end:{x:x0,y:y1,z:z0}}, {start:{x:x0,y:y1,z:z0}, end:{x:x0,y:y0,z:z0}},
    {start:{x:x0,y:y0,z:z1}, end:{x:x1,y:y0,z:z1}}, {start:{x:x1,y:y0,z:z1}, end:{x:x1,y:y1,z:z1}},
    {start:{x:x1,y:y1,z:z1}, end:{x:x0,y:y1,z:z1}}, {start:{x:x0,y:y1,z:z1}, end:{x:x0,y:y0,z:z1}},
    {start:{x:x0,y:y0,z:z0}, end:{x:x0,y:y0,z:z1}}, {start:{x:x1,y:y0,z:z0}, end:{x:x1,y:y0,z:z1}},
    {start:{x:x0,y:y1,z:z0}, end:{x:x0,y:y1,z:z1}}, {start:{x:x1,y:y1,z:z0}, end:{x:x1,y:y1,z:z1}}
  ];
};

// --- Tree Core ---
const treeCone = new RotatedShape(new Cone3D({x:0, y:-5, z:0}, 2, 10, 1.93, 9.5), -Math.PI/2, 0, 0);
const treeTrunk = new RotatedShape(new Cylinder3D({x:0, y:-0.5, z:0}, 0.1, 9, 0.09), Math.PI/2, 0, 0);

// --- Spirals with Forced Center Alignment ---
const treeSpiralPath = new Path1D([
  conicHelix({ center: { x: 0, y: -5, z: 0 }, radiusStart: 2.2, radiusEnd: 0.1, height: 9.7, turns: 9 })
]);
treeSpiralPath.center = { x: 0, y: -5, z: 0 }; // Forced alignment before rotation

const spiralVert = new RotatedShape(treeSpiralPath, -Math.PI / 2, 0, 0);
const spiralRed = new RotatedShape(spiralVert, 0, Math.PI, 0);

// --- Star & Rims ---
const starV = createStar(0, 5.0, 0.6, 0.25);
const rim0 = new RotatedShape(new Circle2D({x:0,y:-5,z:0}, 5.0, 4.9), -Math.PI/2, 0, 0);
const rim1 = new RotatedShape(new Circle2D({x:0,y:-5,z:0}, 2.2, 2.1), -Math.PI/2, 0, 0);
const rim2 = new RotatedShape(new Circle2D({x:0,y:-5,z:0}, 4.9, 2.2), -Math.PI/2, 0, 0);

// --- Gifts ---
const makeGift = (pos, size, rot) => {
  const outer = new Box3D(pos, size, size, size);
  const inner = new Box3D(pos, size*0.9, size*0.9, size*0.9);
  const body = new RotatedShape(new CompositeShape('difference', [outer, inner]), 0, rot, 0);
  const edges = new RotatedShape(new Path1D(createBoxWire(pos, size, size, size)), 0, rot, 0);
  const top = new RotatedShape(new Rectangle2D({x:pos.x, y:pos.y+size/2, z:pos.z}, size, size), Math.PI/2, 0, rot);
  return { body, edges, top };
};

const g1 = makeGift({x:-1.5, y:-4.5, z:3}, 1.0, Math.PI/4);
const g2 = makeGift({x:1.5, y:-4.5, z:3}, 1.0, Math.PI/4);
const g3 = makeGift({x:0, y:-4.375, z:3.5}, 1.25, 0);

const C = { GREEN: [0.1, 0.8, 0.2], GOLD: [1.0, 0.9, 0.3], RED: [1.0, 0.1, 0.1], BROWN: [0.4, 0.25, 0.1], BLUE: [0.15, 0.25, 0.65] };

export const christmasTreeConfig = {
  name: "christmasTree",
  config: {
    samplers: [
      () => treeCone.sample(), () => spiralVert.sample(), () => new Polygon2D(starV).sample(),
      () => rim0.sample(), () => rim1.sample(), () => rim2.sample(), () => treeTrunk.sample(),
      () => g1.body.sample(), () => g1.edges.sample(), () => g1.top.sample(),
      () => g2.body.sample(), () => g2.edges.sample(), () => g2.top.sample(),
      () => g3.body.sample(), () => g3.edges.sample(), () => g3.top.sample(),
      () => new Path1D(createWire(starV)).sample(), () => spiralRed.sample()
    ],
    counts: [
      50000, 7000, 300, 3000, 3000, 2000, 5000, 
      2000, 1500, 1500, 2000, 1500, 1500, 3500, 2500, 2500, 
      1500, 7000
    ],
    sceneColors: [
      C.GREEN, C.GOLD, C.RED, C.GOLD, C.GOLD, C.RED, C.BROWN,
      C.RED, C.GOLD, C.GOLD, C.RED, C.GOLD, C.GOLD, C.BLUE, C.GOLD, C.GOLD,
      C.GOLD, C.RED
    ]
  },
  animate: (pointData, time, mat4) => {
    pointData.forEach((obj) => {
      mat4.identity(obj.modelMatrix);
      mat4.rotateY(obj.modelMatrix, obj.modelMatrix, time * 0.2);
      if (obj.id === 2 || obj.id === 16) {
        mat4.translate(obj.modelMatrix, obj.modelMatrix, [0, Math.sin(time * 2.0) * 0.1, 0]);
      }
    });
  }
};