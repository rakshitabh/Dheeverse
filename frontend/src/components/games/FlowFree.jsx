import { useState, useCallback, useRef, useEffect } from "react";
import { RotateCcw, Undo2, Eye } from "lucide-react";
import { Button } from "../ui/button";

const GRID_SIZES = [5, 6, 7];
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B739",
  "#95A5A6",
];

export default function FlowFree({ gridSize = 6 }) {
  const [size, setSize] = useState(gridSize);
  const [grid, setGrid] = useState([]);
  const [dots, setDots] = useState([]);
  const [paths, setPaths] = useState({});
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [currentColor, setCurrentColor] = useState(null);
  const gridRef = useRef(null);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [size]);

  const initializeGame = () => {
    const newGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
    const newDots = [];
    const numPairs = Math.min(size - 1, 5);
    const usedColors = [];

    // Place pairs of dots
    for (let i = 0; i < numPairs; i++) {
      let color = COLORS[i];
      usedColors.push(color);

      // Place first dot
      let row1, col1;
      do {
        row1 = Math.floor(Math.random() * size);
        col1 = Math.floor(Math.random() * size);
      } while (newGrid[row1][col1] !== null);

      newGrid[row1][col1] = { type: "dot", color, id: i * 2 };
      newDots.push({ row: row1, col: col1, color, id: i * 2 });

      // Place second dot
      let row2, col2;
      let attempts = 0;
      do {
        row2 = Math.floor(Math.random() * size);
        col2 = Math.floor(Math.random() * size);
        attempts++;
      } while (
        (newGrid[row2][col2] !== null || (row2 === row1 && col2 === col1)) &&
        attempts < 100
      );

      if (attempts < 100) {
        newGrid[row2][col2] = { type: "dot", color, id: i * 2 + 1 };
        newDots.push({ row: row2, col: col2, color, id: i * 2 + 1 });
      }
    }

    setGrid(newGrid);
    setDots(newDots);
    setPaths({});
    setHistory([]);
  };

  const getCellKey = (row, col) => `${row}-${col}`;

  const isValidMove = (row, col, color) => {
    if (row < 0 || row >= size || col < 0 || col >= size) return false;
    const cell = grid[row][col];
    if (!cell) return true;
    if (cell.type === "dot" && cell.color === color) return true;
    if (cell.type === "path" && cell.color === color) return true;
    return false;
  };

  const handleMouseDown = (row, col) => {
    const cell = grid[row][col];
    if (cell && cell.type === "dot") {
      setIsDragging(true);
      setCurrentColor(cell.color);
      setCurrentPath([{ row, col }]);
      setHistory([...history, JSON.parse(JSON.stringify(paths))]);
    }
  };

  const handleMouseMove = (row, col) => {
    if (!isDragging || !currentPath || !currentColor) return;

    const lastCell = currentPath[currentPath.length - 1];
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);

    // Only allow adjacent moves (no diagonals)
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      if (isValidMove(row, col, currentColor)) {
        const newPath = [...currentPath, { row, col }];
        setCurrentPath(newPath);
        updatePath(currentColor, newPath);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !currentPath || !currentColor) {
      setIsDragging(false);
      setCurrentPath(null);
      setCurrentColor(null);
      return;
    }

    const lastCell = currentPath[currentPath.length - 1];
    const cell = grid[lastCell.row]?.[lastCell.col];

    // Check if path connects to the other dot of the same color
    const colorDots = dots.filter((d) => d.color === currentColor);
    const firstDot = colorDots[0];
    const secondDot = colorDots[1];

    const startCell = currentPath[0];
    const endCell = currentPath[currentPath.length - 1];

    const connectsToFirst =
      startCell.row === firstDot.row && startCell.col === firstDot.col;
    const connectsToSecond =
      endCell.row === secondDot.row && endCell.col === secondDot.col;
    const connectsToSecondReverse =
      startCell.row === secondDot.row && startCell.col === secondDot.col;
    const connectsToFirstReverse =
      endCell.row === firstDot.row && endCell.col === firstDot.col;

    if (
      (connectsToFirst && connectsToSecond) ||
      (connectsToSecondReverse && connectsToFirstReverse)
    ) {
      // Path is complete - save it
      const newPaths = { ...paths, [currentColor]: currentPath };
      setPaths(newPaths);
      // Update grid with the path
      const newGrid = grid.map((row) =>
        row.map((cell) => {
          if (cell && cell.type === "path" && cell.color === currentColor) {
            return null;
          }
          return cell;
        })
      );
      currentPath.forEach(({ row, col }, index) => {
        if (index > 0 && index < currentPath.length - 1) {
          newGrid[row][col] = { type: "path", color: currentColor };
        }
      });
      setGrid(newGrid);
    } else {
      // Path is incomplete, revert
      const newGrid = grid.map((row) =>
        row.map((cell) => {
          if (cell && cell.type === "path" && cell.color === currentColor) {
            return null;
          }
          return cell;
        })
      );
      setGrid(newGrid);
      setPaths({ ...paths, [currentColor]: [] });
    }

    setIsDragging(false);
    setCurrentPath(null);
    setCurrentColor(null);
  };

  const updatePath = (color, path) => {
    const newGrid = grid.map((row) =>
      row.map((cell) => {
        if (cell && cell.type === "path" && cell.color === color) {
          return null;
        }
        return cell;
      })
    );

    path.forEach(({ row, col }, index) => {
      if (index > 0 && index < path.length - 1) {
        newGrid[row][col] = { type: "path", color };
      }
    });

    setGrid(newGrid);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousPaths = history[history.length - 1];
      setPaths(previousPaths);
      setHistory(history.slice(0, -1));
      // Rebuild grid
      const newGrid = Array(size)
        .fill(null)
        .map(() => Array(size).fill(null));
      dots.forEach((dot) => {
        newGrid[dot.row][dot.col] = {
          type: "dot",
          color: dot.color,
          id: dot.id,
        };
      });
      Object.values(previousPaths).forEach((path) => {
        path.forEach(({ row, col }, index) => {
          if (index > 0 && index < path.length - 1) {
            newGrid[row][col] = {
              type: "path",
              color: path[0] ? grid[path[0].row][path[0].col]?.color : null,
            };
          }
        });
      });
      setGrid(newGrid);
    }
  };

  const checkWin = () => {
    const colorGroups = {};
    dots.forEach((dot) => {
      if (!colorGroups[dot.color]) colorGroups[dot.color] = [];
      colorGroups[dot.color].push(dot);
    });

    return Object.keys(colorGroups).every((color) => {
      const path = paths[color];
      if (!path || path.length === 0) return false;
      const start = path[0];
      const end = path[path.length - 1];
      const startDot = colorGroups[color].find(
        (d) => d.row === start.row && d.col === start.col
      );
      const endDot = colorGroups[color].find(
        (d) => d.row === end.row && d.col === end.col && d.id !== startDot?.id
      );
      return startDot && endDot;
    });
  };

  const isComplete = checkWin();

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-foreground text-center">
        🔗 Flow Free
      </h1>
      <div className="flex items-center gap-4">
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
        >
          {GRID_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}x{s}
            </option>
          ))}
        </select>
        <Button
          onClick={handleUndo}
          disabled={history.length === 0}
          variant="outline"
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Undo
        </Button>
        <Button onClick={initializeGame} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {isComplete && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-600 rounded-lg p-4">
          🎉 All paths connected! Puzzle complete!
        </div>
      )}

      <div
        ref={gridRef}
        className="grid gap-1 p-4 bg-muted/30 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          width: "min(90vw, 500px)",
          aspectRatio: "1",
        }}
        onMouseLeave={handleMouseUp}
      >
        {Array(size)
          .fill(null)
          .map((_, row) =>
            Array(size)
              .fill(null)
              .map((_, col) => {
                const cell = grid[row]?.[col];
                const cellKey = getCellKey(row, col);
                const isInCurrentPath = currentPath?.some(
                  (p) => p.row === row && p.col === col
                );

                return (
                  <div
                    key={cellKey}
                    className={`
                  aspect-square rounded transition-all
                  ${cell?.type === "dot" ? "ring-4 ring-offset-2" : ""}
                  ${isInCurrentPath ? "ring-2 ring-primary" : ""}
                `}
                    style={{
                      backgroundColor: cell?.color || "transparent",
                      border: cell ? "none" : "2px solid rgba(0,0,0,0.1)",
                    }}
                    onMouseDown={() => handleMouseDown(row, col)}
                    onMouseEnter={() => handleMouseMove(row, col)}
                    onMouseUp={handleMouseUp}
                  >
                    {cell?.type === "dot" && (
                      <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
                        <div
                          className="w-1/2 h-1/2 rounded-full"
                          style={{ backgroundColor: cell.color }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
          )}
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Connect pairs of colored dots by drawing paths. Paths must not overlap
        or cross.
      </p>
    </div>
  );
}
