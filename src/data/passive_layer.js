import { mat4 } from "https://esm.sh/gl-matrix";
import { COLORS } from "./colors.js";
import { BoxWireframe, Path1D } from "../../geometry/path1d.js";
import { Rectangle2D } from "../../geometry/shapes2d.js";
import { RotatedShape } from "../../geometry/composites.js";

function SquareWireframe(center, size) {
  const h = size / 2;
  const v = (x, y, z) => ({ x, y, z });

  const p = {
    A: v(center.x - h, center.y, center.z - h),
    B: v(center.x + h, center.y, center.z - h),
    C: v(center.x + h, center.y, center.z + h),
    D: v(center.x - h, center.y, center.z + h),
  };

  const line = (start, end) => ({ start, end });

  return new Path1D([
    line(p.A, p.B),
    line(p.B, p.C),
    line(p.C, p.D),
    line(p.D, p.A),
  ]);
}

const FRAME_COUNT = 5000;

const squareBottom = SquareWireframe({ x: 0, y: -15, z: 0 }, 30);
const squareTop    = SquareWireframe({ x: 0, y:  15, z: 0 }, 30);

function sampleFrame(path) {
  const pos = new Float32Array(FRAME_COUNT * 3);
  const col = new Float32Array(FRAME_COUNT * 3);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const p = path.sample();
    pos[i * 3 + 0] = p.x;
    pos[i * 3 + 1] = p.y;
    pos[i * 3 + 2] = p.z;

    col[i * 3 + 0] = COLORS.SILVER_SHADOW[0];
    col[i * 3 + 1] = COLORS.SILVER_SHADOW[1];
    col[i * 3 + 2] = COLORS.SILVER_SHADOW[2];
  }

  return { pos, col };
}

const bottomFrame = sampleFrame(squareBottom);
const topFrame    = sampleFrame(squareTop);




export function createPassiveLayer(regl) {
  return [
    {
      id: "squareFrameBottom",
      count: FRAME_COUNT,
      buffer: regl.buffer(bottomFrame.pos),
      colorBuffer: regl.buffer(bottomFrame.col),
      modelMatrix: mat4.create(),
    },
    {
      id: "squareFrameTop",
      count: FRAME_COUNT,
      buffer: regl.buffer(topFrame.pos),
      colorBuffer: regl.buffer(topFrame.col),
      modelMatrix: mat4.create(),
    }
  ];
}