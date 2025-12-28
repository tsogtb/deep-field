import { christmasTreeConfig } from "../scenes/christmas_tree.js";
import { orbitSceneConfig } from "../scenes/orbit_physics.js";

export const SCENES = [
  christmasTreeConfig,
  orbitSceneConfig,
];

export function getSceneConfig(index) {
  return SCENES[index % SCENES.length];
}

export function getSceneByName(name) {
  return SCENES.find(s => s.name === name) || SCENES[0];
}