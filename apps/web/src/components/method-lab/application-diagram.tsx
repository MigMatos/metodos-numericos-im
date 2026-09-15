import { useRef } from "react"

import { CHART_COLORS } from "@/components/charts/chart-palette"
import { LABEL_FONT } from "@/components/charts/chart-primitives"
import { useAnimatedCanvas } from "@/hooks/use-animated-canvas"
import { formatCompact } from "@/lib/numerical/format"
import { getApplication } from "@/lib/numerical/method-applications"
import { approximationOf, chartDomain } from "@/lib/numerical/method-visuals"
import type { MethodOutcome } from "@/lib/numerical/method-runner"
import type {
  AnyIteration,
  MethodId,
  NewtonIteration,
  PuntoFijoIteration,
  ReglaFalsaIteration,
  SecanteIteration,
} from "@/lib/numerical/types"
import { createScale } from "@/lib/plot"

const SMOOTHING = 0.09
const MONO_FONT = "13px ui-monospace, 'Cascadia Mono', 'Consolas', monospace"

type Frame = {
  context: CanvasRenderingContext2D
  width: number
  height: number
  elapsed: number
  value: number
  settled: boolean
  showNumbers: boolean
  evaluate: (x: number) => number
}

type ApplicationDiagramProps = {
  methodId: MethodId
  outcome: MethodOutcome
  currentIndex: number
  showNumbers?: boolean
}

export function ApplicationDiagram({
  methodId,
  outcome,
  currentIndex,
  showNumbers = true,
}: ApplicationDiagramProps) {
  const animationRef = useRef({ value: Number.NaN })

  const canvasRef = useAnimatedCanvas(({ context, width, height, elapsed }) => {
    const iteration = outcome.iterations[currentIndex]
    const target = iteration
      ? approximationOf(methodId, iteration)
      : outcome.root
    const state = animationRef.current

    if (!Number.isFinite(state.value)) {
      state.value = target
    }

    state.value += (target - state.value) * SMOOTHING

    if (Math.abs(target - state.value) < 1e-9) {
      state.value = target
    }

    const settled =
      outcome.status === "converged" &&
      currentIndex === outcome.iterations.length - 1
    const domain = chartDomain(outcome)

    context.clearRect(0, 0, width, height)
    drawBackdrop(context, width, height)

    const frame: Frame = {
      context,
      width,
      height,
      elapsed,
      value: state.value,
      settled,
      showNumbers,
      evaluate: outcome.inputs.functionExpression.evaluate,
    }

    drawDemoNote(frame)

    const kind = getApplication(methodId).kind

    if (kind === "balance") {
      drawBalance(frame, domain, outcome.root, iteration)
      return
    }

    if (kind === "spring") {
      drawSpringBench(frame, domain, outcome.root, iteration)
      return
    }

    if (kind === "calibration") {
      drawCalibration(frame, domain, outcome.root, iteration)
      return
    }

    drawFeedback(frame, domain, outcome.root, iteration)
  })

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl border border-border/60 bg-space-deep/70 sm:h-80">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}

function drawBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  context.save()
  context.strokeStyle = CHART_COLORS.grid
  context.lineWidth = 1
  context.beginPath()

  for (let x = 0; x <= width; x += 32) {
    context.moveTo(x, 0)
    context.lineTo(x, height)
  }

  for (let y = 0; y <= height; y += 32) {
    context.moveTo(0, y)
    context.lineTo(width, y)
  }

  context.stroke()
  context.restore()
}

