import { niceTicks, type Scale } from "@/lib/plot"

import { CHART_COLORS } from "./chart-palette"

export const LABEL_FONT = "11px 'Geist Variable', sans-serif"

export type PlotArea = {
  left: number
  right: number
  top: number
  bottom: number
}

export function formatTick(value: number) {
  if (!Number.isFinite(value)) {
    return "—"
  }

  if (value === 0) {
    return "0"
  }

  const magnitude = Math.abs(value)

  if (magnitude >= 1e4 || magnitude < 1e-3) {
    return value.toExponential(1)
  }

  return String(Number(value.toFixed(4)))
}

export function drawGrid(
  context: CanvasRenderingContext2D,
  plot: PlotArea,
  xScale: Scale,
  yScale: Scale
) {
  context.save()
  context.strokeStyle = CHART_COLORS.grid
  context.lineWidth = 1
  context.beginPath()

  for (const tick of niceTicks(xScale.domain[0], xScale.domain[1], 8)) {
    const x = xScale.toPixel(tick)

    if (x < plot.left || x > plot.right) {
      continue
    }

    context.moveTo(x, plot.top)
    context.lineTo(x, plot.bottom)
  }

  for (const tick of niceTicks(yScale.domain[0], yScale.domain[1], 6)) {
    const y = yScale.toPixel(tick)

    if (y < plot.top || y > plot.bottom) {
      continue
    }

    context.moveTo(plot.left, y)
    context.lineTo(plot.right, y)
  }

  context.stroke()
  context.restore()
}

export function drawAxes(
  context: CanvasRenderingContext2D,
  plot: PlotArea,
  xScale: Scale,
  yScale: Scale
) {
  const zeroY = yScale.toPixel(0)
  const zeroX = xScale.toPixel(0)
  const axisY = zeroY >= plot.top && zeroY <= plot.bottom ? zeroY : plot.bottom
  const axisX = zeroX >= plot.left && zeroX <= plot.right ? zeroX : plot.left

  context.save()
  context.strokeStyle = CHART_COLORS.axis
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(plot.left, axisY)
  context.lineTo(plot.right, axisY)
  context.moveTo(axisX, plot.top)
  context.lineTo(axisX, plot.bottom)
  context.stroke()

  context.fillStyle = CHART_COLORS.text
  context.font = LABEL_FONT
  context.textAlign = "center"
  context.textBaseline = "top"

  for (const tick of niceTicks(xScale.domain[0], xScale.domain[1], 8)) {
    const x = xScale.toPixel(tick)

    if (x < plot.left || x > plot.right) {
      continue
    }

    context.fillText(formatTick(tick), x, Math.min(axisY, plot.bottom) + 6)
  }

  context.textAlign = "right"
  context.textBaseline = "middle"

  for (const tick of niceTicks(yScale.domain[0], yScale.domain[1], 6)) {
    const y = yScale.toPixel(tick)

    if (y < plot.top || y > plot.bottom) {
      continue
    }

    context.fillText(formatTick(tick), plot.left - 8, y)
  }

  context.restore()
}

export function drawCurve(
  context: CanvasRenderingContext2D,
  samples: { x: number; y: number }[],
  xScale: Scale,
  yScale: Scale
) {
  if (samples.length === 0) {
    return
  }

  const top = Math.min(yScale.range[0], yScale.range[1])
  const bottom = Math.max(yScale.range[0], yScale.range[1])
  const overflow = (bottom - top) * 0.5

  context.save()
  context.strokeStyle = CHART_COLORS.curve
  context.lineWidth = 2.2
  context.lineJoin = "round"
  context.lineCap = "round"
  context.beginPath()

  let started = false

  for (const sample of samples) {
    if (!Number.isFinite(sample.y)) {
      started = false
      continue
    }

    const x = xScale.toPixel(sample.x)
    const y = Math.min(
      Math.max(yScale.toPixel(sample.y), top - overflow),
      bottom + overflow
    )

    if (started) {
      context.lineTo(x, y)
    } else {
      context.moveTo(x, y)
      started = true
    }
  }

  context.stroke()
  context.restore()
}

export function drawSegment(
  context: CanvasRenderingContext2D,
  from: [number, number],
  to: [number, number],
  color: string,
  options: { width?: number; dash?: number[] } = {}
) {
  context.save()
  context.strokeStyle = color
  context.lineWidth = options.width ?? 1.8
  context.setLineDash(options.dash ?? [])
  context.beginPath()
  context.moveTo(from[0], from[1])
  context.lineTo(to[0], to[1])
  context.stroke()
  context.restore()
}

export function drawMarker(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label?: string
) {
  context.save()
  context.fillStyle = color
  context.strokeStyle = "rgba(6, 10, 20, 0.85)"
  context.lineWidth = 1.5
  context.beginPath()
  context.arc(x, y, 4, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  if (!label) {
    context.restore()
    return
  }

  context.font = LABEL_FONT
  const padding = 5
  const boxWidth = context.measureText(label).width + padding * 2
  const boxHeight = 18
  const pixelRatio = context.getTransform().a || 1
  const cssWidth = context.canvas.width / pixelRatio
  const flipX = x + 9 + boxWidth > cssWidth - 4
  const flipY = y - 9 - boxHeight < 4
  const boxX = flipX ? x - 9 - boxWidth : x + 9
  const boxY = flipY ? y + 9 : y - 9 - boxHeight

  context.fillStyle = "rgba(6, 10, 20, 0.8)"
  context.fillRect(boxX, boxY, boxWidth, boxHeight)
  context.fillStyle = CHART_COLORS.text
  context.textAlign = "left"
  context.textBaseline = "middle"
  context.fillText(label, boxX + padding, boxY + boxHeight / 2 + 0.5)
  context.restore()
}
