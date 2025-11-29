"use client"

import { ThemeProvider } from "@/lib/theme-context"
import { UserProvider } from "@/lib/user-context"
import { JournalProvider } from "@/lib/journal-context"

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
        </JournalProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
