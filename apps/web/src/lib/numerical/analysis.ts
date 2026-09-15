import { formatCompact } from "./format"
import type {
  IterationBase,
  MethodId,
  MethodResult,
  MethodSuccess,
  NewtonIteration,
  PuntoFijoIteration,
  ReglaFalsaIteration,
  SecanteIteration,
} from "./types"

export type ErrorPoint = {
  iteration: number
  error: number
  errorPercent: number | null
}

export function errorSeries(iterations: IterationBase[]): ErrorPoint[] {
  return iterations.map(({ iteration, error, errorPercent }) => ({
    iteration,
    error,
    errorPercent,
  }))
}

export function firstError(iterations: IterationBase[]) {
  return iterations[0]?.error ?? 0
}

export function resultOf(result: MethodResult<IterationBase>) {
  return result.ok ? result : null
}

export type ConvergenceReport = Omit<MethodSuccess<IterationBase>, "ok">

export function describeConvergence(
  methodName: string,
  result: ConvergenceReport
): { state: string; explanation: string } {
  const { status, iterations, root, finalError, tolerance } = result
  const initialError = firstError(iterations)
  const iterationCount = iterations.length

  if (status === "converged") {
    const reduction =
      finalError > 0 && initialError > 0 ? initialError / finalError : null
    const reductionText =
      reduction !== null && Number.isFinite(reduction)
        ? ` El error se redujo aproximadamente ${reduction.toFixed(1)} veces respecto a la primera iteración.`
        : ""

    return {
      state: "CONVERGIÓ",
      explanation: `${methodName} cumplió la tolerancia ${formatCompact(tolerance)} en ${iterationCount} ${iterationCount === 1 ? "iteración" : "iteraciones"}. La raíz aproximada es ${formatCompact(root)} y el error final es ${formatCompact(finalError)}.${reductionText}`,
    }
  }

  if (status === "diverged") {
    return {
      state: "DIVERGIÓ",
      explanation: `${methodName} no está convergiendo bajo las condiciones actuales: el error final (${formatCompact(finalError)}) creció de forma sostenida y la aproximación se alejó de la raíz. Cambia el punto inicial o la función de iteración.`,
    }
  }

  return {
    state: "NO CONVERGIÓ",
    explanation: `${methodName} ejecutó ${iterationCount} iteraciones sin alcanzar la tolerancia ${formatCompact(tolerance)}. El error final fue ${formatCompact(finalError)}, así que la aproximación ${formatCompact(root)} no cumple el criterio de parada.`,
  }
}

export function describeIteration(
  method: MethodId,
  current: IterationBase,
  previous: IterationBase | null,
  totalIterations: number,
  tolerance: number,
  converged: boolean
): string {
  const sentences: string[] = []

  sentences.push(
    pickOpening(current.iteration, approximateLabel(method, current))
  )

  if (method === "regla-falsa") {
    const row = current as ReglaFalsaIteration
    sentences.push(
      `El intervalo vigente es [a = ${formatCompact(row.a)}, b = ${formatCompact(row.b)}] con f(a) = ${formatCompact(row.fa)} y f(b) = ${formatCompact(row.fb)}; la recta que une esos puntos corta el eje X en xr = ${formatCompact(row.xr)}.`
    )
  }

  if (method === "newton-raphson") {
    const row = current as NewtonIteration
    sentences.push(
      `La recta tangente en xn = ${formatCompact(row.xn)} tiene pendiente f'(xn) = ${formatCompact(row.dfxn)} y corta el eje X en xn+1 = ${formatCompact(row.xnNext)}.`
    )
  }

  if (method === "secante") {
    const row = current as SecanteIteration
    sentences.push(
      `La recta secante que pasa por (${formatCompact(row.previous)}, ${formatCompact(row.fPrevious)}) y (${formatCompact(row.current)}, ${formatCompact(row.fCurrent)}) corta el eje X en ${formatCompact(row.next)}.`
    )
  }

  if (method === "punto-fijo") {
    const row = current as PuntoFijoIteration
    sentences.push(
      `Al evaluar la función de iteración en xn = ${formatCompact(row.xn)} se obtuvo xn+1 = ${formatCompact(row.gxn)}, que se convierte en la nueva aproximación.`
    )
  }

  const error = formatCompact(current.error)
  const toleranceText = formatCompact(tolerance)

  if (!previous) {
    sentences.push(
      `Es la primera iteración, así que este error (${error}) se toma como referencia para comparar el avance del método.`
    )
  } else if (current.error < previous.error) {
    const reduction = previous.error === 0 ? 0 : current.error / previous.error
    const reductionText =
      reduction > 0 && reduction < 1
        ? ` y quedó en ${(reduction * 100).toFixed(2)} % del error anterior`
        : ""

    sentences.push(
      `El error bajó de ${formatCompact(previous.error)} a ${error}${reductionText}, por lo que el método continúa acercándose a la raíz.`
    )
  } else if (current.error > previous.error) {
    sentences.push(
      `El error subió de ${formatCompact(previous.error)} a ${error}: la aproximación se alejó de la raíz en este paso y conviene vigilar la convergencia.`
    )
  } else {
    sentences.push(
      `El error se mantuvo en ${error}; no hubo cambio entre esta iteración y la anterior.`
    )
  }

  if (converged) {
    sentences.push(
      `Como el error (${error}) ya es menor o igual que la tolerancia (${toleranceText}), el criterio de parada se cumple en la iteración ${current.iteration} de ${totalIterations}.`
    )
  } else if (current.iteration === totalIterations) {
    sentences.push(
      `El error (${error}) todavía es mayor que la tolerancia (${toleranceText}) y se alcanzó el máximo de iteraciones.`
    )
  } else {
    sentences.push(
      `El error (${error}) todavía es mayor que la tolerancia (${toleranceText}), así que el método pasa a la siguiente iteración.`
    )
  }

  return sentences.join(" ")
}

function approximateLabel(method: MethodId, current: IterationBase) {
  if (method === "regla-falsa") {
    return (current as ReglaFalsaIteration).xr
  }

  if (method === "newton-raphson") {
    return (current as NewtonIteration).xnNext
  }

  if (method === "secante") {
    return (current as SecanteIteration).next
  }

  return (current as PuntoFijoIteration).gxn
}

function pickOpening(iteration: number, approximate: number) {
  const value = formatCompact(approximate)
  const openings = [
    `En esta iteración se obtuvo una aproximación de ${value}.`,
    `La iteración ${iteration} produjo el valor ${value}.`,
    `Con los datos de esta iteración, el método generó la aproximación ${value}.`,
    `La aproximación calculada en este paso fue ${value}.`,
  ]

  return openings[iteration % openings.length] as string
}
