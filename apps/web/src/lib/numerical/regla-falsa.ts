import type { Expression } from "./expression"
import type { MethodResult, ReglaFalsaIteration } from "./types"

export const MAX_ITERATIONS_DEFAULT = 50

export const MESSAGES = {
  signInterval:
    "El intervalo seleccionado no presenta cambio de signo. Selecciona un intervalo adecuado.",
  zeroDerivative:
    "La derivada es cero en la aproximación actual. No es posible continuar con Newton-Raphson.",
  zeroSecantDenominator:
    "No es posible calcular la siguiente aproximación porque el denominador de la secante es cero.",
  notConverging:
    "El método no está convergiendo bajo las condiciones actuales.",
  invalidDomain:
    "La función no está definida en los valores ingresados. Verifica el dominio.",
  maxIterations:
    "Se alcanzó el máximo de iteraciones sin cumplir la tolerancia.",
} as const

export function relativePercent(previous: number, next: number) {
  if (next === 0) {
    return null
  }

  return Math.abs((next - previous) / next) * 100
}

export type ReglaFalsaInput = {
  function: Expression
  a: number
  b: number
  tolerance: number
  maxIterations?: number
}

export function reglaFalsa({
  function: fn,
  a,
  b,
  tolerance,
  maxIterations = MAX_ITERATIONS_DEFAULT,
}: ReglaFalsaInput): MethodResult<ReglaFalsaIteration> {
  let left = a
  let right = b
  let fa = fn.evaluate(left)
  let fb = fn.evaluate(right)

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return { ok: false, message: MESSAGES.invalidDomain }
  }

  if (fa * fb > 0) {
    return { ok: false, message: MESSAGES.signInterval }
  }

  const iterations: ReglaFalsaIteration[] = []
  let previousXr = left
  let root = left
  let finalError = Number.POSITIVE_INFINITY
  let finalErrorPercent: number | null = null
  let status: "converged" | "max-iterations" = "max-iterations"

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const xr = right - (fb * (right - left)) / (fb - fa)
    const fxr = fn.evaluate(xr)
    const error = Math.abs(xr - previousXr)
    const errorPercent = relativePercent(previousXr, xr)

    iterations.push({
      iteration,
      a: left,
      b: right,
      fa,
      fb,
      xr,
      fxr,
      error,
      errorPercent,
    })

    root = xr
    finalError = error
    finalErrorPercent = errorPercent

    if (!Number.isFinite(fxr) || !Number.isFinite(xr)) {
      return { ok: false, message: MESSAGES.invalidDomain }
    }

    if (error <= tolerance) {
      status = "converged"
      break
    }

    if (fa * fxr < 0) {
      right = xr
      fb = fxr
    } else {
      left = xr
      fa = fxr
    }

    previousXr = xr
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
