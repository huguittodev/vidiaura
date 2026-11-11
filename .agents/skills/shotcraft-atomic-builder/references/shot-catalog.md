# Shotcraft Reference Catalog & Top 25 Priority Atoms for Vidiaura

All reference files and runnable demos live locally under `/home/huguitto/vidiaura/references/video-shotcraft/`.

---

## 1. Core Shared Primitives to Port First (`Fase 1`)

| Source File in `references/video-shotcraft` | Key Exports | Role in Vidiaura `remotion/motion-kit/` |
| :--- | :--- | :--- |
| `demos/_fixtures/Polish.tsx` | `bezier`, `EASE`, `ramp`, `mix`, `velocity`, `softShadow`, `hairline`, `innerHighlight`, `surface`, `<Grain />`, `<Vignette />`, `<SpeedBlur />`, `<Backdrop />` | Studio finish layer: Newton-Raphson cubic-bezier solver, two-layer elevation shadows, cached deterministic SVG film grain, directional velocity blur. |
| `demos/_fixtures/Look.tsx` | `LOOKS`, `TYPE`, `type`, `stagger`, `springAt`, `glow`, `glowFilter`, `<Stage />`, `<GridFloor />`, `<Dust />`, `<Sheen />`, `<TextReveal />` | Art direction & lighting: 8 curated palettes, Q11-safe typography scale, perspective horizon grid, single-pass clipped sheen, 5-mode text reveal (`rise`, `blur`, `drop`, `scale`, `track`). |
| `demos/_fixtures/Motion.tsx` | `E`, `lerp`, `seg`, `rand`, `useT`, `<DesignStage />` | Normalized segment interpolation, deterministic seeded pseudo-random generator, and `raster="zoom"` stage scaling. |
| `assets/lib/PageCam.tsx` | `<PageCam />`, `CamKey` | 2.5D page camera over real captures using layout-level CSS `zoom` (`Tx = 960/zoom - cx`) for razor-sharp 3D text (Rule Q2) + optional top-band DOF blur. |
| `assets/lib/ClipCard.tsx` | `<ClipCard />` | Wraps external `.mp4` clips (user screen recordings or Google Flow B-roll) into a 3D-ready card with seamless crossfade looping (`OffthreadVideo` + complementary envelope `<Sequence>`). |
| `assets/lib/DigitRoll.tsx` | `<DigitRoll />` | Odometer-style rolling monospace digits (`tabular-nums`) for KPI & metric atoms. |
| `assets/lib/FlashCut.tsx` | `<FlashCut />` | 10-frame warm-white radial bloom transition straddling a hard cut (`cutFrame - 5`). |

---

## 2. Top 25 Priority Shot Recipes for Vidiaura (`Fase 2`)

Selected from the 124 recipes in `references/video-shotcraft/references/shots/` for maximum SaaS promo impact:

### Category 1: Opening & Brand (`opening/`)
1. **`brand-ink-open`** (`demos/opening/brand-ink-open/`): Crisp brand mark & wordmark reveal with $\ge 1\text{s}$ hold (Rule R1).
2. **`spotlight-hero-card`** (`demos/opening/spotlight-hero-card/`): Single hero UI card emerging from darkness with spotlight, push-in, elevation, and single edge sheen (Rule Q5).
3. **`text-as-mask`** (`demos/opening/text-as-mask/`): Giant display typography masking live product footage or animated gradients inside the glyphs.
4. **`magician-card-flourish`** (`demos/opening/magician-card-flourish/`): 3D fan-out flourish of product feature cards settling into stage position.

### Category 2: 2.5D & 3D Camera (`camera/`)
5. **`depth-layer-moves`** (`demos/camera/depth-layer-moves/MultiplaneReal.tsx`): Disney multiplane camera (0.35x blurred background page + 0.7x sharp main card layer + 1.4x foreground floating badges + 0x pinned headline).
6. **`crash-zoom-punch`** (`demos/camera/crash-zoom-punch/`): High-energy rapid zoom into a focal UI action with directional blur and settle.
7. **`steep-tilt-glide`** (`demos/camera/steep-tilt-glide/`): Oblique 3D table-top glide across a SaaS dashboard with perspective depth.
8. **`cursor-flyover`** (`demos/camera/cursor-flyover/`): Camera tracks a flying vector cursor across multiple interactive zones.

