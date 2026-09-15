import { createSeededRandom } from "@/lib/scene-math"

import { SPACE_PALETTE } from "./space-palette"

export type MoonCrater = {
  x: number
  y: number
  radius: number
  shade: number
}

const CRATER_COUNT = 34
const DEFAULT_CRATER_SEED = 4207

export function createMoonCraters(
  count = CRATER_COUNT,
  seed = DEFAULT_CRATER_SEED
): MoonCrater[] {
  const random = createSeededRandom(seed)

  return Array.from({ length: count }, () => {
    const distance = Math.sqrt(random()) * 0.94
    const angle = random() * Math.PI * 2

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      radius: 0.015 + random() * 0.075,
      shade: 0.35 + random() * 0.45,
    }
  })
}

export function drawMoon(
  context: CanvasRenderingContext2D,
  options: {
    centerX: number
    centerY: number
    radius: number
    craters: MoonCrater[]
  }
) {
  const { centerX, centerY, radius, craters } = options

  if (radius < 1) {
    return
  }

  const left = centerX - radius
  const top = centerY - radius
  const size = radius * 2

  context.save()
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.clip()

  const surface = context.createRadialGradient(
    centerX - radius * 0.32,
    centerY - radius * 0.34,
    radius * 0.02,
    centerX,
    centerY,
    radius * 1.3
  )
  surface.addColorStop(0, "#f4f6fa")
  surface.addColorStop(0.35, "#cbd1dc")
  surface.addColorStop(0.7, "#8d94a5")
  surface.addColorStop(1, "#464c5d")
  context.fillStyle = surface
  context.fillRect(left, top, size, size)

  for (const crater of craters) {
    const craterX = centerX + crater.x * radius
    const craterY = centerY + crater.y * radius
    const craterRadius = crater.radius * radius

    if (craterRadius < 0.8) {
      continue
    }

    const bowl = context.createRadialGradient(
      craterX - craterRadius * 0.35,
      craterY - craterRadius * 0.35,
      craterRadius * 0.05,
      craterX,
      craterY,
      craterRadius
    )
    bowl.addColorStop(0, `rgba(58, 63, 78, ${0.6 * crater.shade})`)
    bowl.addColorStop(0.72, `rgba(126, 133, 148, ${0.35 * crater.shade})`)
    bowl.addColorStop(1, "rgba(238, 241, 248, 0)")
    context.fillStyle = bowl
    context.beginPath()
    context.arc(craterX, craterY, craterRadius, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = "rgba(255, 255, 255, 0.18)"
    context.lineWidth = Math.max(craterRadius * 0.05, 0.7)
    context.beginPath()
    context.arc(
      craterX,
      craterY,
      craterRadius * 0.96,
      Math.PI * 1.05,
      Math.PI * 1.9
    )
    context.stroke()
  }

  const shadow = context.createLinearGradient(
    centerX - radius,
    centerY - radius,
    centerX + radius,
    centerY + radius
  )
  shadow.addColorStop(0, `rgba(${SPACE_PALETTE.shadow}, 0)`)
  shadow.addColorStop(0.5, `rgba(${SPACE_PALETTE.shadow}, 0.2)`)
  shadow.addColorStop(1, `rgba(${SPACE_PALETTE.shadow}, 0.82)`)
  context.fillStyle = shadow
  context.fillRect(left, top, size, size)
  context.restore()

  const halo = context.createRadialGradient(
    centerX,
    centerY,
    Math.max(radius * 0.94, 1),
    centerX,
    centerY,
    radius * 1.09
  )
  halo.addColorStop(0, "rgba(150, 210, 255, 0)")
  halo.addColorStop(0.45, "rgba(150, 210, 255, 0.16)")
  halo.addColorStop(1, "rgba(150, 210, 255, 0)")
  context.fillStyle = halo
  context.beginPath()
  context.arc(centerX, centerY, radius * 1.09, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = "rgba(215, 235, 255, 0.5)"
  context.lineWidth = Math.max(radius * 0.002, 1)
  context.beginPath()
  context.arc(centerX, centerY, radius, -Math.PI * 0.98, -Math.PI * 0.02)
  context.stroke()
}
