"use client"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pause, Volume2, Repeat, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

// ... existing code kept, just wrapping with PageLayout ...

interface NatureSound {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

const natureSounds: NatureSound[] = [
  { id: "rain", name: "Rain", icon: "🌧️", description: "Gentle rainfall on leaves", color: "bg-blue-500/20" },
  { id: "ocean", name: "Ocean Waves", icon: "🌊", description: "Calm ocean waves", color: "bg-cyan-500/20" },
  { id: "forest", name: "Forest", icon: "🌲", description: "Birds and rustling leaves", color: "bg-green-500/20" },
  { id: "fire", name: "Crackling Fire", icon: "🔥", description: "Warm fireplace sounds", color: "bg-orange-500/20" },
  { id: "wind", name: "Wind", icon: "💨", description: "Soft breeze through trees", color: "bg-slate-500/20" },
  {
    id: "thunder",
    name: "Thunderstorm",
    icon: "⛈️",
    description: "Distant thunder and rain",
    color: "bg-purple-500/20",
  },
  { id: "birds", name: "Birdsong", icon: "🐦", description: "Morning bird chorus", color: "bg-yellow-500/20" },
  { id: "stream", name: "Stream", icon: "💧", description: "Babbling brook", color: "bg-teal-500/20" },
]

export default function SoundsPage() {
  const [activeSounds, setActiveSounds] = useState<Record<string, { volume: number; loop: boolean }>>({})
  const [masterVolume, setMasterVolume] = useState(70)

  const toggleSound = (soundId: string) => {
    setActiveSounds((prev) => {
      if (prev[soundId] !== undefined) {
        const { [soundId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [soundId]: { volume: 50, loop: true } }
    })
  }

  const updateSoundVolume = (soundId: string, volume: number) => {
    setActiveSounds((prev) => ({
      ...prev,
      [soundId]: { ...prev[soundId], volume },
    }))
  }

  const toggleLoop = (soundId: string) => {
    setActiveSounds((prev) => ({
      ...prev,
      [soundId]: { ...prev[soundId], loop: !prev[soundId]?.loop },
    }))
  }

  const activeCount = Object.keys(activeSounds).length

  return (
    <PageLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Nature Sounds</h1>
          <p className="text-muted-foreground">Create your perfect ambient soundscape</p>
        </div>

        {/* Master Volume */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Master Volume</span>
                  <span className="text-sm text-muted-foreground">{masterVolume}%</span>
                </div>
                <Slider value={[masterVolume]} onValueChange={([value]) => setMasterVolume(value)} max={100} step={1} />
              </div>
            </div>
            {activeCount > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {activeCount} sound{activeCount !== 1 ? "s" : ""} playing
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sound Grid with enhanced UI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {natureSounds.map((sound) => {
            const isActive = activeSounds[sound.id] !== undefined
            const soundConfig = activeSounds[sound.id]

            return (
              <Card
                key={sound.id}
                className={cn("transition-all cursor-pointer hover:shadow-md", isActive && "ring-2 ring-primary")}
              >
                <CardContent className="pt-6">
                  <div className={cn("flex flex-col items-center text-center")} onClick={() => toggleSound(sound.id)}>
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full text-3xl transition-all",
                        sound.color,
                        isActive && "scale-110 animate-pulse",
                      )}
                    >
                      {sound.icon}
                    </div>
                    <h3 className="mt-3 font-medium">{sound.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{sound.description}</p>
                  </div>

                  {isActive && soundConfig && (
                    <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                      {/* Volume slider */}
                      <Slider
                        value={[soundConfig.volume]}
                        onValueChange={([value]) => updateSoundVolume(sound.id, value)}
                        max={100}
                        step={1}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{soundConfig.volume}%</span>
                        <div className="flex gap-1">
                          {/* Loop toggle */}
                          <Button
                            size="sm"
                            variant={soundConfig.loop ? "default" : "ghost"}
                            onClick={() => toggleLoop(sound.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Repeat className="h-3 w-3" />
                          </Button>
                          {/* Stop button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSound(sound.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle>Sound Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setActiveSounds({ rain: { volume: 60, loop: true }, thunder: { volume: 30, loop: true } })
                }
              >
                🌧️ Rainy Day
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setActiveSounds({ ocean: { volume: 70, loop: true }, birds: { volume: 20, loop: true } })
                }
              >
                🏖️ Beach Morning
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setActiveSounds({
                    forest: { volume: 50, loop: true },
                    stream: { volume: 40, loop: true },
                    birds: { volume: 30, loop: true },
                  })
                }
              >
                🌲 Forest Walk
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveSounds({ fire: { volume: 60, loop: true }, wind: { volume: 20, loop: true } })}
              >
                🏔️ Cozy Cabin
              </Button>
              <Button variant="outline" onClick={() => setActiveSounds({})}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Mix multiple sounds together to create your
              ideal ambient environment. Studies show that nature sounds can reduce stress hormones and improve focus.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
