# AGENTS.md — Vidiaura (Atomic Shotcraft Engine)

`PROJECT_SPEC.md` (v3.0) is the product and architecture source of truth. Read it before changing scope or architecture.

## Hard rules

1. Implement only the requested phase; don't expand scope proactively.
2. Use strict TypeScript and Zod to validate all untrusted inputs.
3. The AI returns structured `SceneGraph` JSON (validated with Zod). Never generate or execute raw/untrusted React/JS code from the AI response in production. The deterministic Remotion engine interprets the `SceneGraph` using our Motion Kit.
4. Scene atoms, shot recipes, camera parameters, layout presets, transitions, fonts, assets and sound cues must come from explicit allowlists and schemas.
5. Keep all AI API keys, service-role keys, Stripe secret keys and server secrets on the server/worker only.
6. Authorize every project, asset, scene graph and render operation by user ownership. Use RLS for Supabase tables and Storage.
7. Coordinate exact versions of all Remotion packages (`4.0.539`).
8. Do not perform long video renders inside a normal user-facing HTTP request. Enqueue a job and use the render worker.
9. Make render jobs idempotent, time-limited, observable and retry-safe.
10. Add useful errors and never claim success until a build/test/render confirms it.
11. Keep `.env.example` current. Never commit real secrets or user files.
12. Don't add paid APIs, external services or heavy dependencies without explaining why.
13. Music and sound effects must have documented rights suitable for commercial exports (`public/sfx/SFX_LICENSES.md`).
14. Maintain 100% backward compatibility with existing `SceneGraph` v2.0 contracts, API routes and tests when evolving to the 5-layer composable architecture.
15. Enforce the Shotcraft Visual & Sonic Laws (`R1–R4`, `Q1–Q11`, `S1–S5` in `PROJECT_SPEC.md` §4):
    - **Deterministic rendering:** Never use `Date.now()` or `Math.random()` inside Remotion components; use deterministic seeded hashes (`mulberry32` / sine hash from index/frame).
    - **Crisp 3D text (Q2):** Use layout-scale CSS `zoom` (`Tx = (width/2)/zoom - cx`) rather than `transform: scale(zoom)` inside 3D perspective containers so text rasterizes at magnified resolution.
    - **Readable pixel height (Q11):** On a 1080p canvas, narrative captions must render at $\ge 56\text{px}$ effective pixel height and secondary text at $\ge 32\text{px}$ after parent scales and 3D perspective compression.
    - **Hold budgets & acceleration (R1, R2):** Wordmarks hold $\ge 30$ frames (1s); batch entrances accelerate non-linearly and hold $\ge 15$ frames (0.5s).
    - **Restrained glints & slams (Q4, R4):** Apply `<Sheen />` at most once to the hero element (clipped to `border-radius`); limit full-frame beat slams to $\le 3$ per video.
    - **Cinematic foley & offset compensation (S1, S2, S5):** No arcade/game-pack synth bleeps; prevent rapid-fire "machine-gun" repetition via sample alternation + volume step-down; apply dual audio offset compensation (`sfxFrom`).

## Repository shape

- Single Next.js 16 App Router app at the repo root.
- Routes: `/` landing/generation, `/editor` minimalist editor, `/editor/advanced` full studio; route handlers live under `src/app/api/`.
- `src/lib/` is domain logic:
  - `scene-graph/` (`schema.ts`, `types.ts`, `layout.ts`, `media-layout.ts`, `adapter.ts`)
  - `design/tokens.ts` (single source of truth for palettes, typography, spacing, radii and motion timings; generates `src/app/tokens.generated.css` via `npm run tokens`)
  - `ai/` and `input-intelligence/` (Gemini Creative Director & Vision adapters + deterministic fallbacks)
  - `render/` (queue/worker/bundler), `supabase/` (clients + persistence), `simple-editor/`, `recorder/`
