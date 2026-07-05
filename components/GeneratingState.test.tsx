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

  it("can show a stack of prior story images", () => {
    render(
      <GeneratingState
        storyImages={[
          { imageUrl: "/generated/demo/main-character.png", alt: "Main Character picture" },
          { imageUrl: "/generated/demo/special.png", alt: "What Makes Them Special picture" },
        ]}
        posterLabel="Story so far"
      />,
    );

    expect(screen.getByAltText("Main Character picture")).toBeInTheDocument();
    expect(screen.getByAltText("What Makes Them Special picture")).toBeInTheDocument();
  });
});
