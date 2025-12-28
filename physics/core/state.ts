import { Vec3 } from "../math/vec3"

export interface BaseState {
  t: number
}
export interface ParticleState extends BaseState {
  position: Vec3[]
  velocity: Vec3[]
  acceleration?: Vec3[]
  
  mass?: number[]
  charge?: number[]
}
