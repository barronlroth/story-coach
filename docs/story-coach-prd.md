# Story Coach PRD

Version: 0.1  
Date: 2026-07-04  
Status: MVP planning draft  
Build target: Next.js responsive web prototype  

## 1. Product Summary

Story Coach is a drawing-based children's book builder. The app guides a child through one story beat at a time, helping them turn drawings and spoken descriptions into a finished illustrated book.

The child does not chat with an assistant. They make a book.

The AI does not replace the child's imagination. It gives the child's imagination story grammar.

## 2. Core Product Idea

Children often have vivid characters, scenes, and ideas, but they struggle to organize those ideas into a coherent story. Story Coach gives them a gentle creative structure:

1. Who is the story about?
2. What makes them special?
3. What do they want?
4. What gets in the way?
5. What do they try?
6. How does it end?

For most beats, the child draws first and then describes what they drew. The drawing gives ownership and visual intent. The voice description gives the AI the truth of what the child meant. The app then generates a polished storybook image, asks whether it got the idea right, and moves to the next beat.

At the end, Story Coach assembles the accepted images and the child's descriptions into a finished six-page illustrated children's book.

## 3. Product Thesis

Story Coach should feel like a tablet drawing and book-making app, not a chatbot.

The app succeeds when a child feels:

- "I drew this."
- "I told the app what it meant."
- "The app understood me."
- "Now I have a real book."

The learning happens through the sequence of prompts and the shape of the final book. The UI should not lecture the child about plot, protagonist, conflict, motivation, or resolution.

## 4. MVP Goal

Build a polished Next.js web app prototype that demonstrates the complete Story Coach journey from blank story to finished illustrated book.

The MVP must support:

- Tablet-friendly drawing.
- Voice description after drawing.
- Local or on-device speech-to-text.
- AI image generation from drawing plus transcript.
- Accept, add detail, and regenerate loops.
- Six-beat story progression.
- Final illustrated book generation.
- A polished book reader with page-turn/pagination feel.

The winning demo moment is the finished book.

The learning value should be visible to adults through the structure of the journey, but invisible and natural to the child.

## 5. Target User

### Primary User

Children roughly ages 6-9.

This range is a good fit because children can usually:

- Draw rough visual ideas.
- Speak richer descriptions than they can type.
- Understand simple story questions.
- Enjoy seeing their work transformed into polished illustrations.

### Secondary User

Parents, teachers, hackathon judges, or adults watching the demo.

They should quickly understand:

- The child is making creative choices.
- The AI is scaffolding story structure.
- The finished book is based on the child's drawings and words.

## 6. Design Principles

### 6.1 Child Agency First

The child must feel like the author. The AI should interpret, polish, and structure, but not take over.

### 6.2 Drawing App, Not Chatbot

The main interaction surfaces are:

- Canvas.
- Voice button.
- Generated image preview.
- Book pages.

Avoid chat bubbles, assistant avatars, long response threads, and conversational back-and-forth as the main UI.

### 6.3 One Thing At A Time

Each screen should ask for one concrete action:

- Draw your main character.
- Tell me about your character.
- Draw the problem.
- Tell me about the problem.

Do not combine too many instructions into one screen.

### 6.4 Draw First, Describe Second

For visual beats, the default loop is:

1. Draw.
2. Submit drawing.
3. Show the submitted drawing as a pinned reference.
4. Ask the child to describe it by voice.
5. Generate image.
6. Confirm.

This preserves the app's identity as a drawing-based creative tool.

### 6.5 Voice Is Meaning

Child drawings may be ambiguous. Voice descriptions are required wherever the AI needs meaning.

The drawing gives style, intent, and emotional ownership. The transcript tells the AI what the drawing is supposed to mean.

### 6.6 Confirmation After Magic

The app should generate the polished image first, then ask "Did I get it right?"

Do not insert a dry structured confirmation step before generation in the MVP. That would make the flow feel procedural instead of magical.

### 6.7 Corrections Are Additive

The correction action should be "Add detail", not a form called "edit structured fields".

The child should be able to say:

- "Actually she has purple wings."
- "He is not scary."
- "The storm should be bigger."

The app uses that correction transcript plus the existing generated image and original drawing to regenerate.

### 6.8 Generic Beat Engine

The app should not hardcode six unrelated pages. It should use a generic beat configuration system so we can change modes later.

Each beat should define:

- Beat id.
- Child-facing prompt.
- Mode.
- Description prompt.
- Nudge bubbles.
- Whether image generation is needed.
- Whether drawing is required.
- Whether description is required.

### 6.9 Finished Book Is The Payoff

Every accepted beat should visibly contribute to the final artifact. The child should see a book forming over time.

## 7. Non-Goals

The MVP should not include:

- Native iPad app.
- Accounts.
- Payments.
- Multi-child classroom management.
- Teacher dashboard.
- Parent review workflow.
- Full child safety compliance workflow.
- Publishing to external stores.
- Collaboration.
- Full semantic story-state extraction.
- A parser agent.
- Adaptive prompt generation based on extracted story fields.
- Production-grade image consistency.
- Production-grade moderation pipeline.
- Production billing architecture.

## 8. Platform And Technology

### 8.1 Build Target

Build a responsive web app that feels good on iPad/tablet dimensions.

Use:

- Next.js App Router.
- TypeScript.
- React.
- Tailwind CSS.
- HTML canvas or a React drawing canvas library.
- API routes or server actions for AI calls.
- Local/on-device speech-to-text.
- Codex/OAuth/Hermes-style backend calls for LLM and image generation during prototype development.

Do not build a native iPad app.

### 8.2 Design Target

Primary viewport:

- Tablet landscape.
- Approximate design reference size: 1536 x 1024.

Secondary viewport:

- Desktop browser.
- Tablet portrait if feasible.

Mobile phones are not the primary target for the hackathon prototype.

## 9. UX Reference Assets

Concept and storyboard assets live in:

- `assets/concepts/story-coach-main-character-description-horizontal.png`
- `assets/concepts/storyboard/README.md`
- `assets/concepts/storyboard/*.png`

The storyboard contains 25 UX states covering:

1. Intro/start.
2. Drawing.
3. Describing.
4. Generating.
5. Confirming.
6. Correction.
7. Retry/error.
8. Finished book reader.
9. Light book text editing.

The implementation should use these as the visual source of truth for the hackathon prototype.

Target fidelity:

- Aim for roughly 90% visual match to the storyboard PNGs.
- Treat layout, spacing, tone, component shape, paper treatments, and state composition as implementation requirements.
- Do not treat the storyboard as loose inspiration unless a technical constraint forces a change.
- If two storyboard states vary slightly, choose the stronger pattern once and reuse it consistently.
- Favor consistency over copying every accidental difference between generated mockups.

The primary reference state for in-flow screens is the horizontal submitted drawing treatment:

- Child drawing appears as a wide landscape paper.
- The paper can be pinned, taped, or clipped into the scene.
- The drawing should not be converted into a portrait card just because the surrounding UI has vertical space.
- The app title does not need to appear on every in-flow screen after the intro.

