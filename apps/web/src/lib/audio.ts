export type SoundEvent =
  | "init"
  | "transition"
  | "unit"
  | "method"
  | "calculate"
  | "iteration"
  | "convergence"
  | "error"

type SoundRecipe = {
  frequency: number
  sweep?: number
  duration: number
  type: OscillatorType
  volume: number
}

const STORAGE_KEY = "metodos-numericos:audio"
const AMBIENT_FREQUENCIES = [55, 82.41, 110]

const RECIPES: Record<SoundEvent, SoundRecipe> = {
  init: {
    frequency: 320,
    sweep: 900,
    duration: 0.7,
    type: "sine",
    volume: 0.32,
  },
  transition: {
    frequency: 170,
    sweep: 520,
    duration: 1.1,
    type: "sawtooth",
    volume: 0.16,
  },
  unit: {
    frequency: 520,
    sweep: 720,
    duration: 0.24,
    type: "triangle",
    volume: 0.2,
  },
  method: {
    frequency: 620,
    sweep: 840,
    duration: 0.22,
    type: "triangle",
    volume: 0.2,
  },
  calculate: {
    frequency: 440,
    sweep: 680,
    duration: 0.2,
    type: "square",
    volume: 0.12,
  },
  iteration: { frequency: 720, duration: 0.05, type: "sine", volume: 0.08 },
  convergence: {
    frequency: 660,
    sweep: 1320,
    duration: 0.65,
    type: "sine",
    volume: 0.28,
  },
  error: {
    frequency: 230,
    sweep: 120,
    duration: 0.45,
    type: "sawtooth",
    volume: 0.2,
  },
}

let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let ambientGain: GainNode | null = null
let ambientOscillators: OscillatorNode[] = []
let enabled = readPreference()

function readPreference() {
  if (typeof window === "undefined") {
    return false
  }

  return window.localStorage.getItem(STORAGE_KEY) === "on"
}

export function isAudioEnabled() {
  return enabled
}

export function setAudioEnabled(value: boolean) {
  enabled = value
  window.localStorage.setItem(STORAGE_KEY, value ? "on" : "off")

  if (value) {
    startAmbient()
  } else {
    stopAmbient()
  }
}

export function toggleAudio() {
  setAudioEnabled(!enabled)
  return enabled
}

function ensureContext() {
  if (audioContext) {
    return audioContext
  }

  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioContextClass) {
    return null
  }

  audioContext = new AudioContextClass()
  masterGain = audioContext.createGain()
  masterGain.gain.value = 0.45
  masterGain.connect(audioContext.destination)

  return audioContext
}

export function playSound(event: SoundEvent) {
  if (!enabled) {
    return
  }

  const audio = ensureContext()

  if (!audio || !masterGain) {
    return
  }

  if (audio.state === "suspended") {
    void audio.resume()
  }

  const recipe = RECIPES[event]
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  const now = audio.currentTime

  oscillator.type = recipe.type
  oscillator.frequency.setValueAtTime(recipe.frequency, now)

  if (recipe.sweep) {
    oscillator.frequency.exponentialRampToValueAtTime(
      recipe.sweep,
      now + recipe.duration
    )
  }

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(recipe.volume, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + recipe.duration)

  oscillator.connect(gain)
  gain.connect(masterGain)
  oscillator.start(now)
  oscillator.stop(now + recipe.duration + 0.05)
}

function startAmbient() {
  const audio = ensureContext()

  if (!audio || !masterGain || ambientGain) {
    return
  }

  if (audio.state === "suspended") {
    void audio.resume()
  }

  const filter = audio.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 620
  filter.Q.value = 0.7

  ambientGain = audio.createGain()
  ambientGain.gain.value = 0
  filter.connect(ambientGain)
  ambientGain.connect(masterGain)

  ambientOscillators = AMBIENT_FREQUENCIES.map((frequency, index) => {
    const oscillator = audio.createOscillator()
    oscillator.type = index % 2 === 0 ? "sine" : "triangle"
    oscillator.frequency.value = frequency
    oscillator.detune.value = index * 7
    oscillator.connect(filter)
    oscillator.start()
    return oscillator
  })

  ambientGain.gain.linearRampToValueAtTime(0.05, audio.currentTime + 4)
}

function stopAmbient() {
  if (!ambientGain || !audioContext) {
    return
  }

  const gain = ambientGain
  const oscillators = ambientOscillators
  const audio = audioContext

  ambientGain = null
  ambientOscillators = []

  gain.gain.cancelScheduledValues(audio.currentTime)
  gain.gain.linearRampToValueAtTime(0, audio.currentTime + 0.6)

  window.setTimeout(() => {
    oscillators.forEach((oscillator) => {
      oscillator.stop()
      oscillator.disconnect()
    })
    gain.disconnect()
  }, 800)
}
