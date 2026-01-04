import { vec3, quat } from "https://esm.sh/gl-matrix";

export class CameraLerp {
  constructor(from, to, duration = 1.0) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.t = 0;
  }

  update(camera, dt) {
    this.t += dt;
    const a = Math.min(this.t / this.duration, 1);
    const smoothedA = a * a * (3 - 2 * a);

    vec3.lerp(camera.position, this.from.position, this.to.position, smoothedA);
    //quat.slerp(camera.orientation, this.from.orientation, this.to.orientation, smoothedA);

    if (a === 1) {
      camera.driver = null;
    }
  }
}
