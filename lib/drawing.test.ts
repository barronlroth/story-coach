import { describe, expect, it } from "vitest";
import {
  DRAWING_CANVAS_SIZE,
  DRAWING_PAPER_COLOR,
  getCanvasPoint,
  getDrawingStrokeStyle,
  isPngDataUrl,
  normalizeStrokeSize,
} from "@/lib/drawing";

describe("drawing helpers", () => {
  it("maps pointer coordinates into the logical canvas size", () => {
    const point = getCanvasPoint(
      { clientX: 300, clientY: 180 },
      { left: 100, top: 60, width: 800, height: 450 },
    );

    expect(point).toEqual({
      x: DRAWING_CANVAS_SIZE.width * 0.25,
      y: DRAWING_CANVAS_SIZE.height * (120 / 450),
    });
  });

  it("clamps pointer coordinates to the canvas bounds", () => {
    const point = getCanvasPoint(
      { clientX: -50, clientY: 999 },
      { left: 100, top: 100, width: 400, height: 200 },
      { width: 1000, height: 500 },
    );

    expect(point).toEqual({ x: 0, y: 500 });
  });

  it("uses the paper color and a larger mark for the eraser", () => {
    const style = getDrawingStrokeStyle("eraser", "#123456", 10);

    expect(style).toEqual({
      color: DRAWING_PAPER_COLOR,
      lineWidth: 24,
    });
  });

  it("normalizes brush sizes before building a pencil style", () => {
    expect(getDrawingStrokeStyle("pencil", "#123456", 10.4)).toEqual({
      color: "#123456",
      lineWidth: 10,
    });
    expect(normalizeStrokeSize(100)).toBe(64);
  });

  it("recognizes PNG exports", () => {
    expect(isPngDataUrl("data:image/png;base64,abc")).toBe(true);
    expect(isPngDataUrl("data:image/jpeg;base64,abc")).toBe(false);
  });
});
