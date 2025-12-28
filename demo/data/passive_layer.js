import { mat4 } from "https://esm.sh/gl-matrix";
import { Path1D } from "../../geometry/curves1d.js";

const CONFIG = {
  STARS: { count: 10000, size: 0.4 },
  SNOW:  { count: 2000,  size: 1.0 },
  CUBE:  { count: 3000,  size: 5.0 },
  TEXT:  { count: 15000, size: 0.42 }
};

const PALETTE = {
  STARS: [
    [1.0, 0.85, 0.7], [1.0, 0.4, 0.2], [0.5, 0.7, 1.0], 
    [1.0, 1.0, 1.0], [1.0, 0.95, 0.4]
  ],
  SNOW: [0.9, 0.9, 1.0],
  CUBE: [0.5, 0.6, 0.7],
  TEXT: [1.0, 0.9, 0.3]
};

function createGlyphs(offset, scale) {
  const s = scale;
  const gap = scale * 0.4;
  const lineSpacing = scale * 2.4;
  const segments = [];
  let cx = 0, cy = 0;

  const line = (z1, y1, z2, y2) => {
    segments.push({
      start: { x: offset.x, y: offset.y + cy + y1, z: offset.z - (cx + z1) },
      end:   { x: offset.x, y: offset.y + cy + y2, z: offset.z - (cx + z2) }
    });
  };

  const next = (w) => { cx += w + gap; };
  const space = () => { cx += s * 1.5; };
  const indent = (n) => { cx += s * 1.2 * n; };
  const br = () => { cx = 0; cy -= lineSpacing; };

  const drawA = () => { line(0, 0, s * 0.5, s); line(s, 0, s * 0.5, s); line(s * 0.2, s * 0.4, s * 0.8, s * 0.4); next(s); };
  const drawD = () => { line(0, 0, 0, s); line(0, s, s * 0.7, s); line(s * 0.7, s, s, s * 0.5); line(s, s * 0.5, s * 0.7, 0); line(s * 0.7, 0, 0, 0); next(s); };
  const drawE = () => { line(0, 0, 0, s); line(0, s, s, s); line(0, s * 0.5, s * 0.7, s * 0.5); line(0, 0, s, 0); next(s); };
  const drawF = () => { line(0, 0, 0, s); line(0, s, s, s); line(0, s * 0.5, s * 0.7, s * 0.5); next(s); };
  const drawG = () => { line(s, s, 0, s); line(0, s, 0, 0); line(0, 0, s, 0); line(s, 0, s, s * 0.4); line(s, s * 0.4, s * 0.5, s * 0.4); next(s); };
  const drawH = () => { line(0, 0, 0, s); line(s, 0, s, s); line(0, s * 0.5, s, s * 0.5); next(s); };
  const drawI = () => { line(s * 0.4, 0, s * 0.4, s); next(s * 0.8); }; 
  const drawL = () => { line(0.1, s, 0.1, 0); line(0.1, 0, s * 0.8, 0); next(s * 0.9); };
  const drawM = () => { line(0, 0, 0, s); line(0, s, s * 0.5, s * 0.5); line(s * 0.5, s * 0.5, s, s); line(s, s, s, 0); next(s * 1.1); };
  const drawN = () => { line(0, 0, 0, s); line(0, s, s, 0); line(s, 0, s, s); next(s); };
  const drawO = () => { line(0, 0, 0, s); line(s, 0, s, s); line(0, s, s, s); line(0, 0, s, 0); next(s); };
  const drawP = () => { line(0, 0, 0, s); line(0, s, s, s); line(s, s, s, s * 0.5); line(s, s * 0.5, 0, s * 0.5); next(s); };
  const drawR = () => { line(0, 0, 0, s); line(0, s, s, s); line(s, s, s, s * 0.5); line(s, s * 0.5, 0, s * 0.5); line(s * 0.5, s * 0.5, s, 0); next(s); };
  const drawS = () => { line(s, s, 0, s); line(0, s, 0, s * 0.5); line(0, s * 0.5, s, s * 0.5); line(s, s * 0.5, s, 0); line(s, 0, 0, 0); next(s); };
  const drawT = () => { line(s * 0.5, 0, s * 0.5, s); line(0, s, s, s); next(s); };
  const drawU = () => { line(0, s, 0, 0); line(0, 0, s, 0); line(s, 0, s, s); next(s); };
  const drawV = () => { line(0, s, s * 0.5, 0); line(s * 0.5, 0, s, s); next(s); };
  const drawW = () => { line(0, s, s * 0.25, 0); line(s * 0.25, 0, s * 0.5, s * 0.4); line(s * 0.5, s * 0.4, s * 0.75, 0); line(s * 0.75, 0, s, s); next(s * 1.1); };
  const drawY = () => { line(0, s, s * 0.5, s * 0.5); line(s, s, s * 0.5, s * 0.5); line(s * 0.5, s * 0.5, s * 0.5, 0); next(s); };
  const drawEx = () => { line(s * 0.3, s, s * 0.3, s * 0.5); line(s * 0.3, 0.1, s * 0.3, 0); next(s * 0.5); };

  space(); drawH(); drawA(); drawP(); drawP(); drawY(); space();
  drawN(); drawE(); drawW(); space();
  drawY(); drawE(); drawA(); drawR(); br();
  indent(8); drawT(); drawO(); br();
  drawD(); drawA(); drawV(); drawA(); drawA(); drawN(); drawY(); drawA(); drawM(); space();
  drawF(); drawA(); drawM(); drawI(); drawL(); drawY(); br();
  indent(3); drawF(); drawR(); drawO(); drawM(); space();
  drawT(); drawS(); drawO(); drawG(); drawT(); drawEx();

  return segments;
}

