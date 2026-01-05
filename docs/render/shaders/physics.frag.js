export default `
precision mediump float;

varying vec3 vColor;
varying float vDepth;

void main() {
  vec2 uv = gl_PointCoord.xy - 0.5;

  // Circular mask
  float dist = length(uv);
  if (dist > 0.5) discard;

  // Soft edge, scientific-style
  float alpha = smoothstep(0.5, 0.35, dist);

  // Slight depth-based dimming
  float depthFade = mix(1.0, 0.65, vDepth);

  gl_FragColor = vec4(vColor * depthFade, alpha);
}
`;
