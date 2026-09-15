import { FileText } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { FunctionChart } from "@/components/charts/function-chart"
import { AnalysisPanel } from "@/components/method-lab/analysis-panel"
import { IterationPanel } from "@/components/method-lab/iteration-panel"
import { Panel } from "@/components/method-lab/method-panel"
import { overlayFor } from "@/components/method-lab/method-overlay"
import { playSound } from "@/lib/audio"
import type { AnyIteration, MethodId } from "@/lib/numerical/types"
import type { MethodOutcome } from "@/lib/numerical/method-runner"
import { approximationsUpTo, chartDomain } from "@/lib/numerical/method-visuals"
import { generateReport } from "@/lib/report"

type MethodLabBodyProps = {
  methodId: MethodId
  outcome: MethodOutcome | null
  currentIndex: number
  onSelect: (index: number) => void
}

export function MethodLabBody({
  methodId,
  outcome,
  currentIndex,
  onSelect,
}: MethodLabBodyProps) {
  if (!outcome) {
    return (
      <Panel title="RESULTADOS">
        <p className="text-sm text-muted-foreground">
          Presiona CALCULAR para ejecutar el método con los datos ingresados.
          Los resultados, la tabla de iteraciones y la gráfica aparecerán en
          esta pantalla.
        </p>
      </Panel>
    )
  }

  const currentIteration: AnyIteration | undefined =
    outcome.iterations[currentIndex]

  return (
    <>
      <Panel id="lab-iteraciones" title="ITERACIONES">
        <IterationPanel
          outcome={outcome}
          currentIndex={currentIndex}
          onSelect={onSelect}
        />
      </Panel>

      <Panel id="lab-grafica" title="GRÁFICA">
        <FunctionChart
          expression={outcome.inputs.functionExpression}
          domain={chartDomain(outcome)}
          overlay={overlayFor(methodId, currentIteration)}
          approximations={approximationsUpTo(methodId, outcome, currentIndex)}
        />
        <p className="text-sm text-muted-foreground">
          La gráfica usa los datos reales del cálculo y muestra la aproximación
          de la iteración seleccionada.
        </p>
      </Panel>

      <AnalysisPanel
        id="lab-analisis"
        outcome={outcome}
        currentIndex={currentIndex}
      />

      <Panel id="lab-reporte" title="REPORTE">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            className="h-9 px-6 tracking-[0.12em]"
            onClick={() => {
              playSound("calculate")
              generateReport(outcome)
            }}
          >
            <FileText data-icon="inline-start" />
            GENERAR REPORTE
          </Button>
          <span className="text-sm text-muted-foreground">
            Se abrirá el diálogo de impresión con el reporte completo (
            {outcome.config.reportFileName}.pdf).
          </span>
        </div>
      </Panel>
    </>
  )
}
