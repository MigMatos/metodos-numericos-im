import { useEffect, useRef } from "react"

import { Button } from "@workspace/ui/components/button"

import { useAnimatedCanvas } from "@/hooks/use-animated-canvas"
import {
  easeInOutCubic,
  easeOutCubic,
  inverseLerp,
  lerp,
} from "@/lib/scene-math"

import { createLandmasses, drawEarth, type Landmass } from "./earth-render"
import { createMoonCraters, drawMoon, type MoonCrater } from "./moon-render"
import { drawSceneFade, drawSceneProgress } from "./scene-fx"
import {
  createWarpStars,
  drawSpaceSky,
  drawWarpStars,
  type WarpStar,
} from "./warp-stars"

const WARP_DURATION = 3400
const CRATER_COUNT = 24
const ROTATION_SPEED = 0.000018
const SUN_ANGLE = Math.PI * 0.78

type SceneState = {
  stars: WarpStar[]
  craters: MoonCrater[]
  landmasses: Landmass[]
}

type WarpToEarthSequenceProps = {
  onArrive: () => void
}

function renderScene(
  context: CanvasRenderingContext2D,
  scene: SceneState,
  frame: { width: number; height: number; elapsed: number; delta: number },
  progress: number
) {
  const { width, height, elapsed, delta } = frame
  const compact = width < 768
  const restRadius = Math.min(width, height) * (compact ? 0.44 : 0.46)
  const restCenterX = compact ? width * 0.5 : width * 0.76
  const restCenterY = compact ? height * 0.3 : height * 0.5

  const speedPeak = Math.sin(Math.PI * inverseLerp(0.06, 0.68, progress))
  const starSpeed = 0.0014 + 0.0064 * speedPeak
  const cameraRotation = Math.sin(progress * Math.PI * 1.1) * 0.05

  context.save()
  context.translate(width / 2, height / 2)
  context.rotate(cameraRotation)
  context.translate(-width / 2, -height / 2)

  drawSpaceSky(context, width, height, elapsed)

  const moonProgress = inverseLerp(0, 0.46, progress)

  if (moonProgress < 1) {
    const moonRadius = height * lerp(1.3, 0.22, easeInOutCubic(moonProgress))
    const moonCenterY =
      height * lerp(0.5, 1.06, easeOutCubic(moonProgress)) + moonRadius

    context.save()
    context.globalAlpha = 1 - inverseLerp(0.28, 0.46, progress)
    drawMoon(context, {
      centerX: width / 2,
      centerY: moonCenterY,
      radius: moonRadius,
      craters: scene.craters,
    })
    context.restore()
  }

  drawWarpStars(context, scene.stars, {
    vanishingX: restCenterX,
    vanishingY: restCenterY,
    scale: Math.min(width, height) * 0.55,
    width,
    height,
    speed: starSpeed,
    delta,
  })

  const earthProgress = easeInOutCubic(inverseLerp(0.32, 1, progress))

  drawEarth(context, {
    centerX: lerp(width / 2, restCenterX, earthProgress),
    centerY: lerp(height * 0.5, restCenterY, earthProgress),
    radius: lerp(restRadius * 0.3, restRadius, earthProgress),
    rotation: elapsed * ROTATION_SPEED,
    sunAngle: SUN_ANGLE,
    landmasses: scene.landmasses,
  })

  context.restore()

  drawSceneFade(context, width, height, progress, 0.9)
  drawSceneProgress(context, { width, height, progress })
}

export function WarpToEarthSequence({ onArrive }: WarpToEarthSequenceProps) {
  const sceneRef = useRef<SceneState | null>(null)
  const onArriveRef = useRef(onArrive)
  const drawnRef = useRef(false)

  useEffect(() => {
    onArriveRef.current = onArrive
  })

  useEffect(() => {
    const timeout = window.setTimeout(
      () => onArriveRef.current(),
      WARP_DURATION
    )
    const fallback = window.setTimeout(() => {
      if (!drawnRef.current) {
        onArriveRef.current()
      }
    }, 1400)
    const handleKeyDown = () => onArriveRef.current()

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.clearTimeout(timeout)
      window.clearTimeout(fallback)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const canvasRef = useAnimatedCanvas((frame) => {
    sceneRef.current ??= {
      stars: createWarpStars(),
      craters: createMoonCraters(CRATER_COUNT),
      landmasses: createLandmasses(),
    }
    drawnRef.current = true

    renderScene(
      frame.context,
      sceneRef.current,
      {
        width: frame.width,
        height: frame.height,
        elapsed: frame.elapsed,
        delta: frame.delta,
      },
      Math.min(frame.elapsed / WARP_DURATION, 1)
    )
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
          variant="ghost"
          size="sm"
          onClick={() => onArriveRef.current()}
          className="border-space-cyan/40 bg-space-surface/70 text-[0.7rem] tracking-[0.2em] text-space-cyan backdrop-blur-md"
        >
          SALTAR SECUENCIA
        </Button>
      </div>
    </div>
  )
}
