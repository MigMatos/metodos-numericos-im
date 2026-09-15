import { useEffect, useRef } from "react"

import { Button } from "@workspace/ui/components/button"

import { useAnimatedCanvas } from "@/hooks/use-animated-canvas"
import {
  clamp,
  createSeededRandom,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  inverseLerp,
  lerp,
} from "@/lib/scene-math"

import { createMoonCraters, drawMoon, type MoonCrater } from "./moon-render"
import { drawSceneFade, drawSceneProgress } from "./scene-fx"
import { SPACE_PALETTE } from "./space-palette"
import {
  createWarpStars,
  drawSpaceSky,
  drawWarpStars,
  type WarpStar,
} from "./warp-stars"

const FLIGHT_DURATION = 4200
const MAX_DUST_PARTICLES = 420

type DustParticle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
}

type SceneState = {
  stars: WarpStar[]
  craters: MoonCrater[]
  dust: DustParticle[]
  dustBudget: number
  random: () => number
}

type SceneFrame = {
  width: number
  height: number
  elapsed: number
  delta: number
  progress: number
}

type LaunchSequenceProps = {
  onLanding: () => void
}

function createScene(): SceneState {
  return {
    stars: createWarpStars(),
    craters: createMoonCraters(),
    dust: [],
    dustBudget: 0,
    random: createSeededRandom(90210),
  }
}

