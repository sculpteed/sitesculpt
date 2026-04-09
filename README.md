# sitesculpt

Prompt → cinematic scroll-driven website. A Draftly.space competitor built with OpenAI + Anthropic only.

## Quick start

```bash
cp .env.example .env.local
# fill in OPENAI_API_KEY and ANTHROPIC_API_KEY

npm install
npm run dev
```

Open http://localhost:3000.

## Pipeline

```
prompt
  ├─> expandPrompt   (Claude) ─┐
  ├─> composeSite    (Claude) ─┤ parallel
  └─> generateImage  (gpt-image-1.5)
       └─> generateVideo (sora-2)
            └─> extractFrames (ffmpeg → sharp)
                 └─> ScrollFlipbook
```

Cost per generation: ~$1.00 (standard sora-2, cached iterations free).

## Differentiation

- Zero onboarding, zero signup to try
- Parallel pipeline — user edits copy at t=3s while Sora cooks
- IndexedDB auto-save — never lose work
- ZIP export to real Next.js project, free
- 30fps frame density (240 frames per 8s), canvas + rAF easing

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run typecheck` — strict TS check
- `npm run seed:gallery` — pre-generate starter scenes (one-time, ~$6)
