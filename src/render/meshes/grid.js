import { mat4 } from "https://esm.sh/gl-matrix";

export function createGridLayer(regl, size = 20, step = 1) {
  const half = size / 2;
  const lines = [];

  // X lines (parallel to X-axis, varying Z)
  for (let z = -half; z <= half; z += step) {
    lines.push(-half, 0, z, half, 0, z);
  }

  // Z lines (parallel to Z-axis, varying X)
  for (let x = -half; x <= half; x += step) {
    lines.push(x, 0, -half, x, 0, half);
  }

  const positions = new Float32Array(lines);
  const colors = new Float32Array(positions.length).fill(0.5); // gray lines

  return [
    {
      id: "grid",
      count: positions.length / 3,
      buffer: regl.buffer(positions),
      colorBuffer: regl.buffer(colors),
      modelMatrix: mat4.create()
    }
  ];
}
