"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useJournal } from "@/lib/journal-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Friendly, supportive responses based on context
const generateResponse = (message: string, recentMood: number | null): string => {
  const lowerMessage = message.toLowerCase()

  // Greeting responses
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return "Hey there, friend! I'm so glad you're here. How are you feeling today? Remember, there's no right or wrong answer - just what's true for you right now. 💚"
  }

  // Feeling anxious/stressed
  if (lowerMessage.includes("anxious") || lowerMessage.includes("stressed") || lowerMessage.includes("worried")) {
    return "I hear you, and it's completely okay to feel this way. Anxiety can feel overwhelming, but you're not alone in this. Here are some things that might help:\n\n• Try a calming breathing exercise (4-7-8 technique works great)\n• Practice the Gyan Mudra - touch your thumb to your index finger while you breathe\n• Listen to some nature sounds to ground yourself\n• Journal about what's worrying you\n\nI'm right here with you. 🌿"
  }

  // Feeling sad/down
  if (
    lowerMessage.includes("sad") ||
    lowerMessage.includes("down") ||
    lowerMessage.includes("depressed") ||
    lowerMessage.includes("lonely")
  ) {
    return "I'm really sorry you're going through this. It takes courage to acknowledge when we're feeling low. Your feelings are valid, and this heaviness won't last forever. Some things that might bring comfort:\n\n• Try Child's Pose - it's like giving yourself a hug\n• Write about what's on your heart in your journal\n• Practice gratitude - even one small thing counts\n• Listen to soothing nature sounds\n• Remember: you're not alone in this\n\nI'm here to listen. 💙"
  }

  // Feeling happy/good
  if (
    lowerMessage.includes("happy") ||
    lowerMessage.includes("good") ||
    lowerMessage.includes("great") ||
    lowerMessage.includes("amazing")
  ) {
    return "That's wonderful to hear! I'm genuinely happy for you. These positive moments are precious - let me suggest:\n\n• Capture this feeling in a journal entry\n• Reflect on what's bringing you this joy\n• Share your happiness with someone\n• Save this memory to revisit when you need it\n\nWhat's bringing you this happiness today? ✨"
  }

  // Sleep issues
  if (lowerMessage.includes("sleep") || lowerMessage.includes("insomnia") || lowerMessage.includes("tired")) {
    return "Sleep struggles can really affect our whole day. I understand how frustrating that can be. Here's what might help:\n\n• Try our nature sounds before bed - rain or ocean waves are soothing\n• Practice the Prana Mudra before sleep\n• A gentle gratitude practice - name three good things from your day\n• Use Corpse Pose (Savasana) for deep relaxation\n• Keep a consistent sleep schedule\n\nSweet dreams are possible, friend. 🌙"
  }

  // Looking for activities
  if (lowerMessage.includes("what can i do") || lowerMessage.includes("suggest") || lowerMessage.includes("help me")) {
    return "I'd love to help! Here are some wellness activities you can try right now:\n\n• Write a journal entry to process your thoughts\n• Do a breathing exercise for calm and clarity\n• Explore yoga poses and mudras in the Wellness section\n• Listen to nature sounds to relax\n• Practice gratitude with our guided prompts\n• Try a quick mindfulness activity\n\nWhat feels right for you in this moment? 🌸"
  }

  // Breathing/meditation
  if (lowerMessage.includes("breathing") || lowerMessage.includes("meditat") || lowerMessage.includes("calm")) {
    return "Wonderful choice! Here's what I recommend:\n\n• Box Breathing is powerful: breathe in for 4 counts, hold for 4, exhale for 4, hold for 4\n• Try the Chin Mudra (thumb and index finger touching, palms up)\n• Find a quiet space free from distractions\n• Start with just 2-3 minutes\n• Use our Breathing exercises in the Wellness section\n\nYou've got this. 🧘"
  }

  // Yoga/mudras
  if (lowerMessage.includes("yoga") || lowerMessage.includes("mudra") || lowerMessage.includes("pose")) {
    return "Yoga and mudras are beautiful practices! Here's what to know:\n\n• Gyan Mudra: Great for anxiety and focus\n• Prana Mudra: Perfect for energy and vitality\n• Child's Pose: Excellent for grounding\n• Mountain Pose: Builds confidence and awareness\n• Corpse Pose: The ultimate relaxation pose\n\nVisit the Wellness section for detailed instructions. Which appeals to you most? 🙏"
  }

  // Gratitude
  if (lowerMessage.includes("grateful") || lowerMessage.includes("thankful") || lowerMessage.includes("gratitude")) {
    return "Gratitude is such a beautiful practice, and I'm touched that you're embracing it! Here's how to deepen it:\n\n• Use our gratitude prompts in the Wellness section\n• Write down 3 things daily you're grateful for\n• Share appreciation with someone\n• Notice small moments of joy\n• Practice with intention and presence\n\nI'd love to hear what you're grateful for right now! 🌻"
  }

  // Unrelated or out of scope questions
  const wellnessKeywords = ["wellness", "mood", "journal", "entry", "emotion", "feeling", "breathe", "meditation", "yoga", "exercise", "health", "stress", "anxiety", "sleep", "gratitude", "mindful", "relax", "calm", "peace"]
  const isWellnessRelated = wellnessKeywords.some(keyword => lowerMessage.includes(keyword))
  
  if (!isWellnessRelated) {
    return "I appreciate your input, but I'm specifically trained to support your wellness journey. I work best when we focus on:\n\n• Your emotional wellbeing\n• Journal entries and reflections\n• Breathing and meditation practices\n• Yoga and mindfulness\n• Managing stress and emotions\n• Building healthy habits\n\nHow can I help you with your wellness today? 💚"
  }

  // Default supportive response
  const supportiveResponses = [
    "I'm here for you, always. Whatever you're going through, you don't have to face it alone. Would you like to talk more about how you're feeling, or try a calming activity together?",
    "Thank you for sharing with me. Your feelings matter, and this is a safe space to express them. Is there something specific on your mind today?",
    "I appreciate you opening up. Remember, taking care of your mental health is just as important as physical health. How can I best support you right now?",
    "You're doing great just by being here and checking in with yourself. That takes awareness and courage. What would help you most right now?",
  ]

  return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)]
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there, friend! I'm your wellness companion. Think of me as a supportive friend who's always here to listen, offer gentle guidance, and help you on your wellness journey. How are you feeling today? 💚",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { entries } = useJournal()

  // Get recent mood for context
  const recentMood = entries.length > 0 ? entries[0].mood : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(
      () => {
        const response = generateResponse(input, recentMood)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter: Add new line
        e.preventDefault()
        setInput(input + "\n")
      } else {
        // Enter: Send message
        e.preventDefault()
        handleSend()
      }
    }
  }

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn("fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg md:bottom-6", isOpen && "hidden")}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-md rounded-xl border bg-background shadow-2xl transition-all duration-300 md:bottom-6",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">DheeVerse Companion</h3>
              <p className="text-xs text-muted-foreground">Your wellness friend</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{message.role === "assistant" ? "D" : "U"}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                  message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
