import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { cn } from "@workspace/ui/lib/utils"

import { describeIteration } from "@/lib/numerical/analysis"
import { cellText } from "@/lib/numerical/method-visuals"
import type { MethodOutcome } from "@/lib/numerical/method-runner"

type IterationPanelProps = {
  outcome: MethodOutcome
  currentIndex: number
  onSelect: (index: number) => void
}

export function IterationPanel({
  outcome,
  currentIndex,
  onSelect,
}: IterationPanelProps) {
  const { config, iterations, tolerance } = outcome
  const total = iterations.length
  const current = iterations[currentIndex] ?? iterations[total - 1]
  const previous =
    currentIndex > 0 ? (iterations[currentIndex - 1] ?? null) : null

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">
        La tabla completa del método con los valores reales de cada iteración.
        Usa los controles de la barra superior para recorrerla, o haz clic en
        cualquier fila.
      </p>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {iterations.map((iteration, index) => (
              <TableRow
                key={iteration.iteration}
                onClick={() => onSelect(index)}
                className={cn(
                  "cursor-pointer font-mono",
                  index === currentIndex &&
                    "bg-space-cyan/10 hover:bg-space-cyan/15"
                )}
              >
                {config.columns.map((column) => (
                  <TableCell key={column.key}>
                    {cellText(iteration, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {current ? (
        <div className="rounded-xl border border-space-amber/30 bg-space-amber/5 p-4">
          <p className="text-xs font-medium tracking-[0.22em] text-space-amber">
            ¿QUÉ OCURRIÓ EN ESTA ITERACIÓN?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {describeIteration(
              config.id,
              current,
              previous,
              total,
              tolerance,
              outcome.status === "converged" && currentIndex === total - 1
            )}
          </p>
        </div>
      ) : null}
    </div>
  )
}
