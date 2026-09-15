import { useRef } from "react"

import { useAnimatedCanvas } from "@/hooks/use-animated-canvas"
import { createSeededRandom } from "@/lib/scene-math"

import { SPACE_PALETTE } from "./space-palette"

type Star = {
  x: number
  y: number
  depth: number
  radius: number
  alpha: number
  twinkle: number
}

const STAR_COUNT = 340
const STAR_SEED = 20240517

function createStars(): Star[] {
  const random = createSeededRandom(STAR_SEED)

  return Array.from({ length: STAR_COUNT }, () => ({
    x: random(),
    y: random(),
    depth: 0.25 + random() * 0.75,
    radius: 0.4 + random() * 1.5,
    alpha: 0.35 + random() * 0.6,
    twinkle: 0.4 + random() * 1.6,
  }))
}

export function Starfield() {
  const starsRef = useRef<Star[] | null>(null)

  const canvasRef = useAnimatedCanvas(({ context, width, height, elapsed }) => {
    starsRef.current ??= createStars()
    const stars = starsRef.current
    const drift = (elapsed * 0.000008) % 1

    context.clearRect(0, 0, width, height)

    for (const star of stars) {
      const x = ((star.x + drift * star.depth) % 1) * width
      const y = ((star.y + drift * star.depth * 0.35) % 1) * height
      const twinkle =
        0.6 + 0.4 * Math.sin(elapsed * 0.0012 * star.twinkle + star.x * 12)

      context.globalAlpha = star.alpha * twinkle
      context.fillStyle =
        star.depth > 0.6 ? SPACE_PALETTE.starBright : SPACE_PALETTE.starDim
      context.beginPath()
      context.arc(x, y, star.radius * (0.6 + star.depth * 0.8), 0, Math.PI * 2)
      context.fill()
    }

    context.globalAlpha = 1
  })

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -top-40 -left-24">
        <div className="size-[46rem] animate-drift rounded-full bg-space-violet/15 blur-3xl" />
      </div>
      <div className="absolute -right-24 -bottom-40">
        <div className="size-[54rem] animate-drift rounded-full bg-space-cyan/15 blur-3xl [animation-delay:-9s]" />
      </div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
        <div className="size-[38rem] animate-drift rounded-full bg-space-cyan/8 blur-3xl [animation-delay:-17s]" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}
