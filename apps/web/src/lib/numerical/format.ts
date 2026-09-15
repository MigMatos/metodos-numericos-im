export function formatDecimal(value: number, digits = 6) {
  if (!Number.isFinite(value)) {
    return "—"
  }

  return value.toFixed(digits)
}

export function formatCompact(value: number, digits = 6) {
  if (!Number.isFinite(value)) {
    return "—"
  }

  if (value !== 0 && Math.abs(value) < 10 ** -digits) {
    return value.toExponential(4)
  }

  return value.toFixed(digits)
}

export function formatPercent(value: number | null, digits = 6) {
  if (value === null || !Number.isFinite(value)) {
    return "—"
  }

  return `${value.toFixed(digits)} %`
}

export function formatParameter(value: number) {
  if (!Number.isFinite(value)) {
    return "—"
  }

  return String(value)
}
