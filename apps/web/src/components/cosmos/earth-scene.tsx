import { useRef } from "react"

import { useAnimatedCanvas } from "@/hooks/use-animated-canvas"

import { createLandmasses, drawEarth, type Landmass } from "./earth-render"
import {
  createWarpStars,
  drawSpaceSky,
  drawWarpStars,
  type WarpStar,
} from "./warp-stars"

const ROTATION_SPEED = 0.000018
const SUN_ANGLE = Math.PI * 0.78
const DRIFT_SPEED = 0.00006

export function EarthScene() {
  const landmassesRef = useRef<Landmass[] | null>(null)
  const starsRef = useRef<WarpStar[] | null>(null)

  const canvasRef = useAnimatedCanvas(
    ({ context, width, height, elapsed, delta }) => {
      landmassesRef.current ??= createLandmasses()
      starsRef.current ??= createWarpStars()

      context.clearRect(0, 0, width, height)
      drawSpaceSky(context, width, height, elapsed)

      const compact = width < 768
      const radius = Math.min(width, height) * (compact ? 0.44 : 0.46)
      const centerX = compact ? width * 0.5 : width * 0.76
      const centerY = compact ? height * 0.3 : height * 0.5

      drawWarpStars(context, starsRef.current, {
        vanishingX: centerX,
        vanishingY: centerY,
        scale: Math.min(width, height) * 0.55,
        width,
        height,
        speed: DRIFT_SPEED,
        delta,
      })

      drawEarth(context, {
        centerX,
        centerY,
        radius,
        rotation: elapsed * ROTATION_SPEED,
        sunAngle: SUN_ANGLE,
        landmasses: landmassesRef.current,
      })
    }
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="absolute inset-0 bg-space-deeper/55" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-space-deeper via-space-deeper/75 to-transparent" />
    </div>
  )
}
