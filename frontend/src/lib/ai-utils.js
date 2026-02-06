// Simple sentiment analysis
export function analyzeSentiment(text) {
  const positiveWords = [
    "happy",
    "joy",
    "grateful",
    "excited",
    "love",
    "wonderful",
    "amazing",
    "great",
    "good",
    "peaceful",
    "calm",
    "content",
  ];
  const negativeWords = [
    "sad",
    "angry",
    "frustrated",
    "anxious",
    "worried",
    "stressed",
    "tired",
    "bad",
    "terrible",
    "awful",
    "hate",
    "disappointed",
  ];

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  const score =
    (positiveCount - negativeCount) / Math.max(text.split(" ").length, 1);

  if (score > 0.1) return { score: Math.min(score, 1), label: "positive" };
  if (score < -0.1) return { score: Math.max(score, -1), label: "negative" };
  return { score: 0, label: "neutral" };
}

// Simple emotion detection
export function detectEmotions(text) {
  const emotions = [];
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("happy") ||
    lowerText.includes("joy") ||
    lowerText.includes("excited")
  ) {
    emotions.push("happy");
  }
  if (
    lowerText.includes("calm") ||
    lowerText.includes("peaceful") ||
    lowerText.includes("relaxed")
  ) {
    emotions.push("calm");
  }
  if (
    lowerText.includes("sad") ||
    lowerText.includes("down") ||
    lowerText.includes("depressed")
  ) {
    emotions.push("sad");
  }
  if (
    lowerText.includes("anxious") ||
    lowerText.includes("worried") ||
    lowerText.includes("nervous")
  ) {
    emotions.push("anxious");
  }
  if (
    lowerText.includes("angry") ||
    lowerText.includes("mad") ||
    lowerText.includes("frustrated")
  ) {
    emotions.push("angry");
  }
  if (
    lowerText.includes("grateful") ||
    lowerText.includes("thankful") ||
    lowerText.includes("appreciate")
  ) {
    emotions.push("grateful");
  }
  if (
    lowerText.includes("hopeful") ||
    lowerText.includes("optimistic") ||
    lowerText.includes("positive")
  ) {
    emotions.push("hopeful");
  }

  return emotions.length > 0 ? emotions : ["neutral"];
}

// Generate textual insight about the entry
export function generateInsight({ content, mood, emotions, sentiment }) {
  const insights = [
    `Your entry shows ${
      sentiment.label
    } sentiment. Keep reflecting on what brings you ${
      emotions[0] || "balance"
    }.`,
    `You're feeling ${emotions.join(
      " and "
    )}. Consider what activities help you maintain this state.`,
    `Your mood rating of ${mood}/5 suggests ${
      mood >= 4 ? "positive" : mood <= 2 ? "challenging" : "balanced"
    } feelings.`,
    `Take a moment to appreciate your self-awareness in recognizing these emotions.`,
  ];

  return insights[Math.floor(Math.random() * insights.length)];
}

// Recommend yoga poses and mudras based on emotional state / sentiment
export function getRecommendations({ mood, emotions, sentiment }) {
  const recs = [];
  const emoSet = new Set(emotions);
  const label = sentiment.label;

  // Negative / anxious states → calming practices
  if (
    emoSet.has("anxious") ||
    emoSet.has("angry") ||
    label === "negative" ||
    mood <= 2
  ) {
    recs.push(
      {
        type: "yoga",
        id: "child_pose",
        name: "Child's Pose (Balasana)",
        reason: "Helps reduce stress and calm the nervous system.",
      },
      {
        type: "mudra",
        id: "gyan_mudra",
        name: "Gyan Mudra",
        reason: "Supports focus and reduces anxiety.",
      },
      {
        type: "yoga",
        id: "box_breathing",
        name: "Box Breathing",
        reason: "Balances breath and reduces anxiety.",
      }
    );
  }

  // Sad / low mood → gentle uplifting practices
  if (emoSet.has("sad") || mood <= 3) {
    recs.push(
      {
        type: "yoga",
        id: "cat_cow",
        name: "Cat-Cow Stretch",
        reason: "Gently mobilizes the spine and improves energy flow.",
      },
      {
        type: "mudra",
        id: "prana_mudra",
        name: "Prana Mudra",
        reason: "Helps increase vitality and reduce fatigue.",
      }
    );
  }

  // Neutral / calm / grateful → grounding practices
  if (
    emoSet.has("calm") ||
    emoSet.has("grateful") ||
    emoSet.has("hopeful") ||
    label === "neutral"
  ) {
    recs.push(
      {
        type: "yoga",
        id: "mountain_pose",
        name: "Mountain Pose (Tadasana)",
        reason: "Builds grounding and body awareness.",
      },
      {
        type: "mudra",
        id: "apan_mudra",
        name: "Apan Mudra",
        reason: "Supports emotional clarity and detoxification.",
      }
    );
  }

  // Positive / high mood → integration / gratitude
  if (emoSet.has("happy") || label === "positive" || mood >= 4) {
    recs.push(
      {
        type: "yoga",
        id: "savasana",
        name: "Corpse Pose (Savasana)",
        reason: "Helps integrate positive experiences and rest the mind.",
      },
      {
        type: "practice",
        id: "gratitude_journaling",
        name: "Gratitude Journaling",
        reason: "Reinforces positive emotions and resilience.",
      }
    );
  }

  // De-duplicate by id
  const unique = [];
  const seen = new Set();
  for (const r of recs) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      unique.push(r);
    }
  }

  return unique;
}

// Call backend AI wellness endpoint
export async function analyzeEntryWithServer(text) {
  try {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${base}/api/ai-wellness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('AI service error');
    return await res.json(); // { mood, recommendation }
  } catch (err) {
    console.error('analyzeEntryWithServer error:', err);
    return null;
  }
}
