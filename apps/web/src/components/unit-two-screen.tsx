import { ArrowLeft, FlaskConical } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { EarthScene } from "@/components/cosmos/earth-scene"
import { METHODS } from "@/lib/numerical/methods-config"
import type { MethodId } from "@/lib/numerical/types"
import { SITE_CONFIG } from "@/lib/site-config"

type UnitTwoScreenProps = {
  onBack: () => void
  onSelectMethod: (methodId: MethodId) => void
}

export function UnitTwoScreen({ onBack, onSelectMethod }: UnitTwoScreenProps) {
  const { unitTwo } = SITE_CONFIG

  return (
    <section className="relative min-h-svh">
      <EarthScene />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="self-start text-muted-foreground"
          >
            <ArrowLeft data-icon="inline-start" />
            Unidades
          </Button>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium tracking-[0.28em] text-space-cyan/80">
              {unitTwo.label}
            </span>
            <h1 className="font-display text-2xl font-semibold text-balance sm:text-3xl">
              {unitTwo.title}
            </h1>
            <p className="text-sm text-muted-foreground">{unitTwo.subtitle}</p>
          </div>
        </header>

        <ol className="grid gap-5 sm:grid-cols-2">
          {METHODS.map((method) => (
            <li key={method.id} className="flex">
              <article className="group relative flex w-full flex-col gap-5 overflow-hidden rounded-xl border border-space-cyan/20 bg-space-surface/45 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-space-cyan/60 hover:bg-space-surface/65 hover:shadow-[0_0_45px_-18px_var(--color-space-cyan)]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-px left-5 h-px w-16 bg-space-cyan/70 transition-all duration-300 group-hover:w-24"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm tracking-[0.24em] text-space-cyan/80">
                    {method.code}
                  </span>
                  <Badge variant="outline" className="tracking-[0.14em]">
                    {method.kind}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-lg font-medium">
                    {method.name}
                  </h2>
                  <p className="text-xs tracking-[0.14em] text-space-cyan/70 uppercase">
                    {method.subtitle}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {method.description}
                  </p>
                </div>

                <Button
                  onClick={() => onSelectMethod(method.id)}
                  className="mt-auto self-start tracking-[0.12em]"
                >
                  <FlaskConical data-icon="inline-start" />
                  {unitTwo.ctaLabel}
                </Button>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
