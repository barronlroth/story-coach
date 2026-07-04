import { describe, expect, it } from "vitest";
import {
  getBeatStoryboardAsset,
  getBeatStoryboardAssetPath,
  getStoryboardAsset,
  getStoryboardAssetPath,
  STORYBOARD_ASSETS,
  STORYBOARD_FLOW_KEYS,
  STORYBOARD_REUSABLE_STATE_KEYS,
} from "@/lib/storyboard-assets";

describe("storyboard asset mapping", () => {
  it("maps all storyboard PNGs to public asset paths", () => {
    expect(Object.keys(STORYBOARD_ASSETS)).toHaveLength(25);
    expect(STORYBOARD_FLOW_KEYS).toHaveLength(21);
    expect(STORYBOARD_REUSABLE_STATE_KEYS).toHaveLength(4);
    expect(getStoryboardAssetPath("gentleRetryError")).toBe("/storyboard/23-gentle-retry-error.png");
    expect(getStoryboardAsset("addDetailCorrection")).toMatchObject({
      filename: "21-add-detail-correction.png",
      kind: "reusable",
      width: 1536,
      height: 1024,
    });
  });

  it("maps beat stages to their storyboard references", () => {
    expect(getBeatStoryboardAssetPath("main-character", "draw")).toBe(
      "/storyboard/01-step-1a-draw-main-character.png",
    );
    expect(getBeatStoryboardAssetPath("want", "describe")).toBe("/storyboard/08-step-3a-describe-want.png");
    expect(getBeatStoryboardAssetPath("ending", "confirm")).toBe("/storyboard/18-step-6c-confirm-ending.png");
  });

  it("leaves missing beat stages undefined", () => {
    expect(getBeatStoryboardAsset("want", "draw")).toBeUndefined();
  });
});
