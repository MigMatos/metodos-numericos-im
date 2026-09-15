import { compileExpression, type Expression } from "./expression"
import { getMethodConfig, type MethodConfig } from "./methods-config"
import { newtonRaphson } from "./newton-raphson"
import { puntoFijo } from "./punto-fijo"
import { MAX_ITERATIONS_DEFAULT, reglaFalsa } from "./regla-falsa"
import { secante } from "./secante"
import type {
  AnyIteration,
  MethodId,
  MethodStatus,
  MethodSuccess,
  IterationBase,
} from "./types"

export type ParsedInputs = {
  functionExpression: Expression
  derivativeExpression: Expression | null
  a: number
  b: number
  x0: number
  x1: number
  tolerance: number
  maxIterations: number
}

export type MethodOutcome = {
  config: MethodConfig
  inputs: ParsedInputs
  iterations: AnyIteration[]
  root: number
  functionValueAtRoot: number
  finalError: number
  finalErrorPercent: number | null
  tolerance: number
  status: MethodStatus
  message: string
}

export type RunOutcome =
  { ok: true; outcome: MethodOutcome } | { ok: false; message: string }

export function runMethod(
  methodId: MethodId,
  values: Record<string, string>
): RunOutcome {
  const config = getMethodConfig(methodId)

  const compiledFunction = compileExpression(values.function ?? "")
  if (!compiledFunction.ok) {
    return { ok: false, message: compiledFunction.message }
  }

  let derivativeExpression: Expression | null = null

  if (config.inputs.some((input) => input.key === "derivative")) {
    const compiledDerivative = compileExpression(values.derivative ?? "")
    if (!compiledDerivative.ok) {
      return { ok: false, message: compiledDerivative.message }
    }
    derivativeExpression = compiledDerivative.expression
  }

  const numbers = readNumbers(config, values)
  if (!numbers.ok) {
    return { ok: false, message: numbers.message }
  }

  const tolerance = numbers.numbers.tolerance ?? 0.0001
  if (tolerance <= 0) {
    return { ok: false, message: "La tolerancia debe ser mayor que cero." }
  }

  const maxIterations = numbers.numbers.maxIterations ?? MAX_ITERATIONS_DEFAULT
  if (maxIterations < 1) {
    return {
      ok: false,
      message: "El máximo de iteraciones debe ser al menos 1.",
    }
  }

  const inputs: ParsedInputs = {
    functionExpression: compiledFunction.expression,
    derivativeExpression,
    a: numbers.numbers.a ?? 0,
    b: numbers.numbers.b ?? 0,
    x0: numbers.numbers.x0 ?? 0,
    x1: numbers.numbers.x1 ?? 0,
    tolerance,
    maxIterations,
  }

  const base = {
    function: compiledFunction.expression,
    tolerance,
    maxIterations,
  }

  if (methodId === "regla-falsa") {
    const result = reglaFalsa({ ...base, a: inputs.a, b: inputs.b })
    return finish(config, inputs, result)
  }

  if (methodId === "newton-raphson") {
    if (!derivativeExpression) {
      return { ok: false, message: "Escribe la derivada f'(x)." }
    }

    const result = newtonRaphson({
      ...base,
      derivative: derivativeExpression,
      x0: inputs.x0,
    })
    return finish(config, inputs, result)
  }

  if (methodId === "secante") {
    const result = secante({ ...base, x0: inputs.x0, x1: inputs.x1 })
    return finish(config, inputs, result)
  }

  const result = puntoFijo({ ...base, x0: inputs.x0 })
  return finish(config, inputs, result)
}

function readNumbers(config: MethodConfig, values: Record<string, string>) {
  const numbers: Record<string, number> = {}

  for (const input of config.inputs) {
    if (input.kind !== "number") {
      continue
    }

    const raw = (values[input.key] ?? "").trim()

    if (raw === "") {
      return {
        ok: false as const,
        message: `El campo ${input.label} no puede quedar vacío.`,
      }
    }

    const parsed = Number(raw)

    if (!Number.isFinite(parsed)) {
      return {
        ok: false as const,
        message: `El campo ${input.label} debe ser un número válido.`,
      }
    }

    numbers[input.key] = parsed
  }

  return { ok: true as const, numbers }
}

function finish(
  config: MethodConfig,
  inputs: ParsedInputs,
  result:
    | ({ ok: true } & MethodSuccess<IterationBase>)
    | { ok: false; message: string }
): RunOutcome {
  if (!result.ok) {
    return { ok: false, message: result.message }
  }

  return {
    ok: true,
    outcome: {
      config,
      inputs,
      iterations: result.iterations as AnyIteration[],
      root: result.root,
      functionValueAtRoot: result.functionValueAtRoot,
      finalError: result.finalError,
      finalErrorPercent: result.finalErrorPercent,
      tolerance: result.tolerance,
      status: result.status,
      message: result.message,
    },
  }
}