## 10. Visual Direction

The app should feel:

- Warm.
- Child-friendly.
- Creative.
- Polished enough for a hackathon demo.
- Playful but not babyish.
- More like a tactile book-making workspace than a productivity tool.

Visual ingredients:

- Warm off-white paper background.
- Subtle paper texture.
- Wide drawing canvas.
- Pinned submitted drawings as small landscape paper references.
- Crayon, pencil, sticker, tape, or pin details.
- Large touch targets.
- Progress dots for story beats.
- Generated images shown as storybook cards.
- Final book with rich digital pagination.

### 10.1 Storyboard Fidelity Rules

The storyboard PNGs are not wireframes. They are the visual target.

Implementation should preserve:

- The playful paper-workspace feeling.
- The large tablet-friendly controls.
- The warm background and tactile materials.
- The horizontal pinned child drawing in description states.
- The compact beat progress treatment.
- The friendly recording panel states.
- The generated image confirmation layout.
- The finished book reader as the emotional payoff.

Implementation may adapt:

- Exact copy if a prompt changes.
- Exact generated character art.
- Exact image content for seed/demo data.
- Minor spacing required for responsive behavior.

Implementation should avoid:

- Turning the app into standard dashboard cards.
- Replacing tactile art moments with flat vector approximations.
- Introducing a different visual system halfway through the flow.

### 10.2 Bitmap Asset Rule

Illustration-like content must be generated or stored as bitmap images, preferably PNG.

Use ImageGen-created PNGs for:

- Intro artwork.
- Storybook page illustrations.
- Demo generated character images.
- Decorative drawing/paper/sticker/tape details when they are meant to look illustrated.
- Any art that appears inside the child's finished book.

Do not recreate those illustration assets as SVGs.

SVGs or icon libraries are acceptable for:

- Simple interface icons.
- Undo.
- Erase.
- Microphone.
- Page arrows.
- Save/download.
- Close.
- Small tool glyphs.

CSS is acceptable for:

- Paper panels.
- Buttons.
- Shadows.
- Borders.
- Progress dots.
- Layout primitives.

The rule of thumb:

- If the user experiences it as art, use a generated PNG.
- If the user experiences it as a control, use CSS and icons.

### 10.3 Design Token Baseline

The UI implementation should define a small shared visual vocabulary instead of restyling each screen individually.

Core tokens:

- `background.paper`: warm off-white page background.
- `surface.paper`: lighter paper panels and canvas areas.
- `ink.primary`: dark readable text.
- `accent.sun`: yellow primary action.
- `accent.sky`: blue secondary action or recording state.
- `accent.coral`: correction/error attention.
- `accent.leaf`: success/accepted state.
- `shadow.paper`: soft tactile paper shadow.
- `radius.paper`: modest rounded paper corners.
- `border.paper`: subtle warm border.

Reusable treatments:

- Pinned landscape drawing paper.
- Main workspace band.
- Voice prompt panel.
- Confirmation image stage.
- Book page spread.
- Loading/generation state.
- Gentle retry state.

This keeps the implementation close to the storyboard even if individual PNGs are not perfectly identical.

Color direction:

- Warm off-white.
- Sunny yellow.
- Sky blue.
- Coral.
- Leaf green.
- Dark readable ink.

Avoid:

- Dark theme.
- Adult dashboard UI.
- Marketing hero layout after the intro.
- Dense forms.
- Chatbot layout.
- Decorative gradient orbs.
- One-note purple or blue palette.
- Overly rounded card-heavy SaaS styling.

## 11. Story Engine

### 11.1 Beat List

The default MVP story has six beats:

1. Main Character.
2. What Makes Them Special.
3. What They Want.
4. What Gets In The Way.
5. What They Try.
6. How It Ends.

### 11.2 Why These Beats

These beats teach basic story grammar without using schoolish language:

- Character.
- Distinctive trait.
- Goal.
- Obstacle.
- Action.
- Resolution/change.

The fifth beat is intentionally "What do they try?" rather than "What happens next?" The latter invites randomness. "What do they try?" teaches that the character makes a choice in response to the problem.

### 11.3 Default Beat Modes

| Beat | Child-facing prompt | Mode | Notes |
| --- | --- | --- | --- |
| 1. Main Character | Draw your main character | Draw then describe | Required drawing and voice |
| 2. Special Thing | Draw what makes them special | Draw then describe | Trait, power, habit, secret, flaw, favorite thing |
| 3. Want | What does your character want most? | Describe only for MVP | Voice-first because wants may be invisible |
| 4. Problem | Draw what gets in the way | Draw then describe | Obstacle should relate to the want |
| 5. Try | Draw what your character tries | Draw then describe | Character takes action |
| 6. Ending | Draw the ending | Draw then describe | Resolution and emotional change |

The engine must allow future modes:

- `draw`
- `describe`
- `drawThenDescribe`
- `describeThenDraw`

The MVP only needs `describe` and `drawThenDescribe`.

## 12. Core Flow

### 12.1 Draw Then Describe Flow

For beats that require drawing and description:

1. Show drawing screen.
2. Child draws on wide horizontal canvas.
3. Child taps "Done drawing".
4. App stores drawing image.
5. App shows the drawing as a small pinned landscape paper reference.
6. App asks the child to describe the drawing.
7. Child records voice.
8. Speech-to-text produces transcript.
9. App sends drawing, transcript, beat prompt, corrections, and previous accepted image references to image generation.
10. App shows generated image.
11. Child chooses:
    - Looks right.
    - Add detail.
    - Try again.
12. On Looks right, beat is accepted and app advances.

### 12.2 Describe Only Flow

For beats that require description only:

1. Show voice prompt.
2. Show previous accepted images as small continuity references.
3. Child records voice.
4. Speech-to-text produces transcript.
5. App generates an image or story card if needed.
6. Child confirms.
7. App advances.

For the MVP, Beat 3 can be describe-only and still generate a goal image/card.

### 12.3 Confirmation Flow

After image generation:

Primary prompt:

- "Did I get it right?"

Actions:

- "Looks right" accepts the image and beat.
- "Add detail" opens correction voice flow.
- "Try again" regenerates from the same inputs.

The confirmation surface should show:

- Generated image.
- Original drawing if available.
- Short child-friendly line summarizing what the app thinks it made.
- Large buttons.

This summary line can be generated from the raw transcript, but it should not require a structured parser.

### 12.4 Add Detail Flow

When the child taps "Add detail":

1. Show current generated image.
2. Show original drawing if available.
3. Ask "What should I change?"
4. Child records correction.
5. Speech-to-text produces correction transcript.
6. App appends correction transcript to `correctionTranscripts`.
7. Image generation receives:
   - Current generated image.
   - Original drawing if useful.
   - Original transcript.
   - Correction transcript.
   - Beat prompt.
   - Previous accepted images for continuity.
8. App shows updated generated image.
9. Child confirms again.

