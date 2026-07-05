import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceRecorder } from "@/components/VoiceRecorder";

describe("VoiceRecorder", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "MediaRecorder",
      class {
        static isTypeSupported() {
          return true;
        }
      },
    );
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn(),
      },
    });
  });

  it("uses kid-friendly helper copy before recording", async () => {
    render(<VoiceRecorder onTranscript={vi.fn()} prompt="Start talking" />);

    expect(await screen.findByText("Tell it your way. We'll use your favorite parts.")).toBeInTheDocument();
    expect(screen.queryByText("Ramble is okay. Story Coach will keep the good details.")).not.toBeInTheDocument();
  });
});
