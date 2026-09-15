import type { Expression } from "./expression"
import {
  MAX_ITERATIONS_DEFAULT,
  MESSAGES,
  relativePercent,
} from "./regla-falsa"
import type { MethodResult, NewtonIteration } from "./types"

export type NewtonRaphsonInput = {
  function: Expression
  derivative: Expression
  x0: number
  tolerance: number
  maxIterations?: number
}

export function newtonRaphson({
  function: fn,
  derivative,
  x0,
  tolerance,
  maxIterations = MAX_ITERATIONS_DEFAULT,
}: NewtonRaphsonInput): MethodResult<NewtonIteration> {
  let xn = x0
  const iterations: NewtonIteration[] = []
  let root = x0
  let finalError = Number.POSITIVE_INFINITY
  let finalErrorPercent: number | null = null
  let status: "converged" | "max-iterations" = "max-iterations"

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const fxn = fn.evaluate(xn)
    const dfxn = derivative.evaluate(xn)

    if (!Number.isFinite(fxn) || !Number.isFinite(dfxn)) {
      return { ok: false, message: MESSAGES.invalidDomain }
    }

    if (dfxn === 0) {
      return { ok: false, message: MESSAGES.zeroDerivative }
    }

    const xnNext = xn - fxn / dfxn

    if (!Number.isFinite(xnNext)) {
      return { ok: false, message: MESSAGES.invalidDomain }
    }

    const error = Math.abs(xnNext - xn)
    const errorPercent = relativePercent(xn, xnNext)

    iterations.push({
      iteration,
      xn,
      fxn,
      dfxn,
      xnNext,
      error,
      errorPercent,
    })

    root = xnNext
    finalError = error
    finalErrorPercent = errorPercent

    if (error <= tolerance) {
      status = "converged"
      break
    }

    xn = xnNext
  }

  return {
    ok: true,
    iterations,
    root,
    functionValueAtRoot: fn.evaluate(root),
    finalError,
    finalErrorPercent,
    tolerance,
    status,
    message: status === "converged" ? "" : MESSAGES.maxIterations,
  }
}
