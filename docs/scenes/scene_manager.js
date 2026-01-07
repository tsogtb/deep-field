import { blankConfig } from "./setups/blank.js";
import { christmasTreeConfig } from "./setups/christmas_tree.js";
import { orbitSceneConfig } from "./setups/physics_demo.js";
import { geometryUnionDemoConfig } from "./setups/geometry_union_demo.js";
import { geometryDifferenceDemoConfig } from "./setups/geometry_difference_demo.js";
import { geometryIntersectionDemoConfig } from "./setups/geometry_intersection_demo.js";

export const SCENES = [
  blankConfig,
  geometryUnionDemoConfig,
  geometryDifferenceDemoConfig,
  geometryIntersectionDemoConfig,
  orbitSceneConfig,
  christmasTreeConfig,
];

export function getSceneConfig(index) {
  return SCENES[index % SCENES.length];
}

export function getSceneByName(name) {
  return SCENES.find(s => s.name === name) || SCENES[0];
}