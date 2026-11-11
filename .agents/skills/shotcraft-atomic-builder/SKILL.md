---
name: shotcraft-atomic-builder
description: >-
  Port animation recipes and studio primitives from references/video-shotcraft
  into Vidiaura's 5-layer Atomic Motion Kit (remotion/motion-kit/) and produce
  studio-grade SaaS promotional videos with Remotion, SceneGraph, Beat-Sync,
  and Auto-SFX. Activate when creating or refactoring motion atoms, designing
  new shot recipes, building SaaS promo videos (such as ZentioGrid), or auditing
  visual/audio quality against Shotcraft rules.
---

# Shotcraft Atomic Builder — Vidiaura Motion Graphics Skill

This skill bridges the local **`Vincentwei1021/video-shotcraft`** reference library (`references/video-shotcraft/`, Apache 2.0) with **Vidiaura's deterministic Remotion SaaS engine** (`remotion/motion-kit/` + `src/lib/scene-graph/`).

Never write arbitrary one-off React code in production API routes. Instead, use this skill to:
1. **Port & parameterize** battle-tested shot recipes from `references/video-shotcraft/` into reusable, token-compliant atoms in `remotion/motion-kit/`.
2. **Compose & render** studio-quality SaaS promo videos (both via the `SceneGraph` AI pipeline and via CLI scripts like `scripts/`).
3. **Audit** every shot and composition against the empirical aesthetic and sonic laws (`R1–R4`, `Q1–Q11`, `S1–S5`).

For the full index of all 10 categories, 124 shot recipe cards, shared primitives, and the Top 25 Priority SaaS Atoms, read [references/shot-catalog.md](./references/shot-catalog.md).

---

## 1. Golden Rule: Never Guess Parameters — Read the Card AND the Demo TSX

Every shot in `references/video-shotcraft` consists of two paired artifacts:
1. **The Recipe Card (`references/video-shotcraft/references/shots/<category>/<card>.md`)**: Explains intent, narrative role, energy level, parameter table, sound cues, and known pitfalls ("已知坑").
2. **The Tuned Demo Source (`references/video-shotcraft/demos/<category>/<card>/*.tsx`)**: Contains the exact calibrated easing curves, frame ratios, anticipation/follow-through offsets, and shadow/blur math.

**Mandatory procedure before building or porting any atom:**
- Always read **both** the `.md` recipe card and the corresponding `.tsx` file under `references/video-shotcraft/demos/<category>/<card>/`.
- Also inspect shared primitives in `references/video-shotcraft/demos/_fixtures/` (`Polish.tsx`, `Look.tsx`, `Motion.tsx`, `PageCam2D.tsx`) and `references/video-shotcraft/assets/lib/` (`PageCam.tsx`, `ClipCard.tsx`, `DigitRoll.tsx`, `FlashCut.tsx`, `Caption.tsx`).
- Preserve the tuned timing ratios, anticipation frames, and easing curves from the demo while adapting colors/typography to Vidiaura's `src/lib/design/tokens.ts` and geometry to `src/lib/scene-graph/layout.ts`.

---

## 2. The 5-Layer Composable Shot Architecture

Every shot in Vidiaura is structured across 5 orthogonal layers:

1. **Layer 1 — Stage & Backdrop (`StageAtom`)**
   - Procedural stages (`Obsidian`, `LightEditorial`, `StudioLight`, `DarkPrecision`, `PerspectiveGridFloor`) + studio polish (`<Vignette />`, cached 6-tile SVG `<Grain />`, `<Dust />`).
   - Optional external B-roll video backdrop (e.g., abstract glass refraction or cinematic lighting generated with **Google Flow / Veo**) wrapped in `<ClipCard />` with automatic crossfade looping.
2. **Layer 2 — Spatial & Camera Rig (`CameraRig25D`)**
   - Layout slot allocation via `src/lib/scene-graph/layout.ts` (`getSafeArea`, `fitInside`, `buildPreset`).
   - 2.5D camera trajectory (`static-hold`, `slow-push-in`, `isometric-orbit`, `steep-tilt-glide`, `depth-parallax-slide`, `crash-zoom-punch`).
   - **Rule Q2 (Crisp 3D Text):** Inside 3D perspective containers, apply magnification via CSS layout `zoom` (`Tx = (viewportW / 2) / zoom - cx`, `Ty = (viewportH / 2) / zoom - cy`, `transformOrigin: '${cx}px ${cy}px'`) rather than `transform: scale(zoom)` so Chromium rasterizes text at the magnified resolution.
3. **Layer 3 — Visual Subject Atoms (`SubjectAtom[]`)**
   - **Real Product Captures:** `RealCaptureSurface` / `PageCam` (full window screenshot/video) + `CropCalloutCard` (a region `[ymin, xmin, ymax, xmax]` cropped from the real capture and elevated to $Z = +60\text{px}\dots+110\text{px}$ with two-layer elevation shadow).
   - **Synthetic UI & Data Atoms:** `DeckDealGrid`, `TypeAndFilterBar`, `SyntheticPromptBox`, `DigitRollMetricCard`, `ChartLiveMoves`, `IntegrationHubMap`, `ConversationalMockup`, `SyntheticCodeTree`, `SyntheticHeroButton`, `OutroGroupPhotoLaunch`.
   - **Typography Atoms:** `TextReveal` (`rise`, `blur`, `drop`, `scale`, `track`), `MarkerUnderlineTitle`, `PillSlotCycle`, `PaperTitleCard`.
