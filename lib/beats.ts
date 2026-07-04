export type BeatMode = "draw" | "describe" | "drawThenDescribe" | "describeThenDraw";

export type BeatDefinition = {
  beatId: string;
  title: string;
  mode: BeatMode;
  drawPrompt?: string;
  describePrompt?: string;
  helperText?: string;
  nudges: string[];
  requiresImage: boolean;
};

export const STORY_BEATS: BeatDefinition[] = [
  {
    beatId: "main-character",
    title: "Main Character",
    mode: "drawThenDescribe",
    drawPrompt: "Draw your main character",
    describePrompt: "Tell me about your character",
    nudges: ["What's their name?", "What are they?", "What should I remember?"],
    requiresImage: true,
  },
  {
    beatId: "special",
    title: "What Makes Them Special",
    mode: "drawThenDescribe",
    drawPrompt: "Draw what makes them special",
    describePrompt: "Tell me what makes it special",
    helperText: "A power, a favorite thing, a secret, or a funny detail",
    nudges: ["Is it a power?", "How does it help?", "Can it cause trouble?"],
    requiresImage: true,
  },
  {
    beatId: "want",
    title: "What They Want",
    mode: "describe",
    describePrompt: "What do they want most?",
    nudges: ["What are they hoping for?", "Why does it matter?", "How would they feel?"],
    requiresImage: true,
  },
  {
    beatId: "problem",
    title: "What Gets In The Way",
    mode: "drawThenDescribe",
    drawPrompt: "Draw what gets in their way",
    describePrompt: "Tell me about the problem",
    helperText: "A person, a place, a fear, or a tricky problem",
    nudges: ["What is stopping them?", "Why is it hard?", "Is it scary or tricky?"],
    requiresImage: true,
  },
  {
    beatId: "try",
    title: "What They Try",
    mode: "drawThenDescribe",
    drawPrompt: "Draw what they try",
    describePrompt: "Tell me what they do",
    helperText: "What do they do to help?",
    nudges: ["What do they try?", "Does it work?", "What happens next?"],
    requiresImage: true,
  },
  {
    beatId: "ending",
    title: "How It Ends",
    mode: "drawThenDescribe",
    drawPrompt: "Draw the ending",
    describePrompt: "Tell me how it ends",
    helperText: "Show what changed",
    nudges: ["Did they get what they wanted?", "How do they feel?", "What changed?"],
    requiresImage: true,
  },
];

export function getBeatDefinition(beatId: string): BeatDefinition | undefined {
  return STORY_BEATS.find((beat) => beat.beatId === beatId);
}
