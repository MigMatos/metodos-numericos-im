export type MethodId =
  "regla-falsa" | "newton-raphson" | "secante" | "punto-fijo"

export type MethodStatus = "converged" | "max-iterations" | "diverged"

export type IterationBase = {
  iteration: number
  error: number
  errorPercent: number | null
}

export type ReglaFalsaIteration = IterationBase & {
  a: number
  b: number
  fa: number
  fb: number
  xr: number
  fxr: number
}

export type NewtonIteration = IterationBase & {
  xn: number
  fxn: number
  dfxn: number
  xnNext: number
}

export type SecanteIteration = IterationBase & {
  previous: number
  current: number
  fPrevious: number
  fCurrent: number
  next: number
}

export type PuntoFijoIteration = IterationBase & {
  xn: number
  gxn: number
  xnNext: number
}

export type AnyIteration =
  ReglaFalsaIteration | NewtonIteration | SecanteIteration | PuntoFijoIteration

export type MethodSuccess<TIteration extends IterationBase> = {
  ok: true
  iterations: TIteration[]
  root: number
  functionValueAtRoot: number
  finalError: number
  finalErrorPercent: number | null
  tolerance: number
  status: MethodStatus
  message: string
}

export type MethodFailure = {
  ok: false
  message: string
}

export type MethodResult<TIteration extends IterationBase> =
  MethodSuccess<TIteration> | MethodFailure
