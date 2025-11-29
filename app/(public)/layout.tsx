"use client"

import Navigation from "@/components/landing/navigation"
import { ThemeProvider } from "@/components/theme-provider"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <Navigation />
        {children}
      </div>
    </ThemeProvider>
  )
}
