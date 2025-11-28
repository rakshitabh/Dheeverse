export type Emotion = "happy" | "calm" | "sad" | "anxious" | "angry" | "neutral" | "grateful" | "hopeful"

export type MoodScore = 1 | 2 | 3 | 4 | 5

export type EntryType = "text" | "voice" | "doodle"

export interface JournalEntry {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  mood: MoodScore
  emotions: Emotion[]
  tags: string[]
  isArchived: boolean
  entryType?: EntryType
  doodleData?: string // Base64 encoded doodle
  audioUrl?: string
  sentiment?: {
    score: number
    label: "positive" | "negative" | "neutral"
  }
  aiInsight?: string
}

export interface EmotionInsight {
  date: Date
  dominantEmotion: Emotion
  emotionBreakdown: Record<Emotion, number>
  sentimentAverage: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  lastEntryDate: Date | null
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  requirement: {
    type: "streak" | "entries" | "emotion" | "activity"
    value: number
  }
}

export interface WellnessActivity {
  id: string
  type: "breathing" | "gratitude" | "mindfulness" | "reflection"
  name: string
  description: string
  duration: number
  completedAt?: Date
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  preferences: {
    reminderTime?: string
    theme: "light" | "dark" | "system"
    notificationsEnabled: boolean
  }
}

export interface GameStats {
  moodMatcher: {
    gamesPlayed: number
    bestTime: number | null
    totalMatches: number
  }
  popIt: {
    totalPops: number
    sessionsCompleted: number
  }
}
