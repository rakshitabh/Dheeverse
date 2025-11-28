import type { Emotion, JournalEntry } from "./types"

// Sentiment analysis using basic NLP patterns (simulating VADER-like analysis)
export function analyzeSentiment(text: string): { score: number; label: "positive" | "negative" | "neutral" } {
  const positiveWords = [
    "happy",
    "joy",
    "love",
    "grateful",
    "amazing",
    "wonderful",
    "great",
    "beautiful",
    "peaceful",
    "calm",
    "excited",
    "blessed",
    "thankful",
    "hopeful",
    "inspired",
    "delighted",
    "cheerful",
    "content",
    "satisfied",
    "proud",
    "confident",
  ]

  const negativeWords = [
    "sad",
    "angry",
    "frustrated",
    "anxious",
    "worried",
    "stressed",
    "overwhelmed",
    "depressed",
    "lonely",
    "scared",
    "hurt",
    "disappointed",
    "upset",
    "terrible",
    "awful",
    "miserable",
    "hopeless",
    "exhausted",
    "irritated",
    "annoyed",
  ]

  const words = text.toLowerCase().split(/\s+/)
  let positiveCount = 0
  let negativeCount = 0

  for (const word of words) {
    if (positiveWords.some((pw) => word.includes(pw))) positiveCount++
    if (negativeWords.some((nw) => word.includes(nw))) negativeCount++
  }

  const total = positiveCount + negativeCount
  if (total === 0) return { score: 0.5, label: "neutral" }

  const score = (positiveCount - negativeCount + total) / (2 * total)

  if (score > 0.6) return { score, label: "positive" }
  if (score < 0.4) return { score, label: "negative" }
  return { score, label: "neutral" }
}

// Emotion detection based on text patterns
export function detectEmotions(text: string): Emotion[] {
  const emotionPatterns: Record<Emotion, string[]> = {
    happy: ["happy", "joy", "excited", "delighted", "cheerful", "fun", "laugh", "smile"],
    calm: ["calm", "peaceful", "relaxed", "serene", "tranquil", "quiet", "still"],
    sad: ["sad", "cry", "tears", "miss", "lost", "grief", "sorrow", "melancholy"],
    anxious: ["anxious", "worried", "nervous", "stressed", "overwhelmed", "panic", "fear"],
    angry: ["angry", "frustrated", "annoyed", "irritated", "furious", "mad", "rage"],
    neutral: [],
    grateful: ["grateful", "thankful", "blessed", "appreciate", "gratitude", "lucky"],
    hopeful: ["hopeful", "optimistic", "looking forward", "excited about", "anticipate", "hope"],
  }

  const lowerText = text.toLowerCase()
  const detectedEmotions: Emotion[] = []

  for (const [emotion, patterns] of Object.entries(emotionPatterns) as [Emotion, string[]][]) {
    if (patterns.some((pattern) => lowerText.includes(pattern))) {
      detectedEmotions.push(emotion)
    }
  }

  return detectedEmotions.length > 0 ? detectedEmotions : ["neutral"]
}

// Generate AI insight based on entry content and emotions
export function generateInsight(entry: Partial<JournalEntry>): string {
  const insights: Record<string, string[]> = {
    happy: [
      "It's wonderful to see you experiencing joy. Savoring these positive moments can help build emotional resilience.",
      "Your happiness shines through your words. Consider noting what specifically brought you this joy.",
      "Celebrating the good times is important for mental wellness. Keep nurturing what brings you happiness.",
    ],
    calm: [
      "Finding moments of peace is essential for wellbeing. You're doing great at creating space for tranquility.",
      "Inner calm is a powerful state. The practices that led you here are worth continuing.",
      "Serenity comes from within. Your ability to find peace shows strong emotional awareness.",
    ],
    sad: [
      "It's okay to feel sad. Acknowledging these emotions is an important part of processing them.",
      "Remember that difficult feelings are temporary. Be gentle with yourself during this time.",
      "Sadness often carries important messages. Consider what this feeling might be telling you.",
    ],
    anxious: [
      "Anxiety can feel overwhelming, but you're taking a healthy step by writing about it.",
      "Breathing exercises and grounding techniques can help manage anxious feelings. Would you like to try one?",
      "Naming your worries is the first step to addressing them. You're showing great self-awareness.",
    ],
    grateful: [
      "Practicing gratitude has proven benefits for mental health. You're building a positive habit.",
      "Noticing what you're thankful for shifts focus to abundance. Keep cultivating this mindset.",
      "Gratitude is like a muscle - the more you exercise it, the stronger it becomes.",
    ],
    hopeful: [
      "Hope is a powerful force. Your optimism can help you navigate challenges ahead.",
      "Looking forward with hope shows resilience. Hold onto this positive outlook.",
      "Your hopefulness is inspiring. Keep nurturing the dreams and goals that excite you.",
    ],
  }

  const emotions = entry.emotions || ["neutral"]
  const primaryEmotion = emotions[0]
  const relevantInsights = insights[primaryEmotion] || [
    "Thank you for sharing your thoughts. Regular journaling helps build self-awareness.",
    "Taking time to reflect is a gift to yourself. Keep exploring your inner landscape.",
    "Every entry is a step on your wellness journey. You're doing important work.",
  ]

  return relevantInsights[Math.floor(Math.random() * relevantInsights.length)]
}

// Generate reflection prompts based on recent emotions
export function generatePrompt(recentEmotions: Emotion[]): string {
  const prompts: Record<string, string[]> = {
    default: [
      "What made you smile today, even briefly?",
      "Describe a moment when you felt truly present.",
      "What are you looking forward to this week?",
      "Write about someone who positively influenced your day.",
      "What small act of kindness did you witness or perform today?",
    ],
    anxious: [
      "What would you tell a friend who felt the way you do right now?",
      "List three things within your control that could improve your situation.",
      "What's one small step you could take today to feel more grounded?",
      "Describe a time when you overcame a similar challenge.",
    ],
    sad: [
      "What comfort would you offer your younger self right now?",
      "Write about a happy memory that brings you warmth.",
      "What do you need most right now? How can you give that to yourself?",
      "Describe something beautiful you noticed today.",
    ],
    happy: [
      "What specifically contributed to your good mood today?",
      "How can you create more moments like this?",
      "Who would you like to share this happiness with?",
      "What lesson from today would you like to remember?",
    ],
  }

  const hasAnxious = recentEmotions.includes("anxious")
  const hasSad = recentEmotions.includes("sad")
  const hasHappy = recentEmotions.includes("happy")

  let promptList = prompts.default
  if (hasAnxious) promptList = prompts.anxious
  else if (hasSad) promptList = prompts.sad
  else if (hasHappy) promptList = prompts.happy

  return promptList[Math.floor(Math.random() * promptList.length)]
}
