"use client"

import { useState, useEffect } from "react"
import { Volume2, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface FloatingSoundState {
  isPlaying: boolean
  soundId: string
  volume: number
}

interface NatureSound {
  id: string
  name: string
  icon: string
}

const natureSounds: NatureSound[] = [
  { id: "rain", name: "Rain", icon: "🌧️" },
  { id: "ocean", name: "Ocean", icon: "🌊" },
  { id: "forest", name: "Forest", icon: "🌲" },
  { id: "fire", name: "Fire", icon: "🔥" },
  { id: "wind", name: "Wind", icon: "💨" },
  { id: "thunder", name: "Storm", icon: "⛈️" },
  { id: "birds", name: "Birds", icon: "🐦" },
  { id: "stream", name: "Stream", icon: "💧" },
]

export function FloatingNatureSounds() {
  const [soundState, setSoundState] = useState<FloatingSoundState>({
    isPlaying: false,
    soundId: "rain",
    volume: 50,
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentSound = natureSounds.find((s) => s.id === soundState.soundId)

  const togglePlayPause = () => {
    setSoundState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }))
  }

  const changeSoundId = (id: string) => {
    setSoundState((prev) => ({
      ...prev,
      soundId: id,
      isPlaying: true, // Auto-play when changing sound
    }))
  }

  if (!isMounted) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-background border rounded-lg shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Nature Sounds</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Sound Display */}
          {currentSound && (
            <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
              <span className="text-3xl">{currentSound.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{currentSound.name}</p>
                <p className="text-xs text-muted-foreground">{soundState.volume}% volume</p>
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Volume</label>
            <Slider
              value={[soundState.volume]}
              onValueChange={([value]: [number]) =>
                setSoundState((prev) => ({ ...prev, volume: value }))
              }
              max={100}
              step={1}
            />
          </div>

          {/* Sound Grid */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Select Sound</label>
            <div className="grid grid-cols-4 gap-2">
              {natureSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => changeSoundId(sound.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                    soundState.soundId === sound.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                  title={sound.name}
                >
                  <span className="text-xl">{sound.icon}</span>
                  <span className="text-xs">{sound.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Play Button */}
          <Button
            onClick={togglePlayPause}
            className="w-full"
            variant={soundState.isPlaying ? "destructive" : "default"}
          >
            {soundState.isPlaying ? "Stop" : "Play"}
          </Button>
        </div>
      )}

      {/* Floating Button */}
      <Button
        size="lg"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "rounded-full h-14 w-14 shadow-lg",
          soundState.isPlaying ? "ring-2 ring-primary ring-offset-2" : ""
        )}
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <>
            {soundState.isPlaying && currentSound && (
              <span className="absolute text-lg">{currentSound.icon}</span>
            )}
            {!soundState.isPlaying && <Volume2 className="h-5 w-5" />}
          </>
        )}
      </Button>
    </div>
  )
}
