import { useAnimatedCanvas } from "@/hooks/use-animated-canvas"
import type { Expression } from "@/lib/numerical/expression"
import { createScale, domainOf, expandDomain } from "@/lib/plot"

import { drawOverlay, overlayValue, type ChartOverlay } from "./chart-overlays"
import { drawAxes, drawCurve, drawGrid } from "./chart-primitives"

type FunctionChartProps = {
  expression: Expression | null
  domain: [number, number]
  overlay?: ChartOverlay | null
  approximations?: number[]
  className?: string
}

const SAMPLE_COUNT = 520
const PADDING = { left: 58, right: 20, top: 18, bottom: 36 }

export function FunctionChart({
  expression,
  domain,
  overlay = null,
  approximations = [],
  className,
}: FunctionChartProps) {
  const canvasRef = useAnimatedCanvas(
    ({ context, width, height }) => {
      context.clearRect(0, 0, width, height)

      const plot = {
        left: PADDING.left,
        right: Math.max(width - PADDING.right, PADDING.left + 10),
        top: PADDING.top,
        bottom: Math.max(height - PADDING.bottom, PADDING.top + 10),
      }

      const xScale = createScale(expandDomain(domain, 0.02), [
        plot.left,
        plot.right,
      ] as const)

      const sampleValues: number[] = []
      const samples: { x: number; y: number }[] = []

      if (expression) {
        for (let index = 0; index <= SAMPLE_COUNT; index += 1) {
          const x = xScale.toValue(
            plot.left + ((plot.right - plot.left) * index) / SAMPLE_COUNT
          )
          const y = expression.evaluate(x)
          samples.push({ x, y })

          if (Number.isFinite(y)) {
            sampleValues.push(y)
          }
        }
      }

      const yDomain = expandDomain(
        domainOf(
          [
            ...sampleValues,
            ...approximations,
            overlay ? overlayValue(overlay) : 0,
            0,
          ],
          [-1, 1]
        ),
        0.14
      )
      const yScale = createScale(yDomain, [plot.bottom, plot.top] as const)

      drawGrid(context, plot, xScale, yScale)
      drawAxes(context, plot, xScale, yScale)

      if (expression) {
        drawCurve(context, samples, xScale, yScale)
      }

      if (overlay) {
        drawOverlay(context, {
          overlay,
          xScale,
          yScale,
          approximations,
        })
      }
    },
    { animated: false }
  )

  return (
    <div
      data-report-chart=""
      className={
        className ??
        "relative h-72 w-full overflow-hidden rounded-xl border border-border/60 bg-space-deep/70 sm:h-80"
      }
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}
