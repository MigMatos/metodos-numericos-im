import type { ReactNode } from "react"

export function Panel({
  title,
  id,
  children,
}: {
  title: string
  id?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-40 flex-col gap-5">
      <h2 className="text-sm font-medium tracking-[0.22em] text-space-cyan">
        {title}
      </h2>
      {children}
    </section>
  )
}
