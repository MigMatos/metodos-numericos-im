import { formatCompact } from "@/lib/numerical/format"
import type {
  NewtonIteration,
  PuntoFijoIteration,
  ReglaFalsaIteration,
  SecanteIteration,
} from "@/lib/numerical/types"
import type { Scale } from "@/lib/plot"

import { CHART_COLORS } from "./chart-palette"
import { drawMarker, drawSegment } from "./chart-primitives"

export type ChartOverlay =
  | { kind: "regla-falsa"; iteration: ReglaFalsaIteration }
  | { kind: "newton-raphson"; iteration: NewtonIteration }
  | { kind: "secante"; iteration: SecanteIteration }
  | { kind: "punto-fijo"; iteration: PuntoFijoIteration }

export function overlayValue(overlay: ChartOverlay) {
  switch (overlay.kind) {
    case "regla-falsa":
      return overlay.iteration.xr
    case "newton-raphson":
      return overlay.iteration.xn
    case "secante":
      return overlay.iteration.next
    case "punto-fijo":
      return overlay.iteration.gxn
  }
}

export function drawOverlay(
  context: CanvasRenderingContext2D,
  options: {
    overlay: ChartOverlay
    xScale: Scale
    yScale: Scale
    approximations: number[]
  }
) {
  const { overlay, xScale, yScale, approximations } = options

  for (const value of approximations) {
    context.fillStyle = CHART_COLORS.faded
    context.beginPath()
    context.arc(xScale.toPixel(value), yScale.toPixel(0), 2.4, 0, Math.PI * 2)
    context.fill()
  }

  if (overlay.kind === "regla-falsa") {
    drawReglaFalsa(context, overlay.iteration, xScale, yScale)
    return
  }

  if (overlay.kind === "newton-raphson") {
    drawNewton(context, overlay.iteration, xScale, yScale)
    return
  }

  if (overlay.kind === "secante") {
    drawSecante(context, overlay.iteration, xScale, yScale)
    return
  }

  drawPuntoFijo(context, overlay.iteration, approximations, xScale, yScale)
}

function drawReglaFalsa(
  context: CanvasRenderingContext2D,
  row: ReglaFalsaIteration,
  xScale: Scale,
  yScale: Scale
) {
  drawSegment(
    context,
    [xScale.toPixel(row.a), yScale.toPixel(row.fa)],
    [xScale.toPixel(row.b), yScale.toPixel(row.fb)],
    CHART_COLORS.secondary
  )
  drawSegment(
    context,
    [xScale.toPixel(row.a), yScale.toPixel(row.fa)],
    [xScale.toPixel(row.a), yScale.toPixel(0)],
    CHART_COLORS.faded,
    { width: 1, dash: [3, 3] }
  )
  drawSegment(
    context,
    [xScale.toPixel(row.b), yScale.toPixel(row.fb)],
    [xScale.toPixel(row.b), yScale.toPixel(0)],
    CHART_COLORS.faded,
    { width: 1, dash: [3, 3] }
  )
  drawMarker(
    context,
    xScale.toPixel(row.a),
    yScale.toPixel(row.fa),
    CHART_COLORS.marker,
    `a = ${formatCompact(row.a, 4)}`
  )
  drawMarker(
    context,
    xScale.toPixel(row.b),
    yScale.toPixel(row.fb),
    CHART_COLORS.marker,
    `b = ${formatCompact(row.b, 4)}`
  )
  drawMarker(
    context,
    xScale.toPixel(row.xr),
    yScale.toPixel(row.fxr),
    CHART_COLORS.curve,
    `xr = ${formatCompact(row.xr, 6)}`
  )
  drawMarker(
    context,
    xScale.toPixel(row.xr),
    yScale.toPixel(0),
    CHART_COLORS.accent
  )
}