function drawRuler(
  frame: Frame,
  domain: readonly [number, number],
  options: { y: number; root: number; unitLabel: string }
) {
  const { context, width, settled, value } = frame
  const { y, root, unitLabel } = options
  const left = 24
  const right = Math.max(width - 24, left + 40)
  const rulerScale = createScale(domain, [left, right] as const)

  context.save()
  context.strokeStyle = CHART_COLORS.axis
  context.lineWidth = 1.4
  context.beginPath()
  context.moveTo(left, y)
  context.lineTo(right, y)
  context.stroke()

  const step = (domain[1] - domain[0]) / 10

  for (let index = 0; index <= 10; index += 1) {
    const x = rulerScale.toPixel(domain[0] + step * index)
    const tall = index % 5 === 0

    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x, y + (tall ? 8 : 4))
    context.stroke()
  }

  context.strokeStyle = CHART_COLORS.accent
  context.setLineDash([5, 4])
  context.beginPath()
  context.moveTo(rulerScale.toPixel(root), y - 12)
  context.lineTo(rulerScale.toPixel(root), y + 12)
  context.stroke()

  context.setLineDash([])
  context.strokeStyle = settled ? CHART_COLORS.curve : CHART_COLORS.accent
  context.beginPath()
  context.moveTo(rulerScale.toPixel(value), y - 18)
  context.lineTo(rulerScale.toPixel(value), y + 16)
  context.stroke()

  drawTag(
    frame,
    rulerScale.toPixel(value),
    y - 34,
    `${formatCompact(value, 4)} ${unitLabel}`,
    settled ? CHART_COLORS.curve : CHART_COLORS.accent
  )
  context.restore()
}

function drawTag(
  frame: Frame,
  centerX: number,
  centerY: number,
  text: string,
  color: string
) {
  if (!frame.showNumbers) {
    return
  }

  const { context } = frame

  context.save()
  context.font = MONO_FONT
  const padding = 6
  const boxWidth = context.measureText(text).width + padding * 2
  const boxHeight = 20
  const pixelRatio = context.getTransform().a || 1
  const cssWidth = context.canvas.width / pixelRatio
  const left = Math.min(
    Math.max(centerX - boxWidth / 2, 4),
    Math.max(cssWidth - boxWidth - 4, 4)
  )

  context.fillStyle = "rgba(6, 10, 20, 0.86)"
  context.fillRect(left, centerY - boxHeight / 2, boxWidth, boxHeight)
  context.strokeStyle = color
  context.lineWidth = 1
  context.strokeRect(left, centerY - boxHeight / 2, boxWidth, boxHeight)
  context.fillStyle = color
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(text, left + boxWidth / 2, centerY + 0.5)
  context.restore()
}

function drawCaption(
  frame: Frame,
  x: number,
  y: number,
  text: string,
  options: { color?: string; align?: CanvasTextAlign } = {}
) {
  if (!frame.showNumbers) {
    return
  }

  const { context } = frame

  context.save()
  context.font = LABEL_FONT
  context.fillStyle = options.color ?? CHART_COLORS.text
  context.textAlign = options.align ?? "left"
  context.textBaseline = "middle"
  context.fillText(text, x, y)
  context.restore()
}

function drawDemoNote(frame: Frame) {
  if (frame.showNumbers) {
    return
  }

  const { context, width } = frame

  context.save()
  context.font = MONO_FONT
  context.fillStyle = CHART_COLORS.faded
  context.fillRect(0, 14, width, 34)
  context.fillStyle = CHART_COLORS.text
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(
    "DEMOSTRACIÓN DEL BANCO · PRESIONA CALCULAR PARA ANIMAR CON TUS DATOS",
    width / 2,
    31
  )
  context.restore()
}

function drawFloor(
  context: CanvasRenderingContext2D,
  width: number,
  floorY: number
) {
  context.save()
  context.strokeStyle = CHART_COLORS.axis
  context.lineWidth = 1.4
  context.beginPath()
  context.moveTo(0, floorY)
  context.lineTo(width, floorY)
  context.stroke()

  context.strokeStyle = CHART_COLORS.grid
  context.lineWidth = 1
  context.beginPath()

  for (let x = 6; x < width; x += 18) {
    context.moveTo(x, floorY)
    context.lineTo(x - 8, floorY + 10)
  }

  context.stroke()
  context.restore()
}

