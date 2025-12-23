export default `

precision mediump float;
varying vec3 vColor;
varying float vSizeFactor;

void main() {
    vec2 centeredCoord = gl_PointCoord.xy - 0.5;
    
    float dist = max(abs(centeredCoord.x), abs(centeredCoord.y));
    if (dist > 0.5) discard;

    float squareGlow = pow(1.0 - dist * 2.0, 2.0);
    
    float core = pow(1.0 - dist * 2.0, 10.0) * 2.0;
    
    gl_FragColor = vec4(vColor, (squareGlow + core) * vSizeFactor);
}
`