### Category 3: UI Entrance (`ui-entrance/`)
9. **`deck-deal-flyin`** (`demos/ui-entrance/deck-deal-flyin/DeckDealFlyin.tsx`): 3D stacked deck with anticipation press, hard-accelerating card deal into grid slots, Z-arc flight, and layered follow-through settle.
10. **`row-embed`** (`demos/ui-entrance/row-embed/`): List items flying in from depth and physically embedding into dashboard rows (Rule Q9).
11. **`integration-hub-map`** (`demos/ui-entrance/integration-hub-map/`): Central product hub pulsing data along Bezier lines to surrounding ecosystem nodes.
12. **`carousel-3d`** (`demos/ui-entrance/carousel-3d/`): Cylindrical/perspective 3D card carousel rotating through product modules.
13. **`product-card-progressive-assemble`** (`demos/ui-entrance/product-card-progressive-assemble/`): A complex SaaS card assembling layer-by-layer (frame → header → chart → badges) in 2.5D space.

### Category 4: Product Interaction (`interaction/`)
14. **`type-and-filter`** (`demos/interaction/type-and-filter/`): Realistic human-paced search typing that dynamically filters and rearranges a card grid below.
15. **`glass-pill-dictation-typing`** (`demos/interaction/glass-pill-dictation-typing/`): Floating glassmorphic AI prompt pill with live waveform and streaming text synthesis.
16. **`theme-switch-moves`** (`demos/interaction/theme-switch-moves/`): Crisp light-to-dark (or dark-to-light) surface sweep triggered by a toggle interaction.

### Category 5: Data & Metrics (`data/`)
17. **`chart-live-moves`** (`demos/data/chart-live-moves/`): Animated spline/bar telemetry drawing in real time with `<DigitRoll />` counters and callout badges.
18. **`before-after-slider-scrub`** (`demos/data/before-after-slider-scrub/`): Split comparison wiper revealing the "With Product" transformation over the "Before" state.

### Category 6: Light & Emphasis (`effects/`)
19. **`spotlight-sweep-moves`** (`demos/effects/spotlight-sweep-moves/`): Three dark-stage lighting choreographies (`GlowWakeSleepPanel`, `SlideSpotlightPan`, `CornerSpotlightReveal`) with linear spotlight travel and 3-layer edge-hugging purple/accent laser glow.
20. **`scanline-annotate-focus`** (`demos/effects/scanline-annotate-focus/`): HUD bracket lock-on + 3D floating callout label highlighting a specific region of a real screenshot.

### Category 7: Kinetic Typography (`typography/`)
21. **`lead-word-zoom-assemble`** (`demos/typography/lead-word-zoom-assemble/`): Hero anchor word lands first while supporting words snap into alignment around it.
22. **`paper-title-card`** (`demos/typography/paper-title-card/`): Editorial ~50-frame breathing title card between feature shots (from `promo-energy-arc`).
23. **`pill-slot-cycle`** (`demos/typography/pill-slot-cycle/`): Fixed sentence frame with an inline pill slot rapidly cycling through high-contrast capability nouns.

### Category 8, 9 & 10: Transitions, Rhythm & Outro (`transition/`, `rhythm/`, `outro/`)
24. **`shot-transitions`** (`demos/transition/shot-transitions/`): The 3 canonical seam connectors:
    - `FlashCut` (10f radial bloom)
    - `WhipBrakeReal` (continuous velocity integral peaking at $\ge 300\text{px/f}$ with `<SpeedBlur />` and 48f ease-out brake)
    - `PortalWipeV2` (card lifts in anticipation, then expands into a 2-layer parallax detail world)
25. **`outro-group-photo-launch`** (`demos/outro/outro-group-photo-launch/`): Representative UI cards from earlier shots fly in from four directions to frame the central brand wordmark and CTA, with crane camera pull-back and stage lighting (Rule Q8).

---

## 3. Complete Directory of All 10 Categories in `references/video-shotcraft`

