export const InputState = {
  keys: new Set(),
  mouse: { movementX: 0, movementY: 0 },
};

export function setupInput(canvas, handlers = {}) {
  
  window.addEventListener("keydown", (e) => {
    if (InputState.keys.has(e.code)) return;
  
    InputState.keys.add(e.code);
    handlers.onKeyDown?.(e.key.toLowerCase(), e);
  });
  
  window.addEventListener("keyup", (e) => {
    InputState.keys.delete(e.code);
  });
  

  canvas.addEventListener("mousedown", () => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === canvas) {
      InputState.mouse.movementX += e.movementX;
      InputState.mouse.movementY += e.movementY;
    }
  });
}
