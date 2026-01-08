import { vec3, quat } from "https://esm.sh/gl-matrix";
import { CameraLerp } from "../camera/drivers/camera_lerp.js";
import { lookAtQuat } from "../camera/camera.js";

/* --------------------------------
   Helper: Stop any active camera driver on user interaction
-------------------------------- */
function setupStopCamera(camera) {
  const stopCamera = () => {
    if (camera.driver instanceof CameraLerp) {
      camera.driver = null;
      camera.controller?.setPositionAndOrientation?.(camera.position, camera.orientation);
    }
    window.removeEventListener("pointerdown", stopCamera);
  };
  window.addEventListener("pointerdown", stopCamera);
}

/* --------------------------------
   Resolve initial scene & camera from URL
-------------------------------- */
export function resolveRouteFromURL(app, camera) {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get("scene");
  const mode  = params.get("mode");

  /* ------------------------------
     Geometry scenes
  ------------------------------ */
  const geometryScenes = [
    "geometry-manifolds",
    "geometry-union",
    "geometry-difference",
    "geometry-intersection"
  ];
  const isGeometryScene = geometryScenes.includes(scene);

  if (scene === "geometry-manifolds") {
    app.setMode("geometry", "manifolds");
    document.body.classList.add("geometry-active");

    setTimeout(() => document.body.classList.add("geometry-faded"), 3500);

    // Camera along the connector line
    const startPos = vec3.fromValues(0, 0.03, -30);
    const endPos   = vec3.fromValues(0, 0.03, 25);

    const startOrientation = quat.create();
    const endOrientation   = quat.create();

    lookAtQuat(startOrientation, startPos, vec3.fromValues(0, 0.03, endPos[2]), [0, 1, 0]);
    lookAtQuat(endOrientation, endPos, vec3.fromValues(0, 0.03, startPos[2]), [0, 1, 0]);

    camera.position = vec3.clone(startPos);
    camera.driver = new CameraLerp(
      { position: startPos, orientation: startOrientation },
      { position: endPos, orientation: endOrientation },
      10.0,
      {
        loop: true,
        onUpdate: (cam, t) => {
          const threshold = 0.98;

          if (t < threshold) {
            lookAtQuat(cam.orientation, cam.position, vec3.fromValues(0, 0.01, 25), [0,1,0]);
          } else {
            const turnT = (t - threshold) / (1 - threshold);
            quat.slerp(cam.orientation, startOrientation, endOrientation, turnT);
          }
        }
      }
    );

    setupStopCamera(camera);

  } else if (isGeometryScene) {
    const subMode = scene.split("-")[1];
    app.setMode("geometry", subMode);
    document.body.classList.add("geometry-active");
    setTimeout(() => document.body.classList.add("geometry-faded"), 3500);

    const target = vec3.fromValues(0, 0, 0);
    const pos = vec3.fromValues(15, 35, 0);

    camera.driver = new CameraLerp(
      { position: pos, orientation: quat.create() },
      { position: pos, orientation: quat.create() },
      10.0,
      {
        lookAtTarget: target,
        orbitSpeed: 0.1,
        tiltRange: [Math.PI * 0.35, Math.PI * 0.35],
        tiltSpeed: 0,
        loop: true
      }
    );

    setupStopCamera(camera);

  /* ------------------------------
     Hero mode
  ------------------------------ */
  } else if (mode === "hero") {
    app.setMode("hero");

    const target = vec3.fromValues(0, 0, 0);
    const startPos = vec3.fromValues(0, 5, 20);
    const endPos   = vec3.fromValues(0, 0, 5);

    camera.position = vec3.clone(startPos);
    lookAtQuat(camera.orientation, startPos, target, [0, 1, 0]);

    camera.driver = new CameraLerp(
      { position: startPos, orientation: quat.clone(camera.orientation) },
      { position: endPos, orientation: quat.clone(camera.orientation) },
      3.0,
      {
        lookAtTarget: target,
        loop: false,
        onComplete: (cam) => {
          camera.driver = null;
          camera.controller?.setPositionAndOrientation?.(cam.position, cam.orientation);
        }
      }
    );

  /* ------------------------------
     Physics scene
  ------------------------------ */
  } else if (scene === "physics") {
    app.setMode("physics");

    const target = vec3.fromValues(0, 0, 0);
    const startPos = vec3.fromValues(100, 60, 100);
    const endPos   = vec3.fromValues(30, 20, 30);

    camera.driver = new CameraLerp(
      { position: startPos, orientation: quat.create() },
      { position: endPos, orientation: quat.create() },
      7.0,
      {
        lookAtTarget: target,
        orbitSpeed: 0.05,
        tiltRange: [0, Math.PI],
        tiltSpeed: 0.15,
        loop: true
      }
    );

  /* ------------------------------
     Default fallback
  ------------------------------ */
  } else {
    app.setMode("app");
  }
}
