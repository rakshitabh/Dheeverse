"use client"

import { Heart, BookOpen, TrendingUp, Lock } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Guided Journaling",
      description: "Thoughtfully crafted prompts to help you reflect deeply and grow.",
    },
    {
      icon: Heart,
      title: "Emotional Tracking",
      description: "Track your moods and discover patterns in your emotional journey.",
    },
    {
      icon: TrendingUp,
      title: "Progress Insights",
      description: "Visualize your growth with beautiful charts and meaningful analytics.",
    },
    {
      icon: Lock,
      title: "Complete Privacy",
      description: "Your entries are encrypted and stored securely, always private.",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for a transformative wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition space-y-4"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
