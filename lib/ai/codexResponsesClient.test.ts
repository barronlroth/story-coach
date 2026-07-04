// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import {
  createCodexResponsesClient,
  DEFAULT_CODEX_RESPONSES_ENDPOINT,
} from "@/lib/ai/codexResponsesClient";

describe("createCodexResponsesClient", () => {
  it("posts to the default Codex endpoint with a server-side bearer token", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ output_text: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createCodexResponsesClient(
      {
        fetchFn,
      },
      {
        STORY_COACH_CODEX_ACCESS_TOKEN: "server-only-token",
      },
    );

    await expect(client.createResponse({ model: "gpt-5.4", store: false })).resolves.toEqual({
      output_text: "ok",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      DEFAULT_CODEX_RESPONSES_ENDPOINT,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer server-only-token",
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});
