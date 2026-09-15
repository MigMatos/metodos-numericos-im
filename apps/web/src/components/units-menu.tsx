import { ArrowLeft, ArrowRight, Lock } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SITE_CONFIG } from "@/lib/site-config"

type Unit = (typeof SITE_CONFIG.units)[number]

type UnitsMenuProps = {
  onOpenUnitTwo: () => void
  onBackToStart: () => void
}

export function UnitsMenu({ onOpenUnitTwo, onBackToStart }: UnitsMenuProps) {
  const { unitsMenu, units } = SITE_CONFIG

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-[0.14em] text-balance sm:text-4xl">
          {unitsMenu.title}
        </h1>
        <p className="text-muted-foreground">{unitsMenu.subtitle}</p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {units.map((unit) => (
          <li key={unit.label} className="flex">
            <UnitCard unit={unit} onOpenUnitTwo={onOpenUnitTwo} />
          </li>
        ))}
      </ul>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToStart}
          className="tracking-[0.18em] text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          {unitsMenu.backLabel}
        </Button>
      </div>
    </section>
  )
}

function UnitCard({
  unit,
  onOpenUnitTwo,
}: {
  unit: Unit
  onOpenUnitTwo: () => void
}) {
  const cardClassName = cn(
    "relative flex min-h-48 w-full flex-col justify-between gap-6 overflow-hidden rounded-xl border p-5 text-left transition duration-300",
    unit.available
      ? "border-space-cyan/25 bg-space-surface/50 backdrop-blur-sm hover:-translate-y-1 hover:border-space-cyan/70 hover:bg-space-surface/80 hover:shadow-[0_0_45px_-18px_var(--color-space-cyan)] focus-visible:ring-3 focus-visible:ring-space-cyan/40"
      : "border-border/60 bg-space-surface/30 opacity-55"
  )

  const content = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-space-cyan/10 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px left-5 h-px w-16 bg-space-cyan/70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-5 -bottom-px h-px w-16 bg-space-cyan/40"
      />
      <span className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium tracking-[0.28em] text-space-cyan/80">
          {unit.label}
        </span>
        <Badge
          variant={unit.available ? "default" : "secondary"}
          className="text-[0.6rem] tracking-[0.18em]"
        >
          {unit.available ? "DISPONIBLE" : "EN DESARROLLO"}
        </Badge>
      </span>
      <span className="flex items-end justify-between gap-3">
        <span className="flex flex-col gap-1.5">
          <span className="text-lg leading-snug font-medium text-balance">
            {unit.title}
          </span>
          <span className="text-xs text-muted-foreground">{unit.detail}</span>
        </span>
        {unit.available ? (
          <ArrowRight
            aria-hidden
            className="shrink-0 text-space-cyan transition-transform duration-300 group-hover:translate-x-1"
          />
        ) : (
          <Lock aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        )}
      </span>
    </>
  )

  if (!unit.available) {
    return <div className={cardClassName}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onOpenUnitTwo}
      className={cn("group", cardClassName)}
    >
      {content}
    </button>
  )
}
