"use client"

import { Star } from "lucide-react"

export default function ReviewsSection() {
  const reviews = [
    {
      name: "Sarah",
      role: "Mindfulness Enthusiast",
      review:
        "DheeVerse transformed how I approach my mental health. The prompts are thoughtful and the experience is calming.",
      rating: 5,
    },
    {
      name: "Michael",
      role: "Wellness Coach",
      review:
        "I recommend DheeVerse to all my clients. It's the perfect tool for daily reflection and emotional awareness.",
      rating: 5,
    },
    {
      name: "Emma",
      role: "Therapist",
      review:
        "A beautiful app that supports mindful living. My patients love the simplicity and elegance of the design.",
      rating: 5,
    },
  ]

  return (
    <section id="reviews" className="py-20 md:py-32 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">What People Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of people on their wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-8 space-y-4">
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed italic">{review.review}</p>
              <div>
                <p className="font-semibold text-foreground">{review.name}</p>
                <p className="text-sm text-muted-foreground">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
