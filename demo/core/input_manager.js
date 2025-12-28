export const InputState = {
  keys: new Set(),
  mouse: { movementX: 0, movementY: 0 },
  touches: new Map()
};

export function setupInput(canvas, sceneController, camera) {
  window.addEventListener("keydown", (e) => {
    const code = e.code;
    const key = e.key.toLowerCase();

    InputState.keys.add(code);
    
    if (key === "n") sceneController.nextScene();
    if (key === "b") sceneController.swapBrush();
    if (key === "o") camera.isReturning = true;
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