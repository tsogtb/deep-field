export class Sphere {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }
    contains(x, y, z) {
        const dx = x - this.center.x;
        const dy = y - this.center.y;
        const dz = z - this.center.z;
        return dx * dx + dy * dy + dz * dz <= this.radius * this.radius;
    }
}
export class Box {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    contains(x, y, z) {
        return (x >= this.min.x && x <= this.max.x &&
            y >= this.min.y && y <= this.max.y &&
            z >= this.min.z && z <= this.max.z);
    }
}
export function findMediumAt(x, y, z, worldMedia) {
    const idx = findRegionIndexAt(x, y, z, worldMedia);
    return idx === 9999 ? air : worldMedia[idx].medium;
}
export const air = {
    name: "air",
    n: 1.0,
    absorption: 0,
    reflectivity: 0,
};
export const glass = {
    name: "glass",
    n: 1.5,
    absorption: 0.01,
    reflectivity: 0.05,
};
export const VACUUM_REGION = {
    shape: { contains: () => true },
    medium: air
};
export function findRegionIndexAt(x, y, z, worldMedia) {
    for (let i = 0; i < worldMedia.length; i++) {
        if (worldMedia[i].shape.contains(x, y, z))
            return i;
    }
    return 9999;
}
