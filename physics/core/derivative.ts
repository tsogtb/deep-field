/**
 * Derivative<S>
 * Defines the mathematical "slope" of a system's state at a given moment.
 * * * Logic: In physics, the derivative of position is velocity, and the 
 * derivative of velocity is acceleration. This type allows the Integrator 
 * to ask the System: "If I am at this state and time, how fast is 
 * everything changing?"
 */
export type Derivative<S> = (state: S, t: number) => Partial<S>;