### 12.5 Regenerate Flow

When the child taps "Try again":

1. Keep same drawing.
2. Keep same transcript.
3. Keep same correction transcripts.
4. Ask image generation for another version.
5. Show new image.
6. Return to confirmation.

This should feel like a pure regeneration, not a correction.

## 13. MVP State Model

### 13.1 Major Decision

Do not build a separate parser agent initially.

Do not build a semantic story-state extraction layer initially.

Treat raw child inputs as the source of truth:

- Drawings.
- Transcripts.
- Correction transcripts.
- Accepted generated images.

The MVP state should be simple and artifact-based.

### 13.2 Simple Beat State

```ts
export type BeatMode =
  | "draw"
  | "describe"
  | "drawThenDescribe"
  | "describeThenDraw";

export type StoryBeatState = {
  beatId: string;
  prompt: string;
  mode: BeatMode;
  drawingImageUrl?: string;
  transcript?: string;
  generatedImageUrl?: string;
  correctionTranscripts: string[];
  accepted: boolean;
};
```

### 13.3 Story Session State

```ts
export type StorySessionState = {
  sessionId: string;
  currentBeatIndex: number;
  beats: StoryBeatState[];
  finalBook?: FinalBook;
  createdAt: string;
  updatedAt: string;
};

export type FinalBook = {
  title: string;
  pages: FinalBookPage[];
  narrationText: string;
};

export type FinalBookPage = {
  pageNumber: number;
  beatId: string;
  imageUrl: string;
  text: string;
};
```

### 13.4 Why No Parser Yet

The previous idea included a transcript parser that would extract structured details such as character name, traits, wants, and obstacles.

For the MVP, this adds complexity before we know it is necessary.

The simplified approach is:

- Send the raw transcript to image generation.
- Send previous accepted images for continuity.
- Send all raw beat context to final story writing.
- Let the final writer infer the story from the full bundle.

If coherence breaks down, the first upgrade should be an editable beat caption/summary, not a full parser agent.

## 14. AI Responsibilities

### 14.1 Speech-To-Text

Speech-to-text should not depend on Codex/OAuth for the MVP.

Current technical conclusion:

- There is no verified, documented Codex OAuth transcription endpoint for arbitrary app audio.
- OpenAI's documented speech-to-text path is the Audio transcription API or realtime audio APIs.
- Those documented audio APIs are separate from the Hermes-style Codex Responses backend pattern.
- Codex App Server is documented as a Codex client/server integration for auth, conversation history, approvals, and streamed agent events, not as a general app audio transcription API.

Therefore, the MVP should treat transcription as a separate replaceable service boundary.

Use local or on-device transcription:

- Whisper.
- Parakeet.
- Another installed local transcription runtime.

Input:

- Browser-recorded audio blob.

Output:

- Plain transcript string.

The transcript can be messy. The app should tolerate rambling child speech.

Implementation boundary:

- Client records audio with `MediaRecorder`.
- Client posts audio to `POST /api/transcribe`.
- Server route invokes the local transcription runtime.
- Server returns the raw transcript.
- No Codex access token is needed for this route.
- The route should be designed so it can later swap to an API-backed transcription service if needed.

Do not block the whole prototype on speech:

- Ship a typed fallback.
- Keep the same downstream state shape whether transcript came from voice or typing.
- Store the transcript string as the durable artifact.

### 14.2 Image Generation

Image generation receives raw context and produces one polished storybook image for the current beat.

Inputs:

- Current beat prompt.
- Current drawing image, if any.
- Current transcript, if any.
- Correction transcripts for the current beat.
- Previous accepted generated images.
- Optional style instruction.
- Optional continuity instruction.

Output:

- Generated image URL or local asset path.

The image generation prompt should emphasize:

- Use the child's drawing as visual intent.
- Obey the child's spoken description.
- Keep the recurring character consistent with previous accepted images.
- Create a polished children's book illustration.
- Do not invent major story facts beyond the current beat.

### 14.3 Final Story Writer

The final story writer runs after all six beats are accepted.

Inputs:

- All beat prompts.
- All transcripts.
- All correction transcripts.
- All accepted generated images.

Outputs:

- Book title.
- Six page texts.
- Optional read-aloud narration.

The final writer should:

- Preserve the child's ideas.
- Create coherent page text.
- Keep language age-appropriate.
- Make the story feel complete.
- Use the accepted images as page anchors.
- Avoid over-polishing the child's voice into generic prose.

### 14.4 No Initial Semantic Parser

The MVP should not separately parse:

- Character name.
- Character species.
- Trait list.
- Goal.
- Obstacle.
- Attempt.
- Resolution.

These may be inferred by image generation and final story writing, but not stored as required app state.

### 14.5 Future Lightweight Upgrade

If needed, add an editable beat caption:

```ts
summary?: string;
```

The app could generate a simple sentence such as:

- "Jesse is a brave green dragon."
- "Jesse wants to find the moon kite."
- "A windy storm gets in his way."

The child or adult could edit this caption. This is preferable to a hidden complex parser because it preserves transparency and control.

## 15. Codex/OAuth Technical Direction

### 15.1 Prototype Cost Goal

The prototype should avoid unnecessary OpenAI API billing where possible.

The intended direction is to use a Hermes-style Codex OAuth path for:

- Normal LLM/story writing.
- Image generation.

Speech-to-text stays local and does not use Codex for MVP.

### 15.2 Hermes Reference Pattern

Hermes proves a useful pattern:

- It defines an `openai-codex` provider.
- It uses ChatGPT/Codex OAuth.
- It does not require `OPENAI_API_KEY` for that provider.
- It calls `https://chatgpt.com/backend-api/codex/responses`.
- It uses a Responses `image_generation` tool for images.
- It keeps Codex tokens server-side.

For Story Coach, this means we likely do not need Codex App Server for normal LLM and image calls.

### 15.3 Important Boundary

Codex OAuth calls must remain server-side.

Never expose:

- Access tokens.
- Refresh tokens.
- Codex auth headers.
- Backend base URLs with bearer credentials.

The browser should only call our own Next.js routes.

### 15.4 Codex App Server

Codex App Server remains useful as a possible integration path for driving Codex turns, but it is not the core MVP route for image/story calls.

For MVP:

- Prefer direct server-side Codex Responses backend calls following the Hermes pattern.
- Use Codex App Server only if direct backend calls become too brittle or unsupported in the local prototype environment.

Codex App Server should not be described as the thing that "does all AI calls" unless implementation proves that route works for this app shape.

The more precise MVP architecture is:

- Codex OAuth provides the authenticated subscription-backed credential.
- A server-only Codex Responses client performs story and image calls.
- Local speech tooling performs transcription.
- Next.js routes hide all of this behind normal app endpoints.

### 15.5 Codex-Backed Responsibilities

Codex OAuth should power exactly these MVP capabilities:

1. Beat image generation.
2. Correction image generation.
3. Regeneration without added correction.
4. Final book title and page text.
5. Optional read-aloud narration text.
6. Optional demo seed/story text generation.

