// @vitest-environment node

import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { persistGeneratedImageUrl } from "@/lib/ai/generatedImageStorage";

const createdFiles: string[] = [];

afterEach(() => {
  for (const filePath of createdFiles.splice(0)) {
    rmSync(filePath, { force: true });
  }
});

describe("persistGeneratedImageUrl", () => {
  it("passes through normal URLs unchanged", async () => {
    await expect(
      persistGeneratedImageUrl("/generated/demo/main-character.png", {
        beatId: "main-character",
      }),
    ).resolves.toBe("/generated/demo/main-character.png");
  });

  it("writes data URLs to a stable public sessions path", async () => {
    const imageUrl = await persistGeneratedImageUrl("data:image/png;base64,aGVsbG8=", {
      beatId: "Main Character!",
      now: new Date("2026-07-04T12:00:00.000Z"),
      uuid: "image-id",
    });
    const expectedPath = path.join(
      process.cwd(),
      "public",
      "generated",
      "sessions",
      "2026-07-04T12-00-00-000Z-main-character-image-id.png",
    );
    createdFiles.push(expectedPath);

    expect(imageUrl).toBe("/generated/sessions/2026-07-04T12-00-00-000Z-main-character-image-id.png");
    expect(existsSync(expectedPath)).toBe(true);
    expect(readFileSync(expectedPath, "utf8")).toBe("hello");
  });
});
