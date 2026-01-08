// src/app/router.js
import { vec3, quat } from "https://esm.sh/gl-matrix";
import { CameraLerp } from "/deep-field/camera/drivers/camera_lerp.js";
import { lookAtQuat } from "/deep-field/camera/camera.js";



export function resolveRouteFromURL(app, camera) {
  const params = new URLSearchParams(window.location.search);

  // Grouping geometry scenes to share the same camera behavior
  const isGeometryScene = [
    "geometry-manifolds", 
    "geometry-union", 
    "geometry-difference", 
    "geometry-intersection"
  ].includes(params.get("scene"));

  if (params.get("scene") === "geometry-manifolds") {
    app.setMode("geometry", "manifolds");
  
    // Camera path along the connector line (slightly above Y to avoid the beam)
    const startPos = vec3.fromValues(0, 0.03, -30); // bottom tip, y offset
    const endPos   = vec3.fromValues(0, 0.03, 25);  // top tip, y offset
  
    // Orientation: always look forward along the path
    const startOrientation = quat.create();
    const endOrientation = quat.create();
  
    // Look slightly ahead along the line (also offset Y)
    lookAtQuat(startOrientation, startPos, vec3.fromValues(0, 0.03, endPos[2]), [0, 1, 0]);
    lookAtQuat(endOrientation, endPos, vec3.fromValues(0, 0.03, startPos[2]), [0, 1, 0]);
  
    camera.position = vec3.clone(startPos);
    camera.driver = new CameraLerp(
      { position: startPos, orientation: startOrientation },
      { position: endPos, orientation: endOrientation },
      6.0, // total duration
      {
        loop: true, // ping-pong along the connector
        onUpdate: (cam, t) => {
          const threshold = 0.98; // 98% of path before turning
  
          if (t < threshold) {
            // Look forward along the connector (keep Y offset)
            lookAtQuat(cam.orientation, cam.position, vec3.fromValues(0, 0.01, 25), [0,1,0]);
          } else {
            // At the end: smoothly rotate to look back down
            const turnT = (t - threshold) / (1 - threshold); // remap 98→100% to 0→1
            quat.slerp(cam.orientation, startOrientation, endOrientation, turnT);
          }
        }
      }
    );
  
    // Stop lerp on user interaction
    const stopCamera = () => {
      if (camera.driver instanceof CameraLerp) {
        camera.driver = null;
        camera.controller?.setPositionAndOrientation?.(camera.position, camera.orientation);
      }
      window.removeEventListener("pointerdown", stopCamera);
    };
    window.addEventListener("pointerdown", stopCamera);
  }
  
   else if (isGeometryScene) {
    const subMode = params.get("scene").split("-")[1];
    app.setMode("geometry", subMode);

    const target = vec3.fromValues(0, 0, 0);
    // Position the camera to see both the shells at -10 and union at 10
    const startPos = vec3.fromValues(15, 35, 0); 
    const endPos   = vec3.fromValues(15, 35, 0);

    camera.driver = new CameraLerp(
      { position: startPos, orientation: quat.create() },
      { position: endPos, orientation: quat.create() },
      10.0, // Duration of one cycle
      {
        lookAtTarget: target,
        orbitSpeed: 0.1,    // Slow rotation
        tiltRange: [Math.PI * 0.35, Math.PI * 0.35],  // Locks vertical tilt (removes up/down)
        tiltSpeed: 0,       // Disables vertical movement
        loop: true
      }
    );

    // Stop the driver on user click
    const stopCamera = () => {
      if (camera.driver instanceof CameraLerp) {
        camera.driver = null;
        // Sync the manual controller so the transition is seamless
        camera.controller?.setPositionAndOrientation?.(camera.position, camera.orientation);
      }
      window.removeEventListener("pointerdown", stopCamera);
    };

    window.addEventListener("pointerdown", stopCamera);
  }

  else if (params.get("mode") === "hero") {
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
  /*
  } else if (params.get("scene") === "geometry-shells") {
    app.setMode("geometry", "shells");   

  } else if (params.get("scene") === "geometry-union") {
    app.setMode("geometry", "union");

  } else if (params.get("scene") === "geometry-difference") {
    app.setMode("geometry", "difference");

  } else if (params.get("scene") === "geometry-intersection") {
    app.setMode("geometry", "intersection");
  */  
  } else if (params.get("scene") === "physics") {
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

  } else {
    app.setMode("app");
  }
}
