import { vec3, quat } from "https://esm.sh/gl-matrix";
import { lookAtQuat } from "/deep-field/camera/camera.js";

/* --------------------------------
   CameraLerp: Smooth interpolation between two camera states
-------------------------------- */
export class CameraLerp {
  /**
   * @param from { position, orientation }
   * @param to { position, orientation }
   * @param duration number in seconds
   * @param options { 
   *   lookAtTarget?: vec3, 
   *   orbitSpeed?: number,        // horizontal orbit speed in rad/sec
   *   tiltRange?: [number, number], // vertical tilt range in rad [min, max]
   *   tiltSpeed?: number,         // vertical tilt speed (oscillation)
   *   onUpdate?: function, 
   *   onComplete?: function, 
   *   loop?: boolean 
   * }
   */
  constructor(from, to, duration = 1.0, options = {}) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.t = 0;

    // --- Pre-allocated scratch vectors ---
    this._radiusVec = vec3.create();
    this._up = vec3.fromValues(0, 1, 0);

    // --- Options ---
    this.lookAtTarget = options.lookAtTarget || null;
    this.orbitSpeed   = options.orbitSpeed || 0;
    this.tiltRange    = options.tiltRange || null;
    this.tiltSpeed    = options.tiltSpeed || 1;
    this.onUpdate     = options.onUpdate || null;
    this.onComplete   = options.onComplete || null;
    this.loop         = options.loop || false;

    this._completed = false;
  }

  /* --------------------------------
     Update camera per frame
  -------------------------------- */
  update(camera, dt) {
    this.t += dt;

    let a = Math.min(this.t / this.duration, 1);
    const smoothedA = a * a * (3 - 2 * a); // Smoothstep interpolation

    // --- Interpolate position ---
    vec3.lerp(camera.position, this.from.position, this.to.position, smoothedA);

    if (this.lookAtTarget) {
      // --- Orbit & tilt logic ---
      const radiusVec = this._radiusVec;
      vec3.subtract(radiusVec, camera.position, this.lookAtTarget);
      const radius = vec3.length(radiusVec);

      // Horizontal orbit
      let theta = Math.atan2(radiusVec[0], radiusVec[2]);
      if (this.orbitSpeed) theta += this.t * this.orbitSpeed;

      // Vertical tilt
      let phi = Math.acos(radiusVec[1] / radius);
      if (this.tiltRange) {
        const [minTilt, maxTilt] = this.tiltRange;
        const tiltAmplitude = (maxTilt - minTilt) / 2;
        const tiltCenter = (maxTilt + minTilt) / 2;
        phi = tiltCenter + tiltAmplitude * Math.sin(this.t * this.tiltSpeed);
        phi = Math.max(0.01, Math.min(Math.PI - 0.01, phi));
      }

      // Spherical → Cartesian conversion
      const sinPhi = Math.sin(phi);
      camera.position[0] = this.lookAtTarget[0] + radius * sinPhi * Math.sin(theta);
      camera.position[1] = this.lookAtTarget[1] + radius * Math.cos(phi);
      camera.position[2] = this.lookAtTarget[2] + radius * sinPhi * Math.cos(theta);

      // Always look at target
      lookAtQuat(camera.orientation, camera.position, this.lookAtTarget, this._up);
    } else {
      // Orientation slerp between from/to
      quat.slerp(camera.orientation, this.from.orientation, this.to.orientation, smoothedA);
    }

    if (this.onUpdate) this.onUpdate(camera, smoothedA);

    // --- Completion handling ---
    if (a === 1 && !this.loop && !this._completed) {
      this._completed = true;
      if (this.onComplete) this.onComplete(camera);
      camera.driver = null;
    }
  }
}
