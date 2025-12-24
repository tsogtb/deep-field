export default `

precision mediump float;
attribute vec3 position, color;
uniform mat4 projection, view;
varying vec3 vColor;

void main() {
  vec4 mvPosition = view * vec4(position, 1.0);
  gl_Position = projection * mvPosition;

  // 100.0 is the "World Size". 
  // Dividing by -mvPosition.z makes points smaller as they get further away.
  gl_PointSize = 100.0 / -mvPosition.z; 
  
  vColor = color;
}
`