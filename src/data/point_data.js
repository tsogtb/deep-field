import { mat4 } from "https://esm.sh/gl-matrix";

/**
 * Generates point data for rendering.
 * Each point set has a position buffer, color buffer, and model matrix.
 * 
 * @param {Object} regl - The REGL instance
 * @param {Object} options
 * @param {Function[]} options.samplers - Array of sampling functions returning {x, y, z}
 * @param {number[]} options.counts - Number of points per sampler
 * @param {Array} options.sceneColors - Optional RGB colors per sampler
 * @returns {Array} Array of point data objects
 */
export function createPointData(regl, { samplers = [], counts = [], sceneColors = [] } = {}) {
  const activeCount = Math.min(samplers.length, counts.length);

  return samplers.slice(0, activeCount).map((sampleFn, i) => {
    const n = counts[i];
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const rgb = sceneColors[i] || [1.0, 1.0, 1.0];

    for (let j = 0; j < n; j++) {
      const p = sampleFn();
      const idx = j * 3;

      pos[idx]     = p.x;
      pos[idx + 1] = p.y;
      pos[idx + 2] = p.z;

      col[idx]     = rgb[0];
      col[idx + 1] = rgb[1];
      col[idx + 2] = rgb[2];
    }

    return {
      buffer: regl.buffer(pos),
      colorBuffer: regl.buffer(col),
      count: n,
      modelMatrix: mat4.create(),
      id: i,
    };
  });
}
