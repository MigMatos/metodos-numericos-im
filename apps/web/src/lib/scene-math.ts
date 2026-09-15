export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

export function inverseLerp(from: number, to: number, value: number) {
  if (from === to) {
    return 0
  }

  return clamp((value - from) / (to - from), 0, 1)
}

export function easeInCubic(amount: number) {
  return amount * amount * amount
}

export function easeOutCubic(amount: number) {
  return 1 - (1 - amount) ** 3
}

export function easeInOutCubic(amount: number) {
  return amount < 0.5
    ? 4 * amount * amount * amount
    : 1 - (-2 * amount + 2) ** 3 / 2
}

export function createSeededRandom(seed: number) {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}
