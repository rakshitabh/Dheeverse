"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Plus, Search, Filter, Calendar, List, Grid3X3, X, Type, Mic, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EntryCard } from "@/components/entry-card"
import { useJournal } from "@/lib/journal-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Emotion, EntryType } from "@/lib/types"

type ViewMode = "list" | "grid" | "calendar"

const emotions: Emotion[] = ["happy", "calm", "sad", "anxious", "angry", "neutral", "grateful", "hopeful"]
const entryTypes: { value: EntryType; label: string; icon: React.ReactNode }[] = [
  { value: "text", label: "Text", icon: <Type className="h-3 w-3" /> },
  { value: "voice", label: "Voice", icon: <Mic className="h-3 w-3" /> },
  { value: "doodle", label: "Doodle", icon: <Palette className="h-3 w-3" /> },
]

export default function JournalPage() {
  const { entries } = useJournal()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([])
  const [selectedTypes, setSelectedTypes] = useState<EntryType[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Only show non-archived entries
      if (entry.isArchived) return false

      // Text search (content, tags)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesContent = entry.content.toLowerCase().includes(query)
        const matchesTags = entry.tags.some((tag) => tag.toLowerCase().includes(query))
        const matchesEmotions = entry.emotions.some((e) => e.toLowerCase().includes(query))
        if (!matchesContent && !matchesTags && !matchesEmotions) return false
      }

      // Emotion filter
      if (selectedEmotions.length > 0) {
        const hasEmotion = selectedEmotions.some((e) => entry.emotions.includes(e))
        if (!hasEmotion) return false
      }

      // Type filter
      if (selectedTypes.length > 0) {
        const entryType = entry.entryType || "text"
        if (!selectedTypes.includes(entryType)) return false
      }

      // Date filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        if (new Date(entry.createdAt) < fromDate) return false
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (new Date(entry.createdAt) > toDate) return false
      }

      return true
    })
  }, [entries, searchQuery, selectedEmotions, selectedTypes, dateFrom, dateTo])

  const toggleEmotion = (emotion: Emotion) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const toggleType = (type: EntryType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedEmotions([])
    setSelectedTypes([])
    setDateFrom("")
    setDateTo("")
  }

  const hasActiveFilters = searchQuery || selectedEmotions.length > 0 || selectedTypes.length > 0 || dateFrom || dateTo

  // Group entries by date for calendar view
  const entriesByDate = filteredEntries.reduce(
    (acc, entry) => {
      const dateKey = format(new Date(entry.createdAt), "yyyy-MM-dd")
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(entry)
      return acc
    },
    {} as Record<string, typeof entries>,
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Journal</h1>
            <p className="text-muted-foreground">{filteredEntries.length} entries</p>
          </div>
          <Button asChild>
            <Link href="/journal/new">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search content, tags, emotions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative bg-transparent">
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Filter by Emotion</DropdownMenuLabel>
                  {emotions.map((emotion) => (
                    <DropdownMenuCheckboxItem
                      key={emotion}
                      checked={selectedEmotions.includes(emotion)}
                      onCheckedChange={() => toggleEmotion(emotion)}
                    >
                      <span className="capitalize">{emotion}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  {entryTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => toggleType(type.value)}
                    >
                      <span className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                  <div className="p-2 space-y-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="From"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="To"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-x"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("calendar")}
                  className="rounded-l-none"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {selectedEmotions.map((emotion) => (
                <Badge key={emotion} variant="secondary" className="gap-1">
                  {emotion}
                  <button onClick={() => toggleEmotion(emotion)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <button onClick={() => toggleType(type)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(dateFrom || dateTo) && (
                <Badge variant="secondary" className="gap-1">
                  {dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : dateFrom || `Until ${dateTo}`}
                  <button
                    onClick={() => {
                      setDateFrom("")
                      setDateTo("")
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Entries */}
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No entries found</h3>
            <p className="mt-2 text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Start your wellness journey by creating your first entry"}
            </p>
            {!hasActiveFilters && (
              <Button className="mt-4" asChild>
                <Link href="/journal/new">Create Entry</Link>
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : viewMode === "calendar" ? (
          <div className="space-y-6">
            {Object.entries(entriesByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateEntries]) => (
                <div key={date}>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <div className="space-y-3">
                    {dateEntries.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    )
  }
