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
});
