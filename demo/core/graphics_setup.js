import createREGL from "https://esm.sh/regl";

export function setupCanvasAndREGL(canvasId = "c") {
  const canvas = document.getElementById(canvasId);
  const regl = createREGL({ 
    canvas, 
    attributes: { 
      antialias: true, 
      alpha: false, 
      powerPreference: "high-performance",
      preserveDrawingBuffer: false
    }
  });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2.0);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  };

  window.addEventListener("resize", resize);
  resize();

  return { canvas, regl };
}