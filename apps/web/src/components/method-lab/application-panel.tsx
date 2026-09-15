import { Badge } from "@workspace/ui/components/badge"

import { ApplicationDiagram } from "@/components/method-lab/application-diagram"
import { formatCompact } from "@/lib/numerical/format"
import {
  describeApplication,
  getApplication,
} from "@/lib/numerical/method-applications"
import { approximationOf } from "@/lib/numerical/method-visuals"
import type { MethodOutcome } from "@/lib/numerical/method-runner"

type ApplicationPanelProps = {
  outcome: MethodOutcome
  currentIndex: number
  isPreview: boolean
}

export function ApplicationPanel({
  outcome,
  currentIndex,
  isPreview,
}: ApplicationPanelProps) {
  const application = getApplication(outcome.config.id)
  const iteration = outcome.iterations[currentIndex]
  const approximation = iteration
    ? approximationOf(outcome.config.id, iteration)
    : outcome.root
  const settled =
    outcome.status === "converged" &&
    currentIndex === outcome.iterations.length - 1

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border/60 bg-space-surface/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-base font-medium">
            {application.title}
          </h3>
          <Badge
            variant={isPreview ? "secondary" : settled ? "default" : "outline"}
            className="tracking-[0.16em]"
          >
            {isPreview
              ? "DEMOSTRACIÓN"
              : settled
                ? application.settledLabel
                : application.pendingLabel}
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {application.scenario}
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 p-3">
            <dt className="text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Variable física
            </dt>
            <dd className="mt-1">{application.quantity}</dd>
          </div>
          <div className="rounded-lg border border-border/50 p-3">
            <dt className="text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Lectura cero
            </dt>
            <dd className="mt-1">{application.goal}</dd>
          </div>
        </dl>
      </div>

      <ApplicationDiagram
        methodId={outcome.config.id}
        outcome={outcome}
        currentIndex={currentIndex}
        showNumbers={!isPreview}
      />

      {isPreview ? (
        <p className="rounded-xl border border-border/60 bg-space-surface/40 p-4 text-sm leading-relaxed text-muted-foreground">
          El banco está en <strong>modo demostración</strong> con los datos por
          defecto del método y sin resultados a la vista. Presiona CALCULAR para
          animarlo con tus datos y ver las lecturas, la raíz y el estado reales.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Reading
              label="Lectura de esta iteración"
              value={formatCompact(approximation, 6)}
            />
            <Reading
              label="Valor objetivo (raíz)"
              value={formatCompact(outcome.root, 6)}
            />
            <Reading
              label={application.instrument}
              value={
                settled ? application.settledLabel : application.pendingLabel
              }
            />
          </div>

          <p className="rounded-xl border border-space-amber/30 bg-space-amber/5 p-4 text-sm leading-relaxed">
            {describeApplication(outcome, currentIndex)}
          </p>
        </>
      )}
    </div>
  )
}

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-space-surface/40 p-4">
      <p className="text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm text-foreground">{value}</p>
    </div>
  )
}
