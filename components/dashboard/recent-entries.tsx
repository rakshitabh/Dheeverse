"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EntryCard } from "@/components/entry-card"
import { useJournal } from "@/lib/journal-context"

export function RecentEntries() {
  const { entries } = useJournal()
  const recentEntries = entries.filter((e) => !e.isArchived).slice(0, 3)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Entries</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/journal">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentEntries.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No entries yet. Start journaling!</p>
            <Button className="mt-4" asChild>
              <Link href="/journal/new">Write Your First Entry</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
