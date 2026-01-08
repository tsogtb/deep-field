import { mat4, vec3, quat } from "https://esm.sh/gl-matrix";

/* --------------------------------
   Predefined direction vectors
-------------------------------- */
const FORWARD = vec3.fromValues(0, 0, -1);
const RIGHT   = vec3.fromValues(1, 0, 0);
const UP      = vec3.fromValues(0, 1, 0);

/* --------------------------------
   Camera Class
-------------------------------- */
export class Camera {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.position = vec3.clone(config.position ?? [0, 0, 0]);
    this.orientation = quat.create();
    this.controller = null;
    this.driver = null;

    this.view = mat4.create();
    this.projection = mat4.create();

    this.fov = config.fov ?? Math.PI / 4;
    this.near = config.near ?? 0.01;
    this.far = config.far ?? 1000;

    /* Internal temporary vectors */
    this._forward = vec3.create();
    this._right   = vec3.create();
    this._up      = vec3.create();
    this._target  = vec3.create();

    this._initOrientation(config);

    this.updateProjection();
    window.addEventListener("resize", () => this.updateProjection());

    this.overlay = document.getElementById("camera-overlay");

    this.uiColors = {
      x: "rgb(217, 51, 77)",
      y: "rgb(26, 204, 128)",
      z: "rgb(51, 153, 255)"
    };

  }

  /* --------------------------------
     Initialize orientation from config
  -------------------------------- */
  _initOrientation(config) {
    const target = config.target ?? [0, 0, 0];
    const up = config.up ?? [0, 1, 0];
    lookAtQuat(this.orientation, this.position, target, up);
  }

  /* --------------------------------
     Direction getters
  -------------------------------- */
  getForward(out = this._forward) {
    return vec3.transformQuat(out, FORWARD, this.orientation);
  }

  getRight(out = this._right) {
    return vec3.transformQuat(out, RIGHT, this.orientation);
  }

  getUp(out = this._up) {
    return vec3.transformQuat(out, UP, this.orientation);
  }

  /* --------------------------------
     Projection and view updates
  -------------------------------- */
  updateProjection() {
    const aspect = this.canvas.width / this.canvas.height;
    mat4.perspective(this.projection, this.fov, aspect, this.near, this.far);
  }

  updateView() {
    vec3.add(this._target, this.position, this.getForward(this._forward));
    mat4.lookAt(this.view, this.position, this._target, this.getUp(this._up));
  }

  /* --------------------------------
     Update per-frame camera state
  -------------------------------- */
  update(dt, inputData, rotDelta) {
    if (this.driver) this.driver.update(this, dt);
    else if (this.controller) this.controller.update(this, dt, inputData, rotDelta);

    quat.normalize(this.orientation, this.orientation);
    this.updateView();
  }

  snapshot() {
    return { position: vec3.clone(this.position), orientation: quat.clone(this.orientation) };
  }

  updateOverlay() {
    if (!this.overlay) return;
  
    // Only show overlay if toggle is checked
    const showOverlay = document.getElementById("ui-camera")?.checked;
    this.overlay.style.display = showOverlay ? "block" : "none";
  
    const [x, y, z] = Array.from(this.position).map(v => v.toFixed(2));
  
    // Forward vector for rotation
    const forward = vec3.fromValues(0, 0, -1);
    const up = vec3.fromValues(0, 1, 0);
    vec3.transformQuat(forward, forward, this.orientation);
    vec3.transformQuat(up, up, this.orientation);
  
    const pitchRad = Math.asin(Math.max(-1, Math.min(1, forward[1])));
    const yawRad = Math.atan2(forward[0], -forward[2]);
  
    const yawDeg = (yawRad * 180 / Math.PI).toFixed(0);
    const pitchDeg = (pitchRad * 180 / Math.PI).toFixed(0);
  
    this.overlay.innerHTML = `
      <div class="overlay-box">
        <div class="coord-row">
          <span style="color:${this.uiColors.x}">X: ${x}</span>
          <span style="color:${this.uiColors.y}">Y: ${y}</span>
          <span style="color:${this.uiColors.z}">Z: ${z}</span>
        </div>
        <div class="rot-row">
          YAW: ${yawDeg}° | PITCH: ${pitchDeg}°
        </div>
      </div>
    `;
  }
  
}

/* --------------------------------
   Utility: Convert lookAt to quaternion
-------------------------------- */
const LOOK_AT_MAT = mat4.create(); // pre-allocate

export function lookAtQuat(out, eye, target, up) {
  mat4.lookAt(LOOK_AT_MAT, eye, target, up);
  mat4.getRotation(out, LOOK_AT_MAT);
  quat.invert(out, out);
  return out;
}
