# CLAUDE.md — sitesculpt

You are working on **sitesculpt**, a paid SaaS that turns a short text brief
into a cinematic, scroll-driven website. Direct competitor to Draftly.space.
This file is the persistent handoff between Claude sessions — read it on
startup, keep it accurate as you ship.

## What this product is

User flow: brief → cinematic keyframe → 4s motion video → frame extraction →
scroll-driven flipbook → editable site copy → ZIP export of a real Next.js
project. Cost ~$0.44/gen baseline, ~$0.48 with brand-asset compositing.

Pipeline (server, `features/pipeline/index.ts`):

```
expandPrompt ─┐
              ├─> generateImage ─> [compositeAssets?] ─> generateVideo ─> extractFrames
composeSite  ─┘  (parallel)
```

- `expandPrompt` (`steps/expandPrompt.ts`) — Claude → Scene JSON (palette, prompts, design tokens)
- `composeSite` (`steps/composeSite.ts`) — Claude → SiteStructure JSON. Has a one-shot retry loop gated on `quality/checks.ts`. System prompt is voice/copy guardrails — keep it sharp.
- `generateImage` (`steps/generateImage.ts`) — keyframe via the image router (G2)
- `compositeAssets` (`steps/compositeAssets.ts`, opt-in) — composites brand assets onto the keyframe (G3)
- `generateVideo` (`steps/generateVideo.ts`) — sora-2 image-to-video, 4s loop
- `extractFrames` (`steps/extractFrames.ts`) — ffmpeg → sharp, 30fps

## Stack

Next.js 15 (App Router) · React 19 · Tailwind 4 (beta) · TS strict.
Auth Clerk · Billing Stripe · Storage Vercel Blob (prod) / fs (dev) · State Zustand.
Models: `@anthropic-ai/sdk` (Opus 4.7) · `openai` (gpt-image-1.5, sora-2) · `@fal-ai/client` (Ideogram v3, Flux Kontext multi).

## Standards (non-negotiable)

- TS strict. No `any`. No `@ts-ignore`. Prefer narrow types.
- Components under 150 lines. Extract at that limit.
- Feature folders: `features/<domain>/...`, never a global `components/`.
- State: Zustand (global), local `useState` only when truly local.
- Never fetch in components — always go through `lib/` or feature helpers.
- Env vars for all config. Never hardcode secrets. Always validate via `lib/env.ts` zod schema.
- Error / loading / empty states everywhere user-facing.
- WCAG AA contrast minimum, 44pt touch targets.
- Default to writing **no comments**. Only when WHY is non-obvious.

## Naming convention — "the model"

Per commit `c2a7feb` we deliberately scrub third-party model names from
user-visible strings, internal prompts, and most code comments. Refer to
providers as "the model", "the image model", "the video model", "the
composite model". Internal type/var names may use specific names (`generateFluxImage`, `openaiSoraProvider`) but customer-facing surface and prompt strings stay vendor-neutral.

## Git conventions

- Commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Branch names: `feat/<short>`, `chore/<short>`, `docs/<short>`
- Never commit unless asked. Never push to `main` without explicit ask.
- One feature per branch, one logical commit per branch when possible.

## Active roadmap (Draftly gap-fill)

Derived from a deep competitive teardown of Draftly.space. Ranked by impact.

### Shipped
- **G2 — Image-provider router** (`feat/model-router`, merged): `lib/providers/image-router.ts` picks fal/Ideogram-v3 when `FAL_API_KEY` is set, falls back to OpenAI on error. `IMAGE_PROVIDER=auto|openai|fal` env switch.
- **G3 — Brand-asset compositing** (`feat/composite-assets`, merged): opt-in pipeline step between `generateImage` and `generateVideo`. Uses `fal-ai/flux-pro/kontext/multi` to composite user logos / product photos / style refs onto the keyframe. `BrandAsset[]` flows in via `/api/generate` body. `composite-applied.flag` sentinel for SSE-resume idempotency.

