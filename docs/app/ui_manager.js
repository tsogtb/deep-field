export function setupUI(sceneController) {
  const settingsBtn = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const brushSelect = document.getElementById("ui-brush-select");
  const bloomCheck = document.getElementById("ui-bloom");
  const gizmoCheckbox = document.getElementById("ui-gizmo");

  function toggleSettings() {
    settingsPanel?.classList.toggle("open");
  }

  // Add this so AppController can close it when switching modes
  window.addEventListener('close-settings', () => {
    settingsPanel?.classList.remove("open");
  });

  settingsBtn?.addEventListener("click", toggleSettings);

  window.addEventListener("keydown", (e) => {
    // Only toggle if UI is actually visible (not in hero mode)
    if (e.key.toLowerCase() === "p" && document.body.classList.contains('ui-ready')) {
      toggleSettings();
    }
  });

  brushSelect?.addEventListener("change", (e) => {
    sceneController.currentBrush = e.target.value;
  });

  if (gizmoCheckbox) {
    gizmoCheckbox.checked = sceneController.showGizmo;
    gizmoCheckbox.addEventListener("change", () => {
      sceneController.showGizmo = gizmoCheckbox.checked;
    });
  }
}