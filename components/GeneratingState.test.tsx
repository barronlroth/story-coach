import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GeneratingState } from "@/components/GeneratingState";

describe("GeneratingState", () => {
  it("labels describe-only visual context as story so far", () => {
    render(
      <GeneratingState
        drawingImageUrl="/generated/demo/main-character.png"
        drawingAlt="Story picture so far"
        posterLabel="Story so far"
      />,
    );

    expect(screen.getByAltText("Story picture so far")).toBeInTheDocument();
    expect(screen.getByText("Story so far")).toBeInTheDocument();
  });
});
