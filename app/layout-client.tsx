"use client"

import type React from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { UserProvider } from "@/lib/user-context"
import { JournalProvider } from "@/lib/journal-context"
import { Toaster } from "@/components/ui/toaster"
import { FloatingNatureSounds } from "@/components/floating-nature-sounds"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <UserProvider>
        <JournalProvider>
          {children}
          <FloatingNatureSounds />
          <Toaster />
        </JournalProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
