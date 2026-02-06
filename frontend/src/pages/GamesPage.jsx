import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import BackButton from '../components/BackButton';
import FlowFree from '../components/games/FlowFree';
import Sudoku from '../components/games/Sudoku';
import WordSearch from '../components/games/WordSearch';
import Doodle from '../components/games/Doodle';

const GAMES = [
  {
    id: 'flow-free',
    name: 'Flow Free',
    description: 'Connect pairs of colored dots with continuous paths',
    icon: '🔗',
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'Fill the grid with numbers 1-9 in each row, column, and box',
    icon: '🔢',
  },
  {
    id: 'word-search',
    name: 'Word Search',
    description: 'Find hidden words in a grid of letters',
    icon: '🔍',
  },
  {
    id: 'doodle',
    name: 'Doodle',
    description: 'Free drawing canvas with colors and brushes',
    icon: '🎨',
  },
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame) {
    return (
      <div className="container mx-auto p-6">
        <BackButton onClick={() => setSelectedGame(null)} />
        <div className="min-h-[calc(100vh-200px)]">
          {selectedGame === 'flow-free' && <FlowFree />}
          {selectedGame === 'sudoku' && <Sudoku />}
          {selectedGame === 'word-search' && <WordSearch />}
          {selectedGame === 'doodle' && <Doodle />}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Games</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Relax and unwind with calming, low-pressure games
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES.map((game) => (
          <Card
            key={game.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => setSelectedGame(game.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{game.icon}</div>
                <div>
                  <CardTitle className="text-2xl">{game.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {game.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Play Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/30 rounded-lg text-center">
        <p className="text-muted-foreground">
          All games are designed to be calming and relaxing. No timers, no pressure, just peaceful gameplay.
        </p>
      </div>
    </div>
  );
}
