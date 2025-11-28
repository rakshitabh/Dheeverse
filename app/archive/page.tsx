'use client'

import { useState, useEffect } from 'react'
import { useJournal } from '@/lib/journal-context'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { PageLayout } from '@/components/page-layout'
import { Archive, Lock, RotateCcw, Trash2, CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

const moodEmoji: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  angry: '😠',
  excited: '🤩',
  anxious: '😰',
  calm: '😌',
  tired: '😴',
}

export default function ArchivePage() {
  const { entries, restoreEntry, deleteMultiple, permanentlyDeleteEntry } = useJournal()
  const [pinCode, setPinCode] = useState('')
  const [pinAttempts, setPinAttempts] = useState(0)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pinEnabled, setPinEnabled] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get archived entries
  const archivedEntries = entries.filter((entry) => entry.isArchived)

  // Check if PIN is enabled
  useEffect(() => {
    const checkPin = async () => {
      try {
        const res = await fetch('/api/user/archive-pin', { signal: AbortSignal.timeout(3000) })
        if (res.ok) {
          const data = await res.json()
          setPinEnabled(!!data.pin)
          setIsUnlocked(!data.pin) // If no PIN, automatically unlocked
        } else {
          // API error - default to no PIN
          setPinEnabled(false)
          setIsUnlocked(true)
        }
      } catch (error) {
        console.error('Error checking PIN:', error)
        // Default to no PIN on error
        setPinEnabled(false)
        setIsUnlocked(true)
      } finally {
        setIsLoading(false)
      }
    }
    checkPin()
  }, [])

  // Handle PIN submission
  const handlePinSubmit = async () => {
    try {
      const res = await fetch('/api/user/archive-pin')
      const data = await res.json()

      if (data.pin === pinCode) {
        setIsUnlocked(true)
        setPinCode('')
        setPinAttempts(0)
      } else {
        const newAttempts = pinAttempts + 1
        setPinAttempts(newAttempts)
        setPinCode('')

        if (newAttempts >= 3) {
          // Lock for security
          setIsUnlocked(false)
          setPinAttempts(0)
        }
      }
    } catch (error) {
      console.error('Error verifying PIN:', error)
    }
  }

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === archivedEntries.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(archivedEntries.map((e) => e.id))
    }
  }

  // Delete handlers
  const handleSingleDelete = (id: string) => {
    setDeleteTargetId(id)
    setShowDeleteDialog(true)
  }

  const handleRestoreSelected = () => {
    selectedIds.forEach((id) => {
      restoreEntry(id)
    })
    setSelectedIds([])
  }

  const handleDeleteSelected = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (deleteTargetId) {
      permanentlyDeleteEntry(deleteTargetId)
      setDeleteTargetId(null)
    } else {
      deleteMultiple(selectedIds)
      setSelectedIds([])
    }
    setShowDeleteDialog(false)
  }

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Show PIN lock screen
  if (pinEnabled && !isUnlocked) {
    return (
      <PageLayout>
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Archive Locked</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Enter your 4-digit PIN to access the archive
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="••••"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.slice(0, 4))}
                  maxLength={4}
                  className="text-center text-2xl tracking-widest"
                  onKeyDown={(e) =>
                    e.key === 'Enter' && pinCode.length === 4 && handlePinSubmit()
                  }
                  autoFocus
                />
                {pinAttempts > 0 && (
                  <p className="text-xs text-destructive mt-2">
                    Wrong PIN. {3 - pinAttempts} attempts remaining
                  </p>
                )}
              </div>
              <Button
                onClick={handlePinSubmit}
                disabled={pinCode.length !== 4}
                className="w-full"
              >
                Unlock
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  // Show archive list
  return (
    <PageLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Archive className="h-6 w-6" />
              Archive
            </h1>
            <p className="text-muted-foreground">
              {archivedEntries.length} archived entries
            </p>
          </div>
          {archivedEntries.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedIds.length === archivedEntries.length ? (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Select All
                  </>
                )}
              </Button>
              {selectedIds.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleRestoreSelected}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore ({selectedIds.length})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedIds.length})
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Archived Entries */}
        {archivedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No archived entries</h3>
            <p className="mt-2 text-muted-foreground">
              Archived journal entries will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {archivedEntries.map((entry) => (
              <Card
                key={entry.id}
                className={cn(
                  'transition-all',
                  selectedIds.includes(entry.id) && 'ring-2 ring-primary'
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelect(entry.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {selectedIds.includes(entry.id) ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <span className="text-2xl">{moodEmoji[entry.mood] || '😐'}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => restoreEntry(entry.id)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSingleDelete(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-foreground">{entry.content}</p>
                  {entry.emotions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {entry.emotions.map((emotion) => (
                        <span
                          key={emotion}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.{' '}
                {deleteTargetId
                  ? 'This entry'
                  : `These ${selectedIds.length} entries`}{' '}
                will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  )
}
