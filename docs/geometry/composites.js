/**
 * CompositeShape
 * A high-level manifold for boolean operations (CSG) on 2D and 3D shapes.
 * Supports Unions, Intersections, and Differences using Importance and Rejection sampling.
 */
export class CompositeShape {
  /**
   * @param {'union'|'intersection'|'difference'|'faulty_union'} type - The boolean operation logic.
   * @param {Object[]} shapes - The constituent shape primitives.
   * @param {Object} [options] - Configuration for sampling precision.
   */
  constructor(type, shapes, options = {}) {
    this.type = type;
    this.shapes = shapes;
    this.maxAttempts = options.maxAttempts ?? 1000;

    // Static analysis of the combined spatial bounds
    this.bbox = this._calculateBBox();

    this.center = {
      x: (this.bbox.minX + this.bbox.maxX) / 2,
      y: (this.bbox.minY + this.bbox.maxY) / 2,
      z: (this.bbox.minZ + this.bbox.maxZ) / 2
    };

    // Derived metric for importance-sampling weight
    this.volume = this._calculateVolume();
    this.area = this.volume; 
  }

  /**
   * Boolean containment logic.
   * Maps standard set theory (OR, AND, NOT) to geometric spatial tests.
   */
  contains(p, epsilon = 1e-9) {
    switch (this.type) {
      case 'union':
      case 'faulty_union':
        return this.shapes.some(s => s.contains(p, epsilon));
      case 'intersection':
        return this.shapes.every(s => s.contains(p, epsilon));
      case 'difference':
        // Logic: Must be in A, but NOT in B
        return this.shapes[0].contains(p, epsilon) && !this.shapes[1].contains(p, epsilon);
      default:
        return false;
    }
  }

  /**
   * Dispatches the point generation to the appropriate Monte Carlo sampler.
   */
  sample() {
    switch (this.type) {
      case 'union':        return sampleUnion(this.shapes, this.maxAttempts);
      case 'faulty_union': return sampleFaultyUnion(this.shapes);
      case 'intersection': return sampleIntersection(this.shapes, this.maxAttempts);
      case 'difference':   return sampleDifference(this.shapes[0], this.shapes[1], this.maxAttempts);
    }
  }

  /** * @private 
   * Computes the Bounding Box by either expanding (Union) or shrinking (Intersection) 
   * the bounds based on the operation type.
   */
  _calculateBBox() {
    const shapes = this.shapes;
    if (!shapes.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };

    // For differences, the first shape defines the maximum possible boundary
    if (this.type === 'difference') return shapes[0].bbox;

    return shapes.reduce((acc, s, idx) => {
      const b = s.bbox;
      const bzMin = b.minZ ?? 0;
      const bzMax = b.maxZ ?? 0;

      if (idx === 0) return { ...b, minZ: bzMin, maxZ: bzMax };

      if (this.type === 'intersection') {
        return {
          minX: Math.max(acc.minX, b.minX), maxX: Math.min(acc.maxX, b.maxX),
          minY: Math.max(acc.minY, b.minY), maxY: Math.min(acc.maxY, b.maxY),
          minZ: Math.max(acc.minZ, bzMin),  maxZ: Math.min(acc.maxZ, bzMax)
        };
      } else {
        return {
          minX: Math.min(acc.minX, b.minX), maxX: Math.max(acc.maxX, b.maxX),
          minY: Math.min(acc.minY, b.minY), maxY: Math.max(acc.maxY, b.maxY),
          minZ: Math.min(acc.minZ, bzMin),  maxZ: Math.max(acc.maxZ, bzMax)
        };
      }
    }, {});
  }

  /** * @private 
   * Estimates volume for weighting purposes. 
   * Uses heuristics for complex boolean results where exact analytic volume is non-trivial.
   */
  _calculateVolume() {
    if (this.type === 'difference') {
      return Math.max(0.001, (this.shapes[0].volume || 1) * 0.7); 
    }
    if (this.type === 'intersection') {
      const b = this.bbox;
      return (b.maxX - b.minX) * (b.maxY - b.minY) * (b.maxZ - b.minZ || 1) * 0.5; 
    }
    return this.shapes.reduce((sum, s) => sum + (s.volume ?? s.area ?? 0), 0);
  }
}


/**
 * sampleUnion
 * Generates a uniform random point from the combined area/volume of multiple shapes.
 * * This algorithm solves the "Over-sampling Bias" by ensuring that points in 
 * intersecting regions are only counted once, maintaining a perfectly 
 * uniform density across the entire union.
 */
