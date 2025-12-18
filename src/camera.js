import { mat4, vec3 } from "https://esm.sh/gl-matrix"

const keys = {
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false,
}

window.addEventListener("keydown", (e) => {
  if (e.code in keys) keys[e.code] = true
})

window.addEventListener("keyup", (e) => {
  if (e.code in keys) keys[e.code] = false
})

export class Camera {
  constructor(canvas) {
    this.canvas = canvas

    this.projection = mat4.create()
    this.view = mat4.create()

    this.position = vec3.fromValues(0, 1.5, 3)
    this.up = vec3.fromValues(0, 1, 0)

    this.yaw = -Math.PI / 2   // looking down -Z
    this.pitch = 0

    this.speed = 2.5
    this.mouseSensitivity = 0.002

    this._initMouse()

    this.updateProjection()
    this.updateView()

    window.addEventListener("resize", () => this.updateProjection())
  }
  
  _initMouse() {
    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock()
    })
  
    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== this.canvas) return
  
      this.yaw   += e.movementX * this.mouseSensitivity
      this.pitch -= e.movementY * this.mouseSensitivity
  
      // Clamp pitch so we don't flip upside down
      const limit = Math.PI / 2 - 0.01
      this.pitch = Math.max(-limit, Math.min(limit, this.pitch))
  
      this.updateView()
    })
  }
  updateProjection() {
    const aspect = this.canvas.width / this.canvas.height
    mat4.perspective(
      this.projection,
      Math.PI / 4,
      aspect,
      0.01,
      100.0
    )
  }

  updateView() {
    const forward = [
      Math.cos(this.pitch) * Math.cos(this.yaw),
      Math.sin(this.pitch),
      Math.cos(this.pitch) * Math.sin(this.yaw),
    ]
  
    const target = [
      this.position[0] + forward[0],
      this.position[1] + forward[1],
      this.position[2] + forward[2],
    ]
  
    mat4.lookAt(this.view, this.position, target, this.up)
  }

  update(dt) {
    let forward = 0
    let right = 0
  
    if (keys.KeyW) forward += 1
    if (keys.KeyS) forward -= 1
    if (keys.KeyD) right += 1
    if (keys.KeyA) right -= 1
  
    const sinYaw = Math.sin(this.yaw)
    const cosYaw = Math.cos(this.yaw)
  
    // Forward vector (XZ only)
    this.position[0] += (cosYaw * forward - sinYaw * right) * this.speed * dt
    this.position[2] += (sinYaw * forward + cosYaw * right) * this.speed * dt
  
    this.updateView()
  }
  
}
