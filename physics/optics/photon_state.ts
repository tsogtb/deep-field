import { BaseState } from "../core/state.js";

export interface PhotonState extends BaseState {
  count: number;

  // Position buffers
  position: Float32Array;
  prevPosition: Float32Array;

  // Direction (normalized) & speed
  direction: Float32Array;
  speed?: number; // default c

  // Energy & wavelength
  energy: Float32Array;
  wavelength: Float32Array;

  // Polarization (2D Jones vector)
  polarization: Float32Array;

  alive: Uint8Array;

  // Optional: cache current medium index
  currentMedium?: Uint16Array;
}
