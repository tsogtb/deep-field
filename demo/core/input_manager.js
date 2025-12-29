export const InputState = {
  keys: new Set(),
  mouse: { movementX: 0, movementY: 0 },
  touches: new Map()
};

export function setupInput(canvas, sceneController, camera) {
  
  window.addEventListener("keydown", (e) => {
    const code = e.code;
    const key = e.key.toLowerCase();

    if (InputState.keys.has(code)) return;

    InputState.keys.add(code);
    InputState.keys[code] = true; 
    
    if (key === "n") sceneController.nextScene();
    if (key === "b") sceneController.swapBrush();
    if (key === "o") camera.isReturning = true; 
    
    console.log(`Key Down: ${code} | Active Keys:`, Array.from(InputState.keys));
  });

  window.addEventListener("keyup", (e) => {
    const code = e.code;
    
    InputState.keys.delete(code);
    InputState.keys[code] = false;
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