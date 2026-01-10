export default `

precision mediump float;
attribute vec3 position, color;
uniform mat4 projection, view, model;

varying vec3 vColor;



void main() {

  vColor = color;

  vec4 worldPos = model * vec4(position, 1.0);

  vec4 mvPosition = view * worldPos;
  gl_Position = projection * mvPosition;

  float baseSize = 80.0; 
  float perspectiveSize = baseSize / -mvPosition.z;

  gl_PointSize = max(perspectiveSize, 1.5);
  
}
`