4. **Layer 4 — Light, Emphasis & Cursor Modifiers (`ModifierAtom[]`)**
   - `SpotlightSweepMask` (linear radial reveal + multi-layer edge-hugging glow line).
   - `Sheen` (single-pass angled specular sweep strictly clipped inside the hero card's `border-radius` — **Rule Q4**).
   - `SmartCursor` (curved Bezier path to normalized target `(x, y)` + physical press scale `0.88` + ripple).
5. **Layer 5 — Transitions, BeatGrid & Auto-SFX (`TemporalSonicGlue`)**
   - Seam transitions between Shot $N$ and Shot $N+1$: `hard-cut`, `flash-cut` (10f radial bloom straddling `cutFrame - 5`), `whip-pan-brake` (directional `SpeedBlur` peaking at $\ge 300\text{px/f}$ with long ease-out tail), `portal-zoom-wipe` (card expands into next scene's world).
   - Beat quantization (`beatF(n)`) and automatic SFX cue generation with dual offset compensation (`sfxFrom`).

---

## 3. Workflow A: Porting a `video-shotcraft` Recipe into `remotion/motion-kit/`

Follow these exact steps when adding or upgrading an atomic component:

1. **Locate & Read Source Files:**
   - Read `references/video-shotcraft/references/shots/<category>/<card>.md`.
   - Read `references/video-shotcraft/demos/<category>/<card>/*.tsx`.
2. **Enforce Determinism & Token Compliance:**
   - Replace any `Math.random()` or `Date.now()` with deterministic seeded hashes (`rand(seed)` / `mulberry32`).
   - Replace raw hex color literals with semantic tokens from `src/lib/design/tokens.ts` (`brand`, `neutral`, `signal`, `alpha`, `sceneThemes`). Remember: `tests/design-tokens.test.ts` fails if new files introduce raw hex colors outside `tokens.ts`!
3. **Enforce Safe Area & Effective Font Height (Rule Q11):**
   - Wrap slot content in `fitInside` (`src/lib/scene-graph/layout.ts`) so nothing bleeds outside `getSafeArea(canvas)` in either `1920x1080` (16:9) or `1080x1920` (9:16).
   - Verify that narrative captions render at $\ge 56\text{px}$ effective height and secondary labels at $\ge 32\text{px}$ after parent scaling and `cos(rotY)`.
4. **Enforce Pacing & Physics (Rules R1 & R2):**
   - Reserve hold frames inside the shot's duration budget: $\ge 30\text{f}$ (1s) hold for brand/key wordmarks, $\ge 15\text{f}$ (0.5s) hold after batch card entrances.
   - Use non-linear accelerating stagger (`EASE.exit` or quadratic shrink) for multi-item entrances, plus layered follow-through settle (card body locks first, shadow settles 2–4f later).
5. **Register Schema & Types (Parallel Invariant):**
   - Add the Zod payload schema in `src/lib/scene-graph/schema.ts` and the matching TypeScript interface in `src/lib/scene-graph/types.ts`.
   - Export the component from `remotion/motion-kit/index.ts`.
6. **Verify:**
   - Run `npm run tokens:verify && npm run lint && npm run typecheck && npm test`.

---

## 4. Workflow B: Producing a Daily SaaS Promo Video (e.g., ZentioGrid)

When the user asks to create or iterate on a promo video for a specific SaaS product:

1. **Product Brief & Asset Inspection:**
   - Gather product name, tagline, core features (4–6 concrete capabilities), brand accent color, and any real UI screenshots or screen recordings.
   - Apply **Rule C2**: Write concrete copy naming the team/audience + specific feature name + measurable outcome (avoid vague metaphors).
2. **Apply the `promo-energy-arc` Sequence Skeleton:**
   - **Stage ① Brand Opening (8–12% duration, Low-Medium Energy):** Crisp brand/hook reveal with $\ge 30\text{f}$ hold (`brand-ink-open`, `text-as-mask`, or `lead-word-zoom-assemble`).
   - **Stage ② Hero Subject Biography (12–15% duration, High Craft / Deliberate Pace):** Single hero card or main product window with a complete $\ge 90\text{f}$ (3s) motion arc: spotlight → push-in → elevation → single `<Sheen />` → settle (`spotlight-hero-card` or `PageCam` 2.5D).
   - **Stage ③ Feature Climb (55–65% duration, Alternating High/Calm Energy):** Map each product feature to a distinct shot recipe (never repeat the same primary animation mechanic twice — **Rule P4**). Alternate high-kinetic shots (`deck-deal-flyin`, `chart-live-moves`, `integration-hub-map`) with calm readable interaction shots (`type-and-filter`, `depth-layer-moves`, `spotlight-sweep-moves`), inserting 1–2 breathing title cards (`paper-title-card`, ~50f) before major shifts.
   - **Stage ④ Launch Finale (13–16% duration, Peak Energy):** Bring representative UI cards together around the brand lockup and CTA (`outro-group-photo-launch` or `brand_closing_cta`), holding the final lockup for $\ge 30\text{f}$ (**Rule R1**).
3. **Sound Design & Beat Synchronization (Rules S1–S5):**
   - Pair camera moves with `camera-whoosh` / `transition-whoosh-fast`, tension build-ups with `sound-riser`, hero reveals with `sub-bass-drop`, card pops with alternating `pop-clean` / `soft-pop` on a descending volume ladder (`0.45 → 0.25`), and clicks with `click-switch` / `mouse-click`.
   - Apply dual offset compensation (`sfxFrom`) so audio peaks align to the exact visual impact frame.
4. **Frame-by-Frame Visual QA (Rule P1):**
   - Before delivering, render still frames of key moments (`npx remotion still`) or render the full MP4 into `out/` and inspect for text sharpness (Q2), safe-area margins, and legibility (Q11).

