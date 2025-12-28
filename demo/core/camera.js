import { mat4, vec3, quat } from "https://esm.sh/gl-matrix";

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.projection = mat4.create();
    this.view = mat4.create();
    this.position = vec3.fromValues(18, 0, 27);
    this.orientation = quat.create();

    const lookAtMatrix = mat4.create();
    mat4.lookAt(lookAtMatrix, this.position, [0, 0, 0], [0, 1, 0]);
    mat4.getRotation(this.orientation, lookAtMatrix);
    quat.invert(this.orientation, this.orientation);

    this.speed = 30.0;
    this.mouseSensitivity = 0.002;
    this.rollSpeed = 1.5;
    this.returnSpeed = 5.0;
    this.isReturning = false;

    this._initialPosition = vec3.clone(this.position);
    this._initialOrientation = quat.clone(this.orientation);

    this.uiColors = { x: "rgb(217, 51, 77)", y: "rgb(26, 204, 128)", z: "rgb(51, 153, 255)" };
    this.overlay = document.getElementById("camera-overlay");

    this.updateProjection();
    window.addEventListener("resize", () => this.updateProjection());
  }

  getForward() {
    const f = vec3.fromValues(0, 0, -1);
    return vec3.transformQuat(f, f, this.orientation);
  }

  getRight() {
    const r = vec3.fromValues(1, 0, 0);
    return vec3.transformQuat(r, r, this.orientation);
  }

  getUp() {
    const u = vec3.fromValues(0, 1, 0);
    return vec3.transformQuat(u, u, this.orientation);
  }

  updateProjection() {
    const aspect = this.canvas.width / this.canvas.height;
    mat4.perspective(this.projection, Math.PI / 4, aspect, 0.01, 1000.0);
  }

  update(dt, inputData, rotDelta) {
    const { move, roll, level } = inputData;
    const isMoving = vec3.length(move) > 0;
    const isRotating = Math.abs(rotDelta[0]) > 0.001 || Math.abs(rotDelta[1]) > 0.001 || roll !== 0;

    if (isMoving || isRotating) {
      this.isReturning = false;
    }

    if (this.isReturning) {
      const step = this.returnSpeed * dt;
      vec3.lerp(this.position, this.position, this._initialPosition, step);
      quat.slerp(this.orientation, this.orientation, this._initialOrientation, step);

      const dist = vec3.distance(this.position, this._initialPosition);
      const angleDiff = Math.abs(quat.dot(this.orientation, this._initialOrientation));

      if (dist < 0.01 && angleDiff > 0.9999) {
        vec3.copy(this.position, this._initialPosition);
        quat.copy(this.orientation, this._initialOrientation);
        this.isReturning = false;
      }
    }

    if (level && !this.isReturning && !isRotating) {
      const forward = this.getForward();
      const target = vec3.add(vec3.create(), this.position, forward);
      const levelMatrix = mat4.lookAt(mat4.create(), this.position, target, [0, 1, 0]);
      const levelQuat = mat4.getRotation(quat.create(), levelMatrix);
      quat.invert(levelQuat, levelQuat);

      if (Math.abs(quat.dot(this.orientation, levelQuat)) > 0.9999) {
        quat.copy(this.orientation, levelQuat);
      } else {
        quat.slerp(this.orientation, this.orientation, levelQuat, 5.0 * dt);
      }
    }

    if (!this.isReturning) {
      if (isMoving) {
        vec3.scaleAndAdd(this.position, this.position, move, this.speed * dt);
      }

      if (isRotating) {
        const right = this.getRight();
        const up = vec3.fromValues(0, 1, 0);
        const yawQ = quat.setAxisAngle(quat.create(), up, rotDelta[0] * this.mouseSensitivity);
        const pitchQ = quat.setAxisAngle(quat.create(), right, rotDelta[1] * this.mouseSensitivity);
        
        quat.multiply(this.orientation, yawQ, this.orientation);
        quat.multiply(this.orientation, pitchQ, this.orientation);

        if (roll !== 0) {
          const rollQ = quat.setAxisAngle(quat.create(), this.getForward(), roll * this.rollSpeed * dt);
          quat.multiply(this.orientation, rollQ, this.orientation);
        }
      }
    }

    quat.normalize(this.orientation, this.orientation);
    this.updateView();
    this.updateOverlay();
  }

  updateView() {
    const forward = this.getForward();
    const up = this.getUp();
    const target = vec3.add(vec3.create(), this.position, forward);
    mat4.lookAt(this.view, this.position, target, up);
  }

  updateOverlay() {
    if (!this.overlay) return;

    const [x, y, z] = Array.from(this.position).map(v => v.toFixed(2));
    const forward = this.getForward();
    const up = this.getUp();

    const pitch = Math.asin(Math.max(-1, Math.min(1, forward[1])));
    const yaw = Math.atan2(forward[0], -forward[2]);

    const worldUp = vec3.fromValues(0, 1, 0);
    const projUp = vec3.create();
    const dot = vec3.dot(worldUp, forward);
    vec3.scaleAndAdd(projUp, worldUp, forward, -dot);
    vec3.normalize(projUp, projUp);

    let roll = Math.acos(Math.max(-1, Math.min(1, vec3.dot(projUp, up))));
    const cross = vec3.create();
    vec3.cross(cross, projUp, up);
    if (vec3.dot(forward, cross) < 0) roll = -roll;

    this.overlay.innerHTML = `
      <div style="font-family: monospace; color: rgba(255,255,255,0.5); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.5;">
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
}