function drawBalance(
  frame: Frame,
  domain: readonly [number, number],
  root: number,
  iteration: AnyIteration | undefined
) {
  const { context, width, height, value, settled, evaluate } = frame
  const row = iteration as ReglaFalsaIteration | undefined
  const floorY = height - 26
  const pivotX = width / 2
  const pivotY = height * 0.4
  const halfBeam = Math.min(width * 0.34, 190)
  const beamScale = createScale(domain, [-halfBeam, halfBeam] as const)
  const reference = Math.max(
    Math.abs(row?.fa ?? 1),
    Math.abs(row?.fb ?? 1),
    1e-6
  )
  const imbalance = evaluate(value)
  const tilt = Math.max(-1, Math.min(1, imbalance / reference)) * 0.2

  drawFloor(context, width, floorY)

  context.save()
  context.fillStyle = "rgba(167, 139, 250, 0.24)"
  context.strokeStyle = CHART_COLORS.secondary
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(pivotX, pivotY + 8)
  context.lineTo(pivotX - 22, floorY)
  context.lineTo(pivotX + 22, floorY)
  context.closePath()
  context.fill()
  context.stroke()
  context.restore()

  context.save()
  context.translate(pivotX, pivotY)
  context.rotate(tilt)

  context.strokeStyle = CHART_COLORS.text
  context.lineWidth = 7
  context.lineCap = "round"
  context.beginPath()
  context.moveTo(-halfBeam, 0)
  context.lineTo(halfBeam, 0)
  context.stroke()

  const leftHeight = 16 + Math.min(Math.abs(row?.fa ?? 8), 40) * 0.9
  context.fillStyle = "rgba(255, 209, 102, 0.5)"
  context.strokeStyle = CHART_COLORS.accent
  context.lineWidth = 1.2
  context.fillRect(-halfBeam - 14, 0, 28, leftHeight)
  context.strokeRect(-halfBeam - 14, 0, 28, leftHeight)

  const carriageX = beamScale.toPixel(value)
  const accent = settled ? CHART_COLORS.curve : CHART_COLORS.accent
  context.fillStyle = settled
    ? "rgba(111, 211, 255, 0.55)"
    : "rgba(255, 209, 102, 0.45)"
  context.strokeStyle = accent
  context.fillRect(carriageX - 13, 0, 26, 24)
  context.strokeRect(carriageX - 13, 0, 26, 24)
  context.restore()

  drawTag(
    frame,
    pivotX - halfBeam - 6,
    pivotY + leftHeight + 22,
    `carga f(a) = ${formatCompact(row?.fa ?? 0, 4)}`,
    CHART_COLORS.accent
  )

  drawTag(
    frame,
    pivotX + carriageX,
    pivotY + 46,
    `contrapeso x = ${formatCompact(value, 4)}`,
    accent
  )

  drawCaption(
    frame,
    16,
    18,
    `lectura del sensor  f(x) = ${formatCompact(imbalance, 4)}`,
    { color: settled ? CHART_COLORS.curve : CHART_COLORS.accent }
  )

  drawCaption(
    frame,
    width - 16,
    18,
    settled ? "VIGA NIVELADA" : "VIGA DESNIVELADA",
    {
      color: settled ? CHART_COLORS.curve : CHART_COLORS.accent,
      align: "right",
    }
  )

  drawRuler(frame, domain, { y: height - 6, root, unitLabel: "m" })
}

function drawSpringCoil(
  context: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  y: number,
  amplitude: number
) {
  const span = Math.max(endX - startX, 12)
  const coils = 9
  const step = span / (coils * 2)

  context.beginPath()
  context.moveTo(startX, y)

  for (let index = 0; index < coils * 2; index += 1) {
    const x = startX + step * (index + 0.5)
    context.lineTo(x, y + (index % 2 === 0 ? -amplitude : amplitude))
  }

  context.lineTo(endX, y)
  context.stroke()
}

