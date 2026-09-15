import type { ChartOverlay } from "@/components/charts/chart-overlays"
import type {
  AnyIteration,
  MethodId,
  NewtonIteration,
  PuntoFijoIteration,
  ReglaFalsaIteration,
  SecanteIteration,
} from "@/lib/numerical/types"

export function overlayFor(
  methodId: MethodId,
  iteration: AnyIteration | undefined
): ChartOverlay | null {
  if (!iteration) {
    return null
  }

  switch (methodId) {
    case "regla-falsa":
      return {
        kind: "regla-falsa",
        iteration: iteration as ReglaFalsaIteration,
      }
    case "newton-raphson":
      return { kind: "newton-raphson", iteration: iteration as NewtonIteration }
    case "secante":
      return { kind: "secante", iteration: iteration as SecanteIteration }
    case "punto-fijo":
      return { kind: "punto-fijo", iteration: iteration as PuntoFijoIteration }
  }
}
