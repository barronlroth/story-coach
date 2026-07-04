import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookReader } from "@/components/BookReader";
import type { FinalBook } from "@/lib/story-state";

const book: FinalBook = {
  title: "Jesse Marsh and the Moon Kite",
  pages: Array.from({ length: 6 }, (_, index) => ({
    pageNumber: index + 1,
    beatId: `beat-${index + 1}`,
    imageUrl: `/generated/page-${index + 1}.png`,
    text: `Page ${index + 1} text.`,
  })),
  narrationText: "All six pages read together.",
};

describe("BookReader", () => {
  it("paginates the book by page spread", () => {
    render(<BookReader book={book} />);

    expect(screen.getByText("Pages 1-2 of 6")).toBeInTheDocument();
    expect(screen.getByText("Page 1 text.")).toBeInTheDocument();
    expect(screen.getByText("Page 2 text.")).toBeInTheDocument();
    expect(screen.queryByText("Page 3 text.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Pages 3-4 of 6")).toBeInTheDocument();
    expect(screen.getByText("Page 3 text.")).toBeInTheDocument();
    expect(screen.getByText("Page 4 text.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(screen.getByText("Pages 1-2 of 6")).toBeInTheDocument();
  });

  it("exposes read-aloud narration text", () => {
    render(<BookReader book={book} />);

    fireEvent.click(screen.getByRole("button", { name: /read aloud/i }));

    expect(screen.getByText("All six pages read together.")).toBeInTheDocument();
  });
});