### Next up (in priority order)
- **G3.5 — Brand-asset upload widget** in the studio. Vercel-Blob upload from the client, return URL, push into the `brandAssets[]` payload sent to `/api/generate`. Per-asset: kind picker (logo/product/reference), optional placement hint. **Don't ship until G3 quality is verified end-to-end with a real logo.**
- **G1 — Cross-project brand memory ("Super Memory")**. Per-tenant brand DNA layer (palette, typography, voice samples, prior assets, accepted keyframes). Pre-conditions `expandPrompt` and `composeSite` system prompts with a `BRAND CONTEXT` block on every gen. Keyed off Clerk `userId` + `brandId`. New `lib/brand-memory.ts`. UI: `Studio → Brand` panel.
- **G4 — Section-level imagery**. Hero is great, sub-sections are naked. Schedule parallel cheap image-1.5 / Flux jobs during `composeSite` for any layout that needs imagery (`team-grid` avatars, `pricing-tiers` art, `split-image`, `logo-strip`). Cache aggressively.
- **G5 — Stream preview URL on `composeSite` complete** (before video is done). `lib/sse.ts` already exists — plumb through. Drafted-by-3s, polished-by-2min UX.
- **G6 — FPS knob (10–40)** in `features/studio/ArtDirection.tsx`. Currently fixed at 30.
- **G7 — GitHub push export** alongside ZIP. OAuth + `gh repo create`.
- **G8 — Open-in-Cursor / Open-in-Claude-Code button** on export.
- **G9 — Multi-brand workspaces** for agencies (gates G1).
- **G10 — Multi-video chaining** for >8s scrolls.
- **G11 — Productized prompt packs** (versioned, gated by tier).

### Explicitly NOT doing
- Node-graph "Visual Studio" UI as the default surface (Draftly's #1 friction point).
- BYO-keys / no-hosting pricing model.
- Self-hosted local-GPU mode.

## Multi-Claude collaboration protocol

There are usually two Claudes in motion:

- **Web Claude** (claude.ai/code, Linux sandbox): research, planning, multi-agent dives, PR reviews, anything that doesn't need filesystem access. Cannot push to GitHub from this repo (not in its allowlist) — hands work back as patches.
- **Local Claude** (Claude Code CLI on the Mac, in this repo): direct file edits, multi-file refactors, runs typecheck/dev server, commits, pushes.

**Sync layer:** this file (`CLAUDE.md`), git history, and branch names. Both sessions read this file on startup and keep it current.

**Handoff rules:**
- When you ship a roadmap item, move it from "Next up" to "Shipped" in the same commit. Cite the branch name and the key file paths.
- When a roadmap item changes shape mid-implementation, edit it before opening the PR — don't leave the doc lying about what's actually in the repo.
- When you discover a new gap (from real user feedback, not speculation), add it to the bottom of "Next up" with a one-line rationale.
- When you decide NOT to do something, log it under "Explicitly NOT doing" with one line of why. Future Claude shouldn't relitigate the decision.

**What the other Claude does NOT have:**
- Web Claude can't see your local terminal, can't run your dev server, can't read `.env.local`. If you ask it to debug a runtime issue, paste the actual error.
- Local Claude can't browse the web for fresh API docs or competitor research. If you need that, ping web Claude.

## Operational reference

- Dev: `npm run dev` (port 3000)
- Typecheck: `npm run typecheck` — must pass before committing
- Quality harness: `npm run test:quality` (needs API keys, costs ~$5 to run all golden briefs)
- Required env (see `.env.example`): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`
- Optional env: `FAL_API_KEY` (unlocks G2 fal path + G3 compositing), `IMAGE_PROVIDER` (auto/openai/fal), `BLOB_READ_WRITE_TOKEN` (prod storage)
- Cache backend: Vercel Blob in prod (token set), local fs in dev (`.cache/projects/<id>/`)
