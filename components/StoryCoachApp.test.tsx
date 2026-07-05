import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StoryCoachApp } from "@/components/StoryCoachApp";
import { createSeedSession } from "@/lib/seed-data";
import { STORY_SESSION_STORAGE_KEY } from "@/lib/storage";

describe("StoryCoachApp", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      globalCompositeOperation: "source-over",
      fillStyle: "",
      strokeStyle: "",
      lineCap: "round",
      lineJoin: "round",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,test");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses child-facing section titles instead of beat labels on confirmation screens", async () => {
    window.localStorage.setItem(
      STORY_SESSION_STORAGE_KEY,
      JSON.stringify({
        ...createSeedSession(),
        currentBeatIndex: 1,
      }),
    );

    render(<StoryCoachApp />);

    expect(await screen.findByText("Did I get it right?")).toBeInTheDocument();
    expect(screen.queryByText("Beat 2: What Makes Them Special")).not.toBeInTheDocument();
    expect(screen.getAllByText("What Makes Them Special").length).toBeGreaterThan(0);
  });

  it("explains what to talk about on describe-only story sections", async () => {
    window.localStorage.setItem(
      STORY_SESSION_STORAGE_KEY,
      JSON.stringify({
        ...createSeedSession(),
        currentBeatIndex: 2,
        currentStep: "describe",
      }),
    );

    render(<StoryCoachApp />);

    expect(await screen.findByText("What do they want most?")).toBeInTheDocument();
    expect(
      screen.getByText("Tell us what they are hoping for, why they want it, and how it would feel to get it."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Use your voice or type it in. Messy details are welcome.")).not.toBeInTheDocument();
  });

  it("stacks all accepted story images when generating a describe-only section", async () => {
    const session = createSeedSession();

    window.localStorage.setItem(
      STORY_SESSION_STORAGE_KEY,
      JSON.stringify({
        ...session,
        currentBeatIndex: 2,
        currentStep: "generating",
        beats: session.beats.map((beat, index) => ({
          ...beat,
          accepted: index < 2,
          generatedImageUrl: index === 2 ? undefined : beat.generatedImageUrl,
        })),
      }),
    );

    render(<StoryCoachApp />);

    expect(await screen.findByText("Imagining their dreams...")).toBeInTheDocument();
    expect(screen.queryByText("Making your picture...")).not.toBeInTheDocument();
    expect(screen.getByAltText("Main Character picture")).toBeInTheDocument();
    expect(screen.getByAltText("What Makes Them Special picture")).toBeInTheDocument();
  });
});
