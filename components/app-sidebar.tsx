"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, BarChart3, Heart, Settings, Volume2, Gamepad2, Archive, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useJournal } from "@/lib/journal-context"

const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/archive", icon: Archive, label: "Archive" },
  { href: "/insights", icon: BarChart3, label: "Insights" },
  { href: "/wellness", icon: Heart, label: "Wellness" },
  { href: "/sounds", icon: Volume2, label: "Nature Sounds" },
  { href: "/games", icon: Gamepad2, label: "Games" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

interface AppSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const { streakData } = useJournal()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] border-r border-border bg-sidebar transition-all duration-300 w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Streak Card */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="rounded-xl bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">Current Streak</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{streakData.currentStreak}</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Keep it up! You&apos;re building a great habit.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
