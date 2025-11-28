"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useJournal } from "@/lib/journal-context"
import { cn } from "@/lib/utils"

const badgeEmojis: Record<string, string> = {
  sparkles: "✨",
  flame: "🔥",
  trophy: "🏆",
  heart: "❤️",
  brain: "🧠",
}

export function BadgesDisplay() {
  const { badges } = useJournal()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-3 text-center transition-all hover:scale-105 cursor-pointer",
                badge.unlockedAt ? "bg-primary/10 border border-primary/20" : "bg-muted opacity-50 border border-transparent",
              )}
              title={`${badge.name}: ${badge.description}`}
            >
              <span className="text-3xl">{badgeEmojis[badge.icon as keyof typeof badgeEmojis] || badge.icon}</span>
              <span className="text-xs font-medium line-clamp-2">{badge.name}</span>
              {!badge.unlockedAt && (
                <span className="text-[10px] text-muted-foreground">Locked</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

