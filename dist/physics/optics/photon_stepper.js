import { VACUUM_REGION, findRegionIndexAt } from "./medium.js";
import { computeNormalAtBoundary, handleBoundary } from "./boundary.js";
const tempNormal = new Float32Array(3);
export function stepPhotons(state, dt, worldMedia, bounds) {
    const { count, position, prevPosition, direction, speed = 299792458, alive } = state;
    for (let i = 0; i < count; i++) {
        if (!alive[i])
            continue;
        const idx = i * 3;
        prevPosition[idx] = position[idx];
        prevPosition[idx + 1] = position[idx + 1];
        prevPosition[idx + 2] = position[idx + 2];
        position[idx] += direction[idx] * speed * dt;
        position[idx + 1] += direction[idx + 1] * speed * dt;
        position[idx + 2] += direction[idx + 2] * speed * dt;
        if (bounds) {
            const x = position[idx], y = position[idx + 1], z = position[idx + 2];
            if (x < bounds.min[0] || x > bounds.max[0] ||
                y < bounds.min[1] || y > bounds.max[1] ||
                z < bounds.min[2] || z > bounds.max[2]) {
                alive[i] = 0;
                continue;
            }
        }
        let index0 = (state.currentMedium?.[i] !== undefined) ? state.currentMedium[i] : 9999;
        let region0 = (index0 === 9999) ? VACUUM_REGION : worldMedia[index0];
        const index1 = findRegionIndexAt(position[idx], position[idx + 1], position[idx + 2], worldMedia);
        const region1 = (index1 === 9999) ? VACUUM_REGION : worldMedia[index1];
        if (region0.medium.n !== region1.medium.n) {
            const boundaryShape = (index1 === 9999) ? region0.shape : region1.shape;
            computeNormalAtBoundary(boundaryShape, position[idx], position[idx + 1], position[idx + 2], tempNormal);
            handleBoundary(i, state, region0.medium, region1.medium, tempNormal);
        }
        if (state.currentMedium) {
            state.currentMedium[i] = index1;
        }
    }
    state.t += dt;
}