Codex OAuth should not power these MVP capabilities:

1. Browser authentication for the child.
2. Speech transcription.
3. Drawing storage.
4. Local session persistence.
5. Client-side state management.
6. UI rendering.

This separation matters because it keeps the prototype honest:

- Codex is used where large multimodal generation is expensive.
- Local tooling is used where it is already available.
- The app remains portable if the Codex backend path changes.

### 15.6 Server-Only Codex Client

Create one isolated server-side client layer:

```txt
lib/ai/codexAuth.ts
lib/ai/codexResponsesClient.ts
lib/ai/codexImageGeneration.ts
lib/ai/codexStoryWriter.ts
```

Responsibilities:

- Resolve the current local Codex OAuth access token.
- Refresh or re-authenticate if the token expires.
- Configure the Codex backend base URL.
- Execute text Responses calls.
- Execute image-generation Responses calls.
- Normalize provider output into app-level return types.
- Keep provider-specific payloads out of React components.

The browser must never see:

- Codex access tokens.
- Codex refresh tokens.
- Raw Codex auth files.
- Provider base URLs paired with credentials.
- Raw provider response payloads unless sanitized.

The browser should only call:

```txt
POST /api/generate-image
POST /api/finalize-book
```

### 15.7 Auth And Token Handling

Hermes is the implementation reference, but Story Coach should not blindly copy token files into the repo.

Expected hackathon approach:

- Use the developer's existing local Codex OAuth session.
- Resolve credentials at runtime on the server.
- Store no credentials in project source.
- Store no credentials in `public/`.
- Do not send credentials to the browser.
- Do not commit auth snapshots.

Implementation options, in preference order:

1. Reuse a local Codex/Hermes-compatible auth helper if available.
2. Add a tiny server-only adapter that reads from an explicitly configured local auth path.
3. Require a manual `CODEX_ACCESS_TOKEN` environment variable only as a temporary development fallback.

The PRD intentionally does not require a production auth design. For a real product, this would need a supported billing and auth model rather than relying on a local developer subscription.

### 15.8 Text Generation Through Codex OAuth

Text generation is used for the final book writer and any optional internal prompt helper.

Request shape:

- Server route receives normalized story state.
- Prompt builder converts beats into plain text plus image references where useful.
- Codex Responses client sends a text-generation request.
- Response is parsed into strict JSON for app use.

Expected output for final book:

```ts
type FinalizeBookResponse = {
  title: string;
  pages: {
    pageNumber: number;
    beatId: string;
    text: string;
  }[];
  narrationText: string;
};
```

Prompt requirements:

- Preserve child transcripts.
- Keep language short and read-aloud friendly.
- Produce exactly six page texts.
- Do not introduce major new story facts unless needed for coherence.
- Return valid JSON only.

Recommended implementation:

- Use the Codex Responses endpoint from a server-only module.
- Keep streaming optional; non-streaming is simpler for MVP.
- Add retry and JSON repair only if needed.
- Keep a stub writer available for demos.

### 15.9 Image Generation Through Codex OAuth

Image generation is the main subscription-backed value of the Codex path.

Request shape:

- Server route receives current beat state.
- Server loads drawing image bytes if present.
- Server loads previous accepted generated images if present.
- Server loads current generated image for correction flows.
- Prompt builder creates a clear image instruction.
- Codex Responses client calls the image generation tool.
- Server saves the returned PNG to local storage.
- Server returns an app image URL.

Expected provider-level idea:

```txt
POST https://chatgpt.com/backend-api/codex/responses
Authorization: Bearer <server-side Codex OAuth access token>

tools:
  - type: image_generation
    model: gpt-image-2

input:
  - text instructions
  - current child drawing as input_image, when available
  - previous accepted images as input_image references, when available
  - current generated image as input_image for correction flows
```

The exact payload should be hidden behind `codexImageGeneration.ts`.

Image generation must support three intents:

- `first_generation`: use current drawing/transcript plus previous accepted images.
- `correction`: use current generated image plus correction transcript, and include original drawing when helpful.
- `regenerate`: use same source material but request a fresh variation without adding new facts.

Returned images should be:

- Saved as PNG.
- Associated with the beat.
- Usable as future reference images.
- Displayed in the confirmation screen.
- Included in final book generation.

### 15.10 Speech Boundary

Codex OAuth is not part of the MVP transcription path.

`POST /api/transcribe` should be implemented as:

```txt
audio blob
  -> local Whisper or Parakeet
  -> raw transcript
```

If a future Codex-backed audio route becomes verified and stable, the implementation can swap it behind the same route contract. Until then, the PRD should not assume Codex can transcribe speech.

This is intentionally worded as an implementation boundary, not a philosophical product rule. The product only cares that the child can speak naturally and the app receives a transcript.

### 15.11 Documentation Checked

Current docs checked for this decision:

- OpenAI Speech to Text guide: `https://developers.openai.com/api/docs/guides/speech-to-text`
- OpenAI Audio transcription API reference: `https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create/`
- Codex App Server docs: `https://developers.openai.com/codex/app-server`
- Codex glossary entry for app-server: `https://developers.openai.com/codex/glossary`

These docs support the current boundary:

- Speech transcription is documented as an Audio API capability.
- Codex App Server is documented for embedding Codex threads, auth, history, approvals, and streamed agent events.
- No documented Codex OAuth speech transcription route was found.

## 16. Proposed Technical Architecture

### 16.1 High-Level Architecture

```txt
Browser UI
  -> Canvas drawing
  -> Voice recording
  -> Local/session state

Next.js server routes
  -> Save drawing/audio artifacts
  -> Run local transcription
  -> Call Codex-backed image generation
  -> Call Codex-backed final story writer
  -> Hide all Codex OAuth details from browser code

Local persistence
  -> Browser storage for MVP
  -> Optional file/session store for demo reliability
```

### 16.2 Runtime Components

Client:

- React components.
- Canvas drawing.
- Voice recording via `MediaRecorder`.
- Beat flow state machine.
- Book reader UI.

Server:

- Upload handling.
- Local transcription wrapper.
- Codex OAuth credential resolver.
- Codex Responses client wrapper.
- Image generation wrapper.
- Final story writer wrapper.
- File persistence for generated assets if needed.

Storage:

- MVP can start with browser `localStorage` or `IndexedDB`.
- Server can store generated images under a local `public/generated` or `.storycoach` directory.
- Keep storage simple for hackathon.

### 16.3 Suggested Routes

```txt
POST /api/transcribe
POST /api/generate-image
POST /api/regenerate-image
POST /api/finalize-book
POST /api/save-session
GET  /api/session/:sessionId
```

For MVP, `/api/regenerate-image` can be the same implementation as `/api/generate-image` with a different intent flag.

### 16.4 Route Contracts

#### POST /api/transcribe

Input:

```ts
type TranscribeRequest = {
  audioFile: File;
  beatId: string;
};
```

Output:

