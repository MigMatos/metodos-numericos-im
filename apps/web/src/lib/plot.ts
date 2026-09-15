export type Scale = {
  domain: readonly [number, number]
  range: readonly [number, number]
  toPixel: (value: number) => number
  toValue: (pixel: number) => number
}

export function createScale(
  domain: readonly [number, number],
  range: readonly [number, number]
): Scale {
  const [domainStart, domainEnd] = domain
  const [rangeStart, rangeEnd] = range
  const domainSpan = domainEnd - domainStart || 1
  const rangeSpan = rangeEnd - rangeStart || 1

  return {
    domain,
    range,
    toPixel: (value) =>
      rangeStart + ((value - domainStart) / domainSpan) * rangeSpan,
    toValue: (pixel) =>
      domainStart + ((pixel - rangeStart) / rangeSpan) * domainSpan,
  }
}

export function expandDomain(
  domain: readonly [number, number],
  padding = 0.08
): [number, number] {
  const span = domain[1] - domain[0] || 1
  return [domain[0] - span * padding, domain[1] + span * padding]
}

export function niceTicks(min: number, max: number, count = 6): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [min]
  }

  const span = max - min
  const roughStep = span / count
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / magnitude
  const stepMultiplier = normalized >= 5 ? 5 : normalized >= 2 ? 2 : 1
  const step = stepMultiplier * magnitude
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []

  for (let value = start; value <= max + step * 0.001; value += step) {
    ticks.push(Math.abs(value) < step * 0.001 ? 0 : value)
  }

  return ticks
}

export function logTicks(min: number, max: number): number[] {
  const start = Math.floor(Math.log10(Math.max(min, Number.MIN_VALUE)))
  const end = Math.ceil(Math.log10(Math.max(max, Number.MIN_VALUE)))
  const ticks: number[] = []

  for (let exponent = start; exponent <= end; exponent += 1) {
    ticks.push(10 ** exponent)
  }

  return ticks
}

export function finiteValues(values: number[]) {
  return values.filter((value) => Number.isFinite(value))
}

export function domainOf(
  values: number[],
  fallback: [number, number]
): [number, number] {
  const finite = finiteValues(values)

  if (finite.length === 0) {
    return fallback
  }

  let min = Math.min(...finite)
  let max = Math.max(...finite)

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return fallback
  }

  const limit = 1e6
  min = Math.max(min, -limit)
  max = Math.min(max, limit)

  if (min === max) {
    return [min - 1, max + 1]
  }

  return [min, max]
}
