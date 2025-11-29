"use client"

import Link from "next/link"

export default function HeroSection() {
  return (
    <section id="home" className="py-20 md:py-32 px-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-balance text-foreground leading-tight">
              Build a Healthier Mind <span className="text-primary">Every Day</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              DheeVerse is your personal wellness companion. Journey through mindful journaling, emotional reflection,
              and growth.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:opacity-90 transition text-center"
            >
              Start Your Journey
            </Link>
            <Link
              href="#features"
              className="border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold hover:bg-primary/5 transition text-center"
            >
              Learn More
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 text-sm text-muted-foreground">
            <p>✓ Completely private & secure</p>
            <p>✓ No ads or distractions</p>
            <p>✓ Available on all devices</p>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex items-center justify-center">
          <div className="w-full h-96 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-3xl flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-64 h-64" fill="none">
              <circle cx="100" cy="80" r="25" fill="currentColor" className="text-primary/40" />
              <path
                d="M 100 110 Q 75 125 70 150 L 75 160 Q 100 145 125 160 L 130 150 Q 125 125 100 110"
                fill="currentColor"
                className="text-primary/30"
              />
              <path
                d="M 80 115 L 75 130"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary/40"
                strokeLinecap="round"
              />
              <path
                d="M 120 115 L 125 130"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary/40"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