```ts
type TranscribeResponse = {
  transcript: string;
};
```

Implementation:

- Use local Whisper or Parakeet.
- Keep audio short.
- Return raw transcript.
- Do not call Codex OAuth from this route for MVP.
- Keep the route contract stable so the provider can change later.

#### POST /api/generate-image

Input:

```ts
type GenerateImageRequest = {
  beat: StoryBeatState;
  previousAcceptedImages: {
    beatId: string;
    imageUrl: string;
  }[];
  intent: "first_generation" | "correction" | "regenerate";
};
```

Output:

```ts
type GenerateImageResponse = {
  imageUrl: string;
};
```

Implementation:

- Build a prompt from raw artifacts.
- Attach current drawing image if present.
- Attach previous accepted images if available.
- Attach current generated image for correction flows.
- Use Codex-backed image generation.
- Save returned image as a PNG.
- Return only the app-owned image URL to the browser.
- Keep Codex provider payloads server-side.

#### POST /api/finalize-book

Input:

```ts
type FinalizeBookRequest = {
  beats: StoryBeatState[];
};
```

Output:

```ts
type FinalizeBookResponse = {
  title: string;
  pages: FinalBookPage[];
  narrationText: string;
};
```

Implementation:

- Send all prompts, transcripts, correction transcripts, and accepted images.
- Ask the writer to produce six page texts and a title.
- Keep text short and child-friendly.
- Use Codex-backed text generation.
- Parse and validate JSON before returning it to the client.
- Keep a local stub response available for demo fallback.

## 17. Prompting Contracts

### 17.1 Image Prompt Builder

The image prompt builder should include:

- App role: "You are creating a polished children's book illustration from a child's drawing and words."
- Current beat.
- Child prompt.
- Child transcript.
- Correction transcript list.
- Continuity instruction.
- Style instruction.
- Safety instruction.

Example structure:

```txt
Create a polished children's book illustration for the current Story Coach beat.

Current beat:
Main Character

Prompt shown to child:
Draw your main character.

Child transcript:
"His name is Jesse Marsh. He is a brave green dragon who loves castles."

Correction transcripts:
- "Make his wings purple."

Use the child's drawing as visual intent, but obey the child's words.
Keep the main character consistent with previous accepted images.
Do not invent a full story beyond this beat.
Style: warm, playful, polished children's book illustration.
```

### 17.2 Correction Prompt Builder

Correction prompts should include:

- Original drawing.
- Current generated image.
- Original transcript.
- Correction transcript.
- Instruction to change only what the child corrected when possible.

Example:

```txt
Update the current generated illustration using the child's correction.
Preserve the character and composition unless the correction says otherwise.

Original transcript:
"His name is Jesse Marsh. He is a brave green dragon."

Correction:
"He has purple wings, not blue wings."
```

### 17.3 Final Story Writer Prompt

The final story writer should receive all beat artifacts in order.

Example structure:

```txt
You are assembling a six-page children's picture book from a child's Story Coach session.

Rules:
- Preserve the child's ideas.
- Use simple, vivid language for ages 6-9.
- Make each page 1-3 short sentences.
- Make the story coherent.
- Do not add major new characters or plot turns unless needed for clarity.
- The ending must answer what the character wanted.

Beat 1: Main Character
Prompt: Draw your main character.
Transcript: ...
Corrections: ...
Accepted image: ...

...

Return JSON:
{
  "title": "...",
  "pages": [
    { "pageNumber": 1, "beatId": "...", "text": "..." }
  ],
  "narrationText": "..."
}
```

## 18. Detailed Beat Requirements

### 18.1 Beat 1: Main Character

Goal:

- Establish the recurring character.

Step 1A:

- Prompt: "Draw your main character"
- Mode: drawing canvas.
- Canvas: wide landscape.
- Action: "Done drawing"

Step 1B:

- Prompt: "Tell me about your character"
- Drawing is pinned as a small horizontal paper reference.
- Primary nudge: "What's their name?"
- Secondary nudges:
  - "What are they?"
  - "What should I remember?"
- Action: "Start talking"
- Action: "I'm done"

Step 1C:

- Loading: "Making your character..."

Step 1D:

- Confirmation: "Did I get your character right?"
- Actions:
  - "Looks right"
  - "Add detail"
  - "Try again"

### 18.2 Beat 2: What Makes Them Special

Goal:

- Add a trait, ability, habit, favorite thing, flaw, secret, or detail that makes the character story-worthy.

Step 2A:

- Prompt: "Draw what makes [character] special"
- Helper: "A power, a favorite thing, a secret, or a funny detail"

Step 2B:

- Prompt: "Tell me what makes it special"
- Primary nudge: "Is it a power?"
- Secondary nudges:
  - "How does it help?"
  - "Can it cause trouble?"

Step 2C:

- Confirmation: "Did I get the special part right?"

### 18.3 Beat 3: What They Want

Goal:

- Establish a clear story goal.

MVP mode:

- Describe only.

Step 3A:

- Prompt: "What does [character] want most?"
- Primary nudge: "What are they hoping for?"
- Secondary nudges:
  - "Why does it matter?"
  - "How would they feel?"

Step 3B:

- Confirmation: "Is this what [character] wants?"
- Generated output can be a goal image/card.

### 18.4 Beat 4: What Gets In The Way

Goal:

- Establish an obstacle related to the goal.

Step 4A:

- Prompt: "Draw what gets in [character]'s way"
- Helper: "A person, a place, a fear, or a tricky problem"

Step 4B:

- Prompt: "Tell me about the problem"
- Primary nudge: "What is stopping [character]?"
- Secondary nudges:
  - "Why is it hard?"
  - "Is it scary or tricky?"

Step 4C:

- Confirmation: "Did I get the problem right?"

### 18.5 Beat 5: What They Try

Goal:

- Make the character take action.

Step 5A:

- Prompt: "Draw what [character] tries"
- Helper: "What do they do to help?"

Step 5B:

- Prompt: "Tell me what [character] does"
- Primary nudge: "What do they try?"
- Secondary nudges:
  - "Does it work?"
  - "What happens next?"

Step 5C:

- Confirmation: "Did I get what [character] tried?"

### 18.6 Beat 6: How It Ends

Goal:

- Resolve the want/problem and show what changed.

Step 6A:

- Prompt: "Draw the ending"
- Helper: "Show what changed"

Step 6B:

- Prompt: "Tell me how it ends"
- Primary nudge: "Did [character] get what they wanted?"
- Secondary nudges:
  - "How do they feel?"
  - "What changed?"

Step 6C:

- Confirmation: "Did I get the ending right?"

## 19. Book Reader Requirements

### 19.1 Building Book State

After all beats are accepted:

- Show "Making your book..."
- Show accepted page cards assembling into a book.
- Keep it magical but not too slow.

### 19.2 Finished Book Reader

The final reader should show:

- Title.
- Open book spread.
- Page image.
- Page text.
- Page indicator.
- Page-turn affordance.
- "Read to me" button.
- Back control.

