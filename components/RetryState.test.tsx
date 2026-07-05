import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RetryState } from "@/components/RetryState";

describe("RetryState", () => {
  it("can show story context instead of an empty drawing poster", () => {
    render(
      <RetryState
        drawingImageUrl="/generated/demo/main-character.png"
        drawingImageAlt="Story picture so far"
        posterLabel="Story so far"
        safeNote="The story picture is still here."
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByAltText("Story picture so far")).toBeInTheDocument();
    expect(screen.getByText("Story so far")).toBeInTheDocument();
    expect(screen.getByText("The story picture is still here.")).toBeInTheDocument();
  });

  it("prefers the story image stack when several prior pictures exist", () => {
    render(
      <RetryState
        drawingImageUrl="/generated/demo/special.png"
        storyImages={[
          { imageUrl: "/generated/demo/main-character.png", alt: "Main Character picture" },
          { imageUrl: "/generated/demo/special.png", alt: "What Makes Them Special picture" },
        ]}
        posterLabel="Story so far"
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByAltText("Main Character picture")).toBeInTheDocument();
    expect(screen.getByAltText("What Makes Them Special picture")).toBeInTheDocument();
  });
});
