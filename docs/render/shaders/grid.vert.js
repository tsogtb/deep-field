export default `

precision mediump float;
attribute vec3 position;
attribute vec3 color;
uniform mat4 projection, view;
varying vec3 vColor;

void main() {
  gl_Position = projection * view * vec4(position, 1.0);
  vColor = color;
}
`