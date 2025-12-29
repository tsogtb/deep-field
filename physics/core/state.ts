export interface BaseState {
  t: number;
}

export interface ParticleState extends BaseState {
  count: number;      

  position: Float32Array; 

  velocity: Float32Array;

  acceleration: Float32Array;

  mass?: Float32Array;   
  charge?: Float32Array;
}