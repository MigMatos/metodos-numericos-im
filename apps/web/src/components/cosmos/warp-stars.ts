import { clamp, createSeededRandom, inverseLerp, lerp } from "@/lib/scene-math"

import { SPACE_PALETTE } from "./space-palette"

export type WarpStar = {
  x: number
  y: number
  z: number
  alpha: number
}

const STAR_COUNT = 320
const STAR_SEED = 88117

export function createWarpStars(): WarpStar[] {
  const random = createSeededRandom(STAR_SEED)

  return Array.from({ length: STAR_COUNT }, () => ({
    x: (random() - 0.5) * 1.7,
    y: (random() - 0.5) * 1.7,
    z: 0.08 + random() * 0.92,
    alpha: 0.35 + random() * 0.65,
  }))
}

export type WarpStarsOptions = {
  vanishingX: number
  vanishingY: number
  scale: number
  width: number
  height: number
  speed: number
  delta: number
}

export function drawWarpStars(
  context: CanvasRenderingContext2D,
  stars: WarpStar[],
  options: WarpStarsOptions
) {
  const { vanishingX, vanishingY, scale, width, height, speed, delta } = options
  const travelled = speed * delta

  context.lineCap = "round"
  context.globalAlpha = 1

  for (const star of stars) {
    star.z -= travelled

    if (star.z <= 0.05) {
      star.z = 1
    }

    const depth = star.z
    const tailDepth = Math.min(depth + travelled * 7, 1)
    const headX = vanishingX + (star.x / depth) * scale
    const headY = vanishingY + (star.y / depth) * scale
    const tailX = vanishingX + (star.x / tailDepth) * scale
    const tailY = vanishingY + (star.y / tailDepth) * scale

    if (
      headX < -120 ||
      headX > width + 120 ||
      headY < -120 ||
      headY > height + 120
    ) {
      continue
    }

    context.globalAlpha = star.alpha * clamp(inverseLerp(1, 0.1, depth), 0, 1)
    context.strokeStyle =
      depth > 0.55 ? SPACE_PALETTE.starBright : SPACE_PALETTE.starDim
    context.lineWidth = lerp(0.6, 2.4, 1 - depth)
    context.beginPath()
    context.moveTo(tailX, tailY)
    context.lineTo(headX, headY)
    context.stroke()
  }

  context.globalAlpha = 1
}

export function drawSpaceSky(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number
) {
  const sky = context.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, SPACE_PALETTE.deeper)
  sky.addColorStop(0.55, SPACE_PALETTE.deep)
  sky.addColorStop(1, SPACE_PALETTE.surface)
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)

  const drift = Math.sin(elapsed * 0.00008) * width * 0.08
  context.save()
  context.globalCompositeOperation = "lighter"
  drawNebula(
    context,
    width * 0.22 + drift,
    height * 0.28,
    height * 0.45,
    "rgba(120, 92, 220, 0.16)"
  )
  drawNebula(
    context,
    width * 0.8 - drift,
    height * 0.6,
    height * 0.4,
    "rgba(70, 170, 235, 0.14)"
  )
  context.restore()
}

function drawNebula(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
  context.fillStyle = gradient
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
}
