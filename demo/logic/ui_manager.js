export function setupUI(sceneController) {
  const settingsBtn = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const brushSelect = document.getElementById("ui-brush-select");
  const bloomCheck = document.getElementById("ui-bloom");

  settingsBtn.addEventListener("click", () => {
      const isOpen = settingsPanel.style.right === "0px";
      settingsPanel.style.right = isOpen ? "-300px" : "0px";
  });

  brushSelect.addEventListener("change", (e) => {
      sceneController.currentBrush = e.target.value;
  });

  bloomCheck.addEventListener("change", (e) => {
      console.log("Bloom toggled:", e.target.checked);
  });
  
  window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'p') settingsBtn.click();
  });
}