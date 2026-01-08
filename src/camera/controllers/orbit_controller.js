import { vec3, quat, mat4 } from "https://esm.sh/gl-matrix";
import { lookAtQuat } from "../camera.js";
export class OrbitController {
  constructor(config={}) {
    this.target = vec3.fromValues(...(config.target||[0,0,0]));
    const startPos = config.position ?? [0,0,5];
    const offset = vec3.subtract(vec3.create(), startPos, this.target);
    this.distance = vec3.length(offset);
    const dir = vec3.normalize(vec3.create(), offset);
    this.phi = Math.acos(Math.max(-1, Math.min(1, dir[1])));
    this.theta = Math.atan2(dir[0], dir[2]);
    this.rotateSpeed = config.rotateSpeed ?? 0.002;
    this.zoomSpeed = config.zoomSpeed ?? 1.0;
    this.minDistance = config.minDistance ?? 1;
    this.maxDistance = config.maxDistance ?? 1000;
  }

  update(camera, dt, input, rotDelta) {
    if (rotDelta) {
      this.theta += rotDelta[0]*this.rotateSpeed;
      this.phi   -= rotDelta[1]*this.rotateSpeed;
      this.phi = Math.max(0.01, Math.min(Math.PI-0.01, this.phi));
    }

    if (input.move && input.move[2]) {
      this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + input.move[2]*this.zoomSpeed));
    }

    const x = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.distance * Math.cos(this.phi);
    const z = this.distance * Math.sin(this.phi) * Math.cos(this.theta);

    vec3.set(camera.position, this.target[0]+x, this.target[1]+y, this.target[2]+z);
    lookAtQuat(camera.orientation, camera.position, this.target, [0,1,0]);
  }

  setPositionAndOrientation(pos, orient) {
    const offset = vec3.subtract(vec3.create(), pos, this.target);
    this.distance = vec3.length(offset);
    const dir = vec3.normalize(vec3.create(), offset);
    this.phi = Math.acos(Math.max(-1, Math.min(1, dir[1])));
    this.theta = Math.atan2(dir[0], dir[2]);
  }
}
