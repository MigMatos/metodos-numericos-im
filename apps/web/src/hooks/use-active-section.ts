import { useEffect, useState } from "react"

const ACTIVE_OFFSET = 200

export function useActiveSection(ids: string[]) {
  const key = ids.join("|")
  const [activeId, setActiveId] = useState(() => ids[0] ?? "")

  useEffect(() => {
    const elements = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) {
      return
    }

    const update = () => {
      const passed = elements.filter(
        (element) => element.getBoundingClientRect().top <= ACTIVE_OFFSET
      )
      const last = passed[passed.length - 1]

      setActiveId(last ? last.id : (elements[0]?.id ?? ""))
    }

    update()

    const observer = new IntersectionObserver(update, {
      rootMargin: `-${ACTIVE_OFFSET}px 0px -45% 0px`,
      threshold: [0, 0.15, 0.5, 1],
    })

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [key])

  return activeId
}

export function scrollToSection(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}
