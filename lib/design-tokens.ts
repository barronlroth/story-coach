export const storyCoachTokenValues = {
  "background.paper": "#f8efd7",
  "surface.paper": "#fff8e8",
  "surface.paperDeep": "#f3dfb8",
  "surface.canvas": "#fffdf5",
  "ink.primary": "#2f2a22",
  "ink.soft": "#76624c",
  "ink.inverse": "#ffffff",
  "accent.sun": "#f6c94c",
  "accent.sky": "#83c8f2",
  "accent.coral": "#ef836f",
  "accent.leaf": "#73b970",
  "accent.plum": "#8b6fb4",
  "border.paper": "#dac49b",
  "border.soft": "rgba(47, 42, 34, 0.18)",
  "shadow.paper": "0 18px 48px rgba(78, 56, 28, 0.16)",
  "shadow.raised": "0 14px 28px rgba(78, 56, 28, 0.18)",
  "shadow.button": "0 8px 0 rgba(190, 134, 16, 0.25), 0 14px 28px rgba(78, 56, 28, 0.14)",
  "radius.paper": "24px",
  "radius.workspace": "30px",
  "radius.control": "22px",
  "radius.pill": "999px",
} as const;

export type StoryCoachTokenPath = keyof typeof storyCoachTokenValues;

export const storyCoachTokenCssVariables = {
  "background.paper": "--background-paper",
  "surface.paper": "--surface-paper",
  "surface.paperDeep": "--surface-paper-deep",
  "surface.canvas": "--surface-canvas",
  "ink.primary": "--ink-primary",
  "ink.soft": "--ink-soft",
  "ink.inverse": "--ink-inverse",
  "accent.sun": "--accent-sun",
  "accent.sky": "--accent-sky",
  "accent.coral": "--accent-coral",
  "accent.leaf": "--accent-leaf",
  "accent.plum": "--accent-plum",
  "border.paper": "--border-paper",
  "border.soft": "--border-soft",
  "shadow.paper": "--shadow-paper",
  "shadow.raised": "--shadow-raised",
  "shadow.button": "--shadow-button",
  "radius.paper": "--radius-paper",
  "radius.workspace": "--radius-workspace",
  "radius.control": "--radius-control",
  "radius.pill": "--radius-pill",
} as const satisfies Record<StoryCoachTokenPath, `--${string}`>;

export const storyCoachTreatments = {
  workspaceBand:
    "relative overflow-hidden rounded-[30px] border border-[var(--border-paper)] bg-[rgba(255,248,232,0.78)] shadow-[var(--shadow-paper)]",
  paperPanel:
    "rounded-[24px] border border-[var(--border-paper)] bg-[var(--surface-paper)] shadow-[var(--shadow-paper)]",
  softPaperPanel:
    "rounded-[24px] border border-[var(--border-paper)] bg-white/70 shadow-[var(--shadow-paper)]",
  pinnedLandscapePaper:
    "relative aspect-[16/9] overflow-hidden rounded-[18px] border-[6px] border-white bg-white shadow-[0_14px_28px_rgba(78,56,28,0.18)]",
  confirmationImageStage:
    "relative aspect-[4/3] overflow-hidden rounded-[24px] border-[8px] border-white bg-white shadow-[0_18px_36px_rgba(78,56,28,0.2)]",
  tapeStrip:
    "absolute h-8 w-24 rounded-[6px] border border-white/30 bg-[rgba(131,200,242,0.58)] shadow-sm",
  pin:
    "absolute h-6 w-6 rounded-full border-2 border-white shadow-[0_5px_10px_rgba(78,56,28,0.22)]",
  touchButton:
    "inline-flex min-h-14 items-center justify-center gap-3 rounded-[22px] px-5 py-3 text-lg font-black shadow-md transition active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60",
  primaryButton:
    "bg-[var(--accent-sun)] text-[var(--ink-primary)] shadow-[0_8px_0_rgba(190,134,16,0.25),0_14px_28px_rgba(78,56,28,0.14)]",
  secondaryButton:
    "border-2 border-[#2578d8] bg-white text-[#2578d8] shadow-[0_10px_24px_rgba(37,120,216,0.16)]",
  retryButton:
    "border-2 border-[var(--accent-coral)] bg-white text-[#e64b35] shadow-[0_10px_24px_rgba(230,75,53,0.16)]",
  successButton:
    "bg-[var(--accent-leaf)] text-white shadow-[0_8px_0_rgba(64,130,59,0.24),0_14px_28px_rgba(78,56,28,0.14)]",
} as const;

export function getStoryCoachTokenValue(path: StoryCoachTokenPath): string {
  return storyCoachTokenValues[path];
}

export function getStoryCoachCssVariable(path: StoryCoachTokenPath): `var(${string})` {
  return `var(${storyCoachTokenCssVariables[path]})`;
}

export function getStoryCoachCssVariableDeclarations(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(storyCoachTokenCssVariables).map(([path, variable]) => [
      variable,
      storyCoachTokenValues[path as StoryCoachTokenPath],
    ]),
  );
}

export function cx(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
