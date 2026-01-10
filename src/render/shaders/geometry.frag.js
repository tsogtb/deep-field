export default `

precision mediump float;

varying vec3 vColor;

void main() {
    vec2 uv = abs(gl_PointCoord - 0.5);

    // Square distance (no rotation)
    float dist = max(uv.x, uv.y);

    // Soft anti-aliased edge
    float edge = smoothstep(0.5, 0.42, dist);

    // Wispy square glow
    float glow = pow(1.0 - dist * 2.0, 2.6);
    float core = pow(1.0 - dist * 2.0, 7.0);

    float alpha = (glow * 1.1 + core * 0.7) * edge;

    gl_FragColor = vec4(vColor, alpha);
}

`