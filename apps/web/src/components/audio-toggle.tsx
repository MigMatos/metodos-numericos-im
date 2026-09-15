import { useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { isAudioEnabled, toggleAudio } from "@/lib/audio"

export function AudioToggle() {
  const [enabled, setEnabled] = useState(() => isAudioEnabled())

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-pressed={enabled}
      aria-label={enabled ? "Desactivar audio" : "Activar audio"}
      title={enabled ? "Desactivar audio" : "Activar audio"}
      onClick={() => setEnabled(toggleAudio())}
      className="fixed right-4 bottom-4 z-50 border border-border/60 bg-space-surface/80 text-muted-foreground backdrop-blur-md hover:text-foreground"
    >
      {enabled ? <Volume2 /> : <VolumeX />}
    </Button>
  )
}
