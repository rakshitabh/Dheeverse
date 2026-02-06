import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useJournal } from "@/lib/journal-context";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoodSelector } from "@/components/mood-selector";
import { EmotionTags } from "@/components/emotion-tags";
import { toast } from "sonner";
import { Mic, Square, Loader2 } from "lucide-react";

/* ✅ AI backend call */
async function analyzeWithAI(text) {
  const base = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${base}/api/ai-wellness`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("AI analysis failed");
  }

  return await res.json();
}

export default function JournalNewPage() {
  console.log("✅ JOURNAL NEW PAGE WITH AI ACTIVE");

  const { addEntry } = useJournal();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  const [content, setContent] = useState("");
  const [mood, setMood] = useState(3);
  const [emotions, setEmotions] = useState([]);
  const [tags, setTags] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  // Transcription cache and retry logic
  const audioHashRef = useRef(null);
  const transcriptionCacheRef = useRef({});
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 5000; // 5 second initial delay, doubles on each retry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      console.log("🚀 Analyzing with AI (Gemini first, fallback if needed)...");
      const ai = await analyzeWithAI(content);
      console.log(`✅ AI Analysis complete - Source: ${ai.source}`);

      addEntry({
        content,
        mood: ai.mood || mood,
        emotions,
        tags,
        aiInsight: ai.insight,
        recommendation: ai.recommendation,
        recommendedActivities: ai.recommendedActivities || {
          wellness: [],
          natureSounds: [],
          games: [],
        },
        intensity: ai.intensity || null,
        stressLevel: ai.stressLevel,
        keywords: ai.keywords || [],
        aiSource: ai.source, // "Gemini" or "Fallback"
        isArchived: false,
        entryType: "text",
        createdAt: new Date(),
      });

      toast.success("Entry saved successfully!", {
        description: "Your journal entry has been saved with AI insights.",
      });

      const recText = (ai.recommendation || "").toLowerCase();
      const suggestsWellness =
        recText.includes("yoga") ||
        recText.includes("mudra") ||
        recText.includes("wellness") ||
        recText.includes("grounding") ||
        recText.includes("breathing");

      if (suggestsWellness) {
        navigate("/wellness", { replace: true });
      } else {
        navigate("/journal");
      }
    } catch (err) {
      console.error("❌ Complete AI analysis failed:", err);
      // Only reaches here if backend is completely down
      // Backend already handles Gemini -> Fallback internally

      addEntry({
        content,
        mood,
        emotions,
        tags,
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
        entryType: "text",
        createdAt: new Date(),
      });

      toast.success("Entry saved successfully!", {
        description: "Your journal entry has been saved.",
      });
      navigate("/journal");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Voice handling */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });
        console.log("📼 Recording completed:", {
          size: audioFile.size,
          type: audioFile.type,
          name: audioFile.name,
        });
        setAudioFile(audioFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      toast.success("Recording started", {
        description: "Speak now. Click stop to finish.",
      });
    } catch (error) {
      console.error("Microphone access denied:", error);
      toast.error("Microphone access denied", {
        description: "Please allow microphone access to use voice recording.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("Recording stopped", {
        description: "Ready to transcribe. Click transcribe button.",
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Compute file hash to detect duplicate transcriptions
  const computeFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    setAudioFile(file || null);
    setTranscriptionError("");
  };

  const handleTranscribe = async () => {
    // Prevent multiple simultaneous transcription requests
    if (isTranscribing) {
      toast.warning("Already transcribing", {
        description: "Please wait for the current transcription to complete.",
      });
      return;
    }

    if (!audioFile) {
      toast.error("No audio file", {
        description: "Please record audio first.",
      });
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please log in again to use voice transcription.",
      });
      navigate("/login");
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError("");
    retryCountRef.current = 0;

    // Helper function for retry logic
    const transcribeWithRetry = async (attempt = 0) => {
      try {
        // Check cache first
        const hash = await computeFileHash(audioFile);
        if (transcriptionCacheRef.current[hash]) {
          console.log("✅ Using cached transcription result");
          return transcriptionCacheRef.current[hash];
        }
        audioHashRef.current = hash;

        const formData = new FormData();
        formData.append("audio", audioFile);

        const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
        console.log(`🎤 Attempt ${attempt + 1}/${MAX_RETRIES + 1}: Sending audio...`);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const res = await fetch(`${base}/api/voice/transcribe`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        console.log("📝 Transcription response:", data);

        if (!res.ok) {
          // Handle rate limit with retry
          if (res.status === 429) {
            if (attempt < MAX_RETRIES) {
              const delay = RETRY_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
              console.warn(
                `⏳ Rate limit hit. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`
              );
              toast.info("Rate limit hit", {
                description: `Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${MAX_RETRIES})`,
              });
              await new Promise((resolve) => setTimeout(resolve, delay));
              return transcribeWithRetry(attempt + 1);
            } else {
              throw new Error(
                "API rate limit exceeded after multiple retries. Please wait 10+ minutes before trying again."
              );
            }
          }

          throw new Error(data.message || data.error || "Failed to transcribe audio");
        }

        if (data.text) {
          // Cache successful transcription
          transcriptionCacheRef.current[audioHashRef.current] = data.text;
          return data.text;
        } else {
          throw new Error("No text received from transcription");
        }
      } catch (err) {
        if (attempt < MAX_RETRIES && err.message.includes("rate limit") === false) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
          console.warn(`⏳ Error occurred. Retrying in ${delay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return transcribeWithRetry(attempt + 1);
        }
        throw err;
      }
    };

    try {
      const transcribedText = await transcribeWithRetry();
      const newText = transcribedText.trim();
      
      setContent((prev) => {
        if (!prev || prev.trim() === "") return newText;
        return `${prev}\n\n${newText}`;
      });

      toast.success("Voice transcribed successfully!", {
        description: `Added ${newText.split(" ").length} words to your entry.`,
      });

      // Reset audio after successful transcription
      setAudioFile(null);
      setTranscriptionError("");
    } catch (err) {
      console.error("Transcription error:", err);
      const errorMsg = err.message || "Network error while transcribing audio";
      setTranscriptionError(errorMsg);
      toast.error("Transcription failed", {
        description: errorMsg,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">New Journal Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            How are you feeling?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Emotions */}
        <div>
          <label className="text-sm font-medium mb-2 block">Emotions</label>
          <EmotionTags selected={emotions} onChange={setEmotions} />
        </div>

        {/* Text */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Write your entry
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[200px]"
          />
        </div>

        {/* Voice Recording Section removed as requested */}

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Analyzing..." : "Save Entry"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/journal")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