export function sampleUnion(shapes, maxAttempts = 100) {
  // 1. Weighting Phase: Derive selection probability based on shape size.
  // This ensures a massive sphere is picked more often than a tiny cube.
  const weights = shapes.map(s => s.area ?? s.volume ?? 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 2. Importance Sampling: Select a shape index proportional to its weight.
    let r = Math.random() * totalWeight;
    let idx = 0;
    for (let i = 0; i < shapes.length; i++) {
      if ((r -= weights[i]) <= 0) { 
        idx = i; 
        break; 
      }
    }

    // 3. Generation: Pull a raw sample from the chosen shape.
    const point = shapes[idx].sample();

    // 4. Rejection Sampling (The "Clip" Logic): 
    // If the point exists inside any shape that appeared earlier in the array, 
    // we reject it. This prevents "hotspots" in overlapping regions.
    let coveredByPrior = false;
    for (let j = 0; j < idx; j++) {
      if (shapes[j].contains(point)) { 
        coveredByPrior = true; 
        break; 
      }
    }

    if (!coveredByPrior) return point;
  }

  // Fallback: If rejection density is too high, return a raw sample from the lead shape.
  return shapes[0].sample(); 
}


/**
 * sampleIntersection
 * Generates a uniform random point within the shared volume of multiple overlapping shapes.
 * * Logic: Rather than sampling from a single shape and hoping for a "hit," this algorithm 
 * calculates the common AABB (Axis-Aligned Bounding Box) of all shapes first. 
 * This drastically shrinks the search space, making Monte Carlo sampling viable even 
 * for tiny intersection volumes.
 */
export function sampleIntersection(shapes, maxAttempts = 1000) {
  // 1. Broad-Phase Constraint: Find the intersection of all bounding boxes.
  // The resulting bbox represents the only volume where an intersection is physically possible.
  const bbox = shapes.reduce((acc, s, i) => {
    if (i === 0) return s.bbox;
    return {
      minX: Math.max(acc.minX, s.bbox.minX), maxX: Math.min(acc.maxX, s.bbox.maxX),
      minY: Math.max(acc.minY, s.bbox.minY), maxY: Math.min(acc.maxY, s.bbox.maxY),
      minZ: Math.max(acc.minZ ?? 0, s.bbox.minZ ?? 0), maxZ: Math.min(acc.maxZ ?? 0, s.bbox.maxZ ?? 0)
    };
  }, {});

  // 2. Early-Exit Logic: If the bounding boxes don't overlap, the shapes cannot intersect.
  if (bbox.minX > bbox.maxX || bbox.minY > bbox.maxY || (bbox.minZ > bbox.maxZ)) {
    throw new Error("Invalid Intersection: Shapes are spatially disjoint (Bounding boxes do not overlap).");
  }

  

  // 3. Narrow-Phase Sampling: Generate points within the shared bbox and verify containment.
  for (let i = 0; i < maxAttempts; i++) {
    const p = {
      x: bbox.minX + Math.random() * (bbox.maxX - bbox.minX),
      y: bbox.minY + Math.random() * (bbox.maxY - bbox.minY),
      z: bbox.minZ + Math.random() * (bbox.maxZ - bbox.minZ)
    };
    
    // Check if the candidate point resides in EVERY constituent shape.
    if (shapes.every(s => s.contains(p))) return p;
  }
  
  // 4. Exception Handling: Critical for cases where intersections are infinitely thin (surfaces) 
  // or the shapes are tangent but don't share volume.
  throw new Error(`Intersection sampling failed: Possible zero-volume intersection or maxAttempts (${maxAttempts}) reached.`);
}


/**
 * sampleDifference
 * Generates a uniform random point that exists within Shape A but NOT within Shape B.
 * * Logic: This performs a "Geometric Subtraction" (A - B). It uses Shape A as the 
 * primary generator and treats Shape B as a "mask." Any point falling within 
 * the intersection of the two is rejected until a valid exterior point is found.
 */
