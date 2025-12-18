import vert from "./shaders/basic.vert.js"
import frag from "./shaders/basic.frag.js"

export function createRenderer(regl) {

  // Create draw command
  const drawMesh = regl({
    vert,
    frag,

    attributes: {
      position: regl.prop("positions"),
    },

    elements: regl.prop("elements"),


    uniforms: {
      projection: (_, props) => props.camera.projection,
      view: (_, props) => props.camera.view,
      uColor: regl.prop("color"),
    },


    cull: {
        enable: true
    },

    depth: {
        enable: true
    },

  })

  // Return a function that calls the draw command
  return function render(scene, camera) {
    for (const mesh of scene.meshes) {
      drawMesh({
        positions: scene.positions,
        elements: mesh.elements,
        color: mesh.color,
        camera
      })
    }
  }
}
