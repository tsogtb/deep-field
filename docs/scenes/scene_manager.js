import { blankConfig } from "./setups/blank.js";
import { christmasTreeConfig } from "./setups/christmas_tree.js";
import { orbitSceneConfig } from "./setups/orbit_physics.js";

export const SCENES = [
  blankConfig,
  christmasTreeConfig,
  orbitSceneConfig,
];

export function getSceneConfig(index) {
  return SCENES[index % SCENES.length];
}

export function getSceneByName(name) {
  return SCENES.find(s => s.name === name) || SCENES[0];
}