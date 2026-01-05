import { mat4, vec3, quat } from "https://esm.sh/gl-matrix";

const FORWARD = vec3.fromValues(0,0,-1);
const RIGHT   = vec3.fromValues(1,0,0);
const UP      = vec3.fromValues(0,1,0);


export class Camera {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.position = vec3.clone(config.position ?? [0,0,0]);
    this.orientation = quat.create();
    this.controller = null;
    this.driver = null;

    this.view = mat4.create();
    this.projection = mat4.create();

    this.fov = config.fov ?? Math.PI / 4;
    this.near = config.near ?? 0.01;
    this.far = config.far ?? 1000;

    this._forward = vec3.create();
    this._right   = vec3.create();
    this._up      = vec3.create();
    this._target  = vec3.create();

    
    this._initOrientation(config);

    this.updateProjection();
    window.addEventListener("resize", () => this.updateProjection());
  }

  /* -------------------------------- */
  _initOrientation(config) {
    const target = config.target ?? [0,0,0];
    const up = config.up ?? [0,1,0];
    lookAtQuat(this.orientation, this.position, target, up);
  }

  /* -------------------------------- */
  getForward(out = this._forward) {
    return vec3.transformQuat(out, FORWARD, this.orientation);
  }
  getRight(out = this._right) {
    return vec3.transformQuat(out, RIGHT, this.orientation);
  }
  getUp(out = this._up) {
    return vec3.transformQuat(out, UP, this.orientation);
  }

  /* -------------------------------- */
  updateProjection() {
    const aspect = this.canvas.width / this.canvas.height;
    mat4.perspective(this.projection, this.fov, aspect, this.near, this.far);
  }

  updateView() {
    vec3.add(this._target, this.position, this.getForward(this._forward));
    mat4.lookAt(this.view, this.position, this._target, this.getUp(this._up));
  }
  

  /* -------------------------------- */
  update(dt, inputData, rotDelta) {
    if (this.driver) this.driver.update(this, dt);
    else if (this.controller) this.controller.update(this, dt, inputData, rotDelta);

    quat.normalize(this.orientation, this.orientation);
    this.updateView();
  }

  snapshot() {
    return { position: vec3.clone(this.position), orientation: quat.clone(this.orientation) };
  }
}

/* -------------------------------- */

// Pre-allocate ONCE outside the function
const LOOK_AT_MAT = mat4.create();

export function lookAtQuat(out, eye, target, up) {
  // Use the pre-allocated matrix instead of creating one
  mat4.lookAt(LOOK_AT_MAT, eye, target, up);
  mat4.getRotation(out, LOOK_AT_MAT);
  quat.invert(out, out);
  return out;
}