function drawSpringBench(
  frame: Frame,
  domain: readonly [number, number],
  root: number,
  iteration: AnyIteration | undefined
) {
  const { context, width, height, value, settled, evaluate, elapsed } = frame
  const row = iteration as NewtonIteration | undefined
  const floorY = height - 26
  const axisY = height * 0.4
  const wallX = 30
  const railScale = createScale(domain, [wallX + 48, width - 46] as const)
  const carriageX = railScale.toPixel(value)
  const deviation = evaluate(value)
  const reference = Math.max(Math.abs(row?.fxn ?? 1), 1e-6)
  const relative = Math.min(Math.abs(deviation) / reference, 1)
  const forceLength = 20 + relative * 76
  const accent = settled ? CHART_COLORS.curve : CHART_COLORS.accent
  const pulse = 0.35 + 0.3 * Math.sin(elapsed * 0.004)

  drawFloor(context, width, floorY)

  context.save()

  context.strokeStyle = CHART_COLORS.axis
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(wallX, floorY)
  context.lineTo(width - 16, floorY)
  context.stroke()

  context.fillStyle = "rgba(148, 178, 214, 0.16)"
  context.strokeStyle = CHART_COLORS.faded
  context.lineWidth = 1.2
  context.fillRect(10, height * 0.22, 20, floorY - height * 0.22)
  context.strokeRect(10, height * 0.22, 20, floorY - height * 0.22)

  context.strokeStyle = settled ? CHART_COLORS.curve : CHART_COLORS.secondary
  context.lineWidth = 2.4
  drawSpringCoil(context, wallX, carriageX - 18, axisY, 15)

  context.fillStyle = "rgba(18, 23, 40, 0.95)"
  context.strokeStyle = CHART_COLORS.text
  context.lineWidth = 1.4
  context.fillRect(carriageX - 18, axisY - 28, 34, 56)
  context.strokeRect(carriageX - 18, axisY - 28, 34, 56)

  context.fillStyle = `rgba(255, 209, 102, ${pulse})`
  context.strokeStyle = CHART_COLORS.accent
  context.fillRect(carriageX + 20, axisY - 13, 24, 26)
  context.strokeRect(carriageX + 20, axisY - 13, 24, 26)

  const arrowY = axisY + 62
  context.strokeStyle = accent
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(carriageX, arrowY)
  context.lineTo(carriageX + forceLength, arrowY)
  context.stroke()
  context.beginPath()
  context.moveTo(carriageX + forceLength + 9, arrowY)
  context.lineTo(carriageX + forceLength, arrowY - 6)
  context.lineTo(carriageX + forceLength, arrowY + 6)
  context.closePath()
  context.fillStyle = accent
  context.fill()
  context.restore()

  drawCaption(
    frame,
    16,
    18,
    `desviación f(x) = ${formatCompact(deviation, 4)}`,
    { color: accent }
  )

  drawCaption(
    frame,
    width - 16,
    18,
    `rigidez f'(x) = ${formatCompact(row?.dfxn ?? 0, 4)}`,
    { color: CHART_COLORS.text, align: "right" }
  )

  drawTag(
    frame,
    carriageX + 32,
    axisY + 44,
    `corrección ${formatCompact(forceLength, 0)} → ${formatCompact(value, 4)}`,
    accent
  )

  drawCaption(
    frame,
    carriageX,
    axisY - 44,
    settled ? "PRECARGA CORRECTA" : "AJUSTANDO CARRERA",
    { color: accent, align: "center" }
  )

  drawRuler(frame, domain, { y: height - 6, root, unitLabel: "mm" })
}