Whenever you need a specialized effect beyond the Top 25, browse the full local directory at `references/video-shotcraft/references/shots/<category>/<card>.md`:

- **`camera/`** (10 cards): `basic-3d-scene`, `crash-zoom-punch`, `cursor-flyover`, `depth-layer-moves`, `graze-face-tour`, `overhead-camera-moves`, `space-camera-moves`, `steep-tilt-glide`, `tension-camera-moves`, `terminal-3d`
- **`data/`** (5 cards): `before-after-slider-scrub`, `chart-live-moves`, `gauge-readout-moves`, `scroll-brake-moves`, `timeline-travel`
- **`effects/`** (15 cards): `assemble-then-type-flyin`, `aurora-bloom-bg-flip`, `brand-frame-snap`, `fui-hud-moves`, `glow-flyline-moves`, `icon-performance-moves`, `impact-feedback`, `light-play-moves`, `radial-ripple-phone-chips`, `riso-print-hits`, `scan-bracket-sweep`, `scanline-annotate-focus`, `scanline-assemble-flyin`, `slam-entrance-moves`, `spotlight-sweep-moves`
- **`interaction/`** (11 cards): `autolayout-gap-dial`, `canvas-materialize-moves`, `chip-grid-single-select-blackout`, `collab-cursor-moves`, `glass-pill-dictation-typing`, `hashtag-to-pill-materialize`, `picker-carousel-feature-cycle`, `segmented-thumb-hero`, `theme-switch-moves`, `type-and-filter`, `voice-waveform-live`
- **`opening/`** (11 cards): `brand-ink-open`, `crane-rise-reveal`, `dataviz-landscape-open`, `fracture`, `icon-field-colorize`, `letterspace-materialize`, `magician-card-flourish`, `orbit-ring-title-open`, `spotlight-hero-card`, `stroke-segment-build`, `text-as-mask`
- **`outro/`** (6 cards): `grain-dissolve`, `logo-shrink-wordmark-lockup`, `neon-triple-marquee`, `outro-group-photo-launch`, `ui-strip-away-outro`, `ui-to-brand-morph`
- **`rhythm/`** (8 cards): `beat-cut-moves`, `beat-step-list-theme-cycle`, `panel-grid-moves`, `quad-split-parallel-scenes`, `rhythm-interrupt-moves`, `sakuga-timing-shift`, `speed-ramp-freeze`, `trailer-grammar-moves`
- **`transition/`** (15 cards): `bottom-push-stack-wipe`, `card-flip-reveal`, `card-flock-tumble`, `circle-match-iris`, `gradient-transition`, `line-carry-transition`, `mosaic-reframe`, `page-turn-transitions`, `print-texture-transitions`, `shot-transitions`, `tear-streak-transitions`, `transition-hidden-cut`, `transition-travel`, `white-flash-logo-simplify-cut`, `wipe-transitions`
- **`typography/`** (22 cards): `blur-slide`, `brace-expand`, `countdown-arc-scatter`, `document-typewriter-reveal`, `flying-words`, `glitch-cycle`, `gradient-word-sweep`, `lead-word-zoom-assemble`, `marker-underline-title`, `outline-word-fill`, `paper-title-card`, `pill-chip-slot-cycle-handled`, `pill-slot-cycle`, `text-column-converge`, `title-demote-to-label`, `type-assembly-moves`, `type-entrance-moves`, `type-rhythm-sync`, `typewriter-moves`, `vertical-word-roll-blur-cycle`, `word-relay-filmstrip`, `word-relay-geometry`
- **`ui-entrance/`** (21 cards): `avatar-bracket-carousel`, `bezier-source-converge-merge`, `card-stack`, `carousel-3d`, `cloner-depth-echo`, `deck-deal-flyin`, `doc-park-left-pill-deal`, `draw-svg-trace`, `element-body-moves`, `integration-hub-map`, `list-reveal`, `list-stack-press`, `neon-frame-forerun`, `neon-frame-orbit-drop`, `page-waterfall-wall`, `product-card-progressive-assemble`, `radial-wave`, `research-card-stack-scroll`, `row-embed`, `value-stagger-gradient`, `wall-reveal-moves`

