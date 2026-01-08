export default `

precision mediump float;

uniform float uIsSnow;

varying vec3 vColor;
varying float vSizeFactor;

void main() {
  float dist = length(gl_PointCoord.xy - 0.5);

  float edge = smoothstep(0.5, 0.45, dist);
  float glow = pow(1.0 - dist * 2.0, 4.0);
  float core = pow(1.0 - dist * 2.0, 10.0);

  float alpha = (glow + core * 1.5) * vSizeFactor * edge;

  if (uIsSnow == 2.0) {
    // Add extra glow for highlight
    alpha *= 1.5; 
  }

  gl_FragColor = vec4(vColor, alpha);
}

`