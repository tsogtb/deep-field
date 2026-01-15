import { simulationClock } from "./simulation_clock.js";

export function setupUI(sceneController) {
  const settingsBtn = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const brushSelect = document.getElementById("ui-brush-select");
  const bloomCheck = document.getElementById("ui-bloom");
  const gizmoCheckbox = document.getElementById("ui-gizmo");
  const geometryOverlay = document.getElementById("geometry-overlay");
  const biologyOverlay = document.getElementById("biology-overlay");

  const startBtn = document.getElementById("btn-start-sim");

  function updateGeometryUI() {
    const currentScene = sceneController.getCurrentScene()?.name;
    const isGeometry = Object.values(GEOMETRY_SCENES).includes(currentScene);
  
    if (isGeometry) {
      document.body.classList.add("geometry-active");
      document.body.classList.remove("biology-active"); // Clean up Biology
      
      geometryOverlay.querySelectorAll("button[data-geom]").forEach(btn => {
        const sceneName = GEOMETRY_SCENES[btn.dataset.geom];
        btn.classList.toggle("active", sceneName === currentScene);
      });
    } else {
      document.body.classList.remove("geometry-active");
    }
  }

  let activeSequence = "alt1"
  
  function updateBiologyUI() {
    const currentScene = sceneController.getCurrentScene()?.name;
    const isBiology = Object.values(BIOLOGY_SCENES).includes(currentScene);
    
    if (isBiology) {
      document.body.classList.add("biology-active");
      document.body.classList.remove("geometry-active");
  
      // FIX: Ensure the button is ALWAYS flex when biology is active
      if (startBtn) startBtn.style.display = "flex";
      
      // Update Mode button highlights
      biologyOverlay.querySelectorAll("button[data-bio]").forEach(btn => {
        const sceneName = BIOLOGY_SCENES[btn.dataset.bio];
        btn.classList.toggle("active", sceneName === currentScene);
      });

      // Update Sequence highlights
      biologyOverlay.querySelectorAll("button[data-bio-seq]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.bioSeq === activeSequence);
      });

      // Always sync the Play/Pause text with the current clock state
      updatePlayButton();
    } else {
      document.body.classList.remove("biology-active");
    }
  }
  
  function updatePlayButton() {
    if (!startBtn) return;
    
    const hint = `<span class="btn-hint">[SPACE]</span>`;
    
    // Wrap icons in a class for precise positioning
    const playIcon = `<span class="btn-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>`;
    const pauseIcon = `<span class="btn-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></span>`;
  
    if (simulationClock.running) {
      startBtn.innerHTML = `${pauseIcon} <span>PAUSE</span> ${hint}`;
      startBtn.classList.add("active");
    } else {
      startBtn.innerHTML = `${playIcon} <span>PLAY</span> ${hint}`;
      startBtn.classList.remove("active");
    }
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (simulationClock.running) {
        simulationClock.stop(); 
      } else {
        simulationClock.start();
        window.dispatchEvent(new CustomEvent("start-biology-dive"));
      }
  
      updatePlayButton();
    });
  
    updatePlayButton(); 
  }
  

  const GEOMETRY_SCENES = {
    "geometry-manifolds": "geometryManifoldsDemo",
    "geometry-union": "geometryUnionDemo",
    "geometry-difference": "geometryDifferenceDemo",
    "geometry-intersection": "geometryIntersectionDemo",
  };

  const BIOLOGY_SCENES = {
    "biology-secondary": "proteinFoldingDemo",
    "biology-tertiary": "proteinFoldingExperimentalDemo",
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

  }

  if (biologyOverlay) {
    biologyOverlay.addEventListener("click", (e) => {

      const seqBtn = e.target.closest("button[data-bio-seq]");
      if (seqBtn) {
        activeSequence = seqBtn.dataset.bioSeq;
        sceneController.getCurrentScene()?.updateSequence?.(activeSequence);
        updateBiologyUI();
        return;
      }

      const initBtn = e.target.closest("button[data-bio-init]");
      if (initBtn) {
        const mode = initBtn.dataset.bioInit;
        //if (scene?.name !== BIOLOGY_SCENES["biology-secondary"]) return;
        sceneController.getCurrentScene()?.reinitialize?.(mode, activeSequence);
        if (simulationClock.running) {
          simulationClock.stop(); 
          updatePlayButton();
        }
        return;
      }

      const sceneBtn = e.target.closest("button[data-bio]");
      if (!sceneBtn) return;
      simulationClock.stop();
  
      const scene = sceneBtn.dataset.bio;
  
      const url = new URL(window.location.href);
      url.searchParams.set("scene", scene);
      url.searchParams.delete("mode");
      history.pushState({}, "", url);
  
      // Trigger routing
      window.dispatchEvent(new Event("popstate"));
  
      updateBiologyUI();
    });
  
    updateBiologyUI();
  }

  const originalOnSceneChanged = sceneController._onSceneChanged;
  sceneController._onSceneChanged = function(reason) {
    if (originalOnSceneChanged) originalOnSceneChanged.call(this, reason);
    
    updateGeometryUI(); 
    updateBiologyUI();  
  };


  if (gizmoCheckbox) {
    gizmoCheckbox.checked = sceneController.showGizmo;
    gizmoCheckbox.addEventListener("change", () => {
      sceneController.showGizmo = gizmoCheckbox.checked;
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
  
      e.preventDefault();
  
      if (
        //document.body.classList.contains("ui-ready") &&
        startBtn
      ) {
        startBtn.click();
      }
    }
  });
  
}
