import { blankConfig } from "/deep-field/scenes/setups/blank.js";
import { christmasTreeConfig } from "/deep-field/scenes/setups/christmas_tree.js";
import { orbitSceneConfig } from "/deep-field/scenes/setups/orbit_physics.js";
import { geometryUnionDemoConfig } from "/deep-field/scenes/setups/geometry_union_demo.js";
import { geometryDifferenceDemoConfig } from "/deep-field/scenes/setups/geometry_difference_demo.js";
import { geometryIntersectionDemoConfig } from "/deep-field/scenes/setups/geometry_intersection_demo.js";

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