function drawNewton(
  context: CanvasRenderingContext2D,
  row: NewtonIteration,
  xScale: Scale,
  yScale: Scale
) {
  const [domainStart, domainEnd] = xScale.domain
  const leftY = row.fxn + row.dfxn * (domainStart - row.xn)
  const rightY = row.fxn + row.dfxn * (domainEnd - row.xn)

  drawSegment(
    context,
    [xScale.toPixel(domainStart), yScale.toPixel(leftY)],
    [xScale.toPixel(domainEnd), yScale.toPixel(rightY)],
    CHART_COLORS.secondary
  )
  drawSegment(
    context,
    [xScale.toPixel(row.xn), yScale.toPixel(row.fxn)],
    [xScale.toPixel(row.xn), yScale.toPixel(0)],
    CHART_COLORS.faded,
    { width: 1, dash: [3, 3] }
  )
  drawMarker(
    context,
    xScale.toPixel(row.xn),
    yScale.toPixel(row.fxn),
    CHART_COLORS.marker,
    `xn = ${formatCompact(row.xn, 6)}`
  )
  drawMarker(
    context,
    xScale.toPixel(row.xnNext),
    yScale.toPixel(0),
    CHART_COLORS.accent,
    `xn+1 = ${formatCompact(row.xnNext, 6)}`
  )
}

function drawSecante(
  context: CanvasRenderingContext2D,
  row: SecanteIteration,
  xScale: Scale,
  yScale: Scale
) {
  const [domainStart, domainEnd] = xScale.domain
  const slope = (row.fCurrent - row.fPrevious) / (row.current - row.previous)
  const leftY = row.fPrevious + slope * (domainStart - row.previous)
  const rightY = row.fPrevious + slope * (domainEnd - row.previous)

  drawSegment(
    context,
    [xScale.toPixel(domainStart), yScale.toPixel(leftY)],
    [xScale.toPixel(domainEnd), yScale.toPixel(rightY)],
    CHART_COLORS.secondary
  )
  drawMarker(
    context,
    xScale.toPixel(row.previous),
    yScale.toPixel(row.fPrevious),
    CHART_COLORS.marker,
    `xn-1 = ${formatCompact(row.previous, 4)}`
  )
  drawMarker(
    context,
    xScale.toPixel(row.current),
    yScale.toPixel(row.fCurrent),
    CHART_COLORS.marker,
    `xn = ${formatCompact(row.current, 4)}`
  )
  drawMarker(
    context,
    xScale.toPixel(row.next),
    yScale.toPixel(0),
    CHART_COLORS.accent,
    `xn+1 = ${formatCompact(row.next, 6)}`
  )
}

function drawPuntoFijo(
  context: CanvasRenderingContext2D,
  row: PuntoFijoIteration,
  approximations: number[],
  xScale: Scale,
  yScale: Scale
) {
  const [domainStart, domainEnd] = xScale.domain

  drawSegment(
    context,
    [xScale.toPixel(domainStart), yScale.toPixel(domainStart)],
    [xScale.toPixel(domainEnd), yScale.toPixel(domainEnd)],
    CHART_COLORS.faded
  )

  for (let index = 1; index < approximations.length; index += 1) {
    const from = approximations[index - 1] as number
    const to = approximations[index] as number

    drawSegment(
      context,
      [xScale.toPixel(from), yScale.toPixel(from)],
      [xScale.toPixel(from), yScale.toPixel(to)],
      CHART_COLORS.secondary,
      { width: 1, dash: [4, 3] }
    )
    drawSegment(
      context,
      [xScale.toPixel(from), yScale.toPixel(to)],
      [xScale.toPixel(to), yScale.toPixel(to)],
      CHART_COLORS.secondary,
      { width: 1, dash: [4, 3] }
    )
  }

  drawMarker(
    context,
    xScale.toPixel(row.xn),
    yScale.toPixel(row.gxn),
    CHART_COLORS.marker,
    `g(xn) = ${formatCompact(row.gxn, 6)}`
  )
  drawMarker(
    context,
    xScale.toPixel(row.gxn),
    yScale.toPixel(row.gxn),
    CHART_COLORS.accent
  )
}
