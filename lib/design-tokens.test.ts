import { describe, expect, it } from "vitest";
import {
  cx,
  getStoryCoachCssVariable,
  getStoryCoachCssVariableDeclarations,
  getStoryCoachTokenValue,
  storyCoachTokenValues,
} from "@/lib/design-tokens";

describe("story coach design tokens", () => {
  it("encodes the PRD core color tokens", () => {
    expect(getStoryCoachTokenValue("background.paper")).toBe("#f8efd7");
    expect(getStoryCoachTokenValue("surface.paper")).toBe("#fff8e8");
    expect(getStoryCoachTokenValue("accent.sun")).toBe("#f6c94c");
    expect(getStoryCoachTokenValue("accent.sky")).toBe("#83c8f2");
    expect(getStoryCoachTokenValue("accent.coral")).toBe("#ef836f");
    expect(getStoryCoachTokenValue("accent.leaf")).toBe("#73b970");
  });

  it("maps token paths to css variable references", () => {
    expect(getStoryCoachCssVariable("ink.primary")).toBe("var(--ink-primary)");
    expect(getStoryCoachCssVariable("border.paper")).toBe("var(--border-paper)");

    const declarations = getStoryCoachCssVariableDeclarations();
    expect(declarations["--shadow-paper"]).toBe(storyCoachTokenValues["shadow.paper"]);
    expect(declarations["--radius-paper"]).toBe("24px");
  });

  it("joins class names without falsey values", () => {
    expect(cx("paper", false, undefined, "warm", null, "shadow")).toBe("paper warm shadow");
  });
});
