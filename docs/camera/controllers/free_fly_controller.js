export class FreeFlyController {
  update(camera, dt, inputData, rotDelta) {
    const { move, roll, level } = inputData;

    const isMoving = camera._hasMovement(move);
    const isRotating = camera._hasRotation(rotDelta, roll);

    if (isMoving || isRotating) {
      camera.isReturning = false;
    }

    if (camera.isReturning) {
      camera._updateReturn(dt);
    }

    if (level && !camera.isReturning && !isRotating) {
      camera._updateLevel(dt);
    }

    if (!camera.isReturning) {
      camera._updateMovement(dt, move);
      camera._updateRotation(dt, rotDelta, roll);
    }
  }
}
