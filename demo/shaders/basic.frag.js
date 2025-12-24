export default `

precision mediump float;
varying vec3 vColor;

void main() {
    // gl_PointCoord.xy is the coordinates within the point square (0 to 1)
    // We calculate the distance from the center (0.5, 0.5)
    float dist = length(gl_PointCoord.xy - vec2(0.5));
    
    // Discard pixels outside the circle radius
    if (dist > 0.5) discard;

    // Optional: Smooth the edges (anti-aliasing)
    float alpha = smoothstep(0.5, 0.48, dist);

    // If you want your glow/core:
    //float glow = pow(1.0 - dist * 2.0, 4.0);
    //float core = pow(1.0 - dist * 2.0, 10.0) * 2.0;
    
    //gl_FragColor = vec4(vColor, alpha * (glow + core));
    gl_FragColor = vec4(vColor, 1.0);
}
`