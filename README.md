# 🌌 deepfield

**A modular JavaScript framework for procedural geometry, particle physics, and GPU-based visualization.**

![deepfield Banner](./assets/deepfield.png)

> **Why Deepfield?**  
> Just as the Hubble Deep Field revealed structure through accumulation, `deepfield` reveals space, motion, and form by sampling, evolving, and rendering large numbers of discrete points.

---

## 🚀 Performance

`deepfield` is built for **real-time simulation and visualization**.

- **Fast:** Millions of samples per second for complex geometries and particle systems.
- **Streaming-friendly:** Designed to write directly into `Float32Array` buffers for GPU upload.
- **Zero-dependency core:** Geometry, math, and physics modules are pure and standalone.
- **GPU-ready:** Includes adapters and demos using WebGL / `regl`.

---

## ✨ Features

### Procedural Geometry
- **1D Paths:** Uniform arc-length sampling for lines, arcs, helices, and Bézier curves.
- **2D Shapes:** Circles, ellipses, rectangles, triangles, convex polygons.
- **3D Volumes:** Spheres, ellipsoids, boxes, cones, cylinders, shells.
- **CSG Operations:** Union, intersection, and difference with uniform density guarantees.

### Particle Physics
- **Generic State System:** Typed particle states with position, velocity, and optional acceleration.
- **Force Fields:** Pluggable derivatives (e.g. central gravity).
- **Integrators:** Time-stepping via Euler (with room for Verlet / RK4).
- **Deterministic Simulation:** Explicit control over time step and evolution.

### Visualization
- **GPU Data Bridges:** Convert simulation states into GPU buffers efficiently.
- **Point Cloud Rendering:** High-performance point-based visualization using `regl`.
- **Decoupled Design:** Rendering never mutates physics or geometry state.

---

## 🛠 Quick Start

```js
import { Sphere3D } from 'deepfield/geometry';
import { gravityCentral, integrateEuler } from 'deepfield/physics';

// 1. Sample a volume
const sphere = new Sphere3D({ x: 0, y: 0, z: 0 }, 5);
const points = new Float32Array(100000 * 3);

for (let i = 0; i < 100000; i++) {
  const p = sphere.sample();
  points[i*3+0] = p.x;
  points[i*3+1] = p.y;
  points[i*3+2] = p.z;
}

// 2. Evolve particles under gravity
let state = {
  t: 0,
  position: [[1, 0, 0]],
  velocity: [[0, 1, 0]],
};

const deriv = gravityCentral(10);

state = integrateEuler(state, deriv, 0.01);
```

## 🧪 Mathematical Rigor

deepfield prioritizes correctness over shortcuts.

- 1D: Arc-length parameterization for uniform path sampling.

- 2D: Square-root radial distributions to prevent center clustering.

- 3D: Cube-root volume scaling and cosine-correct spherical sampling.

- Physics: Explicit time integration with controllable error via dt.

No hidden easing. No visual hacks.

## 🤝 Contributing

Current areas of focus:

- Higher-order integrators (Verlet, RK4)

- Multi-body interactions

- Deterministic sampling (sample(t)) for animation

- GPU instancing & transform pipelines
