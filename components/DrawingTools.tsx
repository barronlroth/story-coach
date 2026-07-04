"use client";

import { Check, Eraser, Paintbrush, Palette, Trash2, Undo2 } from "lucide-react";
import {
  DRAWING_COLORS,
  DRAWING_STROKE_SIZES,
  type DrawingTool,
} from "@/lib/drawing";

type DrawingToolsProps = {
  activeTool: DrawingTool;
  activeColor: string;
  strokeSize: number;
  canUndo: boolean;
  canClear: boolean;
  canExport: boolean;
  exportLabel?: string;
  disabled?: boolean;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onStrokeSizeChange: (strokeSize: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
};

export function DrawingTools({
  activeTool,
  activeColor,
  strokeSize,
  canUndo,
  canClear,
  canExport,
  exportLabel = "Done drawing",
  disabled = false,
  onToolChange,
  onColorChange,
  onStrokeSizeChange,
  onUndo,
  onClear,
  onExport,
}: DrawingToolsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--border-paper)] bg-white/72 p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2" aria-label="Drawing tools">
        <ToolButton
          label="Pencil"
          selected={activeTool === "pencil"}
          disabled={disabled}
          onClick={() => onToolChange("pencil")}
        >
          <Paintbrush size={22} strokeWidth={2.8} />
        </ToolButton>
        <ToolButton
          label="Eraser"
          selected={activeTool === "eraser"}
          disabled={disabled}
          onClick={() => onToolChange("eraser")}
        >
          <Eraser size={22} strokeWidth={2.8} />
        </ToolButton>

        <div className="mx-1 hidden h-9 w-px bg-[var(--border-paper)] md:block" />

        <div className="flex items-center gap-1 rounded-2xl bg-[var(--surface-paper)] px-2 py-1">
          <Palette size={18} className="text-[var(--ink-soft)]" aria-hidden="true" />
          {DRAWING_COLORS.map((color) => {
            const selected = activeColor === color.value;

            return (
              <button
                key={color.value}
                type="button"
                aria-label={color.name}
                aria-pressed={selected}
                title={color.name}
                disabled={disabled}
                onClick={() => {
                  onColorChange(color.value);
                  onToolChange("pencil");
                }}
                className={`h-11 w-11 rounded-full border-2 shadow-sm transition ${
                  selected
                    ? "border-[var(--ink-primary)] ring-2 ring-[var(--accent-sun)]"
                    : "border-white/90"
                } disabled:cursor-not-allowed disabled:opacity-45`}
                style={{ backgroundColor: color.value }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-2xl bg-[var(--surface-paper)] p-1">
          {DRAWING_STROKE_SIZES.map((size) => {
            const selected = strokeSize === size;

            return (
              <button
                key={size}
                type="button"
                aria-label={`${size}px brush`}
                aria-pressed={selected}
                title={`${size}px brush`}
                disabled={disabled}
                onClick={() => onStrokeSizeChange(size)}
                className={`grid h-11 w-11 place-items-center rounded-xl border transition ${
                  selected
                    ? "border-[var(--ink-primary)] bg-white shadow-sm"
                    : "border-transparent bg-transparent"
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                <span
                  className="rounded-full bg-[var(--ink-primary)]"
                  style={{
                    height: Math.max(6, size * 0.65),
                    width: Math.max(6, size * 0.65),
                  }}
                />
              </button>
            );
          })}
        </div>

        <ToolButton label="Undo" disabled={disabled || !canUndo} onClick={onUndo}>
          <Undo2 size={22} strokeWidth={2.8} />
        </ToolButton>
        <ToolButton label="Clear" disabled={disabled || !canClear} onClick={onClear}>
          <Trash2 size={22} strokeWidth={2.8} />
        </ToolButton>

        <button
          type="button"
          disabled={disabled || !canExport}
          onClick={onExport}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--accent-sun)] px-5 py-3 text-base font-black text-[var(--ink-primary)] shadow-md transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(246,201,76,0.45)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Check size={22} strokeWidth={3} />
          {exportLabel}
        </button>
      </div>
    </div>
  );
}

type ToolButtonProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolButton({ label, selected = false, disabled = false, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-14 w-14 place-items-center rounded-2xl border text-[var(--ink-primary)] transition focus:outline-none focus:ring-4 focus:ring-[rgba(131,200,242,0.42)] ${
        selected
          ? "border-[var(--ink-primary)] bg-[var(--accent-sky)] shadow-md"
          : "border-[var(--border-paper)] bg-[var(--surface-paper)] shadow-sm hover:-translate-y-0.5"
      } disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45`}
    >
      {children}
    </button>
  );
}
