export const DefaultCameraConfig = {
  position: [0, 0, -10],
  target: [0, 0, 0],
  up: [0, 1, 0],

  fov: Math.PI / 4,
  near: 0.01,
  far: 1000,

  mode: "free", // "free" | "orbit"
};