function drawCalibration(
  frame: Frame,
  domain: readonly [number, number],
  root: number,
  iteration: AnyIteration | undefined
) {
  const { context, width, height, value, settled } = frame
  const row = iteration as SecanteIteration | undefined
  const zeroY = height * 0.44
  const postScale = createScale(domain, [46, width - 46] as const)
  const maxReading = Math.max(
    Math.abs(row?.fPrevious ?? 1),
    Math.abs(row?.fCurrent ?? 1),
    1e-6
  )
  const postHeight = height * 0.24
  const accent = settled ? CHART_COLORS.curve : CHART_COLORS.accent

  context.save()

  context.strokeStyle = CHART_COLORS.axis
  context.lineWidth = 1.4
  context.beginPath()
  context.moveTo(20, zeroY)
  context.lineTo(width - 20, zeroY)
  context.stroke()

  drawCaption(frame, 22, zeroY - 12, "lectura cero del sensor", {
    color: CHART_COLORS.faded,
  })

  const posts = [
    { x: row?.previous ?? domain[0], y: row?.fPrevious ?? 0 },
    { x: row?.current ?? domain[1], y: row?.fCurrent ?? 0 },
  ].map((post) => ({
    pixelX: postScale.toPixel(post.x),
    pixelY: zeroY - (post.y / maxReading) * postHeight,
    reading: post.y,
    position: post.x,
  }))

  for (const post of posts) {
    context.strokeStyle = CHART_COLORS.marker
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(post.pixelX, zeroY)
    context.lineTo(post.pixelX, post.pixelY)
    context.stroke()

    context.fillStyle = CHART_COLORS.marker
    context.beginPath()
    context.arc(post.pixelX, post.pixelY, 5, 0, Math.PI * 2)
    context.fill()
  }

  const [first, second] = posts

  if (first && second && second.pixelX !== first.pixelX) {
    const slope =
      (second.pixelY - first.pixelY) / (second.pixelX - first.pixelX)
    const leftY = first.pixelY + slope * (20 - first.pixelX)
    const rightY = first.pixelY + slope * (width - 20 - first.pixelX)

    context.strokeStyle = CHART_COLORS.secondary
    context.lineWidth = 2.4
    context.beginPath()
    context.moveTo(20, leftY)
    context.lineTo(width - 20, rightY)
    context.stroke()
  }

  const markerX = postScale.toPixel(value)

  context.strokeStyle = accent
  context.lineWidth = 1.4
  context.setLineDash([5, 4])
  context.beginPath()
  context.moveTo(markerX, zeroY)
  context.lineTo(markerX, height - 34)
  context.stroke()
  context.setLineDash([])
  context.beginPath()
  context.arc(markerX, zeroY, 7, 0, Math.PI * 2)
  context.stroke()

  context.restore()

  drawTag(
    frame,
    posts[0]?.pixelX ?? 46,
    (posts[0]?.pixelY ?? zeroY) - 22,
    `xn-1 = ${formatCompact(posts[0]?.position ?? 0, 4)} · f = ${formatCompact(posts[0]?.reading ?? 0, 4)}`,
    CHART_COLORS.marker
  )

  drawTag(
    frame,
    posts[1]?.pixelX ?? width - 46,
    (posts[1]?.pixelY ?? zeroY) - 22,
    `xn = ${formatCompact(posts[1]?.position ?? 0, 4)} · f = ${formatCompact(posts[1]?.reading ?? 0, 4)}`,
    CHART_COLORS.marker
  )

  drawCaption(
    frame,
    width - 16,
    18,
    settled ? "SENSOR CALIBRADO" : "REGLA TENDIDA ENTRE DOS LECTURAS",
    { color: accent, align: "right" }
  )

  drawRuler(frame, domain, { y: height - 18, root, unitLabel: "m" })
}

