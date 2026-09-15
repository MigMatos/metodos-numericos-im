import { useEffect, useMemo, useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { ApplicationPanel } from "@/components/method-lab/application-panel"
import { IterationControls } from "@/components/method-lab/iteration-controls"
import { MethodForm } from "@/components/method-lab/method-form"
import { MethodLabBody } from "@/components/method-lab/method-lab-body"
import { Panel } from "@/components/method-lab/method-panel"
import {
  SectionDots,
  type LabSection,
} from "@/components/method-lab/section-dots"
import { useActiveSection } from "@/hooks/use-active-section"
import { playSound } from "@/lib/audio"
import { defaultInputs, getMethodConfig } from "@/lib/numerical/methods-config"
import { runMethod, type MethodOutcome } from "@/lib/numerical/method-runner"
import type { MethodId } from "@/lib/numerical/types"

type MethodLabScreenProps = {
  methodId: MethodId
  onBack: () => void
}

const PLAY_INTERVAL = 900

const BASE_SECTIONS: LabSection[] = [
  { id: "lab-fundamento", label: "Fundamento" },
  { id: "lab-formula", label: "Fórmula y procedimiento" },
  { id: "lab-datos", label: "Datos de entrada" },
  { id: "lab-ejemplo", label: "Ejemplo en la vida real" },
]

const RESULT_SECTIONS: LabSection[] = [
  { id: "lab-iteraciones", label: "Iteraciones y tabla" },
  { id: "lab-grafica", label: "Gráfica" },
  { id: "lab-analisis", label: "Resultados y análisis" },
  { id: "lab-reporte", label: "Reporte" },
]

export function MethodLabScreen({ methodId, onBack }: MethodLabScreenProps) {
  const config = getMethodConfig(methodId)
  const [values, setValues] = useState(() => defaultInputs(config))
  const [outcome, setOutcome] = useState<MethodOutcome | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const previewOutcome = useMemo(() => {
    const result = runMethod(methodId, defaultInputs(config))

    return result.ok ? result.outcome : null
  }, [methodId, config])

  const activeOutcome = outcome ?? previewOutcome
  const activeIndex = outcome
    ? currentIndex
    : activeOutcome
      ? activeOutcome.iterations.length - 1
      : 0

  const sections = useMemo(
    () => (outcome ? [...BASE_SECTIONS, ...RESULT_SECTIONS] : BASE_SECTIONS),
    [outcome]
  )
  const sectionIds = useMemo(
    () => sections.map((section) => section.id),
    [sections]
  )
  const activeSection = useActiveSection(sectionIds)

  useEffect(() => {
    if (!isPlaying || !outcome) {
      return
    }

    const lastIndex = outcome.iterations.length - 1

    if (currentIndex >= lastIndex) {
      return
    }

    const timeout = window.setTimeout(() => {
      const nextIndex = currentIndex + 1

      setCurrentIndex(nextIndex)
      playSound("iteration")

      if (nextIndex >= lastIndex) {
        setIsPlaying(false)
      }
    }, PLAY_INTERVAL)

    return () => window.clearTimeout(timeout)
  }, [isPlaying, currentIndex, outcome])

  const handleChange = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleCalculate = () => {
    const result = runMethod(methodId, values)

    if (!result.ok) {
      setErrorMessage(result.message)
      setOutcome(null)
      playSound("error")
      return
    }

    setErrorMessage("")
    setOutcome(result.outcome)
    setCurrentIndex(result.outcome.iterations.length - 1)
    setIsPlaying(false)
    playSound(
      result.outcome.status === "converged" ? "convergence" : "calculate"
    )
  }

  const handleReset = () => {
    setValues(defaultInputs(config))
    setOutcome(null)
    setErrorMessage("")
    setCurrentIndex(0)
    setIsPlaying(false)
  }

  const handleSelectIteration = (index: number) => {
    setCurrentIndex(index)
    playSound("iteration")
  }

  return (
    <section className="relative min-h-svh">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-space-deep/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground"
            >
              <ArrowLeft data-icon="inline-start" />
              Métodos
            </Button>
            <span className="font-mono text-xs tracking-[0.24em] text-space-cyan/80">
              {config.code}
            </span>
            <h1 className="font-display text-base font-medium sm:text-lg">
              {config.name}
            </h1>
            <Badge variant="outline" className="tracking-[0.12em]">
              {config.kind}
            </Badge>
            <div className="ml-auto">
              <SectionDots sections={sections} activeId={activeSection} />
            </div>
          </div>

          {outcome ? (
            <IterationControls
              outcome={outcome}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              onSelect={handleSelectIteration}
              onPlayToggle={() => {
                if (currentIndex >= outcome.iterations.length - 1) {
                  setCurrentIndex(0)
                }

                setIsPlaying((playing) => !playing)
              }}
              onReset={() => {
                setCurrentIndex(0)
                setIsPlaying(false)
              }}
            />
          ) : null}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <p className="max-w-3xl text-sm text-muted-foreground">
          {config.description}
        </p>

        <Panel id="lab-fundamento" title="FUNDAMENTO">
          <div className="grid gap-4 sm:grid-cols-2">
            {config.theory.map((block) => (
              <div
                key={block.title}
                className="rounded-xl border border-border/60 bg-space-surface/40 p-4"
              >
                <h3 className="text-sm font-medium text-space-cyan/90">
                  {block.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {block.content}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel id="lab-formula" title="FÓRMULA Y PROCEDIMIENTO">
          <div className="flex flex-col gap-5">
            <p className="rounded-xl border border-space-cyan/25 bg-space-cyan/5 p-4 font-mono text-base text-space-cyan">
              {config.formula}
            </p>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
              {config.procedure.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </Panel>

        <Panel id="lab-datos" title="DATOS DE ENTRADA">
          <MethodForm
            config={config}
            values={values}
            errorMessage={errorMessage}
            onChange={handleChange}
            onCalculate={() => {
              playSound("calculate")
              handleCalculate()
            }}
            onReset={handleReset}
          />
        </Panel>

        <Panel id="lab-ejemplo" title="EJEMPLO EN LA VIDA REAL">
          {activeOutcome ? (
            <ApplicationPanel
              outcome={activeOutcome}
              currentIndex={activeIndex}
              isPreview={!outcome}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Ingresa datos válidos y presiona CALCULAR para ver el ejemplo
              aplicado con sus valores reales.
            </p>
          )}
        </Panel>

        <MethodLabBody
          methodId={methodId}
          outcome={outcome}
          currentIndex={currentIndex}
          onSelect={handleSelectIteration}
        />
      </div>
    </section>
  )
}
