"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DrawingTools } from "@/components/DrawingTools";
import {
  DEFAULT_DRAWING_COLOR,
  DEFAULT_STROKE_SIZE,
  DRAWING_CANVAS_SIZE,
  DRAWING_PAPER_COLOR,
  getCanvasPoint,
  getDrawingStrokeStyle,
  type DrawingPoint,
  type DrawingTool,
} from "@/lib/drawing";

type CanvasSnapshot = {
  dataUrl: string;
  hasInk: boolean;
};

type DrawingCanvasProps = {
  prompt?: string;
  helperText?: string;
  initialImageUrl?: string;
  exportLabel?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (dataUrl: string | null) => void;
  onExport: (dataUrl: string) => void;
};

export function DrawingCanvas({
  prompt = "Draw your story idea",
  helperText = "Use your finger, pencil, or mouse. Big messy ideas are perfect.",
  initialImageUrl,
  exportLabel,
  disabled = false,
  className = "",
  onChange,
  onExport,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousPointRef = useRef<DrawingPoint | null>(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(Boolean(initialImageUrl));
  const historyRef = useRef<CanvasSnapshot[]>([]);
  const [activeTool, setActiveTool] = useState<DrawingTool>("pencil");
  const [activeColor, setActiveColor] = useState(DEFAULT_DRAWING_COLOR);
  const [strokeSize, setStrokeSize] = useState(DEFAULT_STROKE_SIZE);
  const [hasInk, setHasInk] = useState(Boolean(initialImageUrl));
  const [canUndo, setCanUndo] = useState(false);

  const setInkState = useCallback((nextHasInk: boolean) => {
    hasInkRef.current = nextHasInk;
    setHasInk(nextHasInk);
  }, []);

  const paintBlankCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = DRAWING_PAPER_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }, []);

  const loadImageIntoCanvas = useCallback(
    (imageUrl: string, nextHasInk: boolean) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!canvas || !context) {
        return;
      }

      const image = new Image();

      image.onload = () => {
        paintBlankCanvas();
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setInkState(nextHasInk);
      };
      image.src = imageUrl;
    },
    [paintBlankCanvas, setInkState],
  );

  const pushSnapshot = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    historyRef.current = [
      ...historyRef.current.slice(-24),
      {
        dataUrl: canvas.toDataURL("image/png"),
        hasInk: hasInkRef.current,
      },
    ];
    setCanUndo(true);
  }, []);

  const getContext = useCallback(() => {
    const context = canvasRef.current?.getContext("2d");

    if (!context) {
      return null;
    }

    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalCompositeOperation = "source-over";

    return context;
  }, []);

  const drawDot = useCallback(
    (point: DrawingPoint) => {
      const context = getContext();

      if (!context) {
        return;
      }

      const style = getDrawingStrokeStyle(activeTool, activeColor, strokeSize);

      context.fillStyle = style.color;
      context.beginPath();
      context.arc(point.x, point.y, style.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    },
    [activeColor, activeTool, getContext, strokeSize],
  );

  const drawLine = useCallback(
    (from: DrawingPoint, to: DrawingPoint) => {
      const context = getContext();

      if (!context) {
        return;
      }

      const style = getDrawingStrokeStyle(activeTool, activeColor, strokeSize);

      context.strokeStyle = style.color;
      context.lineWidth = style.lineWidth;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    },
    [activeColor, activeTool, getContext, strokeSize],
  );

  const getPointerPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    return getCanvasPoint(event, canvas.getBoundingClientRect(), DRAWING_CANVAS_SIZE);
  }, []);

  const exportDataUrl = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    return canvas.toDataURL("image/png");
  }, []);

  const notifyChange = useCallback(
    (nextHasInk: boolean) => {
      if (!onChange) {
        return;
      }

      onChange(nextHasInk ? exportDataUrl() : null);
    },
    [exportDataUrl, onChange],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushSnapshot();

    const point = getPointerPoint(event);

    drawingRef.current = true;
    previousPointRef.current = point;
    drawDot(point);

    if (activeTool === "pencil") {
      setInkState(true);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || disabled) {
      return;
    }

    event.preventDefault();

    const nextPoint = getPointerPoint(event);
    const previousPoint = previousPointRef.current;

    if (previousPoint) {
      drawLine(previousPoint, nextPoint);
    }

    previousPointRef.current = nextPoint;
  };

  const finishDrawing = useCallback(
    (event?: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) {
        return;
      }

      if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      drawingRef.current = false;
      previousPointRef.current = null;

      if (activeTool === "pencil") {
        setInkState(true);
      }

      notifyChange(hasInkRef.current);
    },
    [activeTool, notifyChange, setInkState],
  );

  const handleUndo = () => {
    const snapshot = historyRef.current.pop();

    if (!snapshot) {
      return;
    }

    setCanUndo(historyRef.current.length > 0);
    loadImageIntoCanvas(snapshot.dataUrl, snapshot.hasInk);
    onChange?.(snapshot.hasInk ? snapshot.dataUrl : null);
  };

  const handleClear = () => {
    if (!hasInkRef.current) {
      return;
    }

    pushSnapshot();
    paintBlankCanvas();
    setInkState(false);
    onChange?.(null);
  };

  const handleExport = () => {
    const dataUrl = exportDataUrl();

    if (!dataUrl) {
      return;
    }

    onExport(dataUrl);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = DRAWING_CANVAS_SIZE.width;
    canvas.height = DRAWING_CANVAS_SIZE.height;
    paintBlankCanvas();

    if (initialImageUrl) {
      loadImageIntoCanvas(initialImageUrl, true);
    } else {
      setInkState(false);
    }
  }, [initialImageUrl, loadImageIntoCanvas, paintBlankCanvas, setInkState]);

  return (
    <section
      className={`rounded-[30px] border border-[var(--border-paper)] bg-[rgba(255,248,232,0.78)] p-4 shadow-[var(--shadow-paper)] md:p-5 ${className}`}
      aria-label="Drawing canvas"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[var(--accent-plum)]">
            Drawing time
          </p>
          <h2 className="mt-1 text-3xl font-black leading-tight text-[var(--ink-primary)] md:text-5xl">
            {prompt}
          </h2>
          <p className="mt-2 max-w-2xl text-base font-semibold leading-snug text-[var(--ink-soft)] md:text-lg">
            {helperText}
          </p>
        </div>
        <div className="rounded-full bg-white/76 px-4 py-2 text-sm font-black text-[var(--ink-soft)] shadow-sm">
          Wide paper canvas
        </div>
      </div>

      <div className="relative rounded-[26px] border border-[var(--border-paper)] bg-[var(--surface-paper-deep)] p-3 shadow-inner">
        <div className="absolute -top-3 left-10 h-7 w-24 rotate-[-4deg] rounded-[4px] border border-[rgba(169,121,76,0.2)] bg-[rgba(131,200,242,0.62)] shadow-sm" />
        <div className="absolute -top-2 right-14 h-7 w-28 rotate-[3deg] rounded-[4px] border border-[rgba(169,121,76,0.2)] bg-[rgba(246,201,76,0.7)] shadow-sm" />
        <canvas
          ref={canvasRef}
          aria-label="Draw on this wide canvas"
          className="block aspect-[16/9] max-h-[64vh] min-h-[360px] w-full cursor-crosshair touch-none rounded-[20px] border border-[rgba(218,196,155,0.78)] bg-[#fffdf5] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72),0_12px_30px_rgba(78,56,28,0.12)]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          onPointerLeave={finishDrawing}
        />
      </div>

      <div className="mt-4">
        <DrawingTools
          activeTool={activeTool}
          activeColor={activeColor}
          strokeSize={strokeSize}
          canUndo={canUndo}
          canClear={hasInk}
          canExport={hasInk}
          disabled={disabled}
          exportLabel={exportLabel}
          onToolChange={setActiveTool}
          onColorChange={setActiveColor}
          onStrokeSizeChange={setStrokeSize}
          onUndo={handleUndo}
          onClear={handleClear}
          onExport={handleExport}
        />
      </div>
    </section>
  );
}
