export function vectorField(fieldFn) {
    return (state, t) => {
        const { position, acceleration, count } = state;
        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const [fx, fy, fz] = fieldFn(position[idx], position[idx + 1], position[idx + 2], t);
            acceleration[idx] = fx;
            acceleration[idx + 1] = fy;
            acceleration[idx + 2] = fz;
        }
        return { acceleration };
    };
}
export function vortexField(strength, pull = 0.5) {
    return (x, y, z) => {
        const r2 = x * x + y * y + z * z;
        if (r2 < 0.0001)
            return [0, 0, 0];
        const r = Math.sqrt(r2);
  
        const tx = (-y / r) * strength;
        const ty = (x / r) * strength;

        const rx = (-x / r) * pull;
        const ry = (-y / r) * pull;
        return [tx + rx, ty + ry, 0];
    };
}
function modf(x, m) {
    return ((x % m) + m) % m;
}
export function waveField(frequency, amplitude, speed = 1.0, densityScale = 1.0) {
    return (x, y, z, t) => {

        const fx = 0.0;

        const fy = 0.0;
        
        const fz = 15.0 + Math.sin(z * frequency + t * speed) * amplitude;
 
        const period = 10;
        const densityMod = modf(z, period) / period; 
        const frictionFactor = Math.sin(densityMod * Math.PI) * densityScale;
  
        return [fx, fy, fz * (1 - 0.5 * frictionFactor)];
    };
}
export function repulsionField(centerX, centerY, radius, strength) {
    return (x, y, z) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const r2 = dx * dx + dy * dy;
        const r = Math.sqrt(r2);
        if (r > radius || r < 0.001)
            return [0, 0, 0];
        const push = (1.0 - r / radius) * strength;
        return [(dx / r) * push, (dy / r) * push, 0];
    };
}
export function jellySwimField(frequency = 2.2, strength = 18.0, forward = 0.6, bellRadius = 1.0) {
    return (x, y, z, t) => {
        const r = Math.sqrt(y * y + z * z);
        
        if (r > bellRadius * 2.2)
            return [0, 0, 0];
        
        const pulse = Math.sin(t * frequency);
        const contraction = pulse > 0 ? pulse * pulse : pulse * 0.2;
        
        const inward = -contraction * strength * (r / bellRadius);
        const ry = r > 0 ? y / r : 0;
        const rz = r > 0 ? z / r : 0;
        
        const fy = inward * ry - contraction * 4.5;
        const fz = inward * rz;
        
        const fx = contraction * forward;
        return [fx, fy, fz];
    };
}

