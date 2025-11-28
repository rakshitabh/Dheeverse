"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import type { Emotion } from "@/lib/types"

interface EmotionTagsProps {
  selected: Emotion[]
  onChange: (emotions: Emotion[]) => void
}

const emotions: { value: Emotion; label: string; color: string }[] = [
  { value: "happy", label: "Happy", color: "bg-wellness-happy/20 text-wellness-happy hover:bg-wellness-happy/30" },
  { value: "calm", label: "Calm", color: "bg-wellness-calm/20 text-wellness-calm hover:bg-wellness-calm/30" },
  { value: "grateful", label: "Grateful", color: "bg-primary/20 text-primary hover:bg-primary/30" },
  { value: "hopeful", label: "Hopeful", color: "bg-chart-3/20 text-chart-3 hover:bg-chart-3/30" },
  {
    value: "anxious",
    label: "Anxious",
    color: "bg-wellness-anxious/20 text-wellness-anxious hover:bg-wellness-anxious/30",
  },
  { value: "sad", label: "Sad", color: "bg-wellness-sad/20 text-wellness-sad hover:bg-wellness-sad/30" },
  { value: "angry", label: "Angry", color: "bg-destructive/20 text-destructive hover:bg-destructive/30" },
  { value: "neutral", label: "Neutral", color: "bg-muted text-muted-foreground hover:bg-muted/80" },
]

export function EmotionTags({ selected, onChange }: EmotionTagsProps) {
  const toggleEmotion = (emotion: Emotion) => {
    if (selected.includes(emotion)) {
      onChange(selected.filter((e) => e !== emotion))
    } else {
      onChange([...selected, emotion])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {emotions.map((emotion) => (
        <button
          key={emotion.value}
          type="button"
          onClick={() => toggleEmotion(emotion.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
            emotion.color,
            selected.includes(emotion.value) && "ring-2 ring-offset-2 ring-offset-background",
          )}
          style={
            {
              "--tw-ring-color": selected.includes(emotion.value) ? "currentColor" : "transparent",
            } as React.CSSProperties
          }
        >
          {emotion.label}
        </button>
      ))}
    </div>
  )
}
