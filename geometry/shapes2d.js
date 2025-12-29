/**
 * EllipseSector2D
 * Manifold for elliptical and circular shapes. 
 * Supports hollow (annular) sectors and importance sampling.
 */
export class EllipseSector2D {
  constructor(center, outerRx = 1, outerRy = 1, startAngle = 0, endAngle = 2 * Math.PI, innerRx = 0, innerRy = 0) {
    this.center = center;
    this.outerRx = outerRx;
    this.outerRy = outerRy;
    this.innerRx = innerRx;
    this.innerRy = innerRy;
    this.start = startAngle;
    this.end = endAngle;

    // Normalizes angular span to [0, 2π]
    let deltaTheta = endAngle - startAngle;
    if (deltaTheta < 0) deltaTheta += 2 * Math.PI;
    this.deltaTheta = deltaTheta;

    const outerArea = 0.5 * outerRx * outerRy * deltaTheta;
    const innerArea = 0.5 * innerRx * innerRy * deltaTheta;
    this.area = outerArea - innerArea;

    this.bbox = {
      minX: center.x - outerRx, maxX: center.x + outerRx,
      minY: center.y - outerRy, maxY: center.y + outerRy
    };
  }

  /**
   * Point-in-shape test using normalized elliptical coordinates.
   * Handles sector-crossing at the 2π boundary.
   */
  contains(p, epsilon = 1e-9) {
    const dx = p.x - this.center.x;
    const dy = p.y - this.center.y;
    
    // Algebraically shifts point to a unit circle space for distance check
    const distSq = (dx * dx) / (this.outerRx * this.outerRx) + (dy * dy) / (this.outerRy * this.outerRy);
    const innerDistSq = (this.innerRx <= 0 || this.innerRy <= 0) 
      ? 0 
      : (dx * dx) / (this.innerRx * this.innerRx) + (dy * dy) / (this.innerRy * this.innerRy);

    if (distSq > 1 + epsilon || (this.innerRx > 0 && innerDistSq < 1 - epsilon)) return false;

    // Corrects for elliptical eccentricity before calculating angle
    let theta = Math.atan2(dy / this.outerRy, dx / this.outerRx); 
    if (theta < 0) theta += 2 * Math.PI;

    return (this.start <= this.end)
      ? (theta >= this.start - epsilon && theta <= this.end + epsilon)
      : (theta >= this.start - epsilon || theta <= this.end + epsilon);
  }

  /**
   * Uniformly samples the elliptical area.
   * Uses sqrt(random) to counteract the radial density gradient.
   */
  sample() {
    const t = (this.start + Math.random() * this.deltaTheta) % (2 * Math.PI);
    
    // Inverse Transform Sampling for annular area distribution
    const rScaling = Math.sqrt(Math.random() * (1 - Math.pow(this.innerRx/this.outerRx, 2)) + Math.pow(this.innerRx/this.outerRx, 2));

    return {
      x: this.center.x + rScaling * this.outerRx * Math.cos(t),
      y: this.center.y + rScaling * this.outerRy * Math.sin(t),
      z: this.center.z ?? 0
    };
  }
}


/**
 * CircleSector2D
 * Optimized specialization of EllipseSector2D.
 * Swaps elliptical division for squared-magnitude comparisons (x² + y²).
 */
export class CircleSector2D extends EllipseSector2D {
  constructor(center, radius = 1, startAngle = 0, endAngle = 2 * Math.PI, innerRadius = 0) {
    super(center, radius, radius, startAngle, endAngle, innerRadius, innerRadius);
    this.radius = radius;
    this.innerRadius = innerRadius;
    this.rOuterSq = radius * radius;
    this.rInnerSq = innerRadius * innerRadius;
  }

  /**
   * Fast-path override. 
   * Uses pre-calculated squared radii to bypass Math.sqrt() and division.
   */
  contains(p, epsilon = 1e-9) {
    const dx = p.x - this.center.x;
    const dy = p.y - this.center.y;
    
    // Euclidean distance squared
    const d2 = dx * dx + dy * dy;

    // Early exit if outside radial bounds
    if (d2 > this.rOuterSq + epsilon || d2 < this.rInnerSq - epsilon) return false;

    // Angular check (only performed if radial check passes)
    let theta = Math.atan2(dy, dx); 
    if (theta < 0) theta += 2 * Math.PI;

    return (this.start <= this.end)
      ? (theta >= this.start - epsilon && theta <= this.end + epsilon)
      : (theta >= this.start - epsilon || theta <= this.end + epsilon);
  }
}


