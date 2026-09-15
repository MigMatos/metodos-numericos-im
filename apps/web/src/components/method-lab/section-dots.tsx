import { cn } from "@workspace/ui/lib/utils"

import { scrollToSection } from "@/hooks/use-active-section"

export type LabSection = {
  id: string
  label: string
}

type SectionDotsProps = {
  sections: LabSection[]
  activeId: string
}

export function SectionDots({ sections, activeId }: SectionDotsProps) {
  const activeIndex = Math.max(
    sections.findIndex((section) => section.id === activeId),
    0
  )

  return (
    <nav
      aria-label="Progreso por las secciones del laboratorio"
      className="flex items-center gap-3"
    >
      <ol className="flex items-center">
        {sections.map((section, index) => {
          const isActive = index === activeIndex
          const isReached = index <= activeIndex

          return (
            <li key={section.id} className="flex items-center">
              <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                title={section.label}
                aria-current={isActive ? "step" : undefined}
                className="grid size-6 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-space-cyan/60 focus-visible:outline-none"
              >
                <span className="sr-only">{section.label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "rounded-full border transition-all duration-300",
                    isActive
                      ? "size-3 border-space-cyan bg-space-cyan shadow-[0_0_12px_var(--color-space-cyan)]"
                      : isReached
                        ? "size-2.5 border-space-cyan/60 bg-space-cyan/40"
                        : "size-2 border-border bg-transparent hover:border-space-cyan/60"
                  )}
                />
              </button>
              {index < sections.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-3 transition-colors duration-300 sm:w-5",
                    index < activeIndex ? "bg-space-cyan/60" : "bg-border"
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <span className="hidden text-[0.6rem] font-medium tracking-[0.2em] text-muted-foreground uppercase lg:inline">
        {sections[activeIndex]?.label}
      </span>
    </nav>
  )
}
