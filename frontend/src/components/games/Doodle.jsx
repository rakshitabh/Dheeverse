import { useState, useRef, useEffect } from "react";
import { RotateCcw, Download, Eraser, Pencil } from "lucide-react";
import { Button } from "../ui/button";

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
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#E67E22",
  "#34495E",
  "#16A085",
  "#27AE60",
];

const BRUSH_SIZES = [2, 4, 6, 8, 12, 16, 20, 24];

export default function Doodle() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState("pencil"); // 'pencil' or 'eraser'
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setContext(ctx);

      // Set canvas size
      const container = canvas.parentElement;
      const size = Math.min(container.offsetWidth - 32, 600);
      canvas.width = size;
      canvas.height = size;

      // Fill with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    if (!context) return;

    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0,0,0,1)";
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = currentColor;
    }

    context.lineWidth = brushSize;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.beginPath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const downloadDrawing = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = `doodle-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent("mouseup", {});
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-foreground text-center">
        🎨 Doodle
      </h1>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <Button
            variant={tool === "pencil" ? "default" : "outline"}
            onClick={() => setTool("pencil")}
            size="sm"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Pencil
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            onClick={() => setTool("eraser")}
            size="sm"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Eraser
          </Button>
        </div>
        <Button onClick={clearCanvas} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Button onClick={downloadDrawing} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="flex gap-6 flex-wrap justify-center items-start">
        <div className="space-y-4 min-w-[200px]">
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentColor(color)}
                  className={`
                    w-12 h-12 rounded-lg border-2 transition-all
                    ${
                      currentColor === color
                        ? "border-foreground scale-110 ring-2 ring-primary"
                        : "border-border"
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Brush Size: {brushSize}px
            </label>
            <div className="flex gap-2 flex-wrap">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                    ${
                      brushSize === size
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }
                  `}
                  style={{
                    width: `${Math.max(16, size)}px`,
                    height: `${Math.max(16, size)}px`,
                  }}
                >
                  {brushSize === size && (
                    <div
                      className="rounded-full"
                      style={{
                        width: `${size / 2}px`,
                        height: `${size / 2}px`,
                        backgroundColor:
                          tool === "eraser" ? "#000" : currentColor,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="border border-border rounded-lg cursor-crosshair bg-white"
            style={{
              maxWidth: "100%",
              touchAction: "none",
            }}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Draw freely on the canvas. Use the pencil tool to draw and the eraser to
        remove. Adjust brush size and color as needed.
      </p>
    </div>
  );
}
