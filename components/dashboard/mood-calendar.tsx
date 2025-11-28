"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useJournal } from "@/lib/journal-context"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns"
import { cn } from "@/lib/utils"

const moodColors: Record<number, { bg: string; text: string; name: string }> = {
  1: { bg: "bg-red-400", text: "text-red-600", name: "Very Sad" },
  2: { bg: "bg-orange-400", text: "text-orange-600", name: "Sad" },
  3: { bg: "bg-yellow-400", text: "text-yellow-600", name: "Neutral" },
  4: { bg: "bg-lime-400", text: "text-lime-600", name: "Good" },
  5: { bg: "bg-green-500", text: "text-green-600", name: "Very Happy" },
}

export function MoodCalendar() {
  const { entries } = useJournal()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return days.map((day) => {
      const dayEntries = entries.filter((entry) => isSameDay(new Date(entry.createdAt), day) && !entry.isArchived)
      const avgMood =
        dayEntries.length > 0 ? Math.round(dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length) : null

      return {
        date: day,
        mood: avgMood,
        hasEntry: dayEntries.length > 0,
      }
    })
  }, [entries, currentMonth])

  const firstDayOfWeek = startOfMonth(currentMonth).getDay()

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-primary" />
            {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {calendarData.map(({ date, mood, hasEntry }) => (
            <div
              key={date.toISOString()}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs relative cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group",
                hasEntry && mood ? moodColors[mood].bg : "bg-muted/30",
                isSameDay(date, new Date()) && "ring-2 ring-primary ring-offset-1",
              )}
              title={hasEntry ? `Mood: ${moodColors[mood!].name} (${mood}/5)` : "No entry"}
            >
              <span className={cn(hasEntry && mood ? "text-white font-medium" : "text-muted-foreground")}>
                {format(date, "d")}
              </span>
              {hasEntry && mood && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                  {moodColors[mood].name}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Mood Scale:</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((mood) => (
              <div
                key={mood}
                className={cn(
                  "rounded-md p-2 text-center text-xs",
                  moodColors[mood].bg,
                )}
              >
                <div className="font-medium text-white">{mood}</div>
                <div className="text-xs text-white/80 line-clamp-1">{moodColors[mood].name}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
