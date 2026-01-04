import { vec3, quat, mat4 } from "https://esm.sh/gl-matrix";

export class OrbitController {
  constructor({
    target = [0, 0, 0],
    distance = 5,
    minDistance = 1,
    maxDistance = 100,
    rotateSpeed = 0.002,
    zoomSpeed = 1.0,
  } = {}) {
    this.target = vec3.fromValues(...target);
    this.distance = distance;
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;

    this.theta = 0;
    this.phi = Math.PI / 2;

    this.rotateSpeed = rotateSpeed;
    this.zoomSpeed = zoomSpeed;
  }

  update(camera, dt, input, rotDelta) {
    // Rotation
    this.theta += rotDelta[0] * this.rotateSpeed;
    this.phi   -= rotDelta[1] * this.rotateSpeed;

    this.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.phi));

    // Zoom (reuse move.z or mouse wheel later)
    if (input.move?.[2]) {
      this.distance -= input.move[2] * this.zoomSpeed;
      this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    }

    // Spherical → Cartesian
    const x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
    const y = this.distance * Math.cos(this.phi);
    const z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);

    vec3.set(
      camera.position,
      this.target[0] + x,
      this.target[1] + y,
      this.target[2] + z
    );

    // Orientation
    const lookAt = mat4.lookAt(
      mat4.create(),
      camera.position,
      this.target,
      [0, 1, 0]
    );

    mat4.getRotation(camera.orientation, lookAt);
    quat.invert(camera.orientation, camera.orientation);
  }
}