The reader should feel closer to a premium digital book than a slideshow.

### 19.3 Pagination

MVP pagination can be implemented with:

- Page spread component.
- CSS page curl affordance.
- Prev/next tap zones.
- Page dots or thumbnails.

Nice-to-have:

- Animated page flip.
- Drag gesture.
- Sound effect.

Do not over-invest in a complex physics page-turn library unless the core flow is already solid.

### 19.4 Edit Words

Optional MVP state:

- Allow light editing of page text after final generation.
- Keep it simple.
- No dense formatting toolbar.

Controls:

- "Edit words"
- "Save"
- "Cancel"

## 20. Persistence Requirements

### 20.1 MVP Persistence

For hackathon:

- Store session state in browser storage.
- Store generated assets in server/public or an app-controlled local path.
- Recover from accidental refresh if possible.

### 20.2 Session Recovery

If the user reloads:

- Restore current beat.
- Restore drawings, transcripts, generated images, and accepted states.
- Restore final book if generated.

### 20.3 Export

Optional:

- Export as images.
- Export as PDF.
- Save book locally.

Not required for the first demo unless time allows.

## 21. Error And Loading States

### 21.1 Transcription Failure

Message:

- "Oops, I didn't catch that."

Actions:

- "Try again"
- "Type instead"

### 21.2 Image Generation Failure

Message:

- "Oops, that didn't work."
- "Let's try that part again."

Actions:

- "Try again"
- "Go back"

### 21.3 Final Book Failure

Message:

- "The book got stuck."
- "Your pages are safe."

Actions:

- "Try again"
- "Review pages"

### 21.4 Offline Or Backend Failure

The app should not lose child work.

At minimum:

- Keep local drawing.
- Keep transcript.
- Allow retry.

## 22. Safety And Child Experience

### 22.1 Child-Safe UX

The app should avoid:

- Adult error messages.
- Scary warnings.
- Public sharing.
- Open-ended chatbot behavior.
- Unbounded AI suggestions.

### 22.2 Content Safety

MVP should include basic safeguards:

- Keep prompts age-appropriate.
- Ask image generation for children's book style.
- Avoid realistic violence, gore, sexual content, or frightening detail.
- If child input is unsafe, redirect gently.

Example:

- "Let's make this part safe for a picture book. Can you draw a silly problem instead?"

### 22.3 Privacy

Because the app processes children's speech and drawings:

- Do not upload to third parties beyond required prototype services.
- Do not expose raw audio or transcripts publicly.
- Keep all tokens server-side.
- Avoid storing more than necessary.

For hackathon demo, use local/on-device transcription where possible.

## 23. Accessibility

MVP should support:

- Large buttons.
- High contrast text.
- Simple readable labels.
- Keyboard access for core actions where practical.
- Typed fallback for voice.
- Undo/erase for drawing.

The child should not be blocked if microphone permission fails.

## 24. Component Plan

Suggested component structure:

```txt
app/
  page.tsx
  layout.tsx
  api/
    transcribe/route.ts
    generate-image/route.ts
    finalize-book/route.ts

components/
  StoryCoachApp.tsx
  BeatProgress.tsx
  DrawingCanvas.tsx
  DrawingTools.tsx
  PinnedDrawing.tsx
  VoiceRecorder.tsx
  NudgeBubbles.tsx
  GeneratingState.tsx
  ConfirmationPanel.tsx
  AddDetailPanel.tsx
  BookBuilderState.tsx
  BookReader.tsx
  PageSpread.tsx
  RetryState.tsx

lib/
  beats.ts
  story-state.ts
  storage.ts
  design-tokens.ts
  storyboard-assets.ts
  prompts/
    imagePrompt.ts
    finalBookPrompt.ts
  ai/
    codexAuth.ts
    codexResponsesClient.ts
    codexImageGeneration.ts
    codexStoryWriter.ts
    imageGenerationStub.ts
    storyWriterStub.ts
  speech/
    transcribe.ts
```

Asset folders:

```txt
assets/
  concepts/
    storyboard/
  generated/
    ui/
    demo/
public/
  generated/
    sessions/
```

Rules:

- `assets/concepts/storyboard` remains the design reference.
- `assets/generated/ui` stores ImageGen-created reusable UI art.
- `assets/generated/demo` stores ImageGen-created demo/story seed art.
- `public/generated/sessions` stores runtime-generated images for the local prototype.
- Do not implement illustrated assets as SVG components.
- Keep interface icons separate from illustration assets.

## 25. Beat Configuration

```ts
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
    nudges: ["What is stopping them?", "Why is it hard?", "Is it scary or tricky?"],
    requiresImage: true,
  },
  {
    beatId: "try",
    title: "What They Try",
    mode: "drawThenDescribe",
    drawPrompt: "Draw what they try",
    describePrompt: "Tell me what they do",
    nudges: ["What do they try?", "Does it work?", "What happens next?"],
    requiresImage: true,
  },
  {
    beatId: "ending",
    title: "How It Ends",
    mode: "drawThenDescribe",
    drawPrompt: "Draw the ending",
    describePrompt: "Tell me how it ends",
    nudges: ["Did they get what they wanted?", "How do they feel?", "What changed?"],
    requiresImage: true,
  },
];
```

## 26. Build Phases

### Phase 1: Static Shell And Near-Pixel Storyboard UI

Deliver:

- Next.js app.
- Tablet layout.
- Shared design tokens matching the storyboard.
- PNG asset loading conventions.
- Intro screen.
- Beat progress.
- Drawing screen shell.
- Voice screen shell.
- Confirmation screen shell.
- Book reader shell.

No real AI required yet.

Quality bar:

- Static screens should look roughly 90% like the storyboard states.
- Illustrated/sticker/story assets should be PNGs, not recreated SVGs.
- Any visual differences between storyboard screens should be resolved into one consistent system.

### Phase 2: Drawing And Local State

Deliver:

- Functional canvas.
- Pencil, eraser, colors, undo.
- Save drawing as image.
- Pinned drawing reference.
- Beat navigation.
- Local session persistence.

### Phase 3: Voice Capture And Transcription

Deliver:

- Push-to-talk recording.
- Active recording state.
- Local/on-device transcription.
- Typed fallback.
- Transcript stored per beat.

### Phase 4: Image Generation

Deliver:

- Server route for image generation.
- Prompt builder.
- Server-only Codex OAuth adapter.
- Codex Responses image-generation wrapper.
- Current drawing plus transcript input.
- Previous accepted images for continuity.
- Generated image display.
- Accept/add detail/regenerate.

### Phase 5: Final Book

Deliver:

- Codex-backed final story writer.
- Title and six page texts.
- Book reader.
- Page navigation.
- Read-aloud narration text.

### Phase 6: Polish And Demo

Deliver:

- Loading states.
- Error states.
- Responsive tablet checks.
- Demo seed flow if backend fails.
- Final visual polish.

## 27. Parallel Execution Plan

