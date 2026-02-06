const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize OpenAI client
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const GEMINI_MODEL = "gemini-2.5-flash";
// Initialize Gemini client
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Mood categories (priority)
const MOODS = [
  "Happy",
  "Calm",
  "Neutral",
  "Sad",
  "Stressed",
  "Angry",
  "Anxious",
  "Tired",
  "Confused",
  "Overwhelmed",
];

// Valid recommendation types (exactly 6 options)
const VALID_RECOMMENDATIONS = [
  "Yoga",
  "Mudras",
  "Breathing exercises",
  "Mindfulness practices",
  "Quick games for mood uplift",
  "Motivation / positivity prompts",
];

// Recommendation mapping - maps each mood to one of the 6 valid types
const RECOMMENDATIONS = {
  Happy: "Motivation / positivity prompts",
  Calm: "Mindfulness practices",
  Neutral: "Mindfulness practices",
  Sad: "Mindfulness practices",
  Stressed: "Breathing exercises",
  Angry: "Breathing exercises",
  Anxious: "Breathing exercises",
  Tired: "Mudras",
  Confused: "Mindfulness practices",
  Overwhelmed: "Quick games for mood uplift",
};

// ✨ DYNAMIC WELLNESS ACTIVITIES (based on emotion) ✨
const WELLNESS_ACTIVITIES = {
  wellness: [
    "Breathing exercises",
    "Yoga",
    "Mudras",
    "Mindfulness practices",
    "Motivation / positivity prompts",
  ],
  natureSounds: ["Rain", "Forest", "River", "Wind"],
  games: ["Flow Free", "Sudoku", "Word Search", "Doodle"],
};

// Activity recommendations by mood (emotion-based)
const ACTIVITY_RECOMMENDATIONS_BY_MOOD = {
  Happy: {
    wellness: ["Motivation / positivity prompts"],
    natureSounds: ["Forest"],
    games: ["Doodle"],
  },
  Calm: {
    wellness: ["Mindfulness practices"],
    natureSounds: ["River"],
    games: ["Flow Free"],
  },
  Neutral: {
    wellness: ["Mindfulness practices"],
    natureSounds: ["Forest"],
    games: ["Sudoku"],
  },
  Sad: {
    wellness: ["Mindfulness practices", "Motivation / positivity prompts"],
    natureSounds: ["Rain"],
    games: ["Doodle"],
  },
  Stressed: {
    wellness: ["Breathing exercises", "Yoga"],
    natureSounds: ["Forest", "Rain"],
    games: ["Flow Free"],
  },
  Angry: {
    wellness: ["Breathing exercises", "Yoga"],
    natureSounds: ["Wind", "River"],
    games: ["Doodle"],
  },
  Anxious: {
    wellness: ["Breathing exercises", "Mudras", "Mindfulness practices"],
    natureSounds: ["Rain", "Forest"],
    games: ["Flow Free"],
  },
  Tired: {
    wellness: ["Mudras", "Yoga"],
    natureSounds: ["River", "Wind"],
    games: ["Sudoku"],
  },
  Confused: {
    wellness: ["Mindfulness practices"],
    natureSounds: ["Forest"],
    games: ["Sudoku"],
  },
  Overwhelmed: {
    wellness: ["Breathing exercises", "Mindfulness practices"],
    natureSounds: ["Rain", "River"],
    games: ["Flow Free"],
  },
};

// Function to get emotion-based activity recommendations
function getRecommendedActivities(mood) {
  return (
    ACTIVITY_RECOMMENDATIONS_BY_MOOD[mood] ||
    ACTIVITY_RECOMMENDATIONS_BY_MOOD.Neutral
  );
}

