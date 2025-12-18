import { mat4, vec3 } from "https://esm.sh/gl-matrix"

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

window.addEventListener("keydown", (e) => {
  if (e.key in keys) keys[e.key] = true
})

window.addEventListener("keyup", (e) => {
  if (e.key in keys) keys[e.key] = false
})

export class Camera {
  constructor(canvas) {
    this.canvas = canvas

    this.projection = mat4.create()
    this.view = mat4.create()

    this.position = vec3.fromValues(0, 1.5, 3)

    // fixed forward direction (for now)
    this.forward = vec3.fromValues(0, 0, -1)
    this.up = vec3.fromValues(0, 1, 0)

    this.speed = 2.0

    this.rebuildMatrices()
    window.addEventListener("resize", () => this.rebuildMatrices())
  }

  update(dt) {
    const move = vec3.create()

    if (keys.ArrowUp)    move[2] -= 1
    if (keys.ArrowDown)  move[2] += 1
    if (keys.ArrowLeft)  move[0] -= 1
    if (keys.ArrowRight) move[0] += 1

    const len = Math.hypot(move[0], move[2])
    if (len > 0) {
      move[0] /= len
      move[2] /= len

      this.position[0] += move[0] * this.speed * dt
      this.position[2] += move[2] * this.speed * dt
    }

    this.rebuildMatrices()
  }

  rebuildMatrices() {
    const aspect = this.canvas.width / this.canvas.height

    mat4.perspective(
      this.projection,
      Math.PI / 4,
      aspect,
      0.01,
      100.0
    )

    const target = vec3.create()
    vec3.add(target, this.position, this.forward)

    mat4.lookAt(
      this.view,
      this.position,
      target,
      this.up
    )
  }
}