The MVP can be built by multiple parallel workstreams as long as the core state contract and beat configuration are agreed first. The goal is to avoid parallel agents editing the same high-churn files while still moving UI, AI, speech, and book-reader work forward at the same time.

### 27.1 First Synchronization Gate

Before parallel implementation starts, complete these shared foundations:

1. Scaffold the Next.js app.
2. Add Tailwind and base layout.
3. Define `StoryBeatState`, `StorySessionState`, and `BeatDefinition`.
4. Define `STORY_BEATS`.
5. Add placeholder API route files with request/response types.
6. Add a simple shared asset path convention for drawings and generated images.

After this gate, most work can proceed independently.

### 27.2 Parallel Workstreams

| Workstream | Can Run In Parallel? | Owns | Depends On | Avoid Editing |
| --- | --- | --- | --- | --- |
| App shell and beat router | Yes, after foundation | Main app container, beat progression, layout slots | State model, beat config | AI route internals, transcription internals |
| Drawing canvas | Yes | Canvas component, drawing tools, image export | Basic app shell | Book reader, AI client |
| Voice recorder | Yes | Recording UI, microphone permissions, audio blob capture | Basic app shell | Local transcription implementation details |
| Local transcription | Yes | Server/local wrapper for Whisper or Parakeet, `/api/transcribe` | Audio blob contract | Voice recorder UI beyond request contract |
| Image generation wrapper | Yes | `/api/generate-image`, prompt builder, `codexAuth`, `codexResponsesClient`, `codexImageGeneration` | Beat state contract, asset path convention | Canvas UI, voice UI |
| Confirmation and correction loop | Yes, after app shell | Accept/add detail/regenerate UI and state transitions | Beat state contract, image route stub | Image backend implementation |
| Final book writer | Yes | `/api/finalize-book`, final story prompt, final book JSON | Beat state contract | Book reader animation internals |
| Book reader | Yes | Page spread UI, pagination, read-aloud controls | Final book JSON shape | AI writer internals |
| Visual polish/design system | Yes | Tailwind tokens, reusable paper/card/button styles, storyboard fidelity checks, PNG art assets | Initial shell | Low-level API clients |
| Demo fallback data | Yes | Seed story/session, stub images, ImageGen-created PNG demo assets, offline demo mode | State model | Live AI route behavior except explicit fallback branch |

### 27.3 Recommended Parallel Agent Split

For a fast hackathon build, split work like this:

#### Agent A: Shell And State

Owns:

- `app/page.tsx`
- `components/StoryCoachApp.tsx`
- `components/BeatProgress.tsx`
- `lib/beats.ts`
- `lib/story-state.ts`
- `lib/storage.ts`

Responsibilities:

- Create the app state machine.
- Move through beat steps.
- Persist progress.
- Wire placeholder screens.

This agent should establish the contracts everyone else uses.

#### Agent B: Drawing Surface

Owns:

- `components/DrawingCanvas.tsx`
- `components/DrawingTools.tsx`
- `components/PinnedDrawing.tsx`

Responsibilities:

- Implement wide landscape canvas.
- Support pencil, eraser, colors, undo.
- Export drawing to image.
- Render submitted drawing as pinned horizontal paper.

This work can use local placeholder callbacks until Agent A wires real state.

#### Agent C: Voice And Transcription

Owns:

- `components/VoiceRecorder.tsx`
- `components/NudgeBubbles.tsx`
- `app/api/transcribe/route.ts`
- `lib/speech/transcribe.ts`

Responsibilities:

- Implement push-to-talk.
- Store audio blob.
- Add typed fallback.
- Integrate local Whisper or Parakeet.
- Return raw transcript.

This work should not depend on image generation.

#### Agent D: Image Generation And Corrections

Owns:

- `app/api/generate-image/route.ts`
- `lib/prompts/imagePrompt.ts`
- `lib/ai/codexAuth.ts`
- `lib/ai/codexResponsesClient.ts`
- `lib/ai/codexImageGeneration.ts`
- `lib/ai/imageGenerationStub.ts`
- `components/ConfirmationPanel.tsx`
- `components/AddDetailPanel.tsx`

Responsibilities:

- Build image prompts from raw beat state.
- Pass drawing, transcript, corrections, and previous accepted images.
- Support first generation, regeneration, and correction.
- Keep Codex/OAuth details server-side.
- Save returned image assets as PNGs.

This agent can start with a stub image response, then swap in the real backend.

#### Agent E: Final Book

Owns:

- `app/api/finalize-book/route.ts`
- `lib/prompts/finalBookPrompt.ts`
- `lib/ai/codexStoryWriter.ts`
- `lib/ai/storyWriterStub.ts`
- `components/BookBuilderState.tsx`
- `components/BookReader.tsx`
- `components/PageSpread.tsx`

Responsibilities:

- Build final story prompt from all beat artifacts.
- Produce title, page text, and narration.
- Render finished book reader.
- Add page navigation and read-aloud controls.

This agent can use seed `FinalBook` JSON until the writer route is live.

#### Agent F: Polish, QA, And Demo Reliability

Owns:

- Shared visual components.
- Responsive fixes.
- Loading and retry states.
- Demo seed data.
- Manual QA checklist.

Responsibilities:

- Match the storyboard style at roughly 90% fidelity.
- Replace illustrated SVG-like placeholders with ImageGen PNG assets.
- Check tablet landscape layout.
- Make text fit.
- Add fallback demo path.
- Verify the full six-beat journey.

This agent should avoid rewiring core state unless a bug requires it.

### 27.4 Work That Should Not Be Parallelized Too Early

Some tasks are tightly coupled and should be done serially or behind stable contracts:

- Changing the `StoryBeatState` shape after other agents start.
- Changing `STORY_BEATS` ids after storage and routes depend on them.
- Reworking routing/navigation while UI agents are integrating screens.
- Replacing the image generation contract while correction UI is being built.
- Replacing the final book JSON shape while the reader is being built.
- Introducing a parser agent before the MVP works end to end.

If these changes become necessary, pause parallel work and update the contract first.

### 27.5 Integration Gates

Use these gates to merge parallel work safely:

#### Gate 1: Static Journey

Requirements:

- All six beats render.
- User can advance through draw/describe/confirm placeholders.
- State persists locally.
- No live AI required.

#### Gate 2: Artifact Journey

Requirements:

- Drawing export works.
- Voice transcript works or typed fallback works.
- Each beat stores real artifacts.
- Confirmation and correction update state.

#### Gate 3: AI Journey

Requirements:

- Image route returns real generated images or reliable stubs.
- Final book route returns title and six pages.
- Regenerate and add-detail paths work.
- Errors do not erase child work.

#### Gate 4: Demo Journey

Requirements:

- Complete story can be made in one run.
- Tablet layout is polished.
- Finished book reader feels like the payoff.
- Seed fallback can demonstrate the app if live AI fails.

### 27.6 Dependency Graph

