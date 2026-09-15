import { formatCompact, formatDecimal, formatPercent } from "./format"
import type { MethodColumn } from "./methods-config"
import type { MethodOutcome } from "./method-runner"
import type { AnyIteration, MethodId } from "./types"

export function approximationOf(methodId: MethodId, iteration: AnyIteration) {
  if (methodId === "regla-falsa") {
    return (iteration as { xr: number }).xr
  }

  if (methodId === "newton-raphson") {
    return (iteration as { xnNext: number }).xnNext
  }

  if (methodId === "secante") {
    return (iteration as { next: number }).next
  }

  return (iteration as { gxn: number }).gxn
}

export function approximationsUpTo(
  methodId: MethodId,
  outcome: MethodOutcome,
  index: number
) {
  const seeds =
    methodId === "secante"
      ? [outcome.inputs.x0, outcome.inputs.x1]
      : methodId === "regla-falsa"
        ? [outcome.inputs.a]
        : [outcome.inputs.x0]

  return [
    ...seeds,
    ...outcome.iterations
      .slice(0, index + 1)
      .map((iteration) => approximationOf(methodId, iteration)),
  ]
}

export function chartDomain(outcome: MethodOutcome): [number, number] {
  const { methodId, inputs, iterations, root } = {
    methodId: outcome.config.id,
    inputs: outcome.inputs,
    iterations: outcome.iterations,
    root: outcome.root,
  }

  const values = [
    inputs.a,
    inputs.b,
    inputs.x0,
    inputs.x1,
    root,
    ...iterations.map((iteration) => approximationOf(methodId, iteration)),
  ].filter((value) => Number.isFinite(value))

  if (values.length === 0) {
    return [-1, 1]
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || Math.max(Math.abs(max), 1)
  const margin = span * 0.45

  return [min - margin, max + margin]
}

export function cellText(
  iteration: AnyIteration,
  column: MethodColumn
): string {
  const value = (iteration as unknown as Record<string, number | null>)[
    column.key
  ]

  if (column.format === "percent") {
    return formatPercent(typeof value === "number" ? value : null)
  }

  if (column.format === "decimal") {
    return typeof value === "number" ? formatDecimal(value, 0) : "—"
  }

  return formatCompact(typeof value === "number" ? value : Number.NaN)
}
