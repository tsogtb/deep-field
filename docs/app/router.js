// src/app/router.js
import { vec3, quat } from "https://esm.sh/gl-matrix";
import { CameraLerp } from "../camera/drivers/camera_lerp.js";
import { lookAtQuat } from "../camera/camera.js";


export function resolveRouteFromURL(app, camera) {
  const params = new URLSearchParams(window.location.search);

  if (params.get("mode") === "hero") {
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

  } else if (params.get("scene") === "geometry-union") {
    app.setMode("geometry", "union");

  } else if (params.get("scene") === "geometry-difference") {
    app.setMode("geometry", "difference");

  } else if (params.get("scene") === "geometry-intersection") {
    app.setMode("geometry", "intersection");

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
