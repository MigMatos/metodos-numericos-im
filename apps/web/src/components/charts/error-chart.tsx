import { useAnimatedCanvas } from "@/hooks/use-animated-canvas"
import { formatCompact } from "@/lib/numerical/format"
import { createScale, niceTicks } from "@/lib/plot"

import { CHART_COLORS } from "./chart-palette"
import { drawMarker, drawSegment, formatTick } from "./chart-primitives"

type ErrorChartProps = {
  points: { iteration: number; error: number }[]
  selectedIteration?: number
  tolerance?: number
  className?: string
}

const PADDING = { left: 66, right: 20, top: 20, bottom: 36 }
const LOG_RATIO_THRESHOLD = 100
const MIN_LOG_VALUE = 1e-12

export function ErrorChart({
  points,
  selectedIteration,
  tolerance,
  className,
}: ErrorChartProps) {
  const canvasRef = useAnimatedCanvas(
    ({ context, width, height }) => {
      context.clearRect(0, 0, width, height)

      const errors = points
        .map((point) => point.error)
        .filter((error) => Number.isFinite(error) && error >= 0)
      const positive = errors.filter((error) => error > 0)
      const maxError = errors.length > 0 ? Math.max(...errors) : 1
      const minPositive = positive.length > 0 ? Math.min(...positive) : 0
      const useLogScale =
        positive.length > 1 &&
        minPositive > 0 &&
        maxError / minPositive >= LOG_RATIO_THRESHOLD

      const plot = {
        left: PADDING.left,
        right: Math.max(width - PADDING.right, PADDING.left + 10),
        top: PADDING.top,
        bottom: Math.max(height - PADDING.bottom, PADDING.top + 10),
      }

      const lastIteration = Math.max(points.length, 2)
      const xScale = createScale([1, lastIteration], [
        plot.left,
        plot.right,
      ] as const)

      const yScale = useLogScale
        ? createScale(
            [
              Math.floor(Math.log10(minPositive)) - 1,
              Math.ceil(Math.log10(maxError)),
            ],
            [plot.bottom, plot.top] as const
          )
        : createScale([0, maxError * 1.15 || 1], [
            plot.bottom,
            plot.top,
          ] as const)

      const toY = (error: number) =>
        useLogScale
          ? yScale.toPixel(Math.log10(Math.max(error, MIN_LOG_VALUE)))
          : yScale.toPixel(error)

      const iterationTicks = integerTicks(1, lastIteration)
      const yTicks = useLogScale
        ? exponentTicks(yScale.domain[0], yScale.domain[1])
        : niceTicks(0, maxError * 1.15 || 1, 5)

      context.strokeStyle = CHART_COLORS.grid
      context.lineWidth = 1
      context.beginPath()

      for (const tick of iterationTicks) {
        const x = xScale.toPixel(tick)
        context.moveTo(x, plot.top)
        context.lineTo(x, plot.bottom)
      }

      for (const tick of yTicks) {
        const y = useLogScale ? yScale.toPixel(tick) : yScale.toPixel(tick)
        context.moveTo(plot.left, y)
        context.lineTo(plot.right, y)
      }

      context.stroke()

      context.fillStyle = CHART_COLORS.text
      context.font = "11px 'Geist Variable', sans-serif"

      for (const tick of iterationTicks) {
        context.textAlign = "center"
        context.textBaseline = "top"
        context.fillText(String(tick), xScale.toPixel(tick), plot.bottom + 6)
      }

      context.textAlign = "right"
      context.textBaseline = "middle"

      for (const tick of yTicks) {
        const y = useLogScale ? yScale.toPixel(tick) : yScale.toPixel(tick)
        context.fillText(
          useLogScale ? `1e${tick}` : formatTick(tick),
          plot.left - 8,
          y
        )
      }

      context.textAlign = "left"
      context.textBaseline = "top"
      context.fillStyle = CHART_COLORS.faded
      context.fillText(
        `Error ${useLogScale ? "(escala logarítmica)" : "(escala lineal)"}`,
        plot.left + 4,
        plot.top - 14
      )

      if (
        !useLogScale &&
        tolerance !== undefined &&
        tolerance > 0 &&
        tolerance <= maxError * 1.15
      ) {
        const y = yScale.toPixel(tolerance)
        drawSegment(
          context,
          [plot.left, y],
          [plot.right, y],
          CHART_COLORS.accent,
          {
            width: 1,
            dash: [5, 4],
          }
        )
        context.fillStyle = CHART_COLORS.accent
        context.textAlign = "left"
        context.textBaseline = "bottom"
        context.fillText(
          `tolerancia ${formatCompact(tolerance, 6)}`,
          plot.left + 4,
          y - 3
        )
      }

      context.strokeStyle = CHART_COLORS.curve
      context.lineWidth = 2
      context.beginPath()

      points.forEach((point, index) => {
        const x = xScale.toPixel(point.iteration)
        const y = toY(point.error)

        if (index === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      })

      context.stroke()

      for (const point of points) {
        const isSelected = point.iteration === selectedIteration
        drawMarker(
          context,
          xScale.toPixel(point.iteration),
          toY(point.error),
          isSelected ? CHART_COLORS.accent : CHART_COLORS.marker,
          isSelected ? formatCompact(point.error, 6) : undefined
        )
      }
    },
    { animated: false }
  )

  return (
    <div
      className={
        className ??
        "relative h-64 w-full overflow-hidden rounded-xl border border-border/60 bg-space-deep/70"
      }
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}

function integerTicks(min: number, max: number) {
  const step = Math.max(1, Math.ceil((max - min) / 10))
  const ticks: number[] = []

  for (let value = min; value <= max; value += step) {
    ticks.push(value)
  }

  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max)
  }

  return ticks
}

function exponentTicks(min: number, max: number) {
  const ticks: number[] = []

  for (
    let exponent = Math.ceil(min);
    exponent <= Math.floor(max);
    exponent += 1
  ) {
    ticks.push(exponent)
  }

  return ticks.length > 0 ? ticks : [Math.round(min)]
}