export function sampleDifference(shapeA, shapeB, maxAttempts = 1000) {
  // 1. Iterative Rejection Sampling:
  // We sample from the "base" shape (A) and verify it is not inside the "cutter" shape (B).
  for (let i = 0; i < maxAttempts; i++) {
    const p = shapeA.sample();

    // 2. The Boolean "NOT" Test:
    // If the point is NOT contained in Shape B, it belongs to the unique volume of A.
    if (!shapeB.contains(p)) return p;
  }

  // 3. Fallback Mechanism:
  // If we fail to find a point after maxAttempts (e.g., if Shape B completely 
  // swallows Shape A), we return a raw sample from A to prevent a logic hang.
  return shapeA.sample(); 
}



/**
 * sampleAdditiveUnion
 * Generates a point by selecting a shape based on its weight and sampling it directly.
 * * * Logic: This is an "Additive" operation. It does not perform rejection sampling 
 * for overlapping regions. Consequently, areas where shapes intersect will exhibit 
 * higher point density. This is significantly faster than a standard Union and 
 * ideal for visual effects like fire or magic where "hotspots" are desirable.
 */
export function sampleAdditiveUnion(shapes) {
  // 1. Weighting: Map shapes to their area/volume for proportional selection.
  const weights = shapes.map(s => s.area ?? s.volume ?? 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  // 2. Linear Selection: Roll once against the total cumulative weight.
  let r = Math.random() * totalWeight;
  
  for (let s of shapes) {
    const weight = s.area ?? s.volume ?? 1;
    // Progressively subtract weights until the random threshold is crossed.
    if ((r -= weight) <= 0) {
      return s.sample();
    }
  }

  // 3. Fallback: Protects against rare floating-point precision issues 
  // where 'r' might not reach zero due to rounding errors.
  return shapes[0].sample();
}


/**
 * RotatedShape
 * A spatial decorator that reorients a shape using Pitch, Yaw, and Roll.
 * * Logic: This class wraps a base shape and applies a 3D Rotation Matrix to its 
 * coordinate system. It transforms samples into world space and inversely 
 * transforms test points into local space for containment checks.
 */
export class RotatedShape {
  /**
   * @param {Object} baseShape - The primitive (e.g., Box, Cone) to rotate.
   * @param {number} pitch - Rotation around the X-axis (in radians).
   * @param {number} yaw - Rotation around the Y-axis (in radians).
   * @param {number} roll - Rotation around the Z-axis (in radians).
   */
  constructor(baseShape, pitch = 0, yaw = 0, roll = 0) {
    this.base = baseShape;
    this.center = baseShape.center;
    this.volume = baseShape.volume;

    // 1. Pre-calculate Trigonometric Coefficients
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cy = Math.cos(yaw),   sy = Math.sin(yaw);
    const cr = Math.cos(roll),  sr = Math.sin(roll);

    // 2. Build the Rotation Matrix (Tait-Bryan ZYX convention)
    // These coefficients allow us to rotate a vector without re-calculating trig every frame.
    this.m00 = cy * cr;
    this.m01 = -cy * sr;
    this.m02 = sy;
    this.m10 = sp * sy * cr + cp * sr;
    this.m11 = -sp * sy * sr + cp * cr;
    this.m12 = -sp * cy;
    this.m20 = -cp * sy * cr + sp * sr;
    this.m21 = cp * sy * sr + sp * cr;
    this.m22 = cp * cy;

    // 3. Bound Updates: The AABB must expand to fit the rotated corners.
    this.bbox = this._calculateRotatedBBox();
  }

  /**
   * Samples a point from the base shape and rotates it into world space.
   * Logic: Moves point to origin, applies matrix multiplication, and moves back.
   */
  sample() {
    const p = this.base.sample();
    const dx = p.x - this.center.x;
    const dy = p.y - this.center.y;
    const dz = p.z - this.center.z;

    return {
      x: dx * this.m00 + dy * this.m01 + dz * this.m02 + this.center.x,
      y: dx * this.m10 + dy * this.m11 + dz * this.m12 + this.center.y,
      z: dx * this.m20 + dy * this.m21 + dz * this.m22 + this.center.z
    };
  }

  /**
   * Containment test using Inverse Rotation.
   * Logic: To see if a world-space point is inside a rotated shape, we rotate 
   * the point "backwards" by the Transpose of the matrix to align it with 
   * the base shape's local axes.
   */
  contains(p, epsilon = 1e-9) {
    const dx = p.x - this.center.x;
    const dy = p.y - this.center.y;
    const dz = p.z - this.center.z;

    // Multiply by the Transpose Matrix (inverse rotation)
    const localP = {
      x: dx * this.m00 + dy * this.m10 + dz * this.m20 + this.center.x,
      y: dx * this.m01 + dy * this.m11 + dz * this.m21 + this.center.y,
      z: dx * this.m02 + dy * this.m12 + dz * this.m22 + this.center.z
    };

    return this.base.contains(localP, epsilon);
  }

  /** @private 
   * Generates a new Axis-Aligned Bounding Box (AABB).
   * Logic: Rotates all 8 corners of the original BBox and finds the new 
   * absolute min/max extents in world space.
   */
  _calculateRotatedBBox() {
    const b = this.base.bbox;
    const zMin = b.minZ ?? this.center.z;
    const zMax = b.maxZ ?? this.center.z;
  
    const corners = [
      {x: b.minX, y: b.minY, z: zMin}, {x: b.maxX, y: b.minY, z: zMin},
      {x: b.minX, y: b.maxY, z: zMin}, {x: b.maxX, y: b.maxY, z: zMin},
      {x: b.minX, y: b.minY, z: zMax}, {x: b.maxX, y: b.minY, z: zMax},
      {x: b.minX, y: b.maxY, z: zMax}, {x: b.maxX, y: b.maxY, z: zMax}
    ];
  
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
  
    for (const p of corners) {
      const dx = p.x - this.center.x;
      const dy = p.y - this.center.y;
      const dz = p.z - this.center.z;
  
      const rx = dx * this.m00 + dy * this.m01 + dz * this.m02 + this.center.x;
      const ry = dx * this.m10 + dy * this.m11 + dz * this.m12 + this.center.y;
      const rz = dx * this.m20 + dy * this.m21 + dz * this.m22 + this.center.z;
  
      if (rx < minX) minX = rx; if (rx > maxX) maxX = rx;
      if (ry < minY) minY = ry; if (ry > maxY) maxY = ry;
      if (rz < minZ) minZ = rz; if (rz > maxZ) maxZ = rz;
    }
  
    return { minX, maxX, minY, maxY, minZ, maxZ };
  }
}

/**
 * TranslatedShape
 * A spatial decorator that offsets a shape's coordinate system.
 * * Logic: This class wraps a base shape and applies a linear shift (displacement). 
 * It is optimized for high-frequency sampling by using an "Out" parameter 
 * pattern to minimize Garbage Collection overhead.
 */
export class TranslatedShape {
  /**
   * @param {Object} baseShape - The primitive or composite to be moved.
   * @param {number} dx, dy, dz - The translation offsets.
   */
  constructor(baseShape, dx = 0, dy = 0, dz = 0) {
    this.base = baseShape;
    this.offset = { x: dx, y: dy, z: dz };
    this.volume = baseShape.volume;
    this.area = baseShape.area;

    // 1. Center Calculation:
    // Establishes the new world-space center of the manifold.
    this.center = baseShape.center
      ? {
          x: baseShape.center.x + dx,
          y: baseShape.center.y + dy,
          z: (baseShape.center.z ?? 0) + dz
        }
      : { x: dx, y: dy, z: dz };

    // 2. Bounding Box Shift:
    // Repositions the AABB so broad-phase collision tests remain accurate.
    if (baseShape.bbox) {
      this.bbox = {
        minX: baseShape.bbox.minX + dx,
        maxX: baseShape.bbox.maxX + dx,
        minY: baseShape.bbox.minY + dy,
        maxY: baseShape.bbox.maxY + dy,
        minZ: (baseShape.bbox.minZ ?? this.center.z) + dz,
        maxZ: (baseShape.bbox.maxZ ?? this.center.z) + dz
      };
    }
  }

  /**
   * Samples a point and translates it into world space.
   * @optimization Uses an 'out' object to prevent memory allocation (Garbage Collection).
   */
  sample(out = {x: 0, y: 0, z: 0}) {
    // Fill the object with local coordinates first
    this.base.sample(out); 
    
    // Apply world-space displacement
    out.x += this.offset.x;
    out.y += this.offset.y;
    out.z += this.offset.z;
    
    return out;
  }

  /**
   * Containment test using Inverse Translation.
   * Logic: Subtracts the displacement from the world-space point 'p' 
   * to test it against the base shape's original local coordinates.
   */
  contains(p, epsilon = 1e-9) {
    if (!this.base.contains) return false;

    // Map world point back to local space
    const localP = {
      x: p.x - this.offset.x,
      y: p.y - this.offset.y,
      z: (p.z ?? 0) - this.offset.z
    };

    return this.base.contains(localP, epsilon);
  }
}