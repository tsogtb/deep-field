export default `

precision mediump float;
varying vec3 vColor;
varying float vSizeFactor;
varying float vRotation;

void main() {
    // Center and Rotate
    vec2 uv = gl_PointCoord.xy - 0.5;
    float cosA = cos(vRotation);
    float sinA = sin(vRotation);
    vec2 rotatedUV = vec2(
        uv.x * cosA - uv.y * sinA,
        uv.x * sinA + uv.y * cosA
    );
    
    // Square Distance
    float dist = max(abs(rotatedUV.x), abs(rotatedUV.y));
    if (dist > 0.5) discard;

    float squareGlow = pow(1.0 - dist * 2.0, 2.0);
    float core = pow(1.0 - dist * 2.0, 10.0) * 2.0;
    
    gl_FragColor = vec4(vColor, (squareGlow + core) * vSizeFactor);
}
`