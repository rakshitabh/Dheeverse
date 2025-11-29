"use client"

import { useMemo } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useJournal } from "@/lib/journal-context"
import type { Emotion } from "@/lib/types"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns"

// ... existing code (keep all the EMOTION_COLORS and chart logic the same) ...

const EMOTION_COLORS: Record<Emotion, string> = {
  happy: "#d4a574",
  calm: "#7ba3a8",
  sad: "#6b7fa3",
  anxious: "#c9956c",
  angry: "#b85c5c",
  neutral: "#8a9a8a",
  grateful: "#4a7c59",
  hopeful: "#9ab87a",
}

export default function InsightsPage() {
  const { entries, streakData } = useJournal()

  // Mood trend data for last 7 days
  const moodTrendData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    })

    return last7Days.map((day) => {
      const dayStart = startOfDay(day)
      const dayEntries = entries.filter((entry) => {
        const entryDate = startOfDay(new Date(entry.createdAt))
        return entryDate.getTime() === dayStart.getTime() && !entry.isArchived
      })

      const avgMood = dayEntries.length > 0 ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length : null

      return {
        date: format(day, "EEE"),
        mood: avgMood,
        entries: dayEntries.length,
      }
    })
  }, [entries])

  // Emotion frequency data
  const emotionFrequencyData = useMemo(() => {
    const emotionCounts: Record<string, number> = {}

    entries
      .filter((e) => !e.isArchived)
      .forEach((entry) => {
        entry.emotions.forEach((emotion) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
        })
      })

    return Object.entries(emotionCounts)
      .map(([name, value]) => ({ name, value, fill: EMOTION_COLORS[name as Emotion] }))
      .sort((a, b) => b.value - a.value)
  }, [entries])

  // Sentiment distribution
  const sentimentData = useMemo(() => {
    const sentiments = { positive: 0, neutral: 0, negative: 0 }

    entries
      .filter((e) => !e.isArchived)
      .forEach((entry) => {
        if (entry.sentiment) {
          sentiments[entry.sentiment.label]++
        }
      })

    return [
      { name: "Positive", value: sentiments.positive, fill: "#4a7c59" },
      { name: "Neutral", value: sentiments.neutral, fill: "#8a9a8a" },
      { name: "Negative", value: sentiments.negative, fill: "#b85c5c" },
    ]
  }, [entries])

  // Weekly summary
  const weeklySummary = useMemo(() => {
    const weekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt)
      const weekAgo = subDays(new Date(), 7)
      return entryDate >= weekAgo && !entry.isArchived
    })

    const avgMood =
      weekEntries.length > 0 ? (weekEntries.reduce((sum, e) => sum + e.mood, 0) / weekEntries.length).toFixed(1) : "0"

    const allEmotions = weekEntries.flatMap((e) => e.emotions)
    const emotionCounts = allEmotions.reduce(
      (acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const dominantEmotion = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral"

    return {
      totalEntries: weekEntries.length,
      avgMood,
      dominantEmotion,
    }
  }, [entries])

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground">Understand your emotional patterns and wellness trends</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklySummary.totalEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklySummary.avgMood}/5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dominant Emotion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{weeklySummary.dominantEmotion}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streakData.currentStreak} days</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mood Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Trend (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodTrendData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ fill: "var(--primary)", strokeWidth: 2 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Emotion Frequency */}
          <Card>
            <CardHeader>
              <CardTitle>Emotion Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionFrequencyData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {sentimentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on your {weeklySummary.totalEntries} entries this week, you&apos;ve been predominantly feeling{" "}
                  <span className="font-medium text-foreground capitalize">{weeklySummary.dominantEmotion}</span>. Your
                  average mood score of <span className="font-medium text-foreground">{weeklySummary.avgMood}/5</span>{" "}
                  suggests{" "}
                  {Number(weeklySummary.avgMood) >= 3.5
                    ? "you're in a positive space emotionally."
                    : Number(weeklySummary.avgMood) >= 2.5
                      ? "you're navigating some mixed emotions."
                      : "you might be going through a challenging time."}
                </p>
                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="text-sm font-medium text-primary mb-2">Recommendation</p>
                  <p className="text-sm text-muted-foreground">
                    {Number(weeklySummary.avgMood) >= 3.5
                      ? "Continue your current practices! Consider sharing your gratitude with someone close to you."
                      : "Consider trying a guided breathing exercise or reaching out to a friend for support."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
}