// Keyword map
const KEYWORD_MAP = [
  { mood: "Happy", keywords: ["happy", "joy", "yay", "glad", "excited"] },
  { mood: "Calm", keywords: ["calm", "peaceful", "relaxed", "serene"] },
  { mood: "Sad", keywords: ["sad", "down", "depressed", "unhappy", "tears"] },
  {
    mood: "Stressed",
    keywords: ["stressed", "overworked", "pressure", "burnout"],
  },
  { mood: "Angry", keywords: ["angry", "mad", "furious", "irritated"] },
  {
    mood: "Anxious",
    keywords: ["anxious", "anxiety", "worried", "nervous", "panic"],
  },
  { mood: "Tired", keywords: ["tired", "exhausted", "sleepy", "fatigued"] },
  { mood: "Confused", keywords: ["confused", "lost", "uncertain", "unsure"] },
  {
    mood: "Overwhelmed",
    keywords: ["overwhelmed", "too much", "flooded", "swamped"],
  },
];

// ------------------------
// LOCAL keyword-based mood detection
// ------------------------
function pickMoodFromText(text) {
  if (!text || typeof text !== "string") return "Neutral";
  const lower = text.toLowerCase();

  if (/[😊🙂😄😁]/.test(text)) return "Happy";
  if (/[😢😭]/.test(text)) return "Sad";

  const counts = {};
  for (const entry of KEYWORD_MAP) {
    for (const k of entry.keywords) {
      if (lower.includes(k)) {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
      }
    }
  }

  const positive = [
    "happy",
    "joy",
    "grateful",
    "good",
    "great",
    "love",
    "calm",
    "relaxed",
  ];
  const negative = [
    "sad",
    "angry",
    "stressed",
    "anxious",
    "worried",
    "tired",
    "overwhelmed",
    "depressed",
  ];
  let posScore = 0,
    negScore = 0;
  for (const p of positive) if (lower.includes(p)) posScore++;
  for (const n of negative) if (lower.includes(n)) negScore++;

  let best = null,
    bestCount = 0;
  for (const [mood, c] of Object.entries(counts)) {
    if (c > bestCount) {
      best = mood;
      bestCount = c;
    }
  }
  if (best) return best;

  if (posScore > negScore) return "Happy";
  if (negScore > posScore) {
    if (/anxious|worried|panic|nervous/.test(lower)) return "Anxious";
    if (/angry|mad|furious/.test(lower)) return "Angry";
    if (/stressed|overworked|burnout/.test(lower)) return "Stressed";
    if (/tired|exhausted|sleepy/.test(lower)) return "Tired";
    return "Sad";
  }

  return "Neutral";
}

function recommendForMood(mood) {
  return RECOMMENDATIONS[mood] || "Mindfulness practices";
}

// Normalize recommendation to ensure it matches one of the 6 valid types
function normalizeRecommendation(recommendation) {
  if (!recommendation || typeof recommendation !== "string") {
    return "Mindfulness practices";
  }

  const lower = recommendation.toLowerCase().trim();

  // Map variations to exact types
  if (lower.includes("yoga")) return "Yoga";
  if (lower.includes("mudra")) return "Mudras";
  if (lower.includes("breath") || lower.includes("breathing"))
    return "Breathing exercises";
  if (lower.includes("mindful") || lower.includes("meditation"))
    return "Mindfulness practices";
  if (lower.includes("game") || lower.includes("play"))
    return "Quick games for mood uplift";
  if (
    lower.includes("motivation") ||
    lower.includes("positivity") ||
    lower.includes("prompt")
  ) {
    return "Motivation / positivity prompts";
  }

  // Default fallback
  return "Mindfulness practices";
}