function drawFeedback(
  frame: Frame,
  domain: readonly [number, number],
  root: number,
  iteration: AnyIteration | undefined
) {
  const { context, width, height, value, settled, evaluate, elapsed } = frame
  const row = iteration as PuntoFijoIteration | undefined
  const span = Math.max(domain[1] - domain[0], Number.EPSILON)
  const ratio = Math.max(0, Math.min(1, (value - domain[0]) / span))
  const rootRatio = Math.max(0, Math.min(1, (root - domain[0]) / span))
  const tankLeft = Math.max(width * 0.22, 60)
  const tankRight = Math.min(width * 0.66, width - 96)
  const tankTop = height * 0.2
  const tankBottom = height - 44
  const levelY = tankBottom - (tankBottom - tankTop) * ratio
  const rootY = tankBottom - (tankBottom - tankTop) * rootRatio
  const accent = settled ? CHART_COLORS.curve : CHART_COLORS.accent
  const loopX = Math.min(width - 26, tankRight + 54)

  context.save()

  context.fillStyle = "rgba(111, 211, 255, 0.18)"
  context.beginPath()
  context.moveTo(tankLeft, levelY)

  for (let x = tankLeft; x <= tankRight; x += 8) {
    const wave =
      Math.sin(x * 0.05 + elapsed * 0.003) * 3 +
      Math.sin(x * 0.017 - elapsed * 0.002) * 2
    context.lineTo(x, levelY + wave)
  }

  context.lineTo(tankRight, tankBottom)
  context.lineTo(tankLeft, tankBottom)
  context.closePath()
  context.fill()

  context.strokeStyle = accent
  context.lineWidth = 1.4
  context.setLineDash([6, 5])
  context.beginPath()
  context.moveTo(tankLeft, rootY)
  context.lineTo(tankRight, rootY)
  context.stroke()
  context.setLineDash([])

  context.strokeStyle = CHART_COLORS.marker
  context.lineWidth = 2.6
  context.strokeRect(
    tankLeft,
    tankTop,
    tankRight - tankLeft,
    tankBottom - tankTop
  )

  context.strokeStyle = CHART_COLORS.faded
  context.lineWidth = 6
  context.lineCap = "round"
  context.setLineDash([10, 9])
  context.lineDashOffset = -elapsed * 0.08
  context.beginPath()
  context.moveTo(tankRight, tankBottom - 14)
  context.lineTo(loopX, tankBottom - 14)
  context.lineTo(loopX, tankTop + 14)
  context.lineTo(tankRight, tankTop + 14)
  context.stroke()
  context.setLineDash([])
  context.lineDashOffset = 0

  const pumpX = loopX
  const pumpY = (tankTop + tankBottom) / 2
  context.fillStyle = "rgba(18, 23, 40, 0.95)"
  context.strokeStyle = CHART_COLORS.secondary
  context.lineWidth = 2
  context.beginPath()
  context.arc(pumpX, pumpY, 17, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.save()
  context.translate(pumpX, pumpY)
  context.rotate(elapsed * 0.006)
  context.strokeStyle = CHART_COLORS.secondary
  context.lineWidth = 2.4
  context.beginPath()

  for (let blade = 0; blade < 3; blade += 1) {
    const angle = (blade * Math.PI * 2) / 3
    context.moveTo(0, 0)
    context.lineTo(Math.cos(angle) * 11, Math.sin(angle) * 11)
  }

  context.stroke()
  context.restore()

  const barX = tankLeft - 30
  const barTop = tankTop
  const barBottom = tankBottom

  context.strokeStyle = CHART_COLORS.axis
  context.lineWidth = 1.2
  context.strokeRect(barX - 8, barTop, 16, barBottom - barTop)
  context.fillStyle = settled
    ? "rgba(111, 211, 255, 0.4)"
    : "rgba(255, 209, 102, 0.35)"
  context.fillRect(barX - 6, levelY, 12, Math.max(barBottom - levelY, 0))
  context.strokeStyle = accent
  context.lineWidth = 1.4
  context.beginPath()
  context.moveTo(barX - 10, rootY)
  context.lineTo(barX + 10, rootY)
  context.stroke()
  context.restore()

  drawCaption(
    frame,
    16,
    18,
    `salida del tanque x = ${formatCompact(value, 4)}`,
    {
      color: accent,
    }
  )

  drawCaption(
    frame,
    width - 16,
    18,
    `retorno g(x) = ${formatCompact(evaluate(value), 4)}`,
    { color: CHART_COLORS.text, align: "right" }
  )

  drawTag(
    frame,
    (tankLeft + tankRight) / 2,
    height - 22,
    `${row?.iteration ?? 1} iteración · lazo ${settled ? "estable" : "ajustando"}`,
    accent
  )

  drawCaption(
    frame,
    (tankLeft + tankRight) / 2,
    tankTop - 16,
    `objetivo x = ${formatCompact(root, 4)} mol/L`,
    { color: CHART_COLORS.accent, align: "center" }
  )
}
