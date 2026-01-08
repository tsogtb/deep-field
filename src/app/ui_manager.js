export function setupUI(sceneController) {
  const settingsBtn = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const brushSelect = document.getElementById("ui-brush-select");
  const bloomCheck = document.getElementById("ui-bloom");
  const gizmoCheckbox = document.getElementById("ui-gizmo");
  const geometryOverlay = document.getElementById("geometry-overlay");

  const GEOMETRY_SCENES = {
    "geometry-manifolds": "geometryManifoldsDemo",
    "geometry-union": "geometryUnionDemo",
    "geometry-difference": "geometryDifferenceDemo",
    "geometry-intersection": "geometryIntersectionDemo",
  };

  function toggleSettings() {
    settingsPanel?.classList.toggle("open");
  }

  window.addEventListener('close-settings', () => {
    settingsPanel?.classList.remove("open");
  });

  settingsBtn?.addEventListener("click", toggleSettings);

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "p" && document.body.classList.contains('ui-ready')) {
      toggleSettings();
    }
  });

  brushSelect?.addEventListener("change", (e) => {
    sceneController.currentBrush = e.target.value;
  });

  if (geometryOverlay) {
    function updateGeometryUI() {
      const currentScene = sceneController.getCurrentScene()?.name;
      const isGeometry = Object.values(GEOMETRY_SCENES).includes(currentScene);

      // Show/hide overlay
      geometryOverlay.style.display = isGeometry ? "flex" : "none";

      // Highlight active button
      geometryOverlay.querySelectorAll("button[data-geom]").forEach(btn => {
        const sceneName = GEOMETRY_SCENES[btn.dataset.geom];
        btn.classList.toggle("active", sceneName === currentScene);
      });
    }

    // Click handler for geometry buttons
    geometryOverlay.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-geom]");
      if (!btn) return;

      const scene = btn.dataset.geom;

      const url = new URL(window.location.href);
      url.searchParams.set("scene", scene);
      url.searchParams.delete("mode"); // ensure geometry path
      history.pushState({}, "", url);

      // Trigger routing
      window.dispatchEvent(new Event("popstate"));

      // Immediately update highlight
      updateGeometryUI();
    });

    // Update overlay initially
    updateGeometryUI();

    // Update overlay whenever scene changes
    const originalOnSceneChanged = sceneController._onSceneChanged;
    sceneController._onSceneChanged = function(reason) {
      if (originalOnSceneChanged) originalOnSceneChanged.call(this, reason);
      updateGeometryUI();
    };
  }

  if (gizmoCheckbox) {
    gizmoCheckbox.checked = sceneController.showGizmo;
    gizmoCheckbox.addEventListener("change", () => {
      sceneController.showGizmo = gizmoCheckbox.checked;
    });
  }
}
