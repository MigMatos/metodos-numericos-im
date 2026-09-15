import { createSeededRandom } from "@/lib/scene-math"

export type Landmass = {
  longitude: number
  latitude: number
  size: number
  stretch: number
  darkness: number
}

const LANDMASS_COUNT = 22
const LANDMASS_SEED = 197001

export function createLandmasses(count = LANDMASS_COUNT): Landmass[] {
  const random = createSeededRandom(LANDMASS_SEED)

  return Array.from({ length: count }, () => ({
    longitude: random() * Math.PI * 2,
    latitude: (random() - 0.5) * 1.5,
    size: 0.14 + random() * 0.2,
    stretch: 0.6 + random() * 0.9,
    darkness: 0.75 + random() * 0.25,
  }))
}

export type EarthOptions = {
  centerX: number
  centerY: number
  radius: number
  rotation: number
  sunAngle: number
  landmasses: Landmass[]
}

export function drawEarth(
  context: CanvasRenderingContext2D,
  options: EarthOptions
) {
  const { centerX, centerY, radius, rotation, sunAngle, landmasses } = options

  if (radius < 2) {
    return
  }

  const sunX = Math.cos(sunAngle)
  const sunY = Math.sin(sunAngle)

  context.save()
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.clip()

  const ocean = context.createRadialGradient(
    centerX + sunX * radius * 0.55,
    centerY + sunY * radius * 0.55,
    radius * 0.04,
    centerX,
    centerY,
    radius * 1.18
  )
  ocean.addColorStop(0, "#3f9fe0")
  ocean.addColorStop(0.4, "#1663ab")
  ocean.addColorStop(0.76, "#0a2f64")
  ocean.addColorStop(1, "#05182f")
  context.fillStyle = ocean
  context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2)

  for (const land of landmasses) {
    const angle = land.longitude + rotation
    const cosLatitude = Math.cos(land.latitude)
    const depth = Math.cos(angle) * cosLatitude

    if (depth <= 0.08) {
      continue
    }

    const horizontal = Math.sin(angle) * cosLatitude
    const screenX = centerX + horizontal * radius
    const screenY = centerY + Math.sin(land.latitude) * radius
    const perspective = 0.45 + 0.55 * depth
    const blobRadius = land.size * radius * perspective

    context.save()
    context.globalAlpha = 0.3 + 0.7 * depth
    const relief = context.createLinearGradient(
      screenX - blobRadius,
      screenY - blobRadius,
      screenX + blobRadius,
      screenY + blobRadius
    )
    relief.addColorStop(0, "#66b070")
    relief.addColorStop(0.55, "#3d8a52")
    relief.addColorStop(1, `rgba(26, 74, 44, ${land.darkness})`)
    context.fillStyle = relief
    context.beginPath()
    context.ellipse(
      screenX,
      screenY,
      blobRadius * land.stretch,
      blobRadius,
      horizontal * 0.6,
      0,
      Math.PI * 2
    )
    context.fill()
    context.restore()
  }

  const northCap = context.createLinearGradient(
    0,
    centerY - radius,
    0,
    centerY - radius * 0.52
  )
  northCap.addColorStop(0, "rgba(240, 248, 255, 0.9)")
  northCap.addColorStop(1, "rgba(240, 248, 255, 0)")
  context.fillStyle = northCap
  context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 0.5)

  const southCap = context.createLinearGradient(
    0,
    centerY + radius,
    0,
    centerY + radius * 0.58
  )
  southCap.addColorStop(0, "rgba(240, 248, 255, 0.85)")
  southCap.addColorStop(1, "rgba(240, 248, 255, 0)")
  context.fillStyle = southCap
  context.fillRect(
    centerX - radius,
    centerY + radius * 0.5,
    radius * 2,
    radius * 0.5
  )

  const night = context.createLinearGradient(
    centerX + sunX * radius,
    centerY + sunY * radius,
    centerX - sunX * radius,
    centerY - sunY * radius
  )
  night.addColorStop(0, "rgba(255, 246, 226, 0.12)")
  night.addColorStop(0.4, "rgba(5, 10, 22, 0)")
  night.addColorStop(0.72, "rgba(4, 7, 18, 0.62)")
  night.addColorStop(1, "rgba(2, 4, 12, 0.93)")
  context.fillStyle = night
  context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2)
  context.restore()

  context.save()
  context.globalCompositeOperation = "lighter"
  const atmosphere = context.createRadialGradient(
    centerX,
    centerY,
    radius * 0.95,
    centerX,
    centerY,
    radius * 1.16
  )
  atmosphere.addColorStop(0, "rgba(130, 205, 255, 0.3)")
  atmosphere.addColorStop(0.4, "rgba(90, 165, 255, 0.14)")
  atmosphere.addColorStop(1, "rgba(60, 130, 230, 0)")
  context.fillStyle = atmosphere
  context.beginPath()
  context.arc(centerX, centerY, radius * 1.16, 0, Math.PI * 2)
  context.fill()
  context.restore()

  context.save()
  context.strokeStyle = "rgba(190, 235, 255, 0.55)"
  context.lineWidth = Math.max(radius * 0.006, 1)
  context.beginPath()
  context.arc(centerX, centerY, radius, sunAngle - 1.15, sunAngle + 1.15)
  context.stroke()
  context.restore()
}