function drawShip(
  context: CanvasRenderingContext2D,
  options: {
    x: number
    y: number
    scale: number
    alpha: number
    time: number
    thrust: number
  }
) {
  const { x, y, scale, alpha, time, thrust } = options

  if (alpha <= 0.01) {
    return
  }

  const flicker =
    0.78 + 0.22 * Math.sin(time * 0.02) + 0.08 * Math.sin(time * 0.083)

  context.save()
  context.globalAlpha = alpha
  context.translate(x, y)
  context.scale(scale, scale)

  const bloomRadius = 78 * thrust * flicker
  context.save()
  context.globalCompositeOperation = "lighter"
  const bloom = context.createRadialGradient(0, 32, 2, 0, 32, bloomRadius)
  bloom.addColorStop(0, "rgba(200, 244, 255, 0.8)")
  bloom.addColorStop(0.35, "rgba(110, 200, 255, 0.3)")
  bloom.addColorStop(1, "rgba(60, 130, 220, 0)")
  context.fillStyle = bloom
  context.beginPath()
  context.arc(0, 32, bloomRadius, 0, Math.PI * 2)
  context.fill()

  for (const offset of [-6.5, 6.5]) {
    const flameLength = (26 + 18 * flicker) * thrust
    const flame = context.createLinearGradient(0, 16, 0, 16 + flameLength)
    flame.addColorStop(0, "rgba(255, 255, 255, 0.95)")
    flame.addColorStop(0.35, "rgba(150, 225, 255, 0.7)")
    flame.addColorStop(1, "rgba(90, 160, 255, 0)")
    context.fillStyle = flame
    context.beginPath()
    context.moveTo(offset - 3.6, 16)
    context.lineTo(offset + 3.6, 16)
    context.lineTo(offset, 16 + flameLength)
    context.closePath()
    context.fill()
  }
  context.restore()

  const wing = context.createLinearGradient(-28, -18, 28, 20)
  wing.addColorStop(0, "#cfd8e8")
  wing.addColorStop(1, "#5d6779")
  context.fillStyle = wing
  context.beginPath()
  context.moveTo(-28, 6)
  context.lineTo(-9, -18)
  context.lineTo(-9, 14)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(28, 6)
  context.lineTo(9, -18)
  context.lineTo(9, 14)
  context.closePath()
  context.fill()

  const hull = context.createLinearGradient(-13, -28, 13, 20)
  hull.addColorStop(0, "#f2f5fb")
  hull.addColorStop(0.5, "#b9c3d4")
  hull.addColorStop(1, "#6e7889")
  context.fillStyle = hull
  context.beginPath()
  context.moveTo(-9, -28)
  context.lineTo(9, -28)
  context.lineTo(13, 16)
  context.lineTo(-13, 16)
  context.closePath()
  context.fill()

  context.strokeStyle = "rgba(180, 225, 255, 0.7)"
  context.lineWidth = 1.1
  context.beginPath()
  context.moveTo(-9, -28)
  context.lineTo(-13, 16)
  context.stroke()

  const glass = context.createLinearGradient(0, -23, 0, -6)
  glass.addColorStop(0, "rgba(215, 245, 255, 0.95)")
  glass.addColorStop(1, "rgba(85, 175, 235, 0.9)")
  context.fillStyle = glass
  context.beginPath()
  context.ellipse(0, -14, 5.6, 8.4, 0, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = "#39414f"
  context.fillRect(-9.5, 14, 6, 5)
  context.fillRect(3.5, 14, 6, 5)

  context.restore()
}

function updateDust(
  scene: SceneState,
  frame: SceneFrame,
  options: { surfaceY: number; centerX: number; progress: number }
) {
  const { width, height, delta, progress } = frame
  const { surfaceY, centerX } = options
  const intensity = inverseLerp(0.55, 0.95, progress)
  const seconds = delta / 1000
  const band = Math.max(height - surfaceY, 0)

  scene.dustBudget += seconds * intensity * 320

  while (scene.dustBudget >= 1) {
    scene.dustBudget -= 1

    if (scene.dust.length >= MAX_DUST_PARTICLES) {
      break
    }

    const x = centerX + (scene.random() - 0.5) * width * 0.9
    const life = 0.9 + scene.random() * 1.6

    scene.dust.push({
      x,
      y: surfaceY + scene.random() * band,
      vx: (x - centerX) * 0.35,
      vy: -(30 + scene.random() * 150) * (0.4 + intensity),
      size: 0.8 + scene.random() * 2.6,
      life,
      maxLife: life,
    })
  }

  for (let index = scene.dust.length - 1; index >= 0; index -= 1) {
    const particle = scene.dust[index]

    particle.x += particle.vx * seconds
    particle.y += particle.vy * seconds
    particle.vy -= 24 * seconds
    particle.vx *= 1 - 0.5 * seconds
    particle.life -= seconds

    if (particle.life <= 0) {
      scene.dust.splice(index, 1)
    }
  }
}

function drawDust(context: CanvasRenderingContext2D, dust: DustParticle[]) {
  context.fillStyle = SPACE_PALETTE.dust

  for (const particle of dust) {
    const fade = clamp(particle.life / particle.maxLife, 0, 1)

    context.globalAlpha = fade * 0.55
    context.beginPath()
    context.arc(
      particle.x,
      particle.y,
      particle.size * (0.6 + fade),
      0,
      Math.PI * 2
    )
    context.fill()
  }

  context.globalAlpha = 1
}

function drawLandingGlow(
  context: CanvasRenderingContext2D,
  options: { x: number; y: number; height: number; progress: number }
) {
  const { x, y, height, progress } = options
  const intensity = Math.sin(Math.PI * inverseLerp(0.72, 0.98, progress)) * 0.85

  if (intensity <= 0.01) {
    return
  }

  const radius = height * 0.42
  context.save()
  context.globalCompositeOperation = "lighter"
  const glow = context.createRadialGradient(x, y, 0, x, y, radius)
  glow.addColorStop(0, `rgba(220, 245, 255, ${0.5 * intensity})`)
  glow.addColorStop(0.35, `rgba(140, 210, 255, ${0.22 * intensity})`)
  glow.addColorStop(1, "rgba(80, 150, 230, 0)")
  context.fillStyle = glow
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function renderScene(
  context: CanvasRenderingContext2D,
  scene: SceneState,
  frame: SceneFrame
) {
  const { width, height, elapsed, delta, progress } = frame

  const speedFactor = lerp(
    0.35,
    1,
    easeInCubic(inverseLerp(0.06, 0.78, progress))
  )
  const starSpeed = 0.0012 + 0.0062 * speedFactor
  const moonApproach = easeInOutCubic(inverseLerp(0.12, 0.9, progress))
  const moonRadius = height * lerp(0.24, 1.34, easeInOutCubic(moonApproach))
  const limbY = height * lerp(0.88, 0.46, easeOutCubic(moonApproach))
  const moonCenterX = width / 2

  const shakeAmount = lerp(0.6, 5.5, speedFactor) + moonApproach * 1.8

  context.save()
  context.translate(
    Math.sin(elapsed * 0.021) * shakeAmount,
    Math.cos(elapsed * 0.017) * shakeAmount * 0.55
  )

  drawSpaceSky(context, width, height, elapsed)
  drawWarpStars(context, scene.stars, {
    vanishingX: moonCenterX,
    vanishingY: height * 0.3,
    scale: height * 0.5,
    width,
    height,
    speed: starSpeed,
    delta,
  })
  drawMoon(context, {
    centerX: moonCenterX,
    centerY: limbY + moonRadius,
    radius: moonRadius,
    craters: scene.craters,
  })
  drawShip(context, {
    x: width / 2 + Math.sin(elapsed * 0.0009) * width * 0.02,
    y: height * lerp(0.26, 0.46, easeInOutCubic(progress)),
    scale: lerp(0.8, 2.6, easeInOutCubic(inverseLerp(0.04, 0.86, progress))),
    alpha: inverseLerp(0, 0.03, progress),
    time: elapsed,
    thrust: lerp(0.55, 1.1, speedFactor),
  })
  updateDust(scene, frame, {
    surfaceY: limbY,
    centerX: moonCenterX,
    progress,
  })
  drawDust(context, scene.dust)
  drawLandingGlow(context, {
    x: moonCenterX,
    y: limbY + height * 0.06,
    height,
    progress,
  })

  context.restore()

  drawSceneFade(context, width, height, progress)
  drawSceneProgress(context, { width, height, progress })
}

export function LaunchSequence({ onLanding }: LaunchSequenceProps) {
  const sceneRef = useRef<SceneState | null>(null)
  const onLandingRef = useRef(onLanding)
  const drawnRef = useRef(false)

  useEffect(() => {
    onLandingRef.current = onLanding
  })

  useEffect(() => {
    const timeout = window.setTimeout(
      () => onLandingRef.current(),
      FLIGHT_DURATION
    )
    const fallback = window.setTimeout(() => {
      if (!drawnRef.current) {
        onLandingRef.current()
      }
    }, 1400)
    const handleKeyDown = () => onLandingRef.current()

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.clearTimeout(timeout)
      window.clearTimeout(fallback)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const canvasRef = useAnimatedCanvas((frame) => {
    sceneRef.current ??= createScene()
    drawnRef.current = true

    renderScene(frame.context, sceneRef.current, {
      width: frame.width,
      height: frame.height,
      elapsed: frame.elapsed,
      delta: frame.delta,
      progress: clamp(frame.elapsed / FLIGHT_DURATION, 0, 1),
    })
  })

  return (
    <div className="absolute inset-0 z-10">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full"
      />
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLandingRef.current()}
          className="border-space-cyan/40 bg-space-surface/70 text-[0.7rem] tracking-[0.2em] text-space-cyan backdrop-blur-md"
        >
          SALTAR SECUENCIA
        </Button>
      </div>
    </div>
  )
}
