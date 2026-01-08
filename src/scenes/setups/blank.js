/* scenes/blank.js */
export const blankConfig = {
  name: "blankScene",
  brush: "basic",
  config: {
    samplers: [() => ({ x: 0, y: 0, z: 0 })],
    counts: [0],
    sceneColors: [[0, 0, 0]],
  },
};