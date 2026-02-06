import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Lightbulb, Save, Eye } from "lucide-react";
import { Button } from "../ui/button";

const DIFFICULTY_CLUES = {
  easy: 40,
  medium: 32,
  hard: 26,
};

export default function Sudoku() {
  const [grid, setGrid] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(0))
  );
  const [solution, setSolution] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(0))
  );
  const [initialGrid, setInitialGrid] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(false))
  );
  const [difficulty, setDifficulty] = useState("easy");
  const [selectedCell, setSelectedCell] = useState(null);
  const [conflicts, setConflicts] = useState(new Set());
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    generatePuzzle();
  }, [difficulty]);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    checkConflicts();
    saveToStorage();
  }, [grid]);

  const isValid = (board, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  };

  const solveSudoku = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) {
                return true;
              }
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const generateFullBoard = () => {
    const board = Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));

    // Fill diagonal 3x3 boxes first (they are independent)
    for (let box = 0; box < 9; box += 3) {
      fillBox(board, box, box);
    }

    // Solve the rest
    solveSudoku(board);
    return board;
  };

  const fillBox = (board, row, col) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(nums);

    let index = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[row + i][col + j] = nums[index++];
      }
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const generatePuzzle = () => {
    const fullBoard = generateFullBoard();
    const puzzle = fullBoard.map((row) => [...row]);
    const clues = DIFFICULTY_CLUES[difficulty];
    const cellsToRemove = 81 - clues;

    const cells = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        cells.push([i, j]);
      }
    }
    shuffleArray(cells);

    for (let i = 0; i < cellsToRemove; i++) {
      const [row, col] = cells[i];
      puzzle[row][col] = 0;
    }

    const newInitialGrid = Array(9)
      .fill(null)
      .map(() => Array(9).fill(false));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        newInitialGrid[i][j] = puzzle[i][j] !== 0;
      }
    }

    setGrid(puzzle);
    setSolution(fullBoard);
    setInitialGrid(newInitialGrid);
    setSelectedCell(null);
    setConflicts(new Set());
  };

  const checkConflicts = () => {
    const newConflicts = new Set();

    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Set();
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value !== 0) {
          const key = `${row}-${col}`;
          if (seen.has(value)) {
            // Mark all occurrences of this value in the row
            for (let c = 0; c < 9; c++) {
              if (grid[row][c] === value) {
                newConflicts.add(`${row}-${c}`);
              }
            }
          }
          seen.add(value);
        }
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      const seen = new Set();
      for (let row = 0; row < 9; row++) {
        const value = grid[row][col];
        if (value !== 0) {
          const key = `${row}-${col}`;
          if (seen.has(value)) {
            // Mark all occurrences of this value in the column
            for (let r = 0; r < 9; r++) {
              if (grid[r][col] === value) {
                newConflicts.add(`${r}-${col}`);
              }
            }
          }
          seen.add(value);
        }
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i;
            const col = boxCol * 3 + j;
            const value = grid[row][col];
            if (value !== 0) {
              if (seen.has(value)) {
                // Mark all occurrences of this value in the box
                for (let r = 0; r < 3; r++) {
                  for (let c = 0; c < 3; c++) {
                    const r2 = boxRow * 3 + r;
                    const c2 = boxCol * 3 + c;
                    if (grid[r2][c2] === value) {
                      newConflicts.add(`${r2}-${c2}`);
                    }
                  }
                }
              }
              seen.add(value);
            }
          }
        }
      }
    }

    setConflicts(newConflicts);
  };

  const handleCellClick = (row, col) => {
    if (!initialGrid[row][col]) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num) => {
    if (selectedCell && !initialGrid[selectedCell.row][selectedCell.col]) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[selectedCell.row][selectedCell.col] = num;
      setGrid(newGrid);
    }
  };

  const handleKeyPress = (e) => {
    if (selectedCell) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        if (!initialGrid[selectedCell.row][selectedCell.col]) {
          const newGrid = grid.map((row) => [...row]);
          newGrid[selectedCell.row][selectedCell.col] = 0;
          setGrid(newGrid);
        }
      }
    }
  };

  const getHint = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          setSelectedCell({ row, col });
          const newGrid = grid.map((r) => [...r]);
          newGrid[row][col] = solution[row][col];
          setGrid(newGrid);
          return;
        }
      }
    }
  };

  const saveToStorage = () => {
    const gameState = {
      grid,
      solution,
      initialGrid,
      difficulty,
    };
    localStorage.setItem("sudoku-game", JSON.stringify(gameState));
  };

  const loadFromStorage = () => {
    const saved = localStorage.getItem("sudoku-game");
    if (saved) {
      try {
        const gameState = JSON.parse(saved);
        if (gameState.grid && gameState.initialGrid) {
          setGrid(gameState.grid);
          setSolution(gameState.solution || gameState.grid);
          setInitialGrid(gameState.initialGrid);
          setDifficulty(gameState.difficulty || "easy");
        }
      } catch (e) {
        console.error("Failed to load saved game:", e);
      }
    }
  };

  const isComplete = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0 || grid[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    return conflicts.size === 0;
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedCell, grid, initialGrid]);

  const completed = isComplete();

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-foreground text-center">
        🔢 Sudoku
      </h1>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <Button onClick={getHint} variant="outline">
          <Lightbulb className="w-4 h-4 mr-2" />
          Hint
        </Button>
        <Button
          onClick={() => setShowSolution(!showSolution)}
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          {showSolution ? "Hide" : "Show"} Answer
        </Button>
        <Button onClick={generatePuzzle} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Puzzle
        </Button>
      </div>

      {completed && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-600 rounded-lg p-4">
          🎉 Congratulations! Puzzle solved!
        </div>
      )}

      <div
        className="grid grid-cols-9 gap-0.5 p-4 bg-muted/30 rounded-lg"
        style={{
          width: "min(90vw, 500px)",
          aspectRatio: "1",
          maxWidth: "500px",
        }}
      >
        {Array(9)
          .fill(null)
          .map((_, row) =>
            Array(9)
              .fill(null)
              .map((_, col) => {
                const value = grid[row][col];
                const isInitial = initialGrid[row][col];
                const isSelected =
                  selectedCell?.row === row && selectedCell?.col === col;
                const isConflict = conflicts.has(`${row}-${col}`);
                const boxRow = Math.floor(row / 3);
                const boxCol = Math.floor(col / 3);
                const isBoxBorder =
                  (row % 3 === 0 && row > 0) || (col % 3 === 0 && col > 0);

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`
                  aspect-square flex items-center justify-center
                  border border-border
                  ${isBoxBorder ? "border-2" : ""}
                  ${isSelected ? "ring-2 ring-primary bg-primary/10" : ""}
                  ${isConflict ? "bg-destructive/20" : ""}
                  ${
                    isInitial
                      ? "bg-muted font-bold"
                      : "bg-background cursor-pointer hover:bg-muted/50"
                  }
                  transition-colors
                `}
                    onClick={() => handleCellClick(row, col)}
                  >
                    {value !== 0 && (
                      <span
                        className={`text-lg ${
                          isInitial
                            ? "text-foreground"
                            : showSolution && solution[row][col] !== value
                            ? "text-destructive line-through"
                            : "text-primary"
                        }`}
                      >
                        {value}
                      </span>
                    )}
                    {showSolution && value === 0 && (
                      <span className="text-sm text-muted-foreground opacity-50">
                        {solution[row][col]}
                      </span>
                    )}
                  </div>
                );
              })
          )}
      </div>

      <div className="grid grid-cols-9 gap-2 max-w-md">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="aspect-square bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg font-semibold text-lg transition-colors"
          >
            {num}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Click a cell and enter a number (1-9). Fill the grid so each row,
        column, and 3x3 box contains digits 1-9.
      </p>
    </div>
  );
}
