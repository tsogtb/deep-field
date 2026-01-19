import { Sphere, Box } from "./medium.js";
export function computeNormalAtBoundary(shape, px, py, pz, out) {
    const normal = out || new Float32Array(3);
    if (shape instanceof Sphere) {
        let nx = px - shape.center.x;
        let ny = py - shape.center.y;
        let nz = pz - shape.center.z;
        const len = Math.hypot(nx, ny, nz) || 1e-8;
        normal[0] = nx / len;
        normal[1] = ny / len;
        normal[2] = nz / len;
    }
    else if (shape instanceof Box) {
        const midX = (shape.min.x + shape.max.x) / 2;
        const midY = (shape.min.y + shape.max.y) / 2;
        const midZ = (shape.min.z + shape.max.z) / 2;
        const dx = px - midX;
        const dy = py - midY;
        const dz = pz - midZ;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const absZ = Math.abs(dz);
        if (absX >= absY && absX >= absZ) {
            normal[0] = Math.sign(dx);
            normal[1] = 0;
            normal[2] = 0;
        }
        else if (absY >= absX && absY >= absZ) {
            normal[0] = 0;
            normal[1] = Math.sign(dy);
            normal[2] = 0;
        }
        else {
            normal[0] = 0;
            normal[1] = 0;
            normal[2] = Math.sign(dz);
        }
    }
    else {
        normal[0] = 0;
        normal[1] = 1;
        normal[2] = 0;
    }
    return normal;
}
export function handleBoundary(idx, state, from, to, normal) {
    const dIdx = idx * 3;
    const pIdx = idx * 2;
    let ix = state.direction[dIdx];
    let iy = state.direction[dIdx + 1];
    let iz = state.direction[dIdx + 2];
    let ilen = Math.hypot(ix, iy, iz) || 1e-8;
    ix /= ilen;
    iy /= ilen;
    iz /= ilen;
    const n1 = from.n;
    const n2 = to.n;
    let nx = normal[0];
    let ny = normal[1];
    let nz = normal[2];
    let cosi = ix * nx + iy * ny + iz * nz;
    if (cosi > 0) {
        nx = -nx;
        ny = -ny;
        nz = -nz;
        cosi = -cosi;
    }
    const cosThetaI = Math.abs(cosi);
    const eta = n1 / n2;
    const sin2ThetaT = eta * eta * (1 - cosThetaI * cosThetaI);
    let reflectProbability = 1.0;
    let rs = -1.0, rp = -1.0, ts = 0.0, tp = 0.0;
    let cosThetaT = 0;
    if (sin2ThetaT < 1.0) {
        cosThetaT = Math.sqrt(1 - sin2ThetaT);
        rs = (n1 * cosThetaI - n2 * cosThetaT) / (n1 * cosThetaI + n2 * cosThetaT);
        rp = (n2 * cosThetaI - n1 * cosThetaT) / (n2 * cosThetaI + n1 * cosThetaT);
        ts = (2 * n1 * cosThetaI) / (n1 * cosThetaI + n2 * cosThetaT);
        tp = (2 * n1 * cosThetaI) / (n2 * cosThetaI + n1 * cosThetaT);
        reflectProbability = (rs * rs + rp * rp) / 2;
    }
    // Probabilistic branching
    if (Math.random() < reflectProbability) {
        const dotIN = ix * nx + iy * ny + iz * nz;
        ix = ix - 2 * dotIN * nx;
        iy = iy - 2 * dotIN * ny;
        iz = iz - 2 * dotIN * nz;
        state.polarization[pIdx] *= rs;
        state.polarization[pIdx + 1] *= rp;
    }
    else {
        const scaleN = eta * cosThetaI - cosThetaT;
        ix = eta * ix + scaleN * nx;
        iy = eta * iy + scaleN * ny;
        iz = eta * iz + scaleN * nz;
        state.polarization[pIdx] *= ts;
        state.polarization[pIdx + 1] *= tp;
        if (to.absorption)
            state.energy[idx] *= Math.exp(-to.absorption);
    }
    const mag = Math.hypot(state.polarization[pIdx], state.polarization[pIdx + 1]) || 1e-8;
    state.polarization[pIdx] /= mag;
    state.polarization[pIdx + 1] /= mag;
    const dirLen = Math.hypot(ix, iy, iz) || 1e-8;
    state.direction[dIdx] = ix / dirLen;
    state.direction[dIdx + 1] = iy / dirLen;
    state.direction[dIdx + 2] = iz / dirLen;
}
