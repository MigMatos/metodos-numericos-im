import type { Expression } from "./expression"
import {
  MAX_ITERATIONS_DEFAULT,
  MESSAGES,
  relativePercent,
} from "./regla-falsa"
import type { MethodResult, SecanteIteration } from "./types"

export type SecanteInput = {
  function: Expression
  x0: number
  x1: number
  tolerance: number
  maxIterations?: number
}

export function secante({
  function: fn,
  x0,
  x1,
  tolerance,
  maxIterations = MAX_ITERATIONS_DEFAULT,
}: SecanteInput): MethodResult<SecanteIteration> {
  let previous = x0
  let current = x1
  const iterations: SecanteIteration[] = []
  let root = x1
  let finalError = Number.POSITIVE_INFINITY
  let finalErrorPercent: number | null = null
  let status: "converged" | "max-iterations" = "max-iterations"

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const fPrevious = fn.evaluate(previous)
    const fCurrent = fn.evaluate(current)

    if (!Number.isFinite(fPrevious) || !Number.isFinite(fCurrent)) {
      return { ok: false, message: MESSAGES.invalidDomain }
    }

    const denominator = fCurrent - fPrevious

    if (denominator === 0) {
      return { ok: false, message: MESSAGES.zeroSecantDenominator }
    }

    const next = current - (fCurrent * (current - previous)) / denominator

    if (!Number.isFinite(next)) {
      return { ok: false, message: MESSAGES.invalidDomain }
    }

    const error = Math.abs(next - current)
    const errorPercent = relativePercent(current, next)

    iterations.push({
      iteration,
      previous,
      current,
      fPrevious,
      fCurrent,
      next,
      error,
      errorPercent,
    })

    root = next
    finalError = error
    finalErrorPercent = errorPercent

    if (error <= tolerance) {
      status = "converged"
      break
    }

    previous = current
    current = next
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
