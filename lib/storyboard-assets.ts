const STORYBOARD_BASE_PATH = "/storyboard";

export const STORYBOARD_IMAGE_SIZE = {
  width: 1536,
  height: 1024,
} as const;

export type StoryboardAssetKind = "flow" | "reusable";

function storyboardAsset<const Filename extends string>(
  filename: Filename,
  label: string,
  kind: StoryboardAssetKind,
) {
  return {
    filename,
    publicPath: `${STORYBOARD_BASE_PATH}/${filename}` as const,
    label,
    kind,
    ...STORYBOARD_IMAGE_SIZE,
  };
}

export const STORYBOARD_ASSETS = {
  introStart: storyboardAsset("00-intro-start.png", "Intro/start screen", "flow"),
  drawMainCharacter: storyboardAsset("01-step-1a-draw-main-character.png", "Draw main character", "flow"),
  describeMainCharacter: storyboardAsset(
    "02-step-1b-describe-main-character.png",
    "Describe main character",
    "flow",
  ),
  generatingCharacter: storyboardAsset("03-step-1c-generating-character.png", "Generate character", "flow"),
  confirmCharacter: storyboardAsset("04-step-1d-confirm-character.png", "Confirm character", "flow"),
  drawSpecial: storyboardAsset("05-step-2a-draw-special.png", "Draw special detail", "flow"),
  describeSpecial: storyboardAsset("06-step-2b-describe-special.png", "Describe special detail", "flow"),
  confirmSpecial: storyboardAsset("07-step-2c-confirm-special.png", "Confirm special detail", "flow"),
  describeWant: storyboardAsset("08-step-3a-describe-want.png", "Describe what they want", "flow"),
  confirmWant: storyboardAsset("09-step-3b-confirm-want.png", "Confirm goal", "flow"),
  drawProblem: storyboardAsset("10-step-4a-draw-problem.png", "Draw the problem", "flow"),
  describeProblem: storyboardAsset("11-step-4b-describe-problem.png", "Describe the problem", "flow"),
  confirmProblem: storyboardAsset("12-step-4c-confirm-problem.png", "Confirm problem", "flow"),
  drawTry: storyboardAsset("13-step-5a-draw-try.png", "Draw what they try", "flow"),
  describeTry: storyboardAsset("14-step-5b-describe-try.png", "Describe what they try", "flow"),
  confirmTry: storyboardAsset("15-step-5c-confirm-try.png", "Confirm attempt", "flow"),
  drawEnding: storyboardAsset("16-step-6a-draw-ending.png", "Draw the ending", "flow"),
  describeEnding: storyboardAsset("17-step-6b-describe-ending.png", "Describe the ending", "flow"),
  confirmEnding: storyboardAsset("18-step-6c-confirm-ending.png", "Confirm ending", "flow"),
  buildingBook: storyboardAsset("19-building-book.png", "Build finished book", "flow"),
  finishedBookReader: storyboardAsset("20-finished-book-reader.png", "Finished book reader", "flow"),
  addDetailCorrection: storyboardAsset("21-add-detail-correction.png", "Add detail correction", "reusable"),
  recordingActive: storyboardAsset("22-recording-active.png", "Active recording", "reusable"),
  gentleRetryError: storyboardAsset("23-gentle-retry-error.png", "Gentle retry error", "reusable"),
  bookEditWords: storyboardAsset("24-book-edit-words.png", "Edit book words", "reusable"),
} as const;

export type StoryboardAssetKey = keyof typeof STORYBOARD_ASSETS;
export type StoryboardBeatId = "main-character" | "special" | "want" | "problem" | "try" | "ending";
export type StoryboardBeatStage = "draw" | "describe" | "generating" | "confirm";

export const STORYBOARD_FLOW_KEYS = [
  "introStart",
  "drawMainCharacter",
  "describeMainCharacter",
  "generatingCharacter",
  "confirmCharacter",
  "drawSpecial",
  "describeSpecial",
  "confirmSpecial",
  "describeWant",
  "confirmWant",
  "drawProblem",
  "describeProblem",
  "confirmProblem",
  "drawTry",
  "describeTry",
  "confirmTry",
  "drawEnding",
  "describeEnding",
  "confirmEnding",
  "buildingBook",
  "finishedBookReader",
] as const satisfies readonly StoryboardAssetKey[];

export const STORYBOARD_REUSABLE_STATE_KEYS = [
  "addDetailCorrection",
  "recordingActive",
  "gentleRetryError",
  "bookEditWords",
] as const satisfies readonly StoryboardAssetKey[];

export const BEAT_STAGE_STORYBOARD_ASSETS: Record<
  StoryboardBeatId,
  Partial<Record<StoryboardBeatStage, StoryboardAssetKey>>
> = {
  "main-character": {
    draw: "drawMainCharacter",
    describe: "describeMainCharacter",
    generating: "generatingCharacter",
    confirm: "confirmCharacter",
  },
  special: {
    draw: "drawSpecial",
    describe: "describeSpecial",
    generating: "generatingCharacter",
    confirm: "confirmSpecial",
  },
  want: {
    describe: "describeWant",
    generating: "generatingCharacter",
    confirm: "confirmWant",
  },
  problem: {
    draw: "drawProblem",
    describe: "describeProblem",
    generating: "generatingCharacter",
    confirm: "confirmProblem",
  },
  try: {
    draw: "drawTry",
    describe: "describeTry",
    generating: "generatingCharacter",
    confirm: "confirmTry",
  },
  ending: {
    draw: "drawEnding",
    describe: "describeEnding",
    generating: "generatingCharacter",
    confirm: "confirmEnding",
  },
};

export function getStoryboardAsset(key: StoryboardAssetKey) {
  return STORYBOARD_ASSETS[key];
}

export function getStoryboardAssetPath(key: StoryboardAssetKey): string {
  return STORYBOARD_ASSETS[key].publicPath;
}

export function getBeatStoryboardAsset(beatId: StoryboardBeatId, stage: StoryboardBeatStage) {
  const stageAssets: Partial<Record<StoryboardBeatStage, StoryboardAssetKey>> = BEAT_STAGE_STORYBOARD_ASSETS[beatId];
  const key = stageAssets[stage];

  return key ? STORYBOARD_ASSETS[key] : undefined;
}

export function getBeatStoryboardAssetPath(
  beatId: StoryboardBeatId,
  stage: StoryboardBeatStage,
): string | undefined {
  return getBeatStoryboardAsset(beatId, stage)?.publicPath;
}
