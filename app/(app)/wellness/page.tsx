"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useJournal } from "@/lib/journal-context"
import { Wind, Heart, Brain, Sparkles, Check, RotateCcw, Hand, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Quick access icons for wellness features
const wellnessFeatures = [
  { id: "breathing", icon: Wind, label: "Breathing", color: "bg-blue-500/20 text-blue-600" },
  { id: "mudras", icon: Hand, label: "Mudras", color: "bg-purple-500/20 text-purple-600" },
  { id: "yoga", icon: Activity, label: "Yoga", color: "bg-green-500/20 text-green-600" },
  { id: "gratitude", icon: Heart, label: "Gratitude", color: "bg-pink-500/20 text-pink-600" },
  { id: "mindfulness", icon: Brain, label: "Mindfulness", color: "bg-teal-500/20 text-teal-600" },
]

// Mudra data with images, descriptions, indications, and benefits
const mudras = [
  {
    id: "gyan",
    name: "Gyan Mudra",
    description: "Touch the tip of the index finger to the tip of the thumb, keeping the other fingers straight.",
    image: "/gyan-mudra-hand-gesture-meditation.jpg",
    indications: ["Stress", "Anxiety", "Poor concentration", "Sleep issues"],
    benefits: ["Enhances concentration", "Reduces stress", "Improves memory", "Calms the mind"],
  },
  {
    id: "prana",
    name: "Prana Mudra",
    description:
      "Touch the tips of the ring and little fingers to the thumb tip, keeping index and middle fingers straight.",
    image: "/prana-mudra-hand-gesture-energy.jpg",
    indications: ["Fatigue", "Low energy", "Eye problems", "Weak immunity"],
    benefits: ["Activates dormant energy", "Improves eyesight", "Boosts immunity", "Reduces fatigue"],
  },
  {
    id: "apan",
    name: "Apan Mudra",
    description: "Touch the tips of the middle and ring fingers to the thumb, keeping other fingers straight.",
    image: "/apan-mudra-hand-gesture-detox.jpg",
    indications: ["Digestive issues", "Toxin buildup", "Constipation", "Mental clarity"],
    benefits: ["Detoxifies the body", "Regulates digestion", "Promotes patience", "Mental purification"],
  },
  {
    id: "vayu",
    name: "Vayu Mudra",
    description: "Fold the index finger to touch the base of the thumb, press thumb over it.",
    image: "/vayu-mudra-hand-gesture-air-element.jpg",
    indications: ["Joint pain", "Arthritis", "Gas problems", "Restlessness"],
    benefits: ["Reduces air element", "Relieves joint pain", "Calms restless mind", "Eases bloating"],
  },
]

// Yoga poses with descriptions
const yogaPoses = [
  {
    id: "child",
    name: "Child's Pose (Balasana)",
    description: "Kneel on the floor, sit back on heels, fold forward with arms extended or alongside body.",
    image: "/childs-pose-yoga-balasana-relaxation.jpg",
    indications: ["Stress", "Back tension", "Fatigue", "Need for grounding"],
    benefits: ["Releases back tension", "Calms the mind", "Stretches hips and thighs", "Promotes relaxation"],
    duration: "1-3 minutes",
  },
  {
    id: "mountain",
    name: "Mountain Pose (Tadasana)",
    description: "Stand tall with feet together, arms at sides, weight evenly distributed, crown reaching up.",
    image: "/mountain-pose-yoga-tadasana-standing.jpg",
    indications: ["Poor posture", "Need for centering", "Low confidence", "Beginning practice"],
    benefits: ["Improves posture", "Strengthens thighs and ankles", "Increases awareness", "Grounds energy"],
    duration: "30 seconds - 1 minute",
  },
  {
    id: "corpse",
    name: "Corpse Pose (Savasana)",
    description: "Lie flat on back, legs slightly apart, arms by sides with palms up, eyes closed.",
    image: "/corpse-pose-yoga-savasana-relaxation-meditation.jpg",
    indications: ["Insomnia", "Deep relaxation needed", "End of practice", "High stress"],
    benefits: ["Deep relaxation", "Reduces blood pressure", "Calms nervous system", "Integrates practice"],
    duration: "5-15 minutes",
  },
  {
    id: "cat-cow",
    name: "Cat-Cow Stretch",
    description: "On hands and knees, alternate between arching back (cat) and dropping belly (cow) with breath.",
    image: "/cat-cow-yoga-pose-stretch-spine.jpg",
    indications: ["Back stiffness", "Spine mobility", "Stress in spine", "Morning routine"],
    benefits: ["Warms up spine", "Improves flexibility", "Coordinates breath with movement", "Massages organs"],
    duration: "1-2 minutes",
  },
]

const gratitudePrompts = [
  "What's something simple that brought you joy today?",
  "Who is someone you're grateful to have in your life?",
  "What's a challenge you've overcome that you're proud of?",
  "What's something in nature that you appreciate?",
  "What's a skill or ability you're thankful to have?",
]

const mindfulnessActivities = [
  { id: "1", name: "2-Minute Body Scan", description: "Notice sensations from head to toe", duration: 2 },
  {
    id: "2",
    name: "5 Senses Check",
    description: "Name 5 things you can see, 4 hear, 3 touch, 2 smell, 1 taste",
    duration: 3,
  },
  { id: "3", name: "Mindful Breathing", description: "Focus only on your natural breath for 2 minutes", duration: 2 },
]

export default function WellnessPage() {
  const { addCompletedActivity, completedActivities, mindfulnessCompletions, completeMindfulness } = useJournal()
  const [activeTab, setActiveTab] = useState("breathing")

  // Breathing state
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale")
  const [breathProgress, setBreathProgress] = useState(0)
  const [breathCycles, setBreathCycles] = useState(0)
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Gratitude state
  const [gratitudeIndex, setGratitudeIndex] = useState(0)
  const [gratitudeText, setGratitudeText] = useState("")

  // Calculate total activities (cap at actual total)
  const totalActivities = mindfulnessActivities.length + mudras.length + yogaPoses.length + 2 // +2 for breathing and gratitude
  const completedCount = Math.min(completedActivities.length, totalActivities)

  // Box breathing: 4-4-4-4 pattern
  const startBreathing = () => {
    setIsBreathing(true)
    setBreathPhase("inhale")
    setBreathProgress(0)
    setBreathCycles(0)

    let phase: "inhale" | "hold1" | "exhale" | "hold2" = "inhale"
    let progress = 0
    let cycles = 0

    breathIntervalRef.current = setInterval(() => {
      progress += 2.5 // 4 seconds per phase (100/4s = 25% per second, update every 100ms = 2.5%)
      setBreathProgress(progress)

      if (progress >= 100) {
        progress = 0
        if (phase === "inhale") {
          phase = "hold1"
        } else if (phase === "hold1") {
          phase = "exhale"
        } else if (phase === "exhale") {
          phase = "hold2"
        } else {
          phase = "inhale"
          cycles++
          setBreathCycles(cycles)
        }
        setBreathPhase(phase)
      }
    }, 100)
  }

  const stopBreathing = () => {
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current)
    }
    setIsBreathing(false)

    if (breathCycles > 0) {
      addCompletedActivity({
        id: Date.now().toString(),
        type: "breathing",
        name: "Box Breathing",
        description: `Completed ${breathCycles} cycles`,
        duration: breathCycles * 16,
      })
    }
  }

  useEffect(() => {
    return () => {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current)
      }
    }
  }, [])

  const completeGratitude = () => {
    if (gratitudeText.trim()) {
      addCompletedActivity({
        id: Date.now().toString(),
        type: "gratitude",
        name: "Gratitude Writing",
        description: gratitudePrompts[gratitudeIndex],
        duration: 5,
      })
      setGratitudeText("")
      setGratitudeIndex((prev) => (prev + 1) % gratitudePrompts.length)
    }
  }

  const handleMindfulnessComplete = (activity: (typeof mindfulnessActivities)[0]) => {
    completeMindfulness(activity.id)
    addCompletedActivity({
      id: Date.now().toString(),
      type: "mindfulness",
      name: activity.name,
      description: activity.description,
      duration: activity.duration,
    })
  }

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case "inhale":
        return "Breathe In"
      case "hold1":
        return "Hold"
      case "exhale":
        return "Breathe Out"
      case "hold2":
        return "Hold"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Wellness Activities</h1>
          <p className="text-muted-foreground">Take a moment for your mental wellbeing</p>
        </div>

        {/* Quick Access Icons */}
        <div className="flex flex-wrap gap-2">
          {wellnessFeatures.map((feature) => (
            <Button
              key={feature.id}
              variant={activeTab === feature.id ? "default" : "outline"}
              className="gap-2"
              onClick={() => setActiveTab(feature.id)}
            >
              <feature.icon className="h-4 w-4" />
              {feature.label}
            </Button>
          ))}
        </div>

        {/* Progress - with correct count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Today&apos;s Wellness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={Math.min((completedCount / totalActivities) * 100, 100)} className="flex-1" />
              <span className="text-sm font-medium">
                {completedCount}/{totalActivities} activities
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden">
            {wellnessFeatures.map((f) => (
              <TabsTrigger key={f.id} value={f.id}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Breathing Tab */}
          <TabsContent value="breathing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-blue-500" />
                  Box Breathing
                </CardTitle>
                <CardDescription>
                  A calming technique used by Navy SEALs. Breathe in, hold, breathe out, hold - each for 4 seconds.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                {/* Breathing Animation Circle - with static outer box */}
                <div className="relative flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <div
                      className={cn(
                        "rounded-full bg-gradient-to-br from-blue-400 to-teal-400 transition-all duration-[4000ms] ease-in-out flex items-center justify-center",
                        isBreathing
                          ? breathPhase === "inhale"
                            ? "h-32 w-32 scale-100"
                            : breathPhase === "exhale"
                              ? "h-20 w-20 scale-75"
                              : "h-28 w-28 scale-90"
                          : "h-20 w-20",
                      )}
                    >
                      <div className="text-center text-white">
                        <p className="text-2xl font-bold">{isBreathing ? getBreathInstruction() : "Ready"}</p>
                        <p className="text-sm opacity-80">
                          {isBreathing ? `${Math.ceil((100 - breathProgress) / 25)}s` : "Tap to start"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pulsing ring animation */}
                  {isBreathing && (
                    <div
                      className="absolute inset-0 animate-ping rounded-full bg-blue-400/20"
                      style={{ animationDuration: "4s" }}
                    />
                  )}
                </div>

                {/* Cycle counter */}
                {isBreathing && (
                  <p className="mt-6 text-muted-foreground">
                    Cycles completed: <span className="font-medium text-foreground">{breathCycles}</span>
                  </p>
                )}

                {/* Controls */}
                <Button
                  size="lg"
                  className="mt-6"
                  variant={isBreathing ? "destructive" : "default"}
                  onClick={isBreathing ? stopBreathing : startBreathing}
                >
                  {isBreathing ? "Stop" : "Start Breathing"}
                </Button>

                {/* Instructions */}
                <div className="mt-8 grid grid-cols-4 gap-4 text-center text-sm">
                  {["Inhale", "Hold", "Exhale", "Hold"].map((phase, i) => (
                    <div
                      key={phase + i}
                      className={cn(
                        "rounded-lg p-3 transition-colors",
                        isBreathing &&
                          ((breathPhase === "inhale" && i === 0) ||
                            (breathPhase === "hold1" && i === 1) ||
                            (breathPhase === "exhale" && i === 2) ||
                            (breathPhase === "hold2" && i === 3))
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <p className="font-medium">{phase}</p>
                      <p className="text-xs opacity-70">4 sec</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mudras Tab */}
          <TabsContent value="mudras" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {mudras.map((mudra) => (
                <Card key={mudra.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <img
                        src={mudra.image || "/placeholder.svg"}
                        alt={mudra.name}
                        className="w-32 h-32 rounded-lg object-cover bg-muted"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{mudra.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{mudra.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">When to Use</h4>
                        <ul className="space-y-1">
                          {mudra.indications.map((ind) => (
                            <li key={ind} className="text-sm flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {ind}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Benefits</h4>
                        <ul className="space-y-1">
                          {mudra.benefits.map((ben) => (
                            <li key={ben} className="text-sm flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              {ben}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Yoga Tab */}
          <TabsContent value="yoga" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {yogaPoses.map((pose) => (
                <Card key={pose.id}>
                  <CardContent className="pt-6">
                    <img
                      src={pose.image || "/placeholder.svg"}
                      alt={pose.name}
                      className="w-full h-48 rounded-lg object-cover bg-muted mb-4"
                    />
                    <h3 className="font-semibold text-lg">{pose.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pose.description}</p>
                    <p className="text-xs text-primary mt-2">Duration: {pose.duration}</p>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">When to Practice</h4>
                        <ul className="space-y-1">
                          {pose.indications.map((ind) => (
                            <li key={ind} className="text-sm flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {ind}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Benefits</h4>
                        <ul className="space-y-1">
                          {pose.benefits.map((ben) => (
                            <li key={ben} className="text-sm flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              {ben}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gratitude Tab */}
          <TabsContent value="gratitude" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Gratitude Practice
                </CardTitle>
                <CardDescription>Cultivate positivity by reflecting on what you&apos;re thankful for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">{gratitudePrompts[gratitudeIndex]}</p>
                </div>
                <textarea
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  placeholder="Write your gratitude here..."
                  className="w-full min-h-[150px] rounded-lg border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGratitudeIndex((prev) => (prev + 1) % gratitudePrompts.length)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    New Prompt
                  </Button>
                  <Button onClick={completeGratitude} disabled={!gratitudeText.trim()}>
                    <Check className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mindfulness Tab */}
          <TabsContent value="mindfulness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-teal-500" />
                  Quick Mindfulness
                </CardTitle>
                <CardDescription>Short exercises to bring you back to the present moment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {mindfulnessActivities.map((activity) => {
                    const completionCount = mindfulnessCompletions[activity.id] || 0
                    return (
                      <div
                        key={activity.id}
                        className="rounded-lg border p-4 hover:border-primary/50 transition-colors"
                      >
                        <h4 className="font-medium">{activity.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground">{activity.duration} min</span>
                            {completionCount > 0 && (
                              <span className="ml-2 text-xs text-primary">Completed {completionCount}x</span>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleMindfulnessComplete(activity)}>
                            <Check className="mr-2 h-4 w-4" />
                            Done
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
}