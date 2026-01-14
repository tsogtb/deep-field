import createREGL from "https://esm.sh/regl";

/**
 * Sets up a canvas and REGL context.
 * @param {string} canvasId - ID of the canvas element to use.
 * @returns {{canvas: HTMLCanvasElement, regl: REGL}} The canvas and REGL instance.
 */
export function setupCanvasAndREGL(canvasId = "c") {
  const canvas = document.getElementById(canvasId);

  const regl = createREGL({
    canvas,
    attributes: {
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    },
  });

  // Handle resizing and device pixel ratio
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2.0);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    regl.poll();
  };

  window.addEventListener("resize", resize);
  resize();

  return { canvas, regl };
}
