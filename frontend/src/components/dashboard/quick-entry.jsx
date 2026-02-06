import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Mic, Palette, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoodSelector } from "@/components/mood-selector";
import { useJournal } from "@/lib/journal-context";

export function QuickEntry() {
  const navigate = useNavigate();
  const { addEntry } = useJournal();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Backend AI call
  const analyzeWithAI = async (text) => {
    const base = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${base}/api/ai-wellness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error("AI analysis failed");

    return await res.json();
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      // ✅ Call AI backend (tries Gemini first, falls back automatically on backend)
      const ai = await analyzeWithAI(content);

      const entry = {
        content,
        mood: ai.mood, // AI-generated mood (from Gemini or fallback)
        aiInsight: ai.insight || null,
        recommendation: ai.recommendation,
        recommendedActivities: ai.recommendedActivities || {
          wellness: [],
          natureSounds: [],
          games: [],
        },
        question: ai.question,
        intensity: ai.intensity || null,
        stressLevel: ai.stressLevel,
        keywords: ai.keywords || [],
        aiSource: ai.source, // Will be "Gemini" or "Fallback"
        isArchived: false,
        createdAt: new Date(),
      };

      await addEntry(entry);

      setContent("");
      setMood(3);
    } catch (err) {
      console.error("❌ Complete AI analysis failed:", err);
      // Only use this fallback if the entire backend call fails
      // The backend already has Gemini -> Fallback logic
      await addEntry({
        content,
        mood: "Neutral",
        aiInsight: "Unable to analyze entry at this time.",
        recommendation: "Take a moment to reflect on your feelings.",
        recommendedActivities: {
          wellness: [],
          natureSounds: [],
          games: [],
        },
        stressLevel: "Low",
        keywords: [],
        aiSource: "Manual",
        isArchived: false,
        createdAt: new Date(),
      });
    }

    setIsSubmitting(false);
  };

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
          <p className="mb-2 text-sm text-muted-foreground">
            How are you feeling?
          </p>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <Textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2" />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/journal/new")}>
              Full Editor
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isSubmitting ? "Analyzing..." : "Save Entry"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
