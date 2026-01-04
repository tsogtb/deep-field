import { mat4, vec3, quat } from "https://esm.sh/gl-matrix";
import { DefaultCameraConfig } from "./camera_config.js";

export class Camera {
  constructor(canvas, config = DefaultCameraConfig) {
    this.canvas = canvas;
    
    // Control & animation
    this.controller = null;
    this.driver = null;


    // Matrices
    this.projection = mat4.create();
    this.view = mat4.create();

    // State
    this.position = vec3.clone(config.position ?? [0, 0, 0]);
    this.orientation = quat.create();

    // Params
    this.speed = 30.0;
    this.mouseSensitivity = 0.002;
    this.rollSpeed = 1.5;
    this.returnSpeed = 5.0;

    // Flags
    this.isReturning = false;

    // UI
    this.uiColors = {
      x: "rgb(217, 51, 77)",
      y: "rgb(26, 204, 128)",
      z: "rgb(51, 153, 255)",
    };
    this.overlay = document.getElementById("camera-overlay");

    // Initialize orientation from config
    this._initOrientation(config);

    // Save home state
    this._initialPosition = vec3.clone(this.position);
    this._initialOrientation = quat.clone(this.orientation);

    // Projection
    this.fov = config.fov ?? Math.PI / 4;
    this.near = config.near ?? 0.01;
    this.far = config.far ?? 1000.0;

    this.updateProjection();
    window.addEventListener("resize", () => this.updateProjection());
  }

  /* ------------------------------------------------------------------ */
  /* Initialization                                                     */
  /* ------------------------------------------------------------------ */

  _initOrientation(config) {
    const target = config.target ?? [0, 0, 0];
    const up = config.up ?? [0, 1, 0];

    const lookAt = mat4.lookAt(
      mat4.create(),
      this.position,
      target,
      up
    );

    mat4.getRotation(this.orientation, lookAt);
    quat.invert(this.orientation, this.orientation);
  }

  /* ------------------------------------------------------------------ */
  /* Basis vectors                                                       */
  /* ------------------------------------------------------------------ */

  getForward() {
    return vec3.transformQuat(
      vec3.create(),
      [0, 0, -1],
      this.orientation
    );
  }

  getRight() {
    return vec3.transformQuat(
      vec3.create(),
      [1, 0, 0],
      this.orientation
    );
  }

  getUp() {
    return vec3.transformQuat(
      vec3.create(),
      [0, 1, 0],
      this.orientation
    );
  }

  /* ------------------------------------------------------------------ */
  /* Projection & View                                                   */
  /* ------------------------------------------------------------------ */

  updateProjection() {
    const aspect = this.canvas.width / this.canvas.height;
    mat4.perspective(
      this.projection,
      this.fov,
      aspect,
      this.near,
      this.far
    );
  }

  updateView() {
    const forward = this.getForward();
    const up = this.getUp();
    const target = vec3.add(vec3.create(), this.position, forward);

    mat4.lookAt(this.view, this.position, target, up);
  }

  /* ------------------------------------------------------------------ */
  /* Update                                                             */
  /* ------------------------------------------------------------------ */

  update(dt, inputData, rotDelta) {
    // Animation driver has priority
    if (this.driver) {
      this.driver.update(this, dt);
    } 
    // Otherwise controller drives the camera
    else if (this.controller) {
      this.controller.update(this, dt, inputData, rotDelta);
    }
  
    quat.normalize(this.orientation, this.orientation);
    this.updateView();
    this.updateOverlay();
  }
  

  /* ------------------------------------------------------------------ */
  /* Movement & Rotation                                                 */
  /* ------------------------------------------------------------------ */

  _updateMovement(dt, move) {
    if (vec3.length(move) > 0) {
      vec3.scaleAndAdd(
        this.position,
        this.position,
        move,
        this.speed * dt
      );
    }
  }

