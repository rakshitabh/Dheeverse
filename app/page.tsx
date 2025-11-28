"use client"

import { PageLayout } from "@/components/page-layout"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { QuickEntry } from "@/components/dashboard/quick-entry"
import { RecentEntries } from "@/components/dashboard/recent-entries"
import { BadgesDisplay } from "@/components/dashboard/badges-display"
import { QuoteCard } from "@/components/quote-card"
import { MoodCalendar } from "@/components/dashboard/mood-calendar"
import { StatsCard } from "@/components/stats-card"
import { BookOpen, Heart, Target } from "lucide-react"
import { useJournal } from "@/lib/journal-context"

export default function DashboardPage() {
  const { entries, streakData } = useJournal()

  const weeklyEntries = entries.filter((e) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(e.createdAt) >= weekAgo && !e.isArchived
  })

  const avgMood =
    weeklyEntries.length > 0
      ? (weeklyEntries.reduce((sum, e) => sum + e.mood, 0) / weeklyEntries.length).toFixed(1)
      : "0"

  return (
    <PageLayout>
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Entries"
            value={streakData.totalEntries.toString()}
            subtitle="journal entries"
            icon={BookOpen}
          />
          <StatsCard
            title="Wellness Score"
            value={`${avgMood}/5`}
            subtitle="this week"
            icon={Heart}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard title="Goals Met" value="4/5" subtitle="weekly goals" icon={Target} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <QuickEntry />
            <RecentEntries />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <QuoteCard />
            <MoodCalendar />
            <BadgesDisplay />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
