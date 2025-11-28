"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Quote } from "lucide-react"

const fallbackQuotes = [
  {
    content: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thich Nhat Hanh",
  },
  {
    content: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
  },
  {
    content: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
  },
  { content: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
  {
    content: "The greatest weapon against stress is our ability to choose one thought over another.",
    author: "William James",
  },
]

export function QuoteCard() {
  const [quote, setQuote] = useState(fallbackQuotes[0])
  const [isLoading, setIsLoading] = useState(false)

  const getNewQuote = () => {
    setIsLoading(true)
    // Simulate fetching - in production, you'd call an actual API
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
      setQuote(fallbackQuotes[randomIndex])
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    getNewQuote()
  }, [])

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Quote className="h-8 w-8 text-primary/50 shrink-0" />
          <div className="flex-1">
            <p className="text-foreground italic leading-relaxed">&ldquo;{quote.content}&rdquo;</p>
            <p className="mt-2 text-sm text-muted-foreground">— {quote.author}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={getNewQuote} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            New Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
