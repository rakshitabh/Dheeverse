import { useState, useEffect, useRef } from "react";
import { RotateCcw, Eye } from "lucide-react";
import { Button } from "../ui/button";

const WORD_LISTS = {
  calm: [
    "CALM",
    "PEACE",
    "SERENE",
    "TRANQUIL",
    "RELAX",
    "ZEN",
    "BREATHE",
    "MINDFUL",
  ],
  nature: [
    "FOREST",
    "OCEAN",
    "MOUNTAIN",
    "SUNSET",
    "BREEZE",
    "FLOWER",
    "TREE",
    "WATER",
  ],
  emotions: [
    "HAPPY",
    "JOY",
    "LOVE",
    "GRATITUDE",
    "HOPE",
    "PEACE",
    "CALM",
    "SMILE",
  ],
};

const GRID_SIZE = 15;

export default function WordSearch() {
  const [wordList, setWordList] = useState("calm");
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    generatePuzzle();
  }, [wordList]);

  const generatePuzzle = () => {
    const wordsToPlace = WORD_LISTS[wordList];
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""));
    const placedWords = [];

    // Place words
    wordsToPlace.forEach((word) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 8); // 0-7: horizontal, vertical, diagonal
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceWord(newGrid, word, row, col, direction)) {
          placeWord(newGrid, word, row, col, direction);
          placedWords.push({
            word,
            cells: getWordCells(word, row, col, direction),
            direction,
          });
          placed = true;
        }
        attempts++;
      }
    });

    // Fill remaining cells with random letters
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col] === "") {
          newGrid[row][col] =
            letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGrid(newGrid);
    setWords(placedWords);
    setFoundWords(new Set());
    setSelectedCells([]);
  };

  const canPlaceWord = (grid, word, row, col, direction) => {
    const directions = [
      [0, 1], // right
      [1, 0], // down
      [1, 1], // diagonal down-right
      [1, -1], // diagonal down-left
      [0, -1], // left
      [-1, 0], // up
      [-1, -1], // diagonal up-left
      [-1, 1], // diagonal up-right
    ];

    const [dRow, dCol] = directions[direction];
    const endRow = row + (word.length - 1) * dRow;
    const endCol = col + (word.length - 1) * dCol;

    if (
      endRow < 0 ||
      endRow >= GRID_SIZE ||
      endCol < 0 ||
      endCol >= GRID_SIZE
    ) {
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
        return false;
      }
    }

    return true;
  };

  const placeWord = (grid, word, row, col, direction) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
      [0, -1],
      [-1, 0],
      [-1, -1],
      [-1, 1],
    ];

    const [dRow, dCol] = directions[direction];
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      grid[r][c] = word[i];
    }
  };

  const getWordCells = (word, row, col, direction) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
      [0, -1],
      [-1, 0],
      [-1, -1],
      [-1, 1],
    ];

    const [dRow, dCol] = directions[direction];
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      cells.push({
        row: row + i * dRow,
        col: col + i * dCol,
      });
    }
    return cells;
  };

  const getCellKey = (row, col) => `${row}-${col}`;

  const isCellInFoundWord = (row, col) => {
    for (const word of foundWords) {
      const wordData = words.find((w) => w.word === word);
      if (wordData) {
        if (wordData.cells.some((c) => c.row === row && c.col === col)) {
          return true;
        }
      }
    }
    return false;
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some((c) => c.row === row && c.col === col);
  };

  const checkWord = (cells) => {
    const cellKeys = cells.map((c) => getCellKey(c.row, c.col)).sort();

    for (const wordData of words) {
      const wordCellKeys = wordData.cells
        .map((c) => getCellKey(c.row, c.col))
        .sort();

      // Check if cells match (forward or reverse)
      const matches =
        JSON.stringify(cellKeys) === JSON.stringify(wordCellKeys) ||
        JSON.stringify(cellKeys) ===
          JSON.stringify([...wordCellKeys].reverse());

      if (matches && !foundWords.has(wordData.word)) {
        setFoundWords(new Set([...foundWords, wordData.word]));
        return true;
      }
    }
    return false;
  };

  const handleMouseDown = (row, col) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting && selectedCells.length > 0) {
      const firstCell = selectedCells[0];
      const newCells = getCellsBetween(firstCell, { row, col });
      setSelectedCells(newCells);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectedCells.length > 0) {
      checkWord(selectedCells);
      setIsSelecting(false);
      setTimeout(() => setSelectedCells([]), 300);
    }
  };

  const getCellsBetween = (start, end) => {
    const cells = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

    if (steps === 0) {
      return [start];
    }

    const dRow = rowDiff === 0 ? 0 : rowDiff / steps;
    const dCol = colDiff === 0 ? 0 : colDiff / steps;

    for (let i = 0; i <= steps; i++) {
      const row = Math.round(start.row + i * dRow);
      const col = Math.round(start.col + i * dCol);
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        cells.push({ row, col });
      }
    }

    return cells;
  };

  const allWordsFound = foundWords.size === words.length;

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-foreground text-center">
        🔍 Word Search
      </h1>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <select
          value={wordList}
          onChange={(e) => setWordList(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="calm">Calm</option>
          <option value="nature">Nature</option>
          <option value="emotions">Emotions</option>
        </select>
        <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          {showAnswers ? "Hide" : "Show"} Answers
        </Button>
        <Button onClick={generatePuzzle} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Puzzle
        </Button>
      </div>

      {allWordsFound && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-600 rounded-lg p-4">
          🎉 All words found! Great job!
        </div>
      )}

      <div className="flex gap-8 flex-wrap justify-center">
        <div
          ref={gridRef}
          className="grid gap-0.5 p-4 bg-muted/30 rounded-lg"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: "min(90vw, 500px)",
            aspectRatio: "1",
          }}
          onMouseLeave={handleMouseUp}
        >
          {Array(GRID_SIZE)
            .fill(null)
            .map((_, row) =>
              Array(GRID_SIZE)
                .fill(null)
                .map((_, col) => {
                  const letter = grid[row]?.[col] || "";
                  const isFound = isCellInFoundWord(row, col);
                  const isSelected = isCellSelected(row, col);
                  const isInAnswer =
                    showAnswers &&
                    words.some((w) =>
                      w.cells.some((c) => c.row === row && c.col === col)
                    );

                  return (
                    <div
                      key={getCellKey(row, col)}
                      className={`
                    aspect-square flex items-center justify-center
                    border border-border rounded
                    font-semibold text-sm
                    transition-colors
                    ${
                      isFound
                        ? "bg-green-500/30 text-green-700 dark:text-green-400"
                        : ""
                    }
                    ${
                      isInAnswer && !isFound
                        ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                        : ""
                    }
                    ${isSelected ? "bg-primary/30 ring-2 ring-primary" : ""}
                    ${
                      !isFound && !isSelected && !isInAnswer
                        ? "bg-background hover:bg-muted/50"
                        : ""
                    }
                    cursor-pointer
                  `}
                      onMouseDown={() => handleMouseDown(row, col)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onMouseUp={handleMouseUp}
                    >
                      {letter}
                    </div>
                  );
                })
            )}
        </div>

        <div className="space-y-4 min-w-[200px]">
          <h3 className="font-semibold text-lg">Words to Find:</h3>
          <div className="space-y-2">
            {words.map((wordData, index) => (
              <div
                key={index}
                className={`
                  p-2 rounded-lg border transition-colors
                  ${
                    foundWords.has(wordData.word)
                      ? "bg-green-500/20 border-green-500/50 line-through"
                      : "bg-muted/50 border-border"
                  }
                `}
              >
                <span
                  className={
                    foundWords.has(wordData.word) ? "text-muted-foreground" : ""
                  }
                >
                  {wordData.word}
                </span>
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Found: {foundWords.size} / {words.length}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Click and drag to select letters forming words. Words can be horizontal,
        vertical, or diagonal.
      </p>
    </div>
  );
}
