import type { StorySessionState } from "@/lib/story-state";

export const STORY_SESSION_STORAGE_KEY = "story-coach-session-v1";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function loadStorySession(storage: ReadableStorage): StorySessionState | null {
  const raw = storage.getItem(STORY_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StorySessionState;
  } catch {
    return null;
  }
}

export function saveStorySession(session: StorySessionState, storage: WritableStorage): void {
  storage.setItem(STORY_SESSION_STORAGE_KEY, JSON.stringify(session));
}
