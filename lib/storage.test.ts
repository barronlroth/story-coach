import { describe, expect, it, vi } from "vitest";
import { createInitialStorySession } from "@/lib/story-state";
import { loadStorySession, saveStorySession, STORY_SESSION_STORAGE_KEY } from "@/lib/storage";

describe("story session storage", () => {
  it("round-trips the current session through localStorage", () => {
    const session = createInitialStorySession(new Date("2026-07-04T12:00:00.000Z"));
    const storage = new Map<string, string>();
    const localStorageLike = {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    };

    saveStorySession(session, localStorageLike);

    expect(localStorageLike.setItem).toHaveBeenCalledWith(STORY_SESSION_STORAGE_KEY, expect.any(String));
    expect(loadStorySession(localStorageLike)).toEqual(session);
  });

  it("returns null for missing or invalid stored state", () => {
    expect(loadStorySession({ getItem: () => null })).toBeNull();
    expect(loadStorySession({ getItem: () => "not json" })).toBeNull();
  });
});
