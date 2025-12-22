/**
 * scene.js
 */

export const SCENES = [
  { name: "Golden Starfield", config: { passive: true } },
  {
    name: "Holiday Ornaments",
    config: {
      passive: false,
      clusters: [
        { num_points: 5000, center: { x: 0, y: 1, z: 0 }, radius: 0.5, color: [1,0,0] },
        { num_points: 5000, center: { x: 0, y: -1, z: 0 }, radius: 0.8, color: [0,1,0] }
      ]
    }
  },
  {
    name: "Snowfall",
    config: {
      passive: false,
      clusters: Array.from({ length: 20 }, () => ({
        num_points: 500,
        center: { x: Math.random()*10-5, y: Math.random()*10, z: Math.random()*5 },
        radius: 0.2,
        color: [1,1,1]
      }))
    }
  }
];

export function getSceneConfig(index) {
  return SCENES[index % SCENES.length];
}
