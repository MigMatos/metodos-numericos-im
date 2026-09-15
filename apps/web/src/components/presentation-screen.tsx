import { Rocket } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { SITE_CONFIG } from "@/lib/site-config"

type PresentationScreenProps = {
  onStart: () => void
}

export function PresentationScreen({ onStart }: PresentationScreenProps) {
  const { presentation, student, subjectDisplay, career } = SITE_CONFIG

  return (
    <section className="relative z-10 grid min-h-svh place-items-center px-6 py-20 text-center">
      <div className="flex w-full max-w-3xl animate-screen-in flex-col items-center">
        <p className="text-[0.7rem] font-medium tracking-[0.34em] text-space-cyan/75 uppercase sm:text-xs">
          {career}
        </p>

        <h1 className="relative mt-6 font-display text-4xl leading-[1.05] font-bold tracking-[0.1em] text-balance sm:text-6xl lg:text-7xl">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -z-10 mx-auto size-64 animate-glow rounded-full bg-space-cyan/20 blur-3xl"
          />
          <span className="bg-gradient-to-b from-white via-white to-space-cyan/70 bg-clip-text text-transparent">
            {subjectDisplay}
          </span>
        </h1>

        <span
          aria-hidden
          className="mt-8 h-px w-40 bg-gradient-to-r from-transparent via-space-cyan to-transparent sm:w-64"
        />

        <p className="mt-6 text-lg font-medium tracking-[0.06em] text-foreground/95 sm:text-xl">
          {student}
        </p>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {presentation.lead}
        </p>

        <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground/80 sm:text-sm">
          {presentation.extra}
        </p>

        <Button
          size="lg"
          onClick={onStart}
          className="group relative mt-12 h-12 animate-float overflow-hidden rounded-full border border-space-cyan/60 bg-space-surface/90 px-9 text-sm font-semibold tracking-[0.22em] text-space-cyan shadow-[0_0_45px_-12px_var(--color-space-cyan)] backdrop-blur-sm hover:border-space-cyan hover:bg-space-surface hover:text-white hover:shadow-[0_0_60px_-6px_var(--color-space-cyan)] focus-visible:ring-3 focus-visible:ring-space-cyan/50"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[300%]"
          />
          <Rocket className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          {presentation.ctaLabel}
        </Button>

        <p className="mt-5 text-xs text-muted-foreground/70">
          {presentation.hint}
        </p>
      </div>
    </section>
  )
}