```txt
Scaffold + state contracts
  -> App shell and beat router
  -> Drawing canvas
  -> Voice recorder
  -> Transcription
  -> Image generation route
  -> Confirmation/correction loop
  -> Final book writer
  -> Book reader
  -> Polish and demo fallback
```

Parallelizable branches after the foundation:

```txt
Foundation
  -> Drawing canvas
  -> Voice recorder
  -> Transcription route
  -> Image prompt/backend stub
  -> Codex OAuth adapter
  -> Final book prompt/backend stub
  -> Book reader with seed data
  -> Visual system and PNG art assets
```

### 27.7 Practical Hackathon Schedule

#### Hour 0-1: Foundation

- Scaffold app.
- Add state types.
- Add beat config.
- Add storyboard-matched base styles and design tokens.
- Add stub routes.

#### Hour 1-3: Parallel Build

- Canvas workstream builds drawing.
- Voice workstream builds recording/transcription.
- AI workstream builds stubbed image/final routes.
- Reader workstream builds final book view with seed data.
- Shell workstream wires beat flow.

#### Hour 3-5: AI Integration

- Swap image stub for live image generation.
- Swap final book stub for live story writer.
- Wire correction/regeneration.
- Add fallback seed data.

#### Hour 5-6: Demo Polish

- Run complete six-beat flow.
- Fix layout issues.
- Improve loading and error states.
- Prepare demo story.

## 28. Demo Script

Ideal hackathon demo:

1. Open Story Coach.
2. Start a story.
3. Draw a rough main character.
4. Describe it by voice: "His name is Jesse Marsh. He is a brave green dragon who loves castles."
5. Show generated character.
6. Accept.
7. Draw special thing.
8. Describe it.
9. Accept.
10. Describe what Jesse wants.
11. Accept.
12. Draw problem.
13. Describe problem.
14. Accept.
15. Draw what Jesse tries.
16. Describe attempt.
17. Accept.
18. Draw ending.
19. Describe ending.
20. Accept.
21. Show "Making your book..."
22. Reveal finished book.
23. Flip pages.
24. Tap "Read to me."

The final book reveal is the emotional payoff.

## 29. Success Metrics

### MVP Success

The prototype is successful if:

- A user can complete all six beats without developer intervention.
- Drawing and voice steps feel natural.
- Generated images visibly respond to the child's drawing and transcript.
- Corrections can improve a generated image.
- The final book feels coherent.
- The app does not feel like a chatbot.
- The app works well at tablet landscape dimensions.

### Demo Success

The hackathon demo is successful if a judge understands within 60 seconds:

- A child is making the story.
- The app is coaching story structure.
- The AI is polishing, not replacing.
- The output is a finished illustrated book.

## 30. Key Risks

### 30.1 Image Consistency

Risk:

- Character may drift across generated images.

MVP mitigation:

- Pass previous accepted images as references.
- Use repeated continuity instruction.
- Keep style consistent.

Future mitigation:

- Character sheet.
- Editable character caption.
- Stronger reference-image pipeline.

### 30.2 Child Speech Quality

Risk:

- Speech transcription may be messy.

MVP mitigation:

- Use short recordings.
- Show typed fallback.
- Let final writer tolerate messy transcripts.

### 30.3 Flow Length

Risk:

- Six beats times draw, describe, generate, confirm may feel slow.

MVP mitigation:

- Keep each screen simple.
- Keep voice prompts lightweight.
- Use loading states with visible progress.
- Allow demo seed or fast mode if needed.

### 30.4 AI Over-Invention

Risk:

- AI invents too much story content.

MVP mitigation:

- Prompt imagegen and final writer to preserve child ideas.
- Avoid adaptive AI prompts that steer too heavily.
- Keep final book to six short pages.

### 30.5 Codex OAuth Fragility

Risk:

- Hermes-style Codex backend calls may be brittle or environment-specific.

MVP mitigation:

- Keep AI wrapper isolated.
- Provide fallback stubs.
- Use local demo seed data if live calls fail.
- Do not expose tokens to browser.

## 31. Acceptance Criteria

### 31.1 Core Journey

- User can start a new story.
- User can draw on a wide canvas.
- User can submit drawing.
- User can record description.
- Transcript is stored.
- Generated image appears.
- User can accept image.
- User can add detail.
- User can regenerate.
- App advances through all six beats.
- App generates final book.
- User can flip through book pages.

### 31.2 State

- Each beat stores drawing, transcript, generated image, corrections, and accepted flag.
- Reloading does not lose completed beats.
- Final book uses accepted images.

### 31.3 UI

- Layout works on tablet landscape.
- Text does not overlap.
- Buttons have large touch targets.
- The app does not show a chatbot interface.
- Submitted drawings appear as horizontal pinned paper references.
- Static app screens match the storyboard PNGs at roughly 90% visual fidelity.
- In-flow screens use one consistent version of the generated visual system.
- Illustration-like assets are PNGs generated or prepared as bitmap images.
- The implementation does not recreate storyboard illustrations as SVG components.

### 31.4 AI

- Image generation uses drawing and transcript.
- Correction uses current image and correction transcript.
- Final book uses all beat transcripts and accepted images.
- No separate parser agent is required.
- Codex OAuth powers story/text generation on the server.
- Codex OAuth powers image generation on the server.
- Speech transcription does not depend on Codex OAuth for MVP.
- Provider-specific Codex payloads are isolated from React components.

### 31.5 Safety

- Tokens remain server-side.
- Voice fallback exists.
- Error states preserve child work.
- Codex tokens are never sent to the browser.
- Local auth material is never committed to the repo.

## 32. Open Decisions

These can be decided during implementation:

- Exact canvas library versus custom HTML canvas.
- Exact local speech runtime: Whisper, Parakeet, or installed available option.
- Exact local Codex OAuth credential resolver.
- Whether final book text editing ships in MVP.
- Whether the finished reader uses real page-turn animation or simpler navigation.
- Whether generated images are stored in `public/generated` or another local asset directory.
- Whether to add a demo seed story for reliability.
- Which storyboard PNGs should become reusable UI art assets versus pure reference images.

## 33. Recommended MVP Implementation Order

1. Scaffold Next.js app.
2. Implement beat config and state model.
3. Define design tokens and PNG asset conventions.
4. Build static UI screens from storyboard at roughly 90% fidelity.
5. Implement drawing canvas.
6. Implement pinned drawing references.
7. Implement voice recording.
8. Add local transcription.
9. Implement imagegen route with stub response.
10. Add server-only Codex OAuth adapter.
11. Swap stub for Codex-backed image generation.
12. Implement confirmation and correction loops.
13. Implement final story writer with stub response.
14. Swap stub for Codex-backed final writer.
15. Build finished book reader.
16. Replace placeholder art with ImageGen PNG assets where needed.
17. Polish tablet layout.
18. Add demo fallback data.

## 34. Product Mantra

Story Coach is not:

- "AI writes a children's book for you."

Story Coach is:

- "A child draws and talks their way through a story, and the app turns those choices into a real picture book."

The product should always preserve that distinction.
