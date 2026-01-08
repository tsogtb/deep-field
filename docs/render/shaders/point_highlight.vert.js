export default `

precision mediump float;

attribute vec3 position, color;
uniform mat4 projection, view, model;
uniform float uTime;
uniform float uIsSnow;

varying vec3 vColor;
varying float vSizeFactor;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  float id = hash(position);

  // --- ORIGINAL COLOR LOGIC ---
  float twinkle = 0.6 + 0.4 * sin(uTime * 3.0 + id * 100.0);
  vColor = color * twinkle;

  vec4 worldPos = model * vec4(position, 1.0);
  vec4 mvPosition = view * worldPos;
  gl_Position = projection * mvPosition;

  // --- ORIGINAL SIZE LOGIC ---
  float baseSize = 40.0 + 80.0 * id;
  float size = baseSize / -mvPosition.z;

  // 🔒 BASELINE: IDENTICAL OLD LOOK
  if (uIsSnow == 0.0) {
    gl_PointSize = max(size, 1.5);
    vSizeFactor = clamp(size / 1.5, 0.0, 1.0);
    return;
  }

  // --- HERO PASS 1: VOLUME ---
  if (uIsSnow == 1.0) {
    size *= 1.1;               // subtle thickening
  }

  // --- HERO PASS 2: HIGHLIGHT ---
  if (uIsSnow == 2.0) {
    size *= 1.8;               // visible halo
  }

  if (uIsSnow == 2.0) {
    vColor *= 1.5; // brighten color for highlight
  }


  gl_PointSize = max(size, 1.5);
  vSizeFactor = clamp(size / 1.5, 0.0, 1.0);
}

`