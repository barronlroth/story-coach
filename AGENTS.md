# AGENTS.md

This repo is a Next.js prototype for Story Coach, a tablet-friendly children's book builder. Keep changes grounded in the existing product decisions and verify them before handoff.

## Product Rules

- Build a responsive web app, not a native iPad app.
- Preserve the drawing-app feel. Avoid chatbot UI, assistant avatars, chat threads, and long explanatory copy.
- The child is the author. The AI interprets, polishes, and structures the child's drawings and words.
- For visual beats, the intended flow is draw first, describe second, generate third, confirm fourth.
- For describe-only beats, show accepted story context with the stacked story images.
- Keep story grammar implicit in the interaction. Do not explain plot theory to the child in the UI.
- The final book reader is the demo payoff.

## Implementation Rules

- Prefer existing local patterns over new abstractions.
- Keep story section behavior data-driven through `lib/beats.ts` where possible.
- Keep state transitions in `lib/story-state.ts`.
- Keep provider-specific behavior in `lib/ai/` or `lib/speech/`; do not leak provider details into UI components.
- Do not commit `.env.local`, generated live session images, build output, or local caches.
- Demo images in `public/generated/demo/` are committed assets. Live generated images in `public/generated/sessions/` are ignored.

## Commands

Use these checks before finishing work:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Use `pnpm dev` for local manual testing.

## AI Configuration

Default demo mode should work with stubs:

```bash
STORY_COACH_IMAGE_PROVIDER=stub
STORY_COACH_STORY_PROVIDER=stub
```

Live prototype mode can use the local Codex OAuth session:

```bash
STORY_COACH_IMAGE_PROVIDER=codex
STORY_COACH_STORY_PROVIDER=codex
STORY_COACH_CODEX_AUTH_PATH=~/.codex/auth.json
```

The Codex-backed path is a prototype convenience, not production auth or billing architecture.

Speech-to-text is local for the MVP. Use typed fallback or configure `STORY_COACH_TRANSCRIBE_COMMAND` with optional `STORY_COACH_TRANSCRIBE_ARGS` containing `{input}`.

## UI Notes

- Keep controls big enough for tablet use.
- Use existing paper, pin, tape, and book-reader visual language.
- Use child-friendly labels. Avoid internal words like `beat` in child-facing screens.
- Use `object-contain` for generated art inside frames so images fit instead of cropping past their containers.
- When adding loading text, make it specific to the story section.
- Prefer lucide icons already used in the app.

## Testing Notes

- Component tests use Vitest and Testing Library.
- Canvas tests mock `HTMLCanvasElement.getContext`.
- For story-flow UI changes, add focused tests in the nearest component test and an app-level test when state handoff matters.
- For prompt changes, update prompt tests rather than relying on snapshots.

## Key Files

- `components/StoryCoachApp.tsx`: main flow coordinator.
- `components/DrawingCanvas.tsx`: drawing step.
- `components/VoiceRecorder.tsx`: voice and typed fallback step.
- `components/ConfirmationPanel.tsx`: accept, add detail, regenerate.
- `components/StoryImageStack.tsx`: story-so-far image stack.
- `components/BookReader.tsx`: final book reader.
- `lib/beats.ts`: story grammar and child-facing copy.
- `lib/story-state.ts`: story session state machine.
- `lib/prompts/imagePrompt.ts`: image generation prompt builder.
- `lib/prompts/finalBookPrompt.ts`: final book prompt builder.
- `app/api/generate-image/route.ts`: image generation route.
- `app/api/finalize-book/route.ts`: final story writing route.
- `app/api/transcribe/route.ts`: speech-to-text route.