  _updateRotation(dt, rotDelta, roll) {
    if (
      Math.abs(rotDelta[0]) < 0.001 &&
      Math.abs(rotDelta[1]) < 0.001 &&
      roll === 0
    ) {
      return;
    }

    const right = this.getRight();
    const worldUp = [0, 1, 0];

    const yawQ = quat.setAxisAngle(
      quat.create(),
      worldUp,
      rotDelta[0] * this.mouseSensitivity
    );

    const pitchQ = quat.setAxisAngle(
      quat.create(),
      right,
      rotDelta[1] * this.mouseSensitivity
    );

    quat.multiply(this.orientation, yawQ, this.orientation);
    quat.multiply(this.orientation, pitchQ, this.orientation);

    if (roll !== 0) {
      const rollQ = quat.setAxisAngle(
        quat.create(),
        this.getForward(),
        roll * this.rollSpeed * dt
      );
      quat.multiply(this.orientation, rollQ, this.orientation);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Return / Level                                                      */
  /* ------------------------------------------------------------------ */

  _updateReturn(dt) {
    const step = this.returnSpeed * dt;

    vec3.lerp(
      this.position,
      this.position,
      this._initialPosition,
      step
    );

    quat.slerp(
      this.orientation,
      this.orientation,
      this._initialOrientation,
      step
    );

    const dist = vec3.distance(this.position, this._initialPosition);
    const align = Math.abs(
      quat.dot(this.orientation, this._initialOrientation)
    );

    if (dist < 0.01 && align > 0.9999) {
      vec3.copy(this.position, this._initialPosition);
      quat.copy(this.orientation, this._initialOrientation);
      this.isReturning = false;
    }
  }

  _updateLevel(dt) {
    const forward = this.getForward();
    const target = vec3.add(vec3.create(), this.position, forward);

    const lookAt = mat4.lookAt(
      mat4.create(),
      this.position,
      target,
      [0, 1, 0]
    );

    const levelQuat = mat4.getRotation(quat.create(), lookAt);
    quat.invert(levelQuat, levelQuat);

    if (Math.abs(quat.dot(this.orientation, levelQuat)) > 0.9999) {
      quat.copy(this.orientation, levelQuat);
    } else {
      quat.slerp(
        this.orientation,
        this.orientation,
        levelQuat,
        5.0 * dt
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /* Overlay                                                             */
  /* ------------------------------------------------------------------ */

  updateOverlay() {
    if (!this.overlay || this.overlay.style.display === "none") return;

    // 1. Position with UI Colors
    const [x, y, z] = Array.from(this.position).map(v => v.toFixed(2));
    const forward = this.getForward();
    const up = this.getUp();

    // 2. Extract Pitch/Yaw (Clamped to prevent NaN)
    const pitch = Math.asin(Math.max(-1, Math.min(1, forward[1])));
    const yaw = Math.atan2(forward[0], -forward[2]);

    // 3. Extract Roll
    const worldUp = vec3.fromValues(0, 1, 0);
    const projUp = vec3.create();
    const dot = vec3.dot(worldUp, forward);
    vec3.scaleAndAdd(projUp, worldUp, forward, -dot);
    vec3.normalize(projUp, projUp);

    let roll = 0;
    if (vec3.length(projUp) > 0.0001) {
      roll = Math.acos(Math.max(-1, Math.min(1, vec3.dot(projUp, up))));
      const cross = vec3.create();
      vec3.cross(cross, projUp, up);
      if (vec3.dot(forward, cross) < 0) roll = -roll;
    }

    // 4. Determine Mode Display
    const modeName = this.controller ? this.controller.constructor.name.replace('Controller', '').toUpperCase() : 'AUTO';

    this.overlay.innerHTML = `
      <div style="font-family: monospace; color: rgba(255,255,255,0.5); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.5;">
        <div style="margin-bottom: 4px; color: #fff; opacity: 0.8;">MODE: ${modeName}</div>
        <div>POS: <span style="color:${this.uiColors.x}">${x}</span> <span style="color:${this.uiColors.y}">${y}</span> <span style="color:${this.uiColors.z}">${z}</span></div>
        <div>ROT: ${(yaw * 180 / Math.PI).toFixed(0)}° / ${(pitch * 180 / Math.PI).toFixed(0)}° / ${(-roll * 180 / Math.PI).toFixed(0)}°</div>
        
        <div style="margin-top: 8px; opacity: 0.3; font-size: 9px; display: grid; grid-template-columns: auto auto; gap: 0 15px;">
          <span>W/S/A/D • MOVE</span>
          <span>SPC/SFT • UP/DWN</span>
          <span>Q/E • ROLL</span>
          <span>R/O • LEVEL/HOME</span>
        </div>
      </div>`;
  }

  _hasMovement(move) {
    return vec3.length(move) > 0;
  }
  
  _hasRotation(rotDelta, roll) {
    return (
      Math.abs(rotDelta[0]) > 0.001 ||
      Math.abs(rotDelta[1]) > 0.001 ||
      roll !== 0
    );
  }
  
  snapshot() {
    return {
      position: vec3.clone(this.position),
      orientation: quat.clone(this.orientation),
    };
  }
  
}