/**
 * Circle2D
 * The most optimized circular primitive. 
 * Strips all angular and trigonometric overhead for pure radial math.
 */
export class Circle2D extends CircleSector2D {
  constructor(center, radius = 1, innerRadius = 0) {
    super(center, radius, 0, 2 * Math.PI, innerRadius);
  }

  /**
   * Performance Override.
   * Completely bypasses atan2() and angular bounds. 
   * Uses only squared Euclidean distance for O(1) containment check.
   */
  contains(p, epsilon = 1e-9) {
    const dx = p.x - this.center.x;
    const dy = p.y - this.center.y;
    const d2 = dx * dx + dy * dy;
    return d2 <= this.rOuterSq + epsilon && d2 >= this.rInnerSq - epsilon;
  }

  /**
   * Optimized uniform sampling.
   * Uses Inverse Transform Sampling over the squared radius to ensure 
   * uniform point density across the circular area.
   */
  sample() {
    const t = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(Math.random() * (this.rOuterSq - this.rInnerSq) + this.rInnerSq);
    return {
      x: this.center.x + r * Math.cos(t),
      y: this.center.y + r * Math.sin(t),
      z: this.center.z ?? 0
    };
  }
}


/**
 * Ellipse2D
 * Optimized specialization of EllipseSector2D.
 * Bypasses all trigonometric and angular logic for pure algebraic distance checks.
 */
export class Ellipse2D extends EllipseSector2D {
  constructor(center, rx = 1, ry = 1, innerRx = 0, innerRy = 0) {
    super(center, rx, ry, 0, 2 * Math.PI, innerRx, innerRy);
  }

  /**
   * Performance Override.
   * Logic: A point is inside if (dx/rx)² + (dy/ry)² ≤ 1.
   * This removes the need for atan2() calls entirely.
   */
  contains(p, epsilon = 1e-9) {
    const dx = p.x - this.center.x;
    const dy = p.y - this.center.y;
    
    // Normalized squared distance in elliptical space
    const distSq = (dx * dx) / (this.outerRx * this.outerRx) + (dy * dy) / (this.outerRy * this.outerRy);
    
    // Annular (hollow) check performed only if an inner radius exists
    if (this.innerRx > 0) {
      const innerDistSq = (dx * dx) / (this.innerRx * this.innerRx) + (dy * dy) / (this.innerRy * this.innerRy);
      return distSq <= 1 + epsilon && innerDistSq >= 1 - epsilon;
    }
    
    return distSq <= 1 + epsilon;
  }
}


/**
 * Triangle2D
 * Primitive manifold defined by three vertices.
 * Uses barycentric coordinate systems for containment and sampling logic.
 */
export class Triangle2D {
  constructor(a, b, c) {
    this.a = a; this.b = b; this.c = c;
    
    // Area derived via the magnitude of the 2D cross product
    this.area = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) * 0.5;
    
    this.bbox = {
      minX: Math.min(a.x, b.x, c.x), maxX: Math.max(a.x, b.x, c.x),
      minY: Math.min(a.y, b.y, c.y), maxY: Math.max(a.y, b.y, c.y)
    };
  }

  /**
   * Point-in-triangle test.
   * Logic: Point is inside if all barycentric coordinates (λ1, λ2, λ3) are >= 0.
   */
  contains(p, epsilon = 1e-9) {
    const { a, b, c } = this;
    const detT = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    
    // Safety check for degenerate (collinear) triangles
    if (Math.abs(detT) < 1e-15) return false;
    
    const l1 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / detT;
    const l2 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / detT;
    const l3 = 1 - l1 - l2;
    
    return l1 >= -epsilon && l2 >= -epsilon && l3 >= -epsilon;
  }

  /**
   * Uniformly samples the triangle's surface.
   * Logic: Samples a parallelogram and folds points outside the hypotenuse back in.
   */
  sample() {
    let u = Math.random(), v = Math.random();
    
    // Fold logic ensures a uniform distribution without rejection sampling
    if (u + v > 1) { 
      u = 1 - u; 
      v = 1 - v; 
    }
    
    return {
      x: this.a.x + u * (this.b.x - this.a.x) + v * (this.c.x - this.a.x),
      y: this.a.y + u * (this.b.y - this.a.y) + v * (this.c.y - this.a.y),
      z: this.a.z ?? 0
    };
  }
}


/**
 * Rectangle2D
 * Standard Axis-Aligned Bounding Box (AABB).
 * Optimized for grid-aligned containment checks and uniform area sampling.
 */
