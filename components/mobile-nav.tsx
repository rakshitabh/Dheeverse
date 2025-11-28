"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, BarChart3, Heart, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/insights", icon: BarChart3, label: "Insights" },
  { href: "/wellness", icon: Heart, label: "Wellness" },
  { href: "/games", icon: Gamepad2, label: "Games" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