// ------------------------
// AI-POWERED ROUTE (Using Gemini)
// ------------------------
router.post("/", async (req, res) => {
  try {
    const { text = "" } = req.body || {};

    // 1️⃣ CALL GEMINI FOR ADVANCED ANALYSIS
    let aiJson = null;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const prompt = `You are a compassionate, empathetic journaling companion who deeply understands human emotions, devotion, and the complexities of feelings and mood variations. Your role is to provide gentle, validating support. Do not add reflective questions.

User provided a journal entry. Analyze it with emotional intelligence and provide:

1) EMOTION DETECTION (Required):
   - primary_emotion: one of ${MOODS.join(
     ", "
   )} (pick the MOST prominent emotion)
   - secondary_emotion: optional secondary emotion or null
   - stress_level: Low | Medium | High
   - keywords: array of 3-5 key emotional words
   - intensity: 1-10 scale of emotional intensity

2) EMOTIONAL REFLECTION (Required):
   - 2-3 sentences, empathetic, personalized to the text
   - Avoid generic phrases, avoid repeating the same pattern across entries
   - If text is noisy/off-topic, still acknowledge and guide gently
   - Format: start with "Emotional Reflection: " then the reflection

3) WELLNESS SUGGESTIONS (Required, NO questions):
   Hybrid logic (respect these rules):
   - If stress_level = High -> prioritize: breathing exercises + grounding + short reassurance
   - If stress_level = Medium -> journaling prompt + light movement or stretching
   - If stress_level = Low -> positive reinforcement + brief mindfulness
   Allowed suggestion types: Breathing exercises, Grounding techniques, Short mindfulness, Music/sounds, Gentle physical activities, Affirmations, Journaling prompts.
   Provide 2-3 concise, actionable steps (no questions). Avoid generic “just relax”.
   Format: start with "Wellness Suggestions: " then list the steps in one string.

4) RECOMMENDATION TYPE:
   Choose ONE best fit from: Yoga, Mudras, Breathing exercises, Mindfulness practices, Quick games for mood uplift, Motivation / positivity prompts

IMPORTANT RULES:
- No reflective questions in the output.
- Be genuinely empathetic and specific; avoid repeating the same template.
- No diagnosing, no medical claims, no therapy language.
- Keep suggestions safe, short, and actionable.
- If spiritual/devotional themes are present, acknowledge respectfully.
- Handle edge cases: if text is empty/noisy/off-topic, provide a gentle clarification and a simple calming suggestion.

Return ONLY valid JSON (no markdown, no code blocks) in this exact shape:
{
  "primary_emotion": "one of the mood options",
  "secondary_emotion": "optional emotion or null",
  "stress_level": "Low|Medium|High",
  "keywords": ["word1", "word2", "word3"],
  "intensity": 5,
  "reflection": "Emotional Reflection: ...",
  "recommendation": "Wellness Suggestions: ...",
  "recommendation_type": "one of the 6 types"
}

User entry:
${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        console.log("✅ Gemini raw response:", responseText);

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = responseText.trim();
        if (jsonText.startsWith("```json")) {
          jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/```\n?/g, "");
        }

        aiJson = JSON.parse(jsonText);
        console.log("✅ Gemini parsed JSON:", aiJson);

        // Map primary_emotion to mood
        if (aiJson.primary_emotion) {
          aiJson.mood = aiJson.primary_emotion;
        }
      } catch (err) {
        console.error("❌ Gemini failed:", err.message);
        console.error("Full error:", err);
      }
    } else {
      console.log("⚠️ Gemini API key not configured");
    }

    // 2️⃣ IF AI WORKED → USE AI OUTPUT
    if (aiJson && aiJson.mood) {
      // Normalize mood to ensure it's one of the valid moods
      const detectedMood = MOODS.includes(aiJson.mood)
        ? aiJson.mood
        : "Neutral";

      // Get recommendation text and type
      let recommendationText = aiJson.recommendation || "";
      let recommendationType =
        aiJson.recommendation_type || recommendForMood(detectedMood);

      // Normalize recommendation type to ensure it's one of the 6 valid types
      recommendationType = normalizeRecommendation(recommendationType);

      // Get dynamic activity recommendations based on mood
      const recommendedActivities = getRecommendedActivities(detectedMood);

      console.log("✅ Sending AI response:", {
        mood: detectedMood,
        recommendationType,
        hasReflection: !!aiJson.reflection,
        hasRecommendation: !!recommendationText,
        recommendedActivities,
      });

      return res.json({
        mood: detectedMood,
        intensity: aiJson.intensity || null,
        stressLevel: aiJson.stress_level || null,
        keywords: aiJson.keywords || [],
        secondaryEmotion: aiJson.secondary_emotion || null,
        insight:
          aiJson.reflection ||
          "Emotional Reflection: You're reflecting on your thoughts and emotions right now.",
        recommendation: recommendationText
          ? recommendationText.startsWith("Wellness Suggestions:")
            ? recommendationText
            : `Wellness Suggestions: ${recommendationText}`
          : `Wellness Suggestions: ${recommendationType}`,
        recommendationType: recommendationType,
        recommendedActivities: recommendedActivities,
        source: "Gemini",
      });
    }

    // 3️⃣ IF AI FAILED → USE LOCAL FALLBACK
    const mood = pickMoodFromText(text);
    const recommendation = normalizeRecommendation(recommendForMood(mood));

    // Simple stress inference
    const lowered = text.toLowerCase();
    const stressLevel =
      /overwhelm|panic|anxious|stressed|pressure|furious|angry/.test(lowered)
        ? "High"
        : /tired|exhausted|nervous|worried|sad|low/.test(lowered)
        ? "Medium"
        : "Low";

    // Lightweight keyword extraction (top 5 unique words longer than 3 chars)
    const keywords = Array.from(
      new Set(
        lowered
          .split(/[^a-z]+/i)
          .filter((w) => w.length > 3)
          .slice(0, 5)
      )
    );

    // Lightweight keyword-based reflection (varied by mood)
    const reflectionTemplates = {
      Stressed: [
        "Emotional Reflection: It sounds like the pressure is high right now; acknowledging it is a strong first step.",
        "Emotional Reflection: You're carrying a lot—it's okay to pause and take the smallest possible next step.",
      ],
      Anxious: [
        "Emotional Reflection: There's a thread of worry here; noticing it helps you choose a calmer next move.",
        "Emotional Reflection: Your mind feels restless; giving it one small anchor might help steady things.",
      ],
      Angry: [
        "Emotional Reflection: There's heat and frustration—your feelings are valid; let's channel them safely.",
        "Emotional Reflection: Something crossed a boundary; naming it clearly can help you regain calm.",
      ],
      Sad: [
        "Emotional Reflection: There's heaviness here; offering yourself a bit of kindness matters right now.",
        "Emotional Reflection: It feels low today; even a tiny comfort can be a start.",
      ],
      Tired: [
        "Emotional Reflection: Your energy sounds drained; it's okay to conserve and go gently.",
        "Emotional Reflection: Fatigue is real—small, kind steps can help refill your tank.",
      ],
      Happy: [
        "Emotional Reflection: There's lightness here; noticing what supports it can help you keep it going.",
        "Emotional Reflection: You sound uplifted—enjoy the moment and note what fuels it.",
      ],
      Calm: [
        "Emotional Reflection: You sound settled; this steady space is valuable.",
        "Emotional Reflection: There's a sense of ease—see what habits help you stay here.",
      ],
      Neutral: [
        "Emotional Reflection: It feels balanced; gentle awareness can guide your next steps.",
        "Emotional Reflection: You're observing without strong swings—that neutrality can be a stable base.",
      ],
      Overwhelmed: [
        "Emotional Reflection: Everything feels like a lot; it's okay to shrink the task and take one breath.",
        "Emotional Reflection: Overload is showing up—paring back to one priority can help you breathe.",
      ],
      Confused: [
        "Emotional Reflection: Things feel unclear; naming one thing you know can offer footing.",
        "Emotional Reflection: Uncertainty is present; a tiny, low-stakes step can reduce the fog.",
      ],
    };

    const reflectionPool =
      reflectionTemplates[mood] || reflectionTemplates.Neutral;
    const reflection =
      reflectionPool[Math.floor(Math.random() * reflectionPool.length)] ||
      "Emotional Reflection: You're reflecting on your thoughts and emotions right now.";

    // Dynamic recommendation text with variation
    const recommendationVariations = {
      High_Stressed: [
        "Try 3 rounds of box breathing (inhale 4s, hold 4s, exhale 6s), add a 2-minute grounding exercise, and take a screen break.",
        "Practice alternate nostril breathing for 3 minutes, do 5 slow shoulder rolls, and step away from your workspace for 5 minutes.",
        "Try the 4-7-8 breathing technique (inhale 4s, hold 7s, exhale 8s), write down 3 urgent tasks, and tackle only the most important one.",
      ],
      High_Anxious: [
        "Practice 4-6 breathing for 2 minutes, try Gyan or Prana Mudra for 3 minutes, and ground with the 5-4-3-2-1 senses check.",
        "Do progressive muscle relaxation starting from your toes, practice box breathing for 5 minutes, and write down what's within your control.",
        "Try diaphragmatic breathing while placing one hand on your chest and one on your belly, listen to calming music for 5 minutes, then stretch gently.",
      ],
      High_Angry: [
        "Do 5 slow exhales twice, try Vajrasana with deep breathing for 2 minutes, and write one boundary you want to state calmly.",
        "Practice intense exhales (like blowing out candles) 10 times, do 5 minutes of vigorous movement, then journal about what triggered you.",
        "Try the lion's breath (loud exhale with tongue out) 5 times, punch a pillow safely, then do 3 minutes of calm breathing.",
      ],
      High_Overwhelmed: [
        "Write down everything on your mind for 2 minutes without judgment, pick ONE task to do now, and give yourself permission to ignore the rest temporarily.",
        "Close your eyes and count to 10 slowly, make a list and circle only the top 2 priorities, then do 5 minutes of gentle stretching.",
        "Try the STOP technique (Stop, Take a breath, Observe, Proceed mindfully), break your biggest task into 3 tiny steps, and tackle just the first one.",
      ],
      Medium_Stressed: [
        "Write one draining thought then one supportive sentence, do a gentle neck/shoulder roll set, and take a short mindful walk or stretch.",
        "Journal for 5 minutes about what's weighing on you, do 10 gentle spinal twists, and drink a glass of water mindfully.",
        "List 3 things you're grateful for today, practice cat-cow stretches for 2 minutes, and take 5 slow deep breaths.",
      ],
      Medium_Anxious: [
        "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste, then breathe slowly for 2 minutes.",
        "Write a worry list and set it aside for later, do ankle and wrist circles, and practice belly breathing for 3 minutes.",
        "Create a 'what if' worry list then write 'so what' responses, practice forward folds for 1 minute, and listen to nature sounds.",
      ],
      Medium_Sad: [
        "Place a hand on your heart and breathe slowly for 2 minutes, write one thing offering warmth, and take a gentle 5-minute walk.",
        "Listen to an uplifting song you love, write a kind letter to yourself, and do some light movement or dance.",
        "Call or text someone who makes you smile, journal about one good memory, and make yourself a comforting drink.",
      ],
      Medium_Tired: [
        "Do 3 rounds of diaphragmatic breathing, a light forward fold for 30 seconds, and sip water while stepping outside for fresh air.",
        "Splash cool water on your face, do 5 gentle sun salutations, and eat a healthy snack with protein.",
        "Take a 10-minute power nap if possible, do neck rolls and arm stretches, and step outside for sunshine and fresh air.",
      ],
      Low_Happy: [
        "Write down what's making you happy to remember later, share your joy with someone, and do an energizing activity you love.",
        "Take a moment to savor this feeling fully, capture it in a photo or note, and pay this positivity forward with a kind gesture.",
        "Dance to your favorite upbeat song, call someone to share good news, and write 3 things you're looking forward to.",
      ],
      Low_Calm: [
        "Notice and appreciate this peaceful moment, practice 2 minutes of gratitude meditation, and set an intention for your next activity.",
        "Do a brief body scan to notice the calm sensations, write 3 things going well, and maintain this energy with slow, mindful movements.",
        "Practice loving-kindness meditation for yourself and others for 3 minutes, stretch gently, and reflect on what helped create this calm.",
      ],
      Low_Neutral: [
        "Take a slow breath-in/longer breath-out for 2 minutes, note one helpful thought, and move lightly for a couple of minutes.",
        "Practice a short mindfulness check-in, do some gentle stretches, and set a small intention for the rest of your day.",
        "Notice your current environment with fresh attention, do 5 minutes of light movement, and drink water mindfully.",
      ],
    };

    const getRecommendationText = (mood, stressLevel) => {
      const key = `${stressLevel}_${mood}`;
      const variations =
        recommendationVariations[key] ||
        recommendationVariations[`${stressLevel}_Neutral`] ||
        [];

      if (variations.length > 0) {
        // Use text length and timestamp to create variation (pseudo-random but deterministic)
        const index = (text.length + Date.now()) % variations.length;
        return "Wellness Suggestions: " + variations[index];
      }

      // Ultimate fallback
      return "Wellness Suggestions: Take a slow breath-in/longer breath-out for 2 minutes, note one helpful thought, and move lightly for a couple of minutes.";
    };

    const recommendationText = getRecommendationText(mood, stressLevel);
    const recommendedActivities = getRecommendedActivities(mood);

    return res.json({
      mood,
      intensity: null,
      insight: reflection,
      recommendation: recommendationText,
      recommendationType: recommendForMood(mood),
      stressLevel,
      keywords,
      recommendedActivities: recommendedActivities,
      source: "Fallback",
    });
  } catch (err) {
    console.error("AI wellness error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------
// YOGA/MUDRA SUGGESTIONS (Using OpenAI)
// ------------------------
router.post("/suggest", async (req, res) => {
  try {
    const { type = "yoga", mood = "Neutral", context = "" } = req.body || {};
    let suggestion = null;

    if (openaiClient) {
      try {
        const prompt =
          type === "mudra"
            ? `Suggest a specific yoga mudra (hand gesture) for someone feeling ${mood}. ${
                context ? `Context: ${context}` : ""
              } Provide:
1. Mudra name
2. How to perform it (step-by-step)
3. Benefits for this mood
4. Duration recommendation
Return as JSON: { "name": "...", "instructions": "...", "benefits": "...", "duration": "..." }`
            : `Suggest a specific yoga pose or sequence for someone feeling ${mood}. ${
                context ? `Context: ${context}` : ""
              } Provide:
1. Pose/sequence name
2. How to perform it (step-by-step)
3. Benefits for this mood
4. Duration recommendation
Return as JSON: { "name": "...", "instructions": "...", "benefits": "...", "duration": "..." }`;

        const response = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a yoga and wellness expert. Provide specific, actionable suggestions in JSON format.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        suggestion = JSON.parse(response.choices[0].message.content);
      } catch (err) {
        console.error("❌ OpenAI suggestion failed:", err.message);
      }
    }

    // Fallback suggestion if API failed or not configured
    if (!suggestion) {
      suggestion = {
        name: type === "mudra" ? "Gyan Mudra" : "Child's Pose",
        instructions:
          type === "mudra"
            ? "Touch the tip of your thumb to the tip of your index finger, keeping other fingers straight."
            : "Kneel on the floor, sit back on your heels, and fold forward resting your forehead on the ground.",
        benefits: "Promotes calmness and mental clarity",
        duration: "5-10 minutes",
      };
    }

    return res.json({
      type,
      suggestion,
      source: openaiClient && suggestion ? "OpenAI" : "Fallback",
    });
  } catch (err) {
    console.error("Suggestion error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
