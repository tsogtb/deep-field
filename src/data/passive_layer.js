import { mat4 } from "https://esm.sh/gl-matrix";

const CONFIG = {
  STARS: { 
    count: 20000, // Replicated high count from original snippet
  }
};

const PALETTE = [
  [1.0, 0.85, 0.7], [1.0, 0.4, 0.2], [0.5, 0.7, 1.0], 
  [1.0, 1.0, 1.0], [1.0, 0.95, 0.4]
];

function generateStars() {
  const count = CONFIG.STARS.count;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * Math.random() - 1.0);
    
    // Tiered radius logic from original snippet
    let r = (Math.random() > 0.2) 
      ? (3.0 + Math.random() * 10.0) 
      : (10.0 + Math.random() * 20.0);

    // Position with Z-offset
    pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    // Color and Brightness
    const baseColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const brightness = 0.4 + Math.random() * 0.6;
    
    col[i * 3 + 0] = baseColor[0] * brightness;
    col[i * 3 + 1] = baseColor[1] * brightness;
    col[i * 3 + 2] = baseColor[2] * brightness;
  }
  return { pos, col };
}

export function createPassiveLayer(regl) {
  const stars = generateStars();

  const pack = (id, data, count) => ({
    id,
    count,
    buffer: regl.buffer(data.pos),
    colorBuffer: regl.buffer(data.col),
    modelMatrix: mat4.create()
  });

  return [
    pack('stars', stars, CONFIG.STARS.count)
  ];
}