export function add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
export function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
export function scale(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
}
export function length(v) {
    return Math.hypot(v[0], v[1], v[2]);
}
