// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import {
  createCodexResponsesClient,
  DEFAULT_CODEX_RESPONSES_ENDPOINT,
} from "@/lib/ai/codexResponsesClient";

describe("createCodexResponsesClient", () => {
  it("posts a streaming request to the default Codex endpoint with a server-side bearer token", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        [
          "event: response.output_text.delta",
          'data: {"type":"response.output_text.delta","delta":"{\\"ok\\""}',
          "",
          "event: response.output_text.done",
          'data: {"type":"response.output_text.done","text":"{\\"ok\\":true}"}',
          "",
          "event: response.completed",
          'data: {"type":"response.completed","response":{"status":"completed"}}',
          "",
        ].join("\n"),
        {
        status: 200,
        },
      ),
    );
    const client = createCodexResponsesClient(
      {
        fetchFn,
      },
      {
        STORY_COACH_CODEX_ACCESS_TOKEN: "server-only-token",
      },
    );

    await expect(client.createResponse({ model: "gpt-5.4", store: false })).resolves.toMatchObject({
      output_text: "{\"ok\":true}",
      response: {
        status: "completed",
      },
    });

    expect(fetchFn).toHaveBeenCalledWith(
      DEFAULT_CODEX_RESPONSES_ENDPOINT,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "text/event-stream",
          Authorization: "Bearer server-only-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          model: "gpt-5.4",
          store: false,
          stream: true,
        }),
      }),
    );
  });
});
