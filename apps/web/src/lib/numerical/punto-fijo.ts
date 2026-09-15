import type { Expression } from "./expression"
import {
  MAX_ITERATIONS_DEFAULT,
  MESSAGES,
  relativePercent,
} from "./regla-falsa"
import type { MethodResult, MethodStatus, PuntoFijoIteration } from "./types"

export type PuntoFijoInput = {
  function: Expression
  x0: number
  tolerance: number
  maxIterations?: number
}

const DIVERGENCE_LIMIT = 1e12
const ERROR_INCREASE_STREAK = 10

export function puntoFijo({
  function: g,
  x0,
  tolerance,
  maxIterations = MAX_ITERATIONS_DEFAULT,
}: PuntoFijoInput): MethodResult<PuntoFijoIteration> {
  let xn = x0
  let previousError = Number.POSITIVE_INFINITY
  let increaseStreak = 0
  const iterations: PuntoFijoIteration[] = []
  let root = x0
  let finalError = Number.POSITIVE_INFINITY
  let finalErrorPercent: number | null = null
  let status: MethodStatus = "max-iterations"
  let message: string = MESSAGES.maxIterations

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const gxn = g.evaluate(xn)

    if (!Number.isFinite(gxn)) {
      return { ok: false, message: MESSAGES.invalidDomain }
    }

    const error = Math.abs(gxn - xn)
    const errorPercent = relativePercent(xn, gxn)

    iterations.push({
      iteration,
      xn,
      gxn,
      xnNext: gxn,
      error,
      errorPercent,
    })

    root = gxn
    finalError = error
    finalErrorPercent = errorPercent

    if (error <= tolerance) {
      status = "converged"
      message = ""
      break
    }

    if (Math.abs(gxn) > DIVERGENCE_LIMIT) {
      status = "diverged"
      message = MESSAGES.notConverging
      break
    }

    increaseStreak = error > previousError ? increaseStreak + 1 : 0

    if (increaseStreak >= ERROR_INCREASE_STREAK) {
      status = "diverged"
      message = MESSAGES.notConverging
      break
    }

    previousError = error
    xn = gxn
  }

  return {
    ok: true,
    iterations,
    root,
    functionValueAtRoot: g.evaluate(root),
    finalError,
    finalErrorPercent,
    tolerance,
    status,
    message,
  }
}
