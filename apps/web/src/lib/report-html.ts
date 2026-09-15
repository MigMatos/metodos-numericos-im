import {
  describeConvergence,
  errorSeries,
  firstError,
} from "./numerical/analysis"
import { formatCompact, formatPercent } from "./numerical/format"
import {
  describeApplication,
  getApplication,
} from "./numerical/method-applications"
import { cellText } from "./numerical/method-visuals"
import type { MethodOutcome } from "./numerical/method-runner"
import { SITE_CONFIG } from "./site-config"

const AUTHOR = SITE_CONFIG.student
const SUBJECT = SITE_CONFIG.subject
const CAREER = SITE_CONFIG.career

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function buildReportHtml(
  outcome: MethodOutcome,
  chartImage: string | null
) {
  const {
    config,
    inputs,
    iterations,
    tolerance,
    finalError,
    finalErrorPercent,
  } = outcome
  const convergence = describeConvergence(config.name, outcome)
  const application = getApplication(config.id)
  const series = errorSeries(iterations)
  const converged = outcome.status === "converged"

  const parameters: { label: string; value: string }[] = [
    { label: "f(x)", value: inputs.functionExpression.source },
    { label: "Tolerancia", value: formatCompact(tolerance, 6) },
    { label: "Máximo de iteraciones", value: String(inputs.maxIterations) },
  ]

  if (inputs.derivativeExpression) {
    parameters.splice(1, 0, {
      label: "f'(x)",
      value: inputs.derivativeExpression.source,
    })
  }

  if (config.id === "regla-falsa") {
    parameters.splice(1, 0, { label: "a", value: formatCompact(inputs.a, 6) })
    parameters.splice(2, 0, { label: "b", value: formatCompact(inputs.b, 6) })
  }

  if (config.id === "newton-raphson" || config.id === "punto-fijo") {
    parameters.splice(1, 0, { label: "x0", value: formatCompact(inputs.x0, 6) })
  }

  if (config.id === "secante") {
    parameters.splice(1, 0, { label: "x0", value: formatCompact(inputs.x0, 6) })
    parameters.splice(2, 0, { label: "x1", value: formatCompact(inputs.x1, 6) })
  }

  const tableHead = config.columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("")

  const tableRows = iterations
    .map(
      (iteration) =>
        `<tr>${config.columns
          .map(
            (column) => `<td>${escapeHtml(cellText(iteration, column))}</td>`
          )
          .join("")}</tr>`
    )
    .join("")

  const conclusion = converged
    ? `Con ${iterations.length} iteraciones, ${config.name} cumplió la tolerancia ${formatCompact(tolerance, 6)}. La raíz aproximada de ${inputs.functionExpression.source} es ${formatCompact(outcome.root, 6)}, con un error absoluto final de ${formatCompact(finalError, 6)} y un error porcentual de ${formatPercent(finalErrorPercent)}.`
    : `Con ${iterations.length} iteraciones, ${config.name} no alcanzó la tolerancia ${formatCompact(tolerance, 6)}. La última aproximación fue ${formatCompact(outcome.root, 6)} con un error de ${formatCompact(finalError, 6)}; conviene ajustar los datos iniciales o revisar la función.`

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(config.reportFileName)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #10131a; margin: 0; font-size: 11.5px; line-height: 1.5; }
  h1 { font-size: 20px; margin: 0 0 4px; letter-spacing: 0.08em; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #c9ced9; }
  .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px 18px; margin-top: 8px; }
  .meta span { color: #55607a; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px; }
  .item { border: 1px solid #d7dbe4; border-radius: 6px; padding: 6px 8px; }
  .item b { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.14em; color: #55607a; }
  .item span { font-family: Consolas, monospace; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; font-family: Consolas, monospace; font-size: 9.5px; }
  th, td { border: 1px solid #d7dbe4; padding: 3px 4px; text-align: right; }
  th { background: #eef1f6; font-family: "Segoe UI", sans-serif; text-align: center; font-size: 9px; }
  tr { page-break-inside: avoid; }
  ol { margin: 0; padding-left: 18px; }
  img { width: 100%; border: 1px solid #d7dbe4; border-radius: 6px; }
  .status { font-weight: 600; }
  footer { margin-top: 20px; font-size: 10px; color: #55607a; }
</style>
</head>
<body>
<h1>${escapeHtml(SUBJECT)}</h1>
<div class="meta">
  <div><span>Autor:</span> ${escapeHtml(AUTHOR)}</div>
  <div><span>Materia:</span> ${escapeHtml(SUBJECT)}</div>
  <div><span>Carrera:</span> ${escapeHtml(CAREER)}</div>
  <div><span>Método:</span> ${escapeHtml(config.name)} (${escapeHtml(config.kind)})</div>
  <div><span>Fecha:</span> ${new Date().toLocaleString("es-MX")}</div>
</div>

<h2>Datos de entrada</h2>
<div class="grid">
${parameters
  .map(
    (parameter) =>
      `  <div class="item"><b>${escapeHtml(parameter.label)}</b><span>${escapeHtml(parameter.value)}</span></div>`
  )
  .join("\n")}
</div>

<h2>Fórmula y procedimiento</h2>
<p><b>${escapeHtml(config.formula)}</b></p>
<ol>${config.procedure.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
<h2>Resultado</h2>
<div class="grid">
  <div class="item"><b>Raíz aproximada</b><span>${escapeHtml(formatCompact(outcome.root, 6))}</span></div>
  <div class="item"><b>f(raíz)</b><span>${escapeHtml(formatCompact(outcome.functionValueAtRoot, 6))}</span></div>
  <div class="item"><b>Iteraciones</b><span>${iterations.length}</span></div>
  <div class="item"><b>Error absoluto final</b><span>${escapeHtml(formatCompact(finalError, 6))}</span></div>
  <div class="item"><b>Error porcentual final</b><span>${escapeHtml(formatPercent(finalErrorPercent))}</span></div>
  <div class="item"><b>Tolerancia</b><span>${escapeHtml(formatCompact(tolerance, 6))}</span></div>
</div>
<p class="status">Estado: ${escapeHtml((converged ? "CONVERGENCIA ALCANZADA" : convergence.state) + (converged ? "" : " · " + outcome.message))}</p>

<h2>Tabla completa de iteraciones</h2>
<table>
  <thead><tr>${tableHead}</tr></thead>
  <tbody>${tableRows}</tbody>
</table>

<h2>Gráfica</h2>
${chartImage ? '<img src="' + chartImage + '" alt="Gráfica del método" />' : "<p>La gráfica no está disponible en este reporte.</p>"}

<h2>Aplicación en la vida real</h2>
<p><b>${escapeHtml(application.title)}</b> · ${escapeHtml(application.instrument)}</p>
<p>${escapeHtml(application.scenario)}</p>
<p><b>${escapeHtml(application.quantity)}</b></p>
<p><b>${escapeHtml(application.goal)}</b></p>
<p>${escapeHtml(describeApplication(outcome, iterations.length - 1))}</p>

<h2>Análisis</h2>
<p>${escapeHtml(convergence.explanation)}</p>
<p>Error inicial: ${escapeHtml(formatCompact(firstError(series), 6))} · Error final: ${escapeHtml(formatCompact(finalError, 6))} · Iteraciones: ${iterations.length} · Tolerancia: ${escapeHtml(formatCompact(tolerance, 6))}</p>

<h2>Conclusión</h2>
<p>${escapeHtml(conclusion)}</p>

<footer>Reporte generado automáticamente por el laboratorio virtual de ${escapeHtml(SUBJECT)}.</footer>
</body>
</html>`
}
