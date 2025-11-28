"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PenLine, Mic, Palette, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MoodSelector } from "@/components/mood-selector"
import { useJournal } from "@/lib/journal-context"
import { analyzeSentiment, detectEmotions, generateInsight } from "@/lib/ai-utils"
import type { MoodScore } from "@/lib/types"

export function QuickEntry() {
  const router = useRouter()
  const { addEntry } = useJournal()
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<MoodScore>(3)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)

    // Analyze content
    const sentiment = analyzeSentiment(content)
    const emotions = detectEmotions(content)

    const entry = {
      content,
      mood,
      emotions,
      tags: [],
      isArchived: false,
      sentiment,
      aiInsight: generateInsight({ content, mood, emotions, sentiment }),
    }

    addEntry(entry)
    setContent("")
    setMood(3)
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-primary" />
          Quick Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">How are you feeling?</p>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <Textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/journal/new?mode=voice")}>
              <Mic className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => router.push("/journal/new?mode=doodle")}>
              <Palette className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/journal/new")}>
              Full Editor
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
              <Sparkles className="mr-2 h-4 w-4" />
              Save Entry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
