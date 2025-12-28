export function setupScreenshot(canvas, regl) {
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "j") return;

    if (!regl._gl.getContextAttributes().preserveDrawingBuffer) {
      console.warn("Screenshot failed: preserveDrawingBuffer is false.");
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = `deepfield_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      console.log("🌌 Captured!");
    } catch (err) {
      console.error("Capture failed:", err);
    }
  });
}