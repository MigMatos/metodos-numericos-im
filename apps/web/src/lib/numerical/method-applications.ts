import { formatCompact, formatPercent } from "./format"
import { approximationOf } from "./method-visuals"
import type { MethodOutcome } from "./method-runner"
import type {
  MethodId,
  NewtonIteration,
  PuntoFijoIteration,
  ReglaFalsaIteration,
  SecanteIteration,
} from "./types"

export type ApplicationKind = "balance" | "spring" | "calibration" | "feedback"

export type MethodApplication = {
  kind: ApplicationKind
  title: string
  instrument: string
  scenario: string
  quantity: string
  goal: string
  settledLabel: string
  pendingLabel: string
}

export const METHOD_APPLICATIONS: Record<MethodId, MethodApplication> = {
  "regla-falsa": {
    kind: "balance",
    title: "Equilibrio de una viga cargada",
    instrument: "Banco de equilibrio con fulcro",
    scenario:
      "En el taller se carga una viga apoyada sobre un fulcro: a la izquierda queda una carga fija y a la derecha se desliza un contrapeso. El sensor de nivel entrega la lectura de desbalance f(x). El contrapeso se coloca en la posición x y la viga queda nivelada cuando esa lectura vale cero.",
    quantity: "x = posición del contrapeso sobre la viga (m)",
    goal: "f(x) = 0 significa que la viga está perfectamente nivelada.",
    settledLabel: "NIVELADA",
    pendingLabel: "DESNIVELADA",
  },
  "newton-raphson": {
    kind: "spring",
    title: "Precarga de un resorte de suspensión",
    instrument: "Banco de ensayo con actuador y celda de carga",
    scenario:
      "El actuador comprime un resorte de suspensión hasta que la fuerza medida iguala la carga de diseño. La celda de carga entrega la diferencia f(x) y la rigidez local del montaje actúa como f'(x): cada corrección de la carrera se calcula dividiendo la desviación entre la rigidez, así que el ajuste llega muy rápido al punto exacto.",
    quantity: "x = carrera del actuador (mm)",
    goal: "f(x) = 0 significa que la fuerza del resorte iguala la carga de diseño.",
    settledLabel: "PRECARGA CORRECTA",
    pendingLabel: "FUERA DE PRECARGA",
  },
  secante: {
    kind: "calibration",
    title: "Calibración con dos lecturas del sensor",
    instrument: "Banco de calibración con dos soportes y regla",
    scenario:
      "Un sensor de nivel se calibra tomando dos lecturas en dos alturas conocidas del tanque. Con esos dos puntos se tiende una regla (la recta secante) y donde esa regla corta la lectura cero queda la altura de referencia real. Cada nueva lectura reemplaza a la más antigua y la regla se vuelve a tender.",
    quantity: "x = altura de referencia del tanque (m)",
    goal: "f(x) = 0 significa que la lectura del sensor se anula.",
    settledLabel: "CALIBRADO",
    pendingLabel: "SIN CALIBRAR",
  },
  "punto-fijo": {
    kind: "feedback",
    title: "Concentración en un lazo de recirculación",
    instrument: "Tanque mezclador con bomba de recirculación",
    scenario:
      "En un tanque mezclador la corriente de salida vuelve a entrar al proceso por la bomba: la concentración de salida se convierte en la concentración de entrada de la siguiente vuelta. El lazo se estabiliza cuando la concentración que sale es igual a la que regresa, es decir cuando x = g(x).",
    quantity: "x = concentración de salida (mol/L)",
    goal: "x = g(x) es la concentración estable del lazo.",
    settledLabel: "LAZO ESTABLE",
    pendingLabel: "LAZO INESTABLE",
  },
}

export function getApplication(methodId: MethodId) {
  return METHOD_APPLICATIONS[methodId]
}

export function describeApplication(outcome: MethodOutcome, index: number) {
  const application = getApplication(outcome.config.id)
  const iteration = outcome.iterations[index]

  if (!iteration) {
    return ""
  }

  const approximation = approximationOf(outcome.config.id, iteration)
  const isLast = index === outcome.iterations.length - 1
  const settled = outcome.status === "converged" && isLast
  const sentences = [
    `En el banco: ${application.quantity} pasa a ${formatCompact(approximation, 6)} en la iteración ${iteration.iteration}.`,
    describeReading(outcome, index),
  ]

  if (settled) {
    const errorPercent =
      outcome.finalErrorPercent !== null
        ? ` y ${formatPercent(outcome.finalErrorPercent)} de error relativo`
        : ""

    sentences.push(
      `${application.settledLabel}: ${application.goal.toLowerCase()} El valor final es ${formatCompact(outcome.root, 6)} con un error absoluto de ${formatCompact(outcome.finalError, 6)}${errorPercent}, dentro de la tolerancia ${formatCompact(outcome.tolerance, 6)}.`
    )
  } else if (isLast) {
    sentences.push(
      `${application.pendingLabel}: con los datos actuales la lectura final es f(x) = ${formatCompact(outcome.functionValueAtRoot, 6)} y el error ${formatCompact(outcome.finalError, 6)} sigue por encima de la tolerancia ${formatCompact(outcome.tolerance, 6)}. Conviene revisar los datos iniciales.`
    )
  } else {
    sentences.push(
      `El error de esta iteración (${formatCompact(iteration.error, 6)}) todavía supera la tolerancia ${formatCompact(outcome.tolerance, 6)}, así que el banco sigue en estado ${application.pendingLabel.toLowerCase()} y el ajuste continúa.`
    )
  }

  return sentences.join(" ")
}

function describeReading(outcome: MethodOutcome, index: number) {
  const iteration = outcome.iterations[index]

  switch (outcome.config.id) {
    case "regla-falsa": {
      const row = iteration as ReglaFalsaIteration
      return `Las lecturas en los extremos son f(a) = ${formatCompact(row.fa, 6)} y f(b) = ${formatCompact(row.fb, 6)}; la regla que une esos puntos corta el cero en xr = ${formatCompact(row.xr, 6)}.`
    }
    case "newton-raphson": {
      const row = iteration as NewtonIteration
      return `La desviación medida es f(xn) = ${formatCompact(row.fxn, 6)} y la rigidez local f'(xn) = ${formatCompact(row.dfxn, 6)}, así que la carrera se corrige a xn+1 = ${formatCompact(row.xnNext, 6)}.`
    }
    case "secante": {
      const row = iteration as SecanteIteration
      return `Las dos lecturas del banco son (${formatCompact(row.previous, 6)}, ${formatCompact(row.fPrevious, 6)}) y (${formatCompact(row.current, 6)}, ${formatCompact(row.fCurrent, 6)}); la regla tendida corta el cero en ${formatCompact(row.next, 6)}.`
    }
    case "punto-fijo": {
      const row = iteration as PuntoFijoIteration
      return `La concentración que sale del tanque (${formatCompact(row.xn, 6)}) vuelve a entrar por la bomba y regresa como ${formatCompact(row.gxn, 6)}.`
    }
  }
}
