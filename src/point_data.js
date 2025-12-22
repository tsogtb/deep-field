/**
 * point_data.js
 *
 * Generates point cloud data for REGL rendering.
 * Supports passive background points or clustered shapes.
 */

export function createPointData(regl, { passive = true, clusters = [] } = {}) {
  const totalPoints = passive
    ? DEFAULT_PASSIVE_COUNT
    : clusters.reduce((sum, c) => sum + (c.num_points || 0), 0);

  const positions = new Float32Array(totalPoints * 3);
  const colors = new Float32Array(totalPoints * 3);

  passive ? fillPassivePoints(positions, colors) : fillClusterPoints(positions, colors, clusters);

  return {
    buffer: regl.buffer(positions),
    colorBuffer: regl.buffer(colors),
    count: totalPoints,
  };
}

const DEFAULT_PASSIVE_COUNT = 100_000;
const BACKGROUND_OFFSET_Z = 5;

function fillPassivePoints(positions, colors) {
  const palette = getPalette();
  const len = positions.length / 3;

  for (let i = 0; i < len; i++) {
    const idx = i * 3;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = getPassiveRadius();

    positions[idx]     = r * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[idx + 2] = BACKGROUND_OFFSET_Z + r * Math.cos(phi);

    const c = randomColor(palette);
    colors[idx]     = c[0];
    colors[idx + 1] = c[1];
    colors[idx + 2] = c[2];
  }
}

function fillClusterPoints(positions, colors, clusters) {
  let offset = 0;
  const palette = getPalette();

  clusters.forEach(({ num_points, center, radius, color }) => {
    const baseColor = color || randomColor(palette);

    for (let i = 0; i < num_points; i++) {
      const idx = (offset + i) * 3;
      const theta = Math.random() * 2 * Math.PI;
      const r = radius * Math.sqrt(Math.random());

      positions[idx]     = center.x + r * Math.cos(theta);
      positions[idx + 1] = center.y + r * Math.sin(theta);
      positions[idx + 2] = center.z;

      const brightness = 0.5 + Math.random() * 0.5;
      colors[idx]     = baseColor[0] * brightness;
      colors[idx + 1] = baseColor[1] * brightness;
      colors[idx + 2] = baseColor[2] * brightness;
    }

    offset += num_points;
  });
}

function getPalette() {
  return [
    [1.0, 0.85, 0.7],
    [1.0, 0.4, 0.2],
    [0.5, 0.7, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 0.95, 0.4],
  ];
}

function randomColor(palette) {
  return palette[Math.floor(Math.random() * palette.length)];
}

function getPassiveRadius() {
  return Math.random() > 0.2
    ? 50 + Math.random() * 100
    : 3 + Math.random() * 50;
}
