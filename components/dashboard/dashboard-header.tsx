"use client"

import { format } from "date-fns"
import { useUser } from "@/lib/user-context"

export function DashboardHeader() {
  const today = new Date()
  const greeting = getGreeting()
  const { user } = useUser()

  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">
        {greeting}, {user?.name?.split(" ")[0] || "there"}
      </h1>
      <p className="text-muted-foreground">{format(today, "EEEE, MMMM d, yyyy")}</p>
    </header>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
