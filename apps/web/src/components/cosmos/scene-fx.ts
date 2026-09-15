import { easeInCubic, inverseLerp } from "@/lib/scene-math"

import { SPACE_PALETTE } from "./space-palette"

export function drawSceneFade(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  from = 0.87
) {
  const fade = easeInCubic(inverseLerp(from, 1, progress))

  if (fade <= 0) {
    return
  }

  context.fillStyle = `rgba(${SPACE_PALETTE.shadow}, ${fade})`
  context.fillRect(0, 0, width, height)
}

export type SceneProgressOptions = {
  width: number
  height: number
  progress: number
}

export function drawSceneProgress(
  context: CanvasRenderingContext2D,
  options: SceneProgressOptions
) {
  const { width, height, progress } = options
  const barWidth = Math.min(width * 0.5, 420)
  const barX = (width - barWidth) / 2
  const barY = height - 62

  context.save()
  context.fillStyle = "rgba(234, 243, 255, 0.2)"
  context.fillRect(barX, barY, barWidth, 3)
  context.fillStyle = SPACE_PALETTE.cyan
  context.fillRect(barX, barY, Math.max(barWidth * progress, 5), 3)
  context.restore()
}
