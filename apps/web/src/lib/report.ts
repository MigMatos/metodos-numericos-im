import type { MethodOutcome } from "./numerical/method-runner"
import { buildReportHtml } from "./report-html"

const PRINT_FRAME_LIFETIME = 60000

function harvestChartImage() {
  const canvas = document.querySelector<HTMLCanvasElement>(
    "[data-report-chart] canvas"
  )

  if (!canvas) {
    return null
  }

  try {
    return canvas.toDataURL("image/png")
  } catch {
    return null
  }
}

export function generateReport(outcome: MethodOutcome) {
  const html = buildReportHtml(outcome, harvestChartImage())
  const frame = document.createElement("iframe")

  frame.setAttribute("title", `Reporte ${outcome.config.reportFileName}`)
  frame.style.position = "fixed"
  frame.style.width = "0"
  frame.style.height = "0"
  frame.style.border = "0"
  frame.style.opacity = "0"
  document.body.append(frame)

  const frameDocument = frame.contentDocument
  const frameWindow = frame.contentWindow

  if (!frameDocument || !frameWindow) {
    frame.remove()
    return false
  }

  frameDocument.open()
  frameDocument.write(html)
  frameDocument.close()

  const printFrame = () => {
    frameWindow.focus()
    frameWindow.print()
  }

  // El diálogo de impresión debe esperar a que la gráfica esté decodificada,
  // si no la imagen sale vacía en el PDF.
  const image = frameDocument.querySelector("img")

  if (image && !image.complete) {
    image.addEventListener("load", printFrame, { once: true })
    image.addEventListener("error", printFrame, { once: true })
  } else {
    window.setTimeout(printFrame, 150)
  }

  window.setTimeout(() => {
    frame.remove()
  }, PRINT_FRAME_LIFETIME)

  return true
}
