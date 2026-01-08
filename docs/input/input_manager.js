/**
 * Global input state for keyboard and mouse.
 */
export const InputState = {
  keys: new Set(),
  mouse: { 
    movementX: 0, 
    movementY: 0,
    isPressed: false, // Track drag state
  },
};

/**
 * Sets up event listeners for keyboard and mouse input on the given canvas.
 * @param {HTMLCanvasElement} canvas 
 * @param {Object} handlers - Optional callbacks: onKeyDown(key, event)
 */
export function setupInput(canvas, handlers = {}) {
  
  // --- Keyboard ---
  window.addEventListener("keydown", (e) => {
    if (!InputState.keys.has(e.code)) {
      InputState.keys.add(e.code);
      handlers.onKeyDown?.(e.key.toLowerCase(), e);
    }
  });

  window.addEventListener("keyup", (e) => {
    InputState.keys.delete(e.code);
  });

  // --- Mouse / Drag ---
  canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    InputState.mouse.isPressed = true;
  });

  window.addEventListener("mouseup", () => {
    InputState.mouse.isPressed = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (InputState.mouse.isPressed) {
      InputState.mouse.movementX += e.movementX;
      InputState.mouse.movementY += e.movementY;
    }
  });

  // --- Focus / Blur handling ---
  window.addEventListener("blur", () => {
    InputState.keys.clear();
    InputState.mouse.movementX = 0;
    InputState.mouse.movementY = 0;
    InputState.mouse.isPressed = false;
  });

  window.addEventListener("focus", () => {
    // Prevent carry-over deltas
    InputState.mouse.movementX = 0;
    InputState.mouse.movementY = 0;
  });

  // --- Canvas focus ---
  canvas.setAttribute("tabindex", "0");

  // Focus canvas on first pointer down
  canvas.addEventListener("pointerdown", () => canvas.focus(), { once: true });
}