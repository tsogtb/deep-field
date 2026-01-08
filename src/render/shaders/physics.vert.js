export default `
precision mediump float;

attribute vec3 position;
attribute vec3 color;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform float uViewportHeight;

varying vec3 vColor;
varying float vDepth;

void main() {
  vec4 worldPos = model * vec4(position, 1.0);
  vec4 mvPosition = view * worldPos;
  gl_Position = projection * mvPosition;

  // Perspective-correct size
  float baseSize = 0.12 * uViewportHeight;
  float size = baseSize / -mvPosition.z;
  gl_PointSize = clamp(size, 1.5, 6.0);

  vDepth = clamp(-mvPosition.z / 50.0, 0.0, 1.0);
  vColor = color;
}
`;
