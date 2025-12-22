import createREGL from "https://esm.sh/regl"
import { Camera } from "./camera.js"
import { createRenderer } from "./renderer.js"
import { createScene, createStarData } from "./scene.js"

const canvas = document.getElementById("c")

const regl = createREGL({ 
    canvas,
    attributes: {
        antialias: true,
        alpha: false, 
        preserveDrawingBuffer: false,
        powerPreference: "high-performance"
    }
})

function resize() {
    const dpr = window.devicePixelRatio || 1
    
    const width = window.innerWidth
    const height = window.innerHeight
    
    canvas.width = width * dpr
    canvas.height = height * dpr
  
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
}

window.addEventListener("resize", resize)
resize()

const camera = new Camera(canvas)
let starData = createStarData(regl)


const scene = createScene()
let render = createRenderer(regl, starData)

document.getElementById("regen").addEventListener("click", () => {
  
  starData.buffer.destroy()
  starData.colorBuffer.destroy()

  
  starData = createStarData(regl, {
    passive: false,
    clusters: [
      {
        num_stars: 2865,
        center: { x: 1.5, y: 0, z: 0 }, 
        radius: 0.7,
        color: [1.0, 0.2, 0.2] 
      },
      {
        num_stars: 5719,
        center: { x: -1.5, y: 0, z: 0 }, 
        radius: 1,
        color: [0.2, 0.5, 1.0]
      }
    ]
  })

  render = createRenderer(regl, starData)
})

let prevTime = 0

regl.frame(({ time }) => {

  const dt = Math.min(time - prevTime, 0.05)
  prevTime = time
  const safeTime = time % (Math.PI * 100)

  camera.update(dt)

  regl.clear({ 
    color: [0.02, 0.02, 0.02, 1], 
    depth: 1 
  })

  render(scene, camera, safeTime)
})