export function integrateEuler(state, deriv, dt) {
    const delta = deriv(state, state.t);
    state.t += dt;
    for (const key in delta) {
        const change = delta[key];
        const target = state[key];
        if (change instanceof Float32Array && target instanceof Float32Array) {
            for (let i = 0; i < target.length; i++) {
                target[i] += change[i] * dt;
            }
        }
    }
}
