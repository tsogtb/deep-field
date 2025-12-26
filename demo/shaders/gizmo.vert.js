export default
`
precision mediump float;
attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform float uTime; 
uniform mat4 view;
uniform float uAspect;
uniform float uViewportHeight;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  float starId = hash(position);

  float twinkle = 0.6 + 0.4 * sin(uTime * 3.0 + starId * 100.0);
  vColor = color * twinkle;


  mat3 rotation = mat3(view);
  vec3 rotatedPos = rotation * position;
  rotatedPos.y *= uAspect;
  vec2 hudPosition = (rotatedPos.xy * 0.1) + vec2(0.9, 0.8);
  
  gl_Position = vec4(hudPosition, 0.0, 1.0);

  gl_PointSize = uViewportHeight * 0.003 + starId* 0.001;
}
` 