import { blankConfig } from "./setups/blank.js";
import { christmasTreeConfig } from "./setups/christmas_tree.js";
import { orbitSceneDemoConfig } from "./setups/physics_demo.js";
import { geometryManifoldsDemoConfig } from "./setups/geometry_manifolds_demo.js";
import { geometryUnionDemoConfig } from "./setups/geometry_union_demo.js";
import { geometryDifferenceDemoConfig } from "./setups/geometry_difference_demo.js";
import { geometryIntersectionDemoConfig } from "./setups/geometry_intersection_demo.js";
import { proteinFoldingDemoConfig } from "./setups/biology_demo.js";
import { proteinFoldingExperimentalDemoConfig } from "./setups/biology_demo_experimental.js";
import { starsConfig } from "./setups/hero_scene.js";
import { physicsJellyConfig } from "./setups/jelly.js";

export const SCENES = [
  blankConfig,
  geometryManifoldsDemoConfig,
  geometryUnionDemoConfig,
  geometryDifferenceDemoConfig,
  geometryIntersectionDemoConfig,
  orbitSceneDemoConfig,
  christmasTreeConfig,
  proteinFoldingDemoConfig,
  proteinFoldingExperimentalDemoConfig,
  starsConfig,
  physicsJellyConfig,
];

export function getSceneConfig(index) {
  return SCENES[index % SCENES.length];
}

export function getSceneByName(name) {
  return SCENES.find(s => s.name === name) || SCENES[0];
}