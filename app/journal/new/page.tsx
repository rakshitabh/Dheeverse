"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Mic,
  MicOff,
  Palette,
  Type,
  Sparkles,
  Save,
  Trash2,
  Undo2,
  Redo2,
  Eraser,
  RefreshCw,
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoodSelector } from "@/components/mood-selector"
import { EmotionTags } from "@/components/emotion-tags"
import { useJournal } from "@/lib/journal-context"
import { analyzeSentiment, detectEmotions, generateInsight, generatePrompt } from "@/lib/ai-utils"
import type { MoodScore, Emotion, EntryType } from "@/lib/types"

type EntryMode = "text" | "voice" | "doodle"

const commonTags = ["gratitude", "work", "health", "family", "friends", "goals", "stress", "peace", "nature", "growth"]

export default function NewEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addEntry, entries } = useJournal()

  const initialMode = (searchParams.get("mode") as EntryMode) || "text"
  const [mode, setMode] = useState<EntryMode>(initialMode)
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<MoodScore>(3)
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [prompt, setPrompt] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Doodle state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushColor, setBrushColor] = useState("#4a7c59")
  const [brushSize, setBrushSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")

  // Tag suggestions
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestedTags = tagInput
    ? commonTags.filter((t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t))
    : commonTags.filter((t) => !tags.includes(t)).slice(0, 5)

  // Get recent emotions for prompt generation
  const recentEmotions = entries
    .slice(0, 5)
    .flatMap((e) => e.emotions)
    .filter((v, i, a) => a.indexOf(v) === i) as Emotion[]

  const refreshPrompt = () => {
    setPrompt(generatePrompt(recentEmotions))
  }

  useEffect(() => {
    refreshPrompt()
  }, [])

  useEffect(() => {
    if (emotions.length > 0) {
      setPrompt(generatePrompt(emotions))
    }
  }, [emotions])

  // Canvas setup for doodle mode
  useEffect(() => {
    if (mode === "doodle" && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        saveToHistory()
      }
    }
  }, [mode, backgroundColor])

  const saveToHistory = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
      setCanvasHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        return [...newHistory, imageData]
      })
      setHistoryIndex((prev) => prev + 1)
    }
  }

  const undo = () => {
    if (historyIndex <= 0 || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (ctx && canvasHistory[historyIndex - 1]) {
      ctx.putImageData(canvasHistory[historyIndex - 1], 0, 0)
      setHistoryIndex((prev) => prev - 1)
    }
  }

  const redo = () => {
    if (historyIndex >= canvasHistory.length - 1 || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (ctx && canvasHistory[historyIndex + 1]) {
      ctx.putImageData(canvasHistory[historyIndex + 1], 0, 0)
      setHistoryIndex((prev) => prev + 1)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    setIsDrawing(true)
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      if (isEraser) {
        ctx.clearRect(e.nativeEvent.offsetX - brushSize / 2, e.nativeEvent.offsetY - brushSize / 2, brushSize, brushSize)
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = brushColor
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      saveToHistory()
    }
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        saveToHistory()
      }
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
      setShowSuggestions(false)
    }
  }

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setTagInput("")
    setShowSuggestions(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          await transcribeAudio(audioBlob)
          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error("Microphone access denied:", error)
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const apiKey = localStorage.getItem("openai_api_key")
      if (!apiKey) {
        console.error("OpenAI API key not configured")
        setContent((prev) => prev + " [Voice transcription requires API key in settings] ")
        return
      }

      const formData = new FormData()
      formData.append("file", audioBlob, "audio.wav")
      formData.append("model", "whisper-1")

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Transcription failed")
      }

      const data = await response.json()
      if (data.text) {
        setContent((prev) => prev + (prev ? " " : "") + data.text)
      }
    } catch (error) {
      console.error("Transcription error:", error)
      setContent((prev) => prev + " [Transcription failed] ")
    }
  }

  const handleSubmit = () => {
    if (!content.trim() && mode !== "doodle") return

    const sentiment = analyzeSentiment(content)
    const detectedEmotions = emotions.length > 0 ? emotions : detectEmotions(content)

    let doodleData: string | undefined
    if (mode === "doodle" && canvasRef.current) {
      doodleData = canvasRef.current.toDataURL("image/png")
    }

    const entry = {
      content: content || "Doodle entry",
      mood,
      emotions: detectedEmotions,
      tags,
      isArchived: false,
      entryType: mode as EntryType,
      sentiment,
      aiInsight: generateInsight({ content, mood, emotions: detectedEmotions, sentiment }),
      doodleData,
    }

    addEntry(entry)
    router.push("/journal")
  }

  // Color palette for doodle
  const colorPalette = [
    "#000000",
    "#ffffff",
    "#4a7c59",
    "#7ba3a8",
    "#d4a574",
    "#b85c5c",
    "#6b7fa3",
    "#9ab87a",
    "#c9956c",
    "#8a9a8a",
  ]

  return (
    <PageLayout>
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">New Entry</h1>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>
            <Type className="mr-2 h-4 w-4" />
            Text
          </Button>
          <Button variant={mode === "voice" ? "default" : "outline"} onClick={() => setMode("voice")}>
            <Mic className="mr-2 h-4 w-4" />
            Voice
          </Button>
          <Button variant={mode === "doodle" ? "default" : "outline"} onClick={() => setMode("doodle")}>
            <Palette className="mr-2 h-4 w-4" />
            Doodle
          </Button>
        </div>

        {/* AI Prompt with refresh */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">Reflection Prompt</p>
                  <Button variant="ghost" size="sm" onClick={refreshPrompt}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-foreground">{prompt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How are you feeling?</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodSelector value={mood} onChange={setMood} />
          </CardContent>
        </Card>

        {/* Entry Content - increased width */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {mode === "text" && "Write your thoughts"}
              {mode === "voice" && "Speak your mind"}
              {mode === "doodle" && "Express with art"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === "text" && (
              <Textarea
                placeholder="What's on your mind today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[250px] resize-none text-base"
              />
            )}

            {mode === "voice" && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Tap the microphone to start speaking..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className="h-16 w-16 rounded-full"
                    onClick={toggleRecording}
                  >
                    {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                </div>
                {isRecording && <p className="text-center text-sm text-muted-foreground animate-pulse">Listening...</p>}
              </div>
            )}

            {mode === "doodle" && (
              <div className="space-y-4">
                {/* Doodle toolbar with eraser, undo/redo */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Brush:</span>
                    <div className="flex gap-1">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setBrushColor(color)
                            setIsEraser(false)
                          }}
                          className={`h-6 w-6 rounded border-2 transition-all ${
                            brushColor === color && !isEraser ? "border-primary scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          title="Brush color"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Background:</span>
                    <div className="flex gap-1">
                      {colorPalette.map((color) => (
                        <button
                          key={`bg-${color}`}
                          onClick={() => setBackgroundColor(color)}
                          className={`h-6 w-6 rounded border-2 transition-all ${
                            backgroundColor === color ? "border-primary scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          title="Background color"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  <Button variant={isEraser ? "default" : "outline"} size="sm" onClick={() => setIsEraser(!isEraser)}>
                    <Eraser className="mr-2 h-4 w-4" />
                    Eraser
                  </Button>
                  <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={historyIndex >= canvasHistory.length - 1}
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={400}
                  className="w-full border rounded-lg cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <Textarea
                  placeholder="Add a note about your doodle (optional)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emotions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select emotions (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionTags selected={emotions} onChange={setEmotions} />
          </CardContent>
        </Card>

        {/* Tags with smart suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Type a tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onKeyDown={handleAddTag}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && suggestedTags.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden z-10">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                        onClick={() => addSuggestedTag(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                    >
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim() && mode !== "doodle"}>
            <Save className="mr-2 h-4 w-4" />
            Save Entry
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
