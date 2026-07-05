import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmationPanel } from "@/components/ConfirmationPanel";

describe("ConfirmationPanel", () => {
  it("fits generated illustrations and drawings inside their paper frames", () => {
    render(
      <ConfirmationPanel
        generatedImageUrl="/generated/demo/main-character.png"
        drawingImageUrl="/storyboard/01-step-1a-draw-main-character.png"
        summaryTitle="Main Character"
        summaryText="Bobby the lil t-rex"
        onLooksRight={vi.fn()}
        onAddDetail={vi.fn()}
        onTryAgain={vi.fn()}
      />,
    );

    expect(screen.getByAltText("Generated storybook picture")).toHaveClass("object-contain");
    expect(screen.getByAltText("Your drawing")).toHaveClass("object-contain");
  });
});
