export function toFloat32(vecs) {
    const arr = new Float32Array(vecs.length * 3);
    for (let i = 0; i < vecs.length; i++) {
        arr[i * 3 + 0] = vecs[i][0];
        arr[i * 3 + 1] = vecs[i][1];
        arr[i * 3 + 2] = vecs[i][2];
    }
    return arr;
}
export function syncParticlesToBuffer(state, buffer) {
    buffer.subdata(toFloat32(state.position));
}
