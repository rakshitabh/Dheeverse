"use client"

import type React from "react"

import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Archive, Trash2, Edit, Type, Mic, Palette } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { JournalEntry } from "@/lib/types"
import { useJournal } from "@/lib/journal-context"
import { Badge } from "@/components/ui/badge"

interface EntryCardProps {
  entry: JournalEntry
  onEdit?: (entry: JournalEntry) => void
}

const moodEmoji: Record<number, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",
}

const typeIcons: Record<string, React.ReactNode> = {
  text: <Type className="h-3 w-3" />,
  voice: <Mic className="h-3 w-3" />,
  doodle: <Palette className="h-3 w-3" />,
}

export function EntryCard({ entry, onEdit }: EntryCardProps) {
  const { deleteEntry, archiveEntry } = useJournal()
  const entryType = entry.entryType || "text"

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moodEmoji[entry.mood]}</span>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </span>
            <Badge variant="outline" className="w-fit mt-1 gap-1 text-xs">
              {typeIcons[entryType]}
              {entryType}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => archiveEntry(entry.id)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteEntry(entry.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {entry.doodleData && (
          <div className="mb-3 rounded-lg overflow-hidden border">
            <img
              src={entry.doodleData || "/placeholder.svg"}
              alt="Doodle"
              className="w-full max-h-48 object-contain bg-white"
            />
          </div>
        )}

        <p className="line-clamp-3 text-sm text-foreground">{entry.content}</p>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {entry.emotions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.emotions.map((emotion) => (
              <span key={emotion} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {emotion}
              </span>
            ))}
          </div>
        )}

        {entry.aiInsight && (
          <div className="mt-3 rounded-lg bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">AI Insight: </span>
              {entry.aiInsight}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
