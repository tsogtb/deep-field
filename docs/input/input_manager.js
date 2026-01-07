export const InputState = {
  keys: new Set(),
  mouse: { 
    movementX: 0, 
    movementY: 0,
    isPressed: false // Add this to track drag state
  },
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
  

  // --- CHANGED LOGIC START ---
  
  // 1. Set isPressed to true when clicking the canvas
  canvas.addEventListener("mousedown", (e) => {
    InputState.mouse.isPressed = true;
  });

  // 2. Clear isPressed when releasing anywhere on the window
  window.addEventListener("mouseup", () => {
    InputState.mouse.isPressed = false;
  });

  // 3. Only accumulate movement if mouse is pressed
  document.addEventListener("mousemove", (e) => {
    if (InputState.mouse.isPressed) {
      InputState.mouse.movementX += e.movementX;
      InputState.mouse.movementY += e.movementY;
    }
  });

  
}
