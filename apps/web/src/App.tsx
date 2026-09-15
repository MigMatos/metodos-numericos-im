import { useState } from "react"

import { AudioToggle } from "@/components/audio-toggle"
import { LaunchSequence } from "@/components/cosmos/launch-sequence"
import { Starfield } from "@/components/cosmos/starfield"
import { WarpToEarthSequence } from "@/components/cosmos/warp-to-earth"
import { MethodLabScreen } from "@/components/method-lab/method-lab-screen"
import { PresentationScreen } from "@/components/presentation-screen"
import { UnitTwoScreen } from "@/components/unit-two-screen"
import { UnitsMenu } from "@/components/units-menu"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { playSound } from "@/lib/audio"
import type { MethodId } from "@/lib/numerical/types"

type Screen =
  "presentation" | "flight" | "units" | "warp" | "unit-two" | "method"

const CINEMATIC_SCREENS: Screen[] = ["flight", "warp"]

export function App() {
  const [screen, setScreen] = useState<Screen>("presentation")
  const [methodId, setMethodId] = useState<MethodId>("regla-falsa")
  const [hasNavigated, setHasNavigated] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  const goTo = (next: Screen) => {
    if (next === screen) {
      return
    }

    setHasNavigated(true)
    setScreen(next)
  }

  const handleStart = () => {
    playSound("init")

    if (prefersReducedMotion) {
      goTo("units")
      return
    }

    playSound("transition")
    goTo("flight")
  }

  const handleOpenUnitTwo = () => {
    playSound("unit")

    if (prefersReducedMotion) {
      goTo("unit-two")
      return
    }

    playSound("transition")
    goTo("warp")
  }

  const handleSelectMethod = (selected: MethodId) => {
    playSound("method")
    playSound("transition")
    setMethodId(selected)
    goTo("method")
  }

  const handleBackToStart = () => {
    playSound("transition")
    goTo("presentation")
  }

  const handleBackToUnits = () => {
    playSound("transition")
    goTo("units")
  }

  const handleBackToMethods = () => {
    playSound("transition")
    goTo("unit-two")
  }

  return (
    <div className="dark relative min-h-svh overflow-x-clip bg-space-deep text-foreground">
      <Starfield />

      <div
        key={screen}
        className="relative min-h-svh animate-screen-in motion-reduce:animate-none"
      >
        {screen === "presentation" && (
          <PresentationScreen onStart={handleStart} />
        )}

        {screen === "flight" && (
          <LaunchSequence onLanding={() => goTo("units")} />
        )}

        {screen === "units" && (
          <UnitsMenu
            onOpenUnitTwo={handleOpenUnitTwo}
            onBackToStart={handleBackToStart}
          />
        )}

        {screen === "warp" && (
          <WarpToEarthSequence onArrive={() => goTo("unit-two")} />
        )}

        {screen === "unit-two" && (
          <UnitTwoScreen
            onBack={handleBackToUnits}
            onSelectMethod={handleSelectMethod}
          />
        )}

        {screen === "method" && (
          <MethodLabScreen methodId={methodId} onBack={handleBackToMethods} />
        )}
      </div>

      {hasNavigated ? (
        <div
          key={`dissolve-${screen}`}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 animate-dissolve bg-space-deep motion-reduce:hidden"
        />
      ) : null}

      {CINEMATIC_SCREENS.includes(screen) ? null : <AudioToggle />}
    </div>
  )
}
