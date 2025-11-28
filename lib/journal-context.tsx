"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { JournalEntry, StreakData, Badge, WellnessActivity } from "./types"

interface JournalContextType {
  entries: JournalEntry[]
  addEntry: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void
  archiveEntry: (id: string) => void
  restoreEntry: (id: string) => void
  permanentlyDeleteEntry: (id: string) => void
  archiveMultiple: (ids: string[]) => void
  restoreMultiple: (ids: string[]) => void
  deleteMultiple: (ids: string[]) => void
  streakData: StreakData
  badges: Badge[]
  completedActivities: WellnessActivity[]
  addCompletedActivity: (activity: WellnessActivity) => void
  mindfulnessCompletions: Record<string, number>
  completeMindfulness: (activityId: string) => void
}

const JournalContext = createContext<JournalContextType | undefined>(undefined)

const defaultBadges: Badge[] = [
  {
    id: "1",
    name: "First Entry",
    description: "Write your first journal entry",
    icon: "sparkles",
    requirement: { type: "entries", value: 1 },
  },
  {
    id: "2",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "flame",
    requirement: { type: "streak", value: 7 },
  },
  {
    id: "3",
    name: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "trophy",
    requirement: { type: "streak", value: 30 },
  },
  {
    id: "4",
    name: "Gratitude Guru",
    description: "Write 10 grateful entries",
    icon: "heart",
    requirement: { type: "emotion", value: 10 },
  },
  {
    id: "5",
    name: "Mindful Maven",
    description: "Complete 5 wellness activities",
    icon: "brain",
    requirement: { type: "activity", value: 5 },
  },
]

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    content:
      "Today was a beautiful day. I took a long walk in the park and felt so connected with nature. The autumn leaves were stunning, and I felt a deep sense of peace.",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    mood: 5,
    emotions: ["happy", "calm", "grateful"],
    tags: ["nature", "gratitude", "peace"],
    isArchived: false,
    entryType: "text",
    sentiment: { score: 0.85, label: "positive" },
    aiInsight:
      "Your connection with nature seems to bring you peace. Consider making outdoor activities a regular part of your routine.",
  },
  {
    id: "2",
    content:
      "Feeling a bit overwhelmed with work deadlines. Took some deep breaths and reminded myself that I can only do one thing at a time. Tomorrow is a new day.",
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    mood: 3,
    emotions: ["anxious", "hopeful"],
    tags: ["work", "stress", "coping"],
    isArchived: false,
    entryType: "text",
    sentiment: { score: 0.2, label: "neutral" },
    aiInsight:
      "You showed great self-awareness by acknowledging your stress and using breathing techniques. Keep practicing these coping strategies.",
  },
  {
    id: "3",
    content:
      "Had coffee with an old friend today. We laughed so much reminiscing about college days. Feeling grateful for genuine friendships that stand the test of time.",
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
    mood: 5,
    emotions: ["happy", "grateful"],
    tags: ["friends", "social", "joy"],
    isArchived: false,
    entryType: "text",
    sentiment: { score: 0.92, label: "positive" },
    aiInsight:
      "Social connections are vital for wellbeing. Your appreciation for lasting friendships shows emotional maturity.",
  },
]

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries)
  const [badges, setBadges] = useState<Badge[]>(defaultBadges)
  const [completedActivities, setCompletedActivities] = useState<WellnessActivity[]>([])
  const [mindfulnessCompletions, setMindfulnessCompletions] = useState<Record<string, number>>({})

  const streakData: StreakData = {
    currentStreak: calculateStreak(entries),
    longestStreak: 7,
    totalEntries: entries.filter((e) => !e.isArchived).length,
    lastEntryDate: entries.length > 0 ? entries[0].createdAt : null,
  }

  useEffect(() => {
    checkAndUnlockBadges()
  }, [entries, completedActivities])

  function calculateStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0

    const sortedEntries = [...entries]
      .filter((e) => !e.isArchived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt)
      entryDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / 86400000)

      if (diffDays <= 1) {
        streak++
        currentDate = entryDate
      } else {
        break
      }
    }

    return streak
  }

  function checkAndUnlockBadges() {
    setBadges((prev) =>
      prev.map((badge) => {
        if (badge.unlockedAt) return badge

        let shouldUnlock = false

        switch (badge.requirement.type) {
          case "entries":
            shouldUnlock = entries.length >= badge.requirement.value
            break
          case "streak":
            shouldUnlock = streakData.currentStreak >= badge.requirement.value
            break
          case "activity":
            shouldUnlock = completedActivities.length >= badge.requirement.value
            break
          case "emotion":
            const gratefulEntries = entries.filter((e) => e.emotions.includes("grateful"))
            shouldUnlock = gratefulEntries.length >= badge.requirement.value
            break
        }

        return shouldUnlock ? { ...badge, unlockedAt: new Date() } : badge
      }),
    )
  }

  const addEntry = (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setEntries((prev) => [newEntry, ...prev])
  }

  const updateEntry = (id: string, updates: Partial<JournalEntry>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates, updatedAt: new Date() } : entry)),
    )
  }

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const archiveEntry = (id: string) => {
    updateEntry(id, { isArchived: true })
  }

  const restoreEntry = (id: string) => {
    updateEntry(id, { isArchived: false })
  }

  const permanentlyDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const archiveMultiple = (ids: string[]) => {
    setEntries((prev) =>
      prev.map((entry) => (ids.includes(entry.id) ? { ...entry, isArchived: true, updatedAt: new Date() } : entry)),
    )
  }

  const restoreMultiple = (ids: string[]) => {
    setEntries((prev) =>
      prev.map((entry) => (ids.includes(entry.id) ? { ...entry, isArchived: false, updatedAt: new Date() } : entry)),
    )
  }

  const deleteMultiple = (ids: string[]) => {
    setEntries((prev) => prev.filter((entry) => !ids.includes(entry.id)))
  }

  const addCompletedActivity = (activity: WellnessActivity) => {
    setCompletedActivities((prev) => [...prev, { ...activity, completedAt: new Date() }])
  }

  const completeMindfulness = (activityId: string) => {
    setMindfulnessCompletions((prev) => ({
      ...prev,
      [activityId]: (prev[activityId] || 0) + 1,
    }))
  }

  return (
    <JournalContext.Provider
      value={{
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        archiveEntry,
        restoreEntry,
        permanentlyDeleteEntry,
        archiveMultiple,
        restoreMultiple,
        deleteMultiple,
        streakData,
        badges,
        completedActivities,
        addCompletedActivity,
        mindfulnessCompletions,
        completeMindfulness,
      }}
    >
      {children}
    </JournalContext.Provider>
  )
}

export function useJournal() {
  const context = useContext(JournalContext)
  if (!context) {
    throw new Error("useJournal must be used within a JournalProvider")
  }
  return context
}
