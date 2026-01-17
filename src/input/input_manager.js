/**
 * Global input state for keyboard and mouse.
 */
export const InputState = {
  keys: new Set(),
  mouse: { 
    movementX: 0, 
    movementY: 0,
    isPressed: false, // Track drag state
    zoomDelta: 0,
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
  
    // --- UI Transition ---
    const standby = document.getElementById('hint-standby');
    const active = document.getElementById('hint-active');
    const parent = document.getElementById('global-camera-hint');
  
    // Check if standby exists and hasn't been hidden yet
    if (standby && standby.style.display !== 'none') {
      standby.style.display = 'none';
      if (active) active.style.display = 'flex';
      
      // Fade the whole HUD to a "ghost" state (0.15 opacity) after 4 seconds
      setTimeout(() => {
        if (parent) parent.style.opacity = '0.30';
      }, 5000);
    }
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

  // --- Touch Support ---
  let lastTouchX = 0;
  let lastTouchY = 0;

  canvas.addEventListener("touchstart", (e) => {
    // Prevent scrolling while interacting with the simulation
    if (e.target === canvas) e.preventDefault();
    
    InputState.mouse.isPressed = true;
    const touch = e.touches[0];
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;

    // Trigger your UI hint transitions (same as mousedown)
    const standby = document.getElementById('hint-standby');
    if (standby && standby.style.display !== 'none') {
       standby.dispatchEvent(new Event('mousedown')); // Re-use your existing logic
    }
  }, { passive: false });

  let initialPinchDistance = 0;

  canvas.addEventListener("touchmove", (e) => {
    if (e.target === canvas) e.preventDefault();
  
    if (e.touches.length === 2) {
      // --- PINCH ZOOM LOGIC ---
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
  
      if (initialPinchDistance > 0) {
        const delta = dist - initialPinchDistance;
      
        InputState.mouse.zoomDelta = -delta * 0.05;
      }
      initialPinchDistance = dist;
    } else if (e.touches.length === 1 && InputState.mouse.isPressed) {
      // --- EXISTING ROTATION LOGIC ---
      const touch = e.touches[0];
      InputState.mouse.movementX += (touch.clientX - lastTouchX);
      InputState.mouse.movementY += (touch.clientY - lastTouchY);
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    if (e.touches.length === 0) {
      InputState.mouse.isPressed = false;
    }
    initialPinchDistance = 0; 
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

  // Ensure canvas regains focus on user interaction
  window.addEventListener("pointerdown", (e) => {
    if (e.pointerType === 'touch') return; // Let touch listeners handle it
    if (document.activeElement !== canvas) {
      canvas.focus();
    }
  });

}