export class Rectangle2D {
  constructor(center, width = 1, height = 1) {
    this.center = center;
    this.width = width;
    this.height = height;
    this.area = width * height;
    
    // Static AABB calculation for O(1) broad-phase collision checks
    this.bbox = {
      minX: center.x - width / 2, maxX: center.x + width / 2,
      minY: center.y - height / 2, maxY: center.y + height / 2
    };
  }

  /**
   * Fast AABB containment test.
   * Logic: Point is inside if its absolute distance from the center 
   * is within the half-extents of the rectangle.
   */
  contains(p, epsilon = 1e-9) {
    return Math.abs(p.x - this.center.x) <= (this.width / 2) + epsilon && 
           Math.abs(p.y - this.center.y) <= (this.height / 2) + epsilon;
  }

  /**
   * Uniformly samples the rectangular area.
   * Maps two independent random variables to the width and height dimensions.
   */
  sample() {
    return {
      x: this.center.x + (Math.random() - 0.5) * this.width,
      y: this.center.y + (Math.random() - 0.5) * this.height,
      z: this.center.z ?? 0
    };
  }
}


/**
 * Polygon2D
 * Manifold for arbitrary ordered vertex arrays (convex or concave).
 * Decomposes complex shapes into a Triangle Mesh for robust sampling and containment.
 */
export class Polygon2D {
  constructor(vertices) {
    if (!vertices || vertices.length < 3) throw new Error("Polygon needs >= 3 vertices");
    this.vertices = vertices;
    this.triangles = [];
    this.area = 0;
    
    // 1. Mesh Generation via Ear Clipping
    this.triangulate(vertices);
    
    // 2. Area-Weighted Distribution Setup
    // We use a Prefix Sum array of triangle areas to enable O(log N) importance sampling.
    let currentTotalArea = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of this.triangles) {
      currentTotalArea += t.area;
      t.cumulativeArea = currentTotalArea;
    }
    this.area = currentTotalArea;

    // 3. Spatial Bounds Calculation
    for (const v of vertices) {
      minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
    }
    this.bbox = { minX, maxX, minY, maxY };
  }

  /**
   * Uniformly samples the polygon surface.
   * Logic: 
   * 1. Pick a triangle using binary search over the cumulative area (CDF).
   * 2. Sample within that triangle using barycentric coordinates.
   */
  sample() {
    const r = Math.random() * this.area;
    let low = 0, high = this.triangles.length - 1;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.triangles[mid].cumulativeArea < r) low = mid + 1;
      else high = mid;
    }
    return this.triangles[low].sample();
  }

  /**
   * Ear Clipping Algorithm.
   * Reduces the polygon by repeatedly "clipping" vertices that form a valid triangle
   * until only three vertices remain.
   * @private
   */
  triangulate(vertices) {
    const pts = [...vertices];
    // Ensure Counter-Clockwise (CCW) winding order for consistent ear identification.
    if (this.getSignedArea(pts) < 0) pts.reverse(); 
    
    while (pts.length > 3) {
      let earFound = false;
      for (let i = 0; i < pts.length; i++) {
        const prev = pts[(i + pts.length - 1) % pts.length];
        const curr = pts[i];
        const next = pts[(i + 1) % pts.length];
        
        if (this.isEar(prev, curr, next, pts)) {
          this.triangles.push(new Triangle2D(prev, curr, next));
          pts.splice(i, 1);
          earFound = true;
          break;
        }
      }
      if (!earFound) break; 
    }
    if (pts.length === 3) this.triangles.push(new Triangle2D(pts[0], pts[1], pts[2]));
  }

  /** * Determines if a vertex is an "ear" (a convex vertex with no other points inside its triangle).
   * @private 
   */
  isEar(p1, p2, p3, allPoints) {
    // Cross product check for convexity
    const area = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    if (area <= 0) return false;

    const tempTri = new Triangle2D(p1, p2, p3);
    for (const p of allPoints) {
      if (p === p1 || p === p2 || p === p3) continue;
      if (tempTri.contains(p)) return false;
    }
    return true;
  }

  /** * Calculates signed area using the Shoelace Formula.
   * @private 
   */
  getSignedArea(pts) {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return area / 2;
  }

  /**
   * Containment test.
   * Uses the AABB for a fast-fail exit, followed by checking the internal triangle mesh.
   */
  contains(p, epsilon = 1e-9) {
    if (p.x < this.bbox.minX - epsilon || p.x > this.bbox.maxX + epsilon || 
        p.y < this.bbox.minY - epsilon || p.y > this.bbox.maxY + epsilon) return false;
    return this.triangles.some(t => t.contains(p, epsilon));
  }
}