import { vec3, quat, mat4 } from "https://esm.sh/gl-matrix";

export class OrbitController {
  constructor(config = {}) {
    this.target = vec3.fromValues(...(config.target ?? [0, 0, 0]));
    this.up = vec3.fromValues(...(config.up ?? [0, 1, 0]));
    
    // 1. Calculate the initial vector from target to position
    const startPos = config.position ?? [0, 0, 5];
    const offset = vec3.subtract(vec3.create(), startPos, this.target);

    // 2. Derive Distance
    this.distance = vec3.length(offset);
    
    // 3. Derive Phi (Vertical angle) and Theta (Horizontal angle)
    // We normalize the offset to do trigonometry on a unit sphere
    vec3.normalize(offset, offset);
    
    // Phi is the angle from the 'Up' vector (0 is top, PI is bottom)
    this.phi = Math.acos(Math.max(-1, Math.min(1, vec3.dot(offset, this.up))));
    
    // Theta is the angle around the Up axis
    // If Up is [0, 1, 0], we look at X and Z
    this.theta = Math.atan2(offset[0], offset[2]);

    this.minDistance = config.minDistance ?? 1;
    this.maxDistance = config.maxDistance ?? 1000;
    this.rotateSpeed = config.rotateSpeed ?? 0.002;
    this.zoomSpeed = config.zoomSpeed ?? 1.0;
  }

  update(camera, dt, input, rotDelta) {
    this.theta += rotDelta[0] * this.rotateSpeed;
    this.phi   -= rotDelta[1] * this.rotateSpeed;

    // Constrain phi so we don't flip over the poles
    this.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.phi));

    // Handle Zoom
    if (input.move?.[2]) {
      this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + input.move[2] * this.zoomSpeed));
    }

    // Convert Spherical back to Cartesian relative to the target
    const x = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.distance * Math.cos(this.phi);
    const z = this.distance * Math.sin(this.phi) * Math.cos(this.theta);

    // Update camera position
    vec3.set(camera.position, this.target[0] + x, this.target[1] + y, this.target[2] + z);

    // Orient camera to look at target
    const lookAt = mat4.lookAt(mat4.create(), camera.position, this.target, this.up);
    mat4.getRotation(camera.orientation, lookAt);
    quat.invert(camera.orientation, camera.orientation);
  }
}
