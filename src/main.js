import createREGL from "https://esm.sh/regl"
import { Camera } from "./camera.js"
import { createRenderer } from "./renderer.js"
import { createScene } from "./scene.js"

const canvas = document.getElementById("c")
const regl = createREGL({ canvas })

function resize() {
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + "px"
  canvas.style.height = window.innerHeight + "px"
}
resize()
window.addEventListener("resize", resize)

const camera = new Camera(canvas)
const scene = createScene()
const render = createRenderer(regl)

let prevTime = 0

regl.frame(({ time }) => {
  const dt = Math.min(time - prevTime, 0.05)
  prevTime = time

  camera.update(dt)

  regl.clear({ color: [0, 0, 0, 1], depth: 1 })
  render(scene, camera)
})
