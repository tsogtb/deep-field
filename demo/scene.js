import { Path1D, helix, conicHelix} from "../src/curves1d.js";
import { Cone3D, Sphere3D } from "../src/shapes3d.js";
import { sampleIntersection, sampleUnion } from "../src/composite_shapes.js";
import { RotatedShape } from "../src/rotated_shape.js";

const tornado = new Path1D([
  conicHelix({
    center: { x: 0, y: 0, z: -50 },
    radiusStart: 50,
    radiusEnd: 0,
    height: 100,
    turns: 12
  })
]);

const spring = new Path1D([
  helix({
    center: {x: 0, y: 0, z: 0},
    radius: 10,
    height: 50,
    turns: 5    
  })
]);

const segments = [];
const step = 5;
const range = 25;

for (let i = -range; i <= range; i += step) {
  segments.push({ 
    start: { x: -range, y: i, z: 0 }, 
    end:   { x: range,  y: i, z: 0 } 
  });
  segments.push({ 
    start: { x: i, y: -range, z: 0 }, 
    end:   { x: i, y: range,  z: 0 } 
  });
}

const flatGridPath = new Path1D(segments);

const zxGrid = new RotatedShape(
  flatGridPath, 
  Math.PI / 2, 0, 0
);


const myDemoSphere1 = new Sphere3D({ x: 2, y: 0, z: 0 }, 4)
const myDemoSphere2 = new Sphere3D({ x: -2, y: 0, z: 0 }, 4)

const christmasCone = new Cone3D({x:0, y:0, z:0}, 1, 5, 0.9)


export const SCENES = [
  { name: "HUDF", config: { passive: true } },
  { name: "christmastree", 
    config: {
      samplers: [
        () => christmasCone.sample(),
        () => zxGrid.sample(),
      ],
      counts: [
        2000,
        100000,
      ],
      sceneColors: [
        [0.85, 0.2, 0.3]
      ] 
  }},
  { name: "zx", 
    config: {
      samplers: [
        () => tornado.sample(),
        () => zxGrid.sample()
      ],
      counts: [
        200000,
        100000,
      ],
      sceneColors: [
        [0.85, 0.2, 0.3],
        [0, 1, 0],
      ] 
  }},
  { name: "zx", 
    config: {
      samplers: [
        () => zxGrid.sample(),
      ],
      counts: [
        100000,
      ],
      sceneColors: [
        [0.85, 0.2, 0.3]
      ] 
  }},
  { name: "Union of 2 Spheres", 
    config: {
      samplers: [
        () => sampleUnion([
          myDemoSphere1,
          myDemoSphere2,
        ])
      ],
      counts: [
        10000,
      ],
  }},
  { name: "Intersection of 2 Spheres", 
    config: {
      samplers: [
        () => sampleIntersection([
          myDemoSphere1,
          myDemoSphere2,
        ])
      ],
      counts: [
        10000,
      ],
  }},
];

export function getSceneConfig(index) {
  return SCENES[index % SCENES.length];
}
