import { blankConfig } from "/deep-field/scenes/setups/blank.js";
import { christmasTreeConfig } from "/deep-field/scenes/setups/christmas_tree.js";
import { orbitSceneConfig } from "/deep-field/scenes/setups/orbit_physics.js";

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