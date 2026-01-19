export interface Shape3D {
  contains(x: number, y: number, z: number): boolean;
}

export class Sphere implements Shape3D {
  constructor(
    public center: { x: number; y: number; z: number },
    public radius: number
  ) {}

  contains(x: number, y: number, z: number): boolean {
    const dx = x - this.center.x;
    const dy = y - this.center.y;
    const dz = z - this.center.z;
    return dx*dx + dy*dy + dz*dz <= this.radius * this.radius;
  }
}

export class Box implements Shape3D {
  constructor(
    public min: { x: number; y: number; z: number },
    public max: { x: number; y: number; z: number }
  ) {}

  contains(x: number, y: number, z: number): boolean {
    return (
      x >= this.min.x && x <= this.max.x &&
      y >= this.min.y && y <= this.max.y &&
      z >= this.min.z && z <= this.max.z
    );
  }
}

export interface Medium {
  name: string;
  n: number;        
  absorption?: number;
  reflectivity?: number;
}

export interface MediumRegion {
  shape: Shape3D;
  medium: Medium;
}

export function findMediumAt(
  x: number, 
  y: number, 
  z: number, 
  worldMedia: MediumRegion[]
): Medium {
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

export const VACUUM_REGION: MediumRegion = { 
  shape: { contains: () => true }, 
  medium: air 
};

export function findRegionIndexAt(
  x: number, 
  y: number, 
  z: number, 
  worldMedia: MediumRegion[]
): number {
  for (let i = 0; i < worldMedia.length; i++) {
    if (worldMedia[i].shape.contains(x, y, z)) return i;
  }
  return 9999; 
}