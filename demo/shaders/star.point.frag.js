export default `
precision mediump float;
varying vec3 vColor;
varying float vSizeFactor;
varying float vRotation;

void main() {
    vec2 uv = gl_PointCoord.xy - 0.5;

    // Rotation Matrix
    float cosA = cos(vRotation);
    float sinA = sin(vRotation);
    uv = vec2(uv.x * cosA - uv.y * sinA, uv.x * sinA + uv.y * cosA);

    float r = length(uv) * 2.0;
    float a = atan(uv.y, uv.x);

    // 5-pointed star formula
    float s = 0.5 + 0.5 * cos(a * 5.0);
    float starShape = r / (0.2 + 0.3 * s);
    
    if (starShape > 1.0) discard;

    // Glowing core logic
    float glow = pow(1.0 - starShape, 2.0);
    float core = pow(1.0 - starShape, 10.0) * 2.0;

    gl_FragColor = vec4(vColor, (glow + core) * vSizeFactor);
}
`