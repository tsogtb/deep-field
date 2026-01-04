export default `

precision mediump float;
attribute vec3 position, color;
uniform mat4 projection, view;
uniform float uViewportHeight;
varying vec3 vColor;

void main() {
  vec4 mvPosition = view * vec4(position, 1.0);
  gl_Position = projection * mvPosition;

  gl_PointSize = max(((0.1 * uViewportHeight)  / -mvPosition.z), 1.5); 
  
  vColor = color;
}
`