import { vec3, quat } from "https://esm.sh/gl-matrix";

export class FreeFlyController {
  constructor() {
    this.position = vec3.create();
    this.yaw = 0;   // horizontal rotation
    this.pitch = 0; // vertical rotation
  }

  setPositionAndOrientation(pos, orient) {
    vec3.copy(this.position, pos);

    const forward = vec3.create();

    vec3.transformQuat(forward, [0, 0, -1], orient);

    this.pitch = Math.asin(Math.max(-1, Math.min(1, -forward[1])));

    this.yaw = Math.atan2(-forward[0], -forward[2]); 
  }

  update(camera, dt, input, rotDelta) {
    // Update yaw/pitch from mouse
    if (rotDelta) {
      this.yaw -= rotDelta[0] * (camera.mouseSensitivity ?? 0.002);
      this.pitch -= rotDelta[1] * (camera.mouseSensitivity ?? 0.002);
      const limit = Math.PI / 2 - 0.01;
      this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
    }

    // Convert yaw/pitch → quaternion
    const qYaw = quat.create();
    const qPitch = quat.create();
    quat.setAxisAngle(qYaw, [0, 1, 0], this.yaw);
    quat.setAxisAngle(qPitch, [1, 0, 0], this.pitch);
    quat.multiply(camera.orientation, qYaw, qPitch);

    // Move
    const move = input.move;
    if (vec3.length(move) > 0) {
      vec3.scaleAndAdd(this.position, this.position, move, (camera.speed ?? 10) * dt);
    }
    vec3.copy(camera.position, this.position);

    // Roll (optional)
    if (input.roll) {
      const rollQ = quat.create();
      quat.setAxisAngle(rollQ, camera.getForward(), input.roll * (camera.rollSpeed ?? 2) * dt);
      quat.multiply(camera.orientation, rollQ, camera.orientation);
    }
  }
}
