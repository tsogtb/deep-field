export default `

precision mediump float;
varying vec3 vColor;

void main() {
    float dist = length(gl_PointCoord.xy - vec2(0.5));
    
    if (dist > 0.5) discard;

    // Smooth the edges (anti-aliasing)
    float alpha = smoothstep(0.5, 0.48, dist);

    gl_FragColor = vec4(vColor, 1.0);
}
`