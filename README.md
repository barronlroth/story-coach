# Story Coach

Story Coach is a drawing-based children's book builder. A child draws and describes one story section at a time, the app turns those inputs into polished illustrations, and the final payoff is a six-page illustrated book.

The core thesis:

> The AI does not replace the child's imagination. It gives it story grammar.

This is a Next.js web prototype designed to feel good on tablet dimensions. It is not a native iPad app and it is not a chatbot.

## Current Demo

The prototype supports the full book-making loop:

- Six-part story structure: main character, special trait, want, problem, try, ending.
- Tablet-friendly drawing canvas.
- Voice recording UI with typed fallback for demos.
- AI image generation through stub mode or Codex-backed mode.
- Accept, add detail, and regenerate flows.
- Story-so-far image stack for later sections.
- Final book writer through stub mode or Codex-backed mode.
- Paginated book reader with read-aloud support through browser speech synthesis.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Vitest and Testing Library
- Server routes for image generation, story writing, and transcription

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The default `.env.example` uses stub providers so the app can run without live AI credentials.

## Useful Commands

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

Run `pnpm test`, `pnpm typecheck`, and `pnpm build` before handing off a demo-ready change.

## Demo Flow

Fastest demo path:

1. Start the app with `pnpm dev`.
2. Use `Seed flow` to load the demo story quickly.
3. Walk through a generated image confirmation screen.
4. Show `Add detail` and `Try again` if needed.
5. Accept the final section and show the finished book reader.

For a full live path:

1. Draw a main character.
2. Describe it with voice or typed fallback.
3. Confirm the generated image.
4. Continue through each story section.
5. Build the final book.

See [docs/demo-checklist.md](docs/demo-checklist.md) for a concise runbook.

## AI Provider Modes

Story Coach has two provider paths:

- `stub`: deterministic demo mode using local demo images and stub story writing.
- `codex`: prototype mode using Codex OAuth-backed calls for image generation and final story writing.

Set these in `.env.local`:

```bash
STORY_COACH_IMAGE_PROVIDER=stub
STORY_COACH_STORY_PROVIDER=stub
```

For live Codex-backed prototype mode:

```bash
STORY_COACH_IMAGE_PROVIDER=codex
STORY_COACH_STORY_PROVIDER=codex
STORY_COACH_CODEX_AUTH_PATH=~/.codex/auth.json
STORY_COACH_CODEX_RESPONSES_URL=https://chatgpt.com/backend-api/codex/responses
STORY_COACH_CODEX_RESPONSE_MODEL=gpt-5.5
STORY_COACH_CODEX_IMAGE_MODEL=gpt-image-2
STORY_COACH_CODEX_IMAGE_REASONING_EFFORT=none
STORY_COACH_CODEX_IMAGE_SIZE=1536x1024
STORY_COACH_CODEX_IMAGE_QUALITY=medium
```

Notes:

- `.env.local` is ignored and must not be committed.
- The Codex-backed path is for prototyping with the local Codex OAuth session, not production billing or production auth.
- Live generated session images are written under `public/generated/sessions/` and ignored by git.
- Demo images live under `public/generated/demo/` and are committed.

## Speech-To-Text

Speech is intentionally local for the MVP. The `/api/transcribe` route supports:

- typed fallback
- mock transcript for development
- a local command provider

Configure a local command with:

```bash
STORY_COACH_TRANSCRIBE_COMMAND=/path/to/transcriber
STORY_COACH_TRANSCRIBE_ARGS="{input}"
STORY_COACH_TRANSCRIBE_PROVIDER=local-whisper
```

The command should print either plain transcript text or JSON with `transcript` or `text`.

## Project Map

- `app/`: Next.js routes and API endpoints.
- `components/`: UI surfaces for drawing, describing, confirming, loading, retrying, and reading the book.
- `lib/beats.ts`: six-part story grammar and child-facing prompts.
- `lib/story-state.ts`: session state transitions.
- `lib/prompts/`: prompt builders for image generation and final book writing.
- `lib/ai/`: stub and Codex-backed provider implementations.
- `lib/speech/`: local speech-to-text adapter.
- `public/storyboard/`: UX mock images used as visual reference.
- `docs/story-coach-prd.md`: product requirements and implementation plan.
- `docs/evals/`: image generation timing and quality evaluation artifacts.

## Product Guardrails

- This should feel like a drawing and book-making app, not a chat UI.
- Children draw first and describe second for visual sections.
- Voice or typed description is the source of truth for ambiguous drawings.
- Confirm after image generation, not before.
- Corrections are additive: `Add detail`, then regenerate.
- Keep story learning implicit in the beat sequence.
- The finished book is the winning demo moment.

