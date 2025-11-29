"use client"

import { useState, useEffect } from "react"
import { Gamepad2, Home } from "lucide-react"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Pop-It Game Component
function PopItGame() {
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false))
  const [popped, setPopped] = useState(0)
  const [completed, setCompleted] = useState(false)

  const toggleBubble = (index: number) => {
    const newGrid = [...grid]
    if (!newGrid[index]) {
      newGrid[index] = true
      const newPopped = popped + 1
      setPopped(newPopped)
      if (newPopped === 25) {
        setCompleted(true)
      }
      setGrid(newGrid)
    }
  }

  const reset = () => {
    setGrid(Array(25).fill(false))
    setPopped(0)
    setCompleted(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Pop-It Game</h3>
        <span className="text-sm text-muted-foreground">{popped}/25 popped</span>
      </div>
      <div className="grid grid-cols-5 gap-2 bg-secondary p-4 rounded-lg">
        {grid.map((isPopped, idx) => (
          <button
            key={idx}
            onClick={() => toggleBubble(idx)}
            disabled={isPopped}
            className={cn(
              "aspect-square rounded-full transition-all",
              isPopped ? "bg-destructive scale-95 cursor-default" : "bg-primary hover:scale-110 cursor-pointer active:scale-95"
            )}
          />
        ))}
      </div>
      {completed && (
        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-200 font-semibold">🎉 All bubbles popped!</p>
        </div>
      )}
      <Button onClick={reset} variant="outline" className="w-full">
        Reset
      </Button>
    </div>
  )
}

// Memory Game Component
function MemoryGame() {
  const cards = ["🌟", "🎨", "🎭", "🎪", "🎯", "🎲"]
  const [gameCards, setGameCards] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    const shuffled = [...cards, ...cards].sort(() => Math.random() - 0.5)
    setGameCards(shuffled)
  }, [])

  const handleCardClick = (index: number) => {
    if (flipped.includes(index) || matched.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      if (gameCards[newFlipped[0]] === gameCards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  const reset = () => {
    const shuffled = [...cards, ...cards].sort(() => Math.random() - 0.5)
    setGameCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  const isWon = matched.length === gameCards.length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Memory Game</h3>
        <span className="text-sm text-muted-foreground">Moves: {moves}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 bg-secondary p-4 rounded-lg">
        {gameCards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => handleCardClick(idx)}
            disabled={matched.includes(idx)}
            className={cn(
              "aspect-square rounded-lg flex items-center justify-center text-2xl transition-all",
              flipped.includes(idx) || matched.includes(idx)
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/80 cursor-pointer"
            )}
          >
            {flipped.includes(idx) || matched.includes(idx) ? card : "?"}
          </button>
        ))}
      </div>
      {isWon && (
        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-200 font-semibold">🎉 Memory complete in {moves} moves!</p>
        </div>
      )}
      <Button onClick={reset} variant="outline" className="w-full">
        Reset
      </Button>
    </div>
  )
}

// Stress Relief Game Component (Bubble Pop)
function StressReliefGame() {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([])
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(30)
  const [gameActive, setGameActive] = useState(false)

  useEffect(() => {
    if (!gameActive || time <= 0) return

    const timer = setInterval(() => {
      setTime((t) => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive, time])

  useEffect(() => {
    if (!gameActive || time <= 0) return

    const spawnInterval = setInterval(() => {
      const newBubble = {
        id: Date.now(),
        x: Math.random() * 80,
        y: Math.random() * 80,
      }
      setBubbles((prev) => [...prev, newBubble])
    }, 300)

    return () => clearInterval(spawnInterval)
  }, [gameActive])

  const popBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id))
    setScore(score + 1)
  }

  const startGame = () => {
    setGameActive(true)
    setScore(0)
    setTime(30)
    setBubbles([])
  }

  const endGame = () => {
    setGameActive(false)
    setBubbles([])
  }

  if (time <= 0 && gameActive) {
    setGameActive(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Stress Relief</h3>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Score: {score}</span>
          <span>Time: {time}s</span>
        </div>
      </div>
      <div className="relative bg-secondary rounded-lg aspect-video overflow-hidden">
        {!gameActive ? (
          <div className="w-full h-full flex items-center justify-center">
            <Button onClick={startGame} size="lg">
              Start Game
            </Button>
          </div>
        ) : (
          <>
            {bubbles.map((bubble) => (
              <button
                key={bubble.id}
                onClick={() => popBubble(bubble.id)}
                className="absolute w-12 h-12 rounded-full bg-primary hover:bg-primary/80 transition-all cursor-pointer"
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                💨
              </button>
            ))}
            <Button
              onClick={endGame}
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
            >
              Stop
            </Button>
          </>
        )}
      </div>
      {time <= 0 && !gameActive && score > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <p className="text-blue-800 dark:text-blue-200 font-semibold">Game Over! Final Score: {score}</p>
        </div>
      )}
    </div>
  )
}

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  const games = [
    { id: "popit", name: "Pop-It", emoji: "🫧", description: "Pop all bubbles" },
    { id: "memory", name: "Memory", emoji: "🧠", description: "Match pairs" },
    { id: "stress", name: "Stress Relief", emoji: "💨", description: "Pop bubbles in 30s" },
  ]

  return (
    <>
      {/* Active Game - Full Screen */}
      {activeGame ? (
        <div className="fixed inset-0 z-40 bg-background flex flex-col">
          <div className="flex-shrink-0 p-4 border-b bg-background sticky top-0 z-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {games.find((g) => g.id === activeGame)?.emoji}{" "}
                {games.find((g) => g.id === activeGame)?.name}
              </h2>
              <Button variant="ghost" onClick={() => setActiveGame(null)}>
                ✕ Close
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto">
              {activeGame === "popit" && <PopItGame />}
              {activeGame === "memory" && <MemoryGame />}
              {activeGame === "stress" && <StressReliefGame />}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4 h-[calc(100vh-56px-80px)] overflow-hidden">
          <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6" />
                  Wellness Games
                </h1>
                <p className="text-muted-foreground text-sm">Play games to relieve stress and boost mood</p>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Back Home
                </Button>
              </Link>
            </div>

            {/* Game Selection Grid - Fits in viewport */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-auto">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => setActiveGame(game.id)}
                >
                  <CardHeader>
                    <div className="text-4xl mb-2">{game.emoji}</div>
                    <h3 className="font-semibold text-lg">{game.name}</h3>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Play</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
