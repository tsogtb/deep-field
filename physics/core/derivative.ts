export type Derivative<S> = (state: S, t: number) => Partial<S>
//“A derivative of S is a function that takes S and time, and returns part of S.”

/**
 * Derivative<ParticleState> → { acceleration }
Derivative<WaveState>     → { phase }
 */