const getCubePath = (size) => new Path1D([
  { start: {x:-size, y:-size, z:-size}, end: {x: size, y:-size, z:-size} },
  { start: {x: size, y:-size, z:-size}, end: {x: size, y: size, z:-size} },
  { start: {x: size, y: size, z:-size}, end: {x:-size, y: size, z:-size} },
  { start: {x:-size, y: size, z:-size}, end: {x:-size, y:-size, z:-size} },
  { start: {x:-size, y:-size, z: size}, end: {x: size, y:-size, z: size} },
  { start: {x: size, y:-size, z: size}, end: {x: size, y: size, z: size} },
  { start: {x: size, y: size, z: size}, end: {x:-size, y: size, z: size} },
  { start: {x:-size, y: size, z: size}, end: {x:-size, y:-size, z: size} },
  { start: {x:-size, y:-size, z:-size}, end: {x:-size, y:-size, z: size} },
  { start: {x: size, y:-size, z:-size}, end: {x: size, y:-size, z: size} },
  { start: {x: size, y: size, z:-size}, end: {x: size, y: size, z: size} },
  { start: {x:-size, y: size, z:-size}, end: {x:-size, y: size, z: size} },
]);

function generatePathPoints(path, count, color) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = path.sample();
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    col[i * 3] = color[0]; col[i * 3 + 1] = color[1]; col[i * 3 + 2] = color[2];
  }
  return { pos, col };
}

function generateStars() {
  const pos = new Float32Array(CONFIG.STARS.count * 3);
  const col = new Float32Array(CONFIG.STARS.count * 3);
  for (let i = 0; i < CONFIG.STARS.count; i++) {
    const t = Math.random() * 2 * Math.PI;
    const p = Math.acos(2 * Math.random() - 1);
    const r = Math.random() > 0.2 ? 40 + Math.random() * 10 : 50 + Math.random() * 20;
    pos[i * 3] = r * Math.sin(p) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    pos[i * 3 + 2] = r * Math.cos(p);
    const c = PALETTE.STARS[Math.floor(Math.random() * PALETTE.STARS.length)];
    const b = 0.4 + Math.random() * 0.6;
    col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b;
  }
  return { pos, col };
}

function generateSnow() {
  const pos = new Float32Array(CONFIG.SNOW.count * 3);
  const col = new Float32Array(CONFIG.SNOW.count * 3);
  for (let i = 0; i < CONFIG.SNOW.count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    col[i * 3] = PALETTE.SNOW[0]; col[i * 3 + 1] = PALETTE.SNOW[1]; col[i * 3 + 2] = PALETTE.SNOW[2];
  }
  return { pos, col };
}

export function createPassiveLayer(regl) {
  const stars = generateStars();
  const snow = generateSnow();
  const cube = generatePathPoints(getCubePath(CONFIG.CUBE.size), CONFIG.CUBE.count, PALETTE.CUBE);
  const text = generatePathPoints(new Path1D(createGlyphs({x:-4.9, y:3.8, z:4.8}, CONFIG.TEXT.size)), CONFIG.TEXT.count, PALETTE.TEXT);

  const pack = (id, data, count) => ({
    id,
    count,
    buffer: regl.buffer(data.pos),
    colorBuffer: regl.buffer(data.col),
    modelMatrix: mat4.create()
  });

  return [
    pack('stars', stars, CONFIG.STARS.count),
    pack('snow',  snow,  CONFIG.SNOW.count),
    pack('cube',  cube,  CONFIG.CUBE.count),
    pack('text',  text,  CONFIG.TEXT.count)
  ];
}