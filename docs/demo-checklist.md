# Story Coach Demo Checklist

Use this when preparing a local demo.

## Before The Demo

1. Confirm dependencies are installed:

   ```bash
   pnpm install
   ```

2. Choose provider mode in `.env.local`.

   Stub mode is fastest and safest:

   ```bash
   STORY_COACH_IMAGE_PROVIDER=stub
   STORY_COACH_STORY_PROVIDER=stub
   ```

   Codex-backed mode uses the local Codex OAuth session:

   ```bash
   STORY_COACH_IMAGE_PROVIDER=codex
   STORY_COACH_STORY_PROVIDER=codex
   STORY_COACH_CODEX_AUTH_PATH=~/.codex/auth.json
   STORY_COACH_CODEX_RESPONSE_MODEL=gpt-5.5
   STORY_COACH_CODEX_IMAGE_MODEL=gpt-image-2
   STORY_COACH_CODEX_IMAGE_SIZE=1536x1024
   STORY_COACH_CODEX_IMAGE_QUALITY=medium
   ```

3. Run verification:

   ```bash
   pnpm test
   pnpm typecheck
   pnpm build
   ```

4. Start the app:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Recommended Talk Track

- "The child draws first so the idea starts with them."
- "Then they describe it, because a child's drawing can be ambiguous."
- "The AI uses the drawing, the child's words, and the story so far."
- "After every generated picture, the child can accept it, add detail, or try again."
- "The six sections quietly teach story structure."
- "The final book is the payoff."

## Fast Demo Path

1. Click `Seed flow`.
2. Show the progress rail.
3. Show a confirmation screen and point out:
   - generated picture
   - child's drawing reference
   - accepted text summary
   - `Looks right`, `Add detail`, `Try again`
4. Move to a later section and show the stacked `Story so far` images.
5. Accept the final section.
6. Show the book reader and page navigation.
7. Click `Read aloud` if browser audio is available.

## Full Demo Path

1. Draw the main character.
2. Describe the character by voice or typed fallback.
3. Wait for image generation.
4. Accept or add detail.
5. Continue through:
   - What Makes Them Special
   - What They Want
   - What Gets In The Way
   - What They Try
   - How It Ends
6. Build the final book.

## If Live AI Fails

- Switch to stub providers in `.env.local`.
- Restart the dev server.
- Use `Seed flow` to continue the demo.
- The product story still works with stubbed images and story text.

