"use client"

import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useUser } from "@/lib/user-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useJournal } from "@/lib/journal-context"
import { format } from "date-fns"

export default function ProfilePage() {
  const { user } = useUser()
  const { entries } = useJournal()

  const totalEntries = entries.filter((e) => !e.isArchived).length
  const archivedEntries = entries.filter((e) => e.isArchived).length
  const joinDate = new Date()

  // Calculate current streak
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let currentDate = new Date(today)

  for (let i = 0; i < 365; i++) {
    const currentDateStr = currentDate.toISOString().split("T")[0]
    const hasEntry = entries.some((e) => {
      const entryDate = new Date(e.createdAt)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.toISOString().split("T")[0] === currentDateStr && !e.isArchived
    })
    if (!hasEntry && i > 0) break
    if (hasEntry) streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return (
    <PageLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Member since {format(joinDate, "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalEntries}</p>
              <p className="text-xs text-muted-foreground">journal entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{archivedEntries}</p>
              <p className="text-xs text-muted-foreground">archived entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg. Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {entries.length > 0
                  ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">out of 5</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your latest journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.filter((e) => !e.isArchived).length === 0 ? (
              <p className="text-muted-foreground text-sm">No entries yet. Start journaling to see them here!</p>
            ) : (
              <div className="space-y-4">
                {entries
                  .filter((e) => !e.isArchived)
                  .slice(0, 5)
                  .map((entry) => (
                    <div key={entry.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium line-clamp-1">{entry.content.slice(0, 50)}...</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <span className="text-2xl">
                          {entry.mood === 1 && "😢"}
                          {entry.mood === 2 && "😔"}
                          {entry.mood === 3 && "😐"}
                          {entry.mood === 4 && "🙂"}
                          {entry.mood === 5 && "😊"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
