"use client"

import { useState, useEffect } from "react"
import { JournalProvider } from "@/lib/journal-context"
import { AppSidebar } from "@/components/app-sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

// Separate client component for navbar to ensure theme context is available
function NavbarWrapper({ onMenuClick }: { onMenuClick: () => void }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // Dynamic import to avoid theme issues during SSR
  const GlobalNavbar = require("@/components/global-navbar").GlobalNavbar
  return <GlobalNavbar onMenuClick={onMenuClick} />
}

export function AppLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <JournalProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-sidebar">
          <AppSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Global Navbar - Rendered only on client */}
          <NavbarWrapper onMenuClick={() => setSidebarOpen(true)} />

          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <AppSidebar />
            </SheetContent>
          </Sheet>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </JournalProvider>
  )
}