- `remotion/` is the deterministic engine: `Root.tsx` registers compositions; `motion-kit/` holds camera, cursor, audio, layout/polish primitives and atomic shot components.
- `references/video-shotcraft/` (gitignored local reference clone of `Vincentwei1021/video-shotcraft`, Apache 2.0) holds 124 shot recipe cards (`references/shots/`), 150 runnable Remotion demos (`demos/`), and core primitives (`demos/_fixtures/Polish.tsx`, `Look.tsx`, `Motion.tsx`, `assets/lib/PageCam.tsx`, `ClipCard.tsx`, `DigitRoll.tsx`, `FlashCut.tsx`).
- `.agents/skills/shotcraft-atomic-builder/SKILL.md` is the workspace Antigravity skill for porting `video-shotcraft` recipes into `remotion/motion-kit/` and producing daily SaaS promo videos.
- `supabase/migrations/*.sql` owns tables, RLS and the private `project-assets` / `rendered-videos` buckets.
- `tests/` uses Node's built-in test runner (`npx tsx --test`).

## Commands

Use `pnpm` for all package management and script execution:

- `pnpm dev` — Next dev server (loads `.env.local`).
- `pnpm test` — full suite from `tests/*.test.ts`.
- `pnpm dlx tsx --test tests/<name>.test.ts` — run a single test file.
- `pnpm tokens` / `pnpm tokens:verify` — regenerate or verify `src/app/tokens.generated.css` from `src/lib/design/tokens.ts`.
- `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build` — mandatory verification order before completing any task.
- `pnpm remotion` — Remotion Studio via `remotion/index.ts`.
- `pnpm render` / `pnpm render:vidiaura` / `pnpm render:showcase` / `pnpm render:legacy` — render MP4s into `out/`.
- `pnpm dlx tsx scripts/generate-sfx.ts` — regenerate the audio bank; add `--verify` to check existing files.
- `package-lock.json` and `pnpm-lock.yaml` are both committed. Do not delete either lockfile.

## SceneGraph & Design Token invariants

- `src/lib/scene-graph/schema.ts` (Zod) and `src/lib/scene-graph/types.ts` (TypeScript) are parallel, hand-maintained definitions. Any scene, atom or payload change must update both, plus the Remotion compositions, fixtures/demo graphs and tests.
- Validate every graph with `SceneGraphSchema.safeParse` before it reaches the player or renderer. `simple-edit.ts` deliberately rejects invalid edits and returns the previous graph.
- New Remotion atoms and compositions must read colors, spacing, radii and typography from `src/lib/design/tokens.ts` (no raw hex literals in new components; enforced by `tests/design-tokens.test.ts`) and place elements within safe-area slots from `src/lib/scene-graph/layout.ts` (`getSafeArea`, `fitInside`, `buildPreset`).
- AI endpoints never emit React/JS. Gemini failures or missing keys return HTTP 200 with a deterministic fallback; check `source` (`gemini` / `gemini-vision` vs `deterministic-fallback`) before assuming the model ran.
- Browser media is memory-only: `draft-store.ts` strips `blob:` / `data:` URLs before `sessionStorage`, and `SimpleEditor` re-embeds the data URI only for export.
- All `@remotion/*` packages and `remotion` are pinned to `4.0.539`; bump them together.
- Add or rename audio end-to-end: `AudioAssetSchema` (`schema.ts`), `AudioAsset` (`types.ts`), `SFX_CATALOG` (`remotion/motion-kit/audio/AudioTimeline.ts`), the WAV in `public/sfx/`, and `public/sfx/SFX_LICENSES.md`.

## Render and persistence gotchas

- `RenderQueue` is an in-memory `Map`, not the `render_jobs` table. Files go to `/tmp/launtion-renders`, the bundle cache to `/tmp/launtion-bundle-cache`, and the download route reads local disk.
- Keep renders asynchronous: `POST /api/render` enqueues and returns 202; clients poll `/api/render/:id`.
- With `MOCK_SUPABASE=true` (or no `NEXT_PUBLIC_SUPABASE_URL`), auth returns a fixed mock user and persistence uses the in-memory adapter. In mock mode, `x-user-id` / `x-user-email` override identity and `Authorization: Bearer invalid` simulates 401.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
