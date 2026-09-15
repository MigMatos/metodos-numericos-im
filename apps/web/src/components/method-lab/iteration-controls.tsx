import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Slider } from "@workspace/ui/components/slider"

import type { MethodOutcome } from "@/lib/numerical/method-runner"

type IterationControlsProps = {
  outcome: MethodOutcome
  currentIndex: number
  isPlaying: boolean
  onSelect: (index: number) => void
  onPlayToggle: () => void
  onReset: () => void
}

export function IterationControls({
  outcome,
  currentIndex,
  isPlaying,
  onSelect,
  onPlayToggle,
  onReset,
}: IterationControlsProps) {
  const total = outcome.iterations.length
  const progress = total > 1 ? (currentIndex / (total - 1)) * 100 : 100

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <p className="font-mono text-xs tracking-[0.14em] whitespace-nowrap text-space-cyan">
        ITERACIÓN {currentIndex + 1} / {total}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onSelect(0)}
          disabled={currentIndex === 0}
        >
          <ChevronsLeft data-icon="inline-start" />
          Primera
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onSelect(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft data-icon="inline-start" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onSelect(Math.min(currentIndex + 1, total - 1))}
          disabled={currentIndex >= total - 1}
        >
          Siguiente
          <ChevronRight data-icon="inline-end" />
        </Button>
        <Button variant="outline" size="xs" onClick={onPlayToggle}>
          {isPlaying ? (
            <Pause data-icon="inline-start" />
          ) : (
            <Play data-icon="inline-start" />
          )}
          {isPlaying ? "Pausar" : "Reproducir"}
        </Button>
        <Button variant="ghost" size="xs" onClick={onReset}>
          <RotateCcw data-icon="inline-start" />
          Reiniciar
        </Button>
      </div>

      <div className="flex min-w-40 flex-1 items-center gap-3">
        <span className="font-mono text-[0.6rem] text-muted-foreground">
          0 %
        </span>
        <Slider
          value={currentIndex}
          min={0}
          max={Math.max(total - 1, 0)}
          step={1}
          aria-label="Iteración mostrada"
          onValueChange={(value) => onSelect(Number(value))}
        />
        <span className="font-mono text-[0.6rem] text-muted-foreground">
          {progress.toFixed(0)} %
        </span>
      </div>
    </div>
  )
}
