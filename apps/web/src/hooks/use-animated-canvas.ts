import { useEffect, useRef } from "react"

export type CanvasFrame = {
  context: CanvasRenderingContext2D
  width: number
  height: number
  elapsed: number
  delta: number
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
const MAX_PIXEL_RATIO = 2

type CanvasOptions = {
  animated?: boolean
}

export function useAnimatedCanvas(
  draw: (frame: CanvasFrame) => void,
  options: CanvasOptions = {}
) {
  const { animated = true } = options
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawRef = useRef(draw)

  useEffect(() => {
    drawRef.current = draw
  })

  useEffect(() => {
    if (animated) {
      return
    }

    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")

    if (!canvas || !context) {
      return
    }

    const bounds = canvas.getBoundingClientRect()

    drawRef.current({
      context,
      width: Math.max(bounds.width, 1),
      height: Math.max(bounds.height, 1),
      elapsed: 0,
      delta: 16,
    })
  }, [animated, draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    let width = 0
    let height = 0
    let animationFrame = 0
    let startTime = 0
    let previousTime = 0

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      const bounds = canvas.getBoundingClientRect()

      width = Math.max(bounds.width, 1)
      height = Math.max(bounds.height, 1)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const render = (time: number) => {
      if (startTime === 0) {
        startTime = time
      }

      const delta = previousTime === 0 ? 16 : time - previousTime
      previousTime = time

      drawRef.current({
        context,
        width,
        height,
        elapsed: time - startTime,
        delta: Math.min(delta, 48),
      })

      animationFrame = requestAnimationFrame(render)
    }

    resize()

    const observer = new ResizeObserver(() => {
      resize()
    })
    observer.observe(canvas)

    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
    if (prefersReducedMotion) {
      drawRef.current({ context, width, height, elapsed: 0, delta: 16 })
    } else {
      animationFrame = requestAnimationFrame(render)
    }

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [])

  return canvasRef
}
