export type DrawingTool = "pencil" | "eraser";

export type DrawingCanvasSize = {
  width: number;
  height: number;
};

export type DrawingPoint = {
  x: number;
  y: number;
};

export type DrawingPointer = {
  clientX: number;
  clientY: number;
};

export type DrawingRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DrawingStrokeStyle = {
  color: string;
  lineWidth: number;
};

export const DRAWING_CANVAS_SIZE: DrawingCanvasSize = {
  width: 1536,
  height: 864,
};

export const DRAWING_PAPER_COLOR = "#fffdf5";
export const DEFAULT_DRAWING_COLOR = "#2f2a22";
export const DEFAULT_STROKE_SIZE = 10;

export const DRAWING_COLORS = [
  { name: "Ink", value: "#2f2a22" },
  { name: "Sky", value: "#2f83d4" },
  { name: "Sun", value: "#f0b429" },
  { name: "Coral", value: "#df5c4f" },
  { name: "Leaf", value: "#4f9d5d" },
  { name: "Plum", value: "#7a55a3" },
] as const;

export const DRAWING_STROKE_SIZES = [6, 10, 16, 24] as const;

export function clampDrawingValue(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function normalizeStrokeSize(strokeSize: number) {
  return Math.round(clampDrawingValue(strokeSize, 2, 64));
}

export function getCanvasPoint(
  pointer: DrawingPointer,
  rect: DrawingRect,
  canvasSize: DrawingCanvasSize = DRAWING_CANVAS_SIZE,
): DrawingPoint {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 };
  }

  const x = ((pointer.clientX - rect.left) / rect.width) * canvasSize.width;
  const y = ((pointer.clientY - rect.top) / rect.height) * canvasSize.height;

  return {
    x: clampDrawingValue(x, 0, canvasSize.width),
    y: clampDrawingValue(y, 0, canvasSize.height),
  };
}

export function getDrawingStrokeStyle(
  tool: DrawingTool,
  color: string,
  strokeSize: number,
): DrawingStrokeStyle {
  const normalizedSize = normalizeStrokeSize(strokeSize);

  if (tool === "eraser") {
    return {
      color: DRAWING_PAPER_COLOR,
      lineWidth: Math.round(normalizedSize * 2.4),
    };
  }

  return {
    color,
    lineWidth: normalizedSize,
  };
}

export function isPngDataUrl(value: string) {
  return value.startsWith("data:image/png;base64,");
}
