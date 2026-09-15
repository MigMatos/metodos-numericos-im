import { Badge } from "@workspace/ui/components/badge"

import { ErrorChart } from "@/components/charts/error-chart"
import {
  describeConvergence,
  errorSeries,
  firstError,
} from "@/lib/numerical/analysis"
import { formatCompact, formatPercent } from "@/lib/numerical/format"
import type { MethodOutcome } from "@/lib/numerical/method-runner"

type AnalysisPanelProps = {
  outcome: MethodOutcome
  currentIndex: number
  id?: string
}

export function AnalysisPanel({
  outcome,
  currentIndex,
  id,
}: AnalysisPanelProps) {
  const {
    config,
    iterations,
    tolerance,
    status,
    finalError,
    finalErrorPercent,
  } = outcome
  const series = errorSeries(iterations)
  const convergence = describeConvergence(config.name, outcome)
  const converged = status === "converged"

  const summary = [
    { label: "RAÍZ APROXIMADA", value: formatCompact(outcome.root, 6) },
    { label: "f(x)", value: formatCompact(outcome.functionValueAtRoot, 6) },
    { label: "ITERACIONES", value: String(iterations.length) },
    { label: "ERROR FINAL", value: formatCompact(finalError, 6) },
    { label: "ERROR FINAL %", value: formatPercent(finalErrorPercent) },
    { label: "TOLERANCIA", value: formatCompact(tolerance, 6) },
  ]

  return (
    <div id={id} className="flex scroll-mt-40 flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium tracking-[0.22em] text-space-cyan">
          RESULTADO FINAL
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-space-surface/40 p-4"
            >
              <p className="text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 font-mono text-lg text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={converged ? "default" : "destructive"}
            className="px-3 py-1 tracking-[0.16em]"
          >
            {converged ? "✓ CONVERGENCIA ALCANZADA" : "SIN CONVERGENCIA"}
          </Badge>
          {!converged ? (
            <span className="text-sm text-muted-foreground">
              {outcome.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium tracking-[0.22em] text-space-cyan">
          EVOLUCIÓN DEL ERROR
        </h3>
        <ErrorChart
          points={series.map((point) => ({
            iteration: point.iteration,
            error: point.error,
          }))}
          selectedIteration={iterations[currentIndex]?.iteration}
          tolerance={tolerance}
        />
        <p className="text-sm text-muted-foreground">
          Error absoluto por iteración calculado con los datos reales del
          método. El error inicial fue{" "}
          {formatCompact(firstError(iterations), 6)} y el error final{" "}
          {formatCompact(finalError, 6)}.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium tracking-[0.22em] text-space-cyan">
          ANÁLISIS DE CONVERGENCIA
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DataPoint label="ESTADO" value={convergence.state} />
          <DataPoint label="ITERACIONES" value={String(iterations.length)} />
          <DataPoint
            label="ERROR INICIAL"
            value={formatCompact(firstError(iterations), 6)}
          />
          <DataPoint label="ERROR FINAL" value={formatCompact(finalError, 6)} />
        </div>
        <p className="rounded-xl border border-space-cyan/25 bg-space-cyan/5 p-4 text-sm leading-relaxed">
          {convergence.explanation}
        </p>
      </div>
    </div>
  )
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-space-surface/40 p-4">
      <p className="text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-base text-foreground">{value}</p>
    </div>
  )
}
