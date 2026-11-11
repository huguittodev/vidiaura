import * as fs from 'fs';
import * as path from 'path';
import { SceneGraphSchema } from '../src/lib/scene-graph/schema';
import type { SceneGraph } from '../src/lib/scene-graph/types';
import {
  beatF,
  buildAudioTimeline,
  quantizeScenesToBeatGrid,
} from '../remotion/motion-kit';

if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

/**
 * VIDEO 1: ZentioGrid — AI-Assisted Visual Web Systems & React/TypeScript Grid Studio.
 * - Commercial Integrity Mode: 'strict' (Zero fabricated percentages/latencies; only product-spec architecture parameters).
 * - Rhythm: 124 BPM, Dark Obsidian / Aurora / Dark-Precision multi-stage look.
 * - Combines all 5 Phase 2 (Batch 1) Shotcraft atoms + Brand Closing CTA.
 */
export function buildZentioGridV3SceneGraph(options?: {
  vertical?: boolean;
}): SceneGraph {
  const fps = 30;
  const isVertical = Boolean(options?.vertical);
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;

  const beatGrid = {
    bpm: 124,
    beat0Seconds: 0,
    beatsPerBar: 4,
    outputAudioOffsetFrames: 1,
  };

  // Beat-synced shot cut boundaries at 124 BPM
  const cut0 = beatF(0, beatGrid, fps);
  const cut1 = beatF(6, beatGrid, fps);
  const cut2 = beatF(13, beatGrid, fps);
  const cut3 = beatF(19, beatGrid, fps);
  const cut4 = beatF(25, beatGrid, fps);
  const cut5 = beatF(29, beatGrid, fps);
  const totalFrames = 480; // Exact 16.0s at 30fps

  const rawGraph: SceneGraph = {
    version: '3.0',
    commercialIntegrityMode: 'strict',
    verifiedMetricsRegistry: [
      {
        value: '12-Col',
        label: 'CSS Grid Engine',
        source: 'ZentioGrid Layout Spec v3',
        provenance: 'product-spec',
      },
      {
        value: '3 Viewports',
        label: 'Responsive Breakpoints',
        source: 'ZentioGrid Viewport Matrix',
        provenance: 'product-spec',
      },
      {
        value: 'Strict TSX',
        label: 'Code Synthesis Target',
        source: 'ZentioGrid Compiler Spec',
        provenance: 'product-spec',
      },
    ],
    canvas: {
      width,
      height,
      fps,
      durationInFrames: totalFrames,
    },
    beatGrid,
    artDirection: {
      backdropVariant: 'dark-precision',
      surfaceTheme: 'dark',
      primaryAccent: '#7C3AED',
      archetype: 'linear-dark',
      stage: {
        look: 'obsidian',
        grainOpacity: 0.025,
        vignetteStrength: 0.42,
        dustParticles: true,
        gridFloor: true,
        horizon: 0.64,
        keyLight: { x: 0.5, y: 0.34 },
      },
    },
    cameraTrack: [
      { frame: 0, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
      { frame: 240, x: 0.5, y: 0.5, zoom: 1.04, easing: 'ease-in-out' },
      { frame: 480, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
    ],
    cursorTrack: [
      { frame: 0, x: 0.22, y: 0.68 },
      { frame: 120, x: 0.52, y: 0.46, controlX: 0.38, controlY: 0.32, click: true },
      { frame: 310, x: 0.68, y: 0.38, controlX: 0.62, controlY: 0.28, click: true },
      { frame: 480, x: 0.54, y: 0.7 },
    ],
    audioTrack: [
      {
        id: 'bg-ambient-beat',
        frame: 0,
        asset: 'ambient-beat',
        volume: 0.42,
        fadeInFrames: 12,
        fadeOutFrames: 28,
      },
    ],
    scenes: [
      // SHOT 1: Mask Reveal (0 -> cut1)
      {
        id: 'zg_shot_1_mask_reveal',
        startFrame: cut0,
        durationInFrames: cut1 - cut0,
        type: 'mask_reveal',
        layoutPreset: 'hook',
        stageOverride: {
          look: 'obsidian',
          grainOpacity: 0.024,
          vignetteStrength: 0.46,
          dustParticles: true,
          gridFloor: true,
        },
        cameraRecipe: {
          mode: 'dolly-push-in',
        },
        modifiers: {
          captionBar: {
            index: '01 / ZENTIOGRID STUDIO',
            text: 'Visual CSS Grid & Design-to-React Systems Builder',
            appearAt: 2,
          },
          sheen: {
            enabled: true,
            startFrame: 24,
            durationInFrames: 24,
          },
        },
        transitionOut: {
          type: 'flash-cut',
          durationInFrames: 10,
        },
        debugMeta: {
          recipeId: 'opening/text-as-mask',
          ruleRefs: ['R1', 'Q2', 'Q11'],
        },
        payload: {
          maskWord: 'ZENTIO',
          eyebrow: 'VISUAL WEB SYSTEMS STUDIO',
          headline: 'Compose Responsive CSS Grids Visually. Export Clean React & TypeScript.',
          subheadline: 'LIVE SYSTEM ARCHITECTURE',
          dashboardTitle: 'ZentioGrid Visual Layout & Token Compiler',
          statusBadge: 'AST COMPILER READY',
          mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
          kpis: [
            {
              value: '12-Col',
              label: 'CSS Grid Engine',
              provenance: 'product-spec',
              sourceRef: 'ZentioGrid Layout Spec v3',
            },
            {
              value: '3 Viewports',
              label: 'Responsive Breakpoints',
              provenance: 'product-spec',
              sourceRef: 'ZentioGrid Viewport Matrix',
            },
            {
              value: 'Strict TSX',
              label: 'Code Synthesis Target',
              provenance: 'product-spec',
              sourceRef: 'ZentioGrid Compiler Spec',
            },
          ],
        },
      },

      // SHOT 2: Exploded 2.5D UI (cut1 -> cut2)
      {
        id: 'zg_shot_2_exploded_25d',
        startFrame: cut1,
        durationInFrames: cut2 - cut1,
        type: 'exploded_25d_ui',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'aurora-blur',
          grainOpacity: 0.024,
          vignetteStrength: 0.38,
          dustParticles: true,
          gridFloor: false,
        },
        cameraRecipe: {
          mode: 'isometric-tilt-reveal',
          keys: [
            {
              frame: 0,
              cx: width / 2,
              cy: height / 2,
              zoom: 1.04,
              rotX: 10,
              rotY: -12,
              rotZ: -0.8,
              persp: 1480,
            },
            {
              frame: 52,
              cx: width / 2,
              cy: height / 2,
              zoom: 1.14,
              rotX: 6,
              rotY: -5,
              rotZ: 0,
              persp: 1520,
            },
            {
              frame: 100,
              cx: width / 2,
              cy: height / 2,
              zoom: 1.08,
              rotX: 3,
              rotY: 0,
              rotZ: 0,
              persp: 1560,
            },
          ],
        },
        cropCallouts: [
          {
            id: 'zg_callout_grid',
            label: 'CSS GridEngine',
            metricValue: '12-Col',
            sublabel: 'Subgrid & fluid clamp() tracks',
            badge: 'PRODUCT SPEC',
            provenance: 'product-spec',
            sourceRef: 'ZentioGrid Layout Spec v3',
            showBracket: true,
            x: 0.74,
            y: 0.78,
            width: 384,
            height: 148,
            elevationZ: 96,
            enterFrame: 14,
            accentColor: '#A855F7',
          },
        ],
        modifiers: {
          captionBar: {
            index: '02 / MULTIPLANE ARCHITECTURE',
            text: 'Visual Grid Canvas, Token System & Live TypeScript AST',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'whip-pan-brake',
          durationInFrames: 12,
        },
        debugMeta: {
          recipeId: 'camera/depth-layer-moves',
          ruleRefs: ['Q2', 'Q4', 'Q9'],
        },
        payload: {
          eyebrow: 'MULTIPLANE SPATIAL INSPECTOR',
          headline: 'Every Layer Linked From Design Token to React Component',
          surfaceTitle: 'zentiogrid build --grid=12col --tokens=css-vars --strict-tsx',
          mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
          heroIndex: 0,
          cameraDrivePx: isVertical ? 80 : 148,
          foregroundPills: ['CSS Subgrid Active', 'Design Tokens Synced', 'Zero Runtime Overhead'],
          layers: [
            {
              id: 'layer_grid',
              title: 'Visual CSS Grid Studio',
              subtitle: 'Drag-to-span 12-column tracks with live fluid clamp() sizing',
              badge: 'CORE CANVAS',
              depthPlane: 'midground',
              items: ['repeat(12, 1fr)', 'subgrid', 'auto-fit'],
              accentColor: '#A855F7',
            },
            {
              id: 'layer_tokens',
              title: 'Design System Tokens',
              subtitle: 'Bidirectional CSS variables for color, spacing, radii & type',
              badge: 'TOKEN GRAPH',
              depthPlane: 'midground',
              items: ['--space-fluid', '--surface-card', '--font-sans'],
              accentColor: '#7C3AED',
            },
            {
              id: 'layer_codegen',
              title: 'React & TypeScript Synthesis',
              subtitle: 'Deterministic AST compiler emitting clean, typed JSX components',
              badge: 'COMPILER',
              depthPlane: 'midground',
              items: ['Strict TS', 'Zero Inline Hex', 'Semantic HTML'],
              accentColor: '#22C55E',
            },
          ],
        },
      },

      // SHOT 3: Bento Cascade (cut2 -> cut3)
      {
        id: 'zg_shot_3_bento_cascade',
        startFrame: cut2,
        durationInFrames: cut3 - cut2,
        type: 'bento_cascade',
        layoutPreset: 'bento',
        stageOverride: {
          look: 'dark-precision',
          grainOpacity: 0.022,
          vignetteStrength: 0.4,
          dustParticles: false,
          gridFloor: true,
        },
        modifiers: {
          captionBar: {
            index: '03 / MODULAR SYSTEM CAPABILITIES',
            text: 'Six Integrated Tools for Frontend & Design Engineering Teams',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'portal-zoom-wipe',
          durationInFrames: 12,
        },
        debugMeta: {
          recipeId: 'ui-entrance/deck-deal-flyin',
          ruleRefs: ['R2', 'Q8', 'S2'],
        },
        payload: {
          eyebrow: 'COMPLETE FRONTEND WORKFLOW',
          headline: 'Built for Design Engineers Who Ship Real Code',
          counterLabel: '6 CORE MODULES • ZERO LOCK-IN',
          cards: [
            {
              id: 'bento_1',
              category: 'LAYOUT ENGINE',
              title: '12-Column Subgrid Lock',
              description: 'Snap nested cards and headers to shared parent tracks automatically.',
              badge: 'CSS GRID',
              accentColor: '#A855F7',
            },
            {
              id: 'bento_2',
              category: 'DESIGN TOKENS',
              title: 'Single-Source Token Sync',
              description: 'Export typed TS token maps and generated CSS custom properties together.',
              badge: 'TOKENS',
              accentColor: '#7C3AED',
            },
            {
              id: 'bento_3',
              category: 'CODE SYNTHESIS',
              title: 'Clean React + TypeScript',
              description: 'Generates human-readable components with strict props and zero bloat.',
              badge: 'TSX AST',
              accentColor: '#22C55E',
            },
            {
              id: 'bento_4',
              category: 'RESPONSIVE',
              title: 'Multi-Viewport Matrix',
              description: 'Preview desktop 16:9, tablet, and mobile 9:16 breakpoints side by side.',
              badge: 'VIEWPORTS',
              accentColor: '#7C3AED',
            },
            {
              id: 'bento_5',
              category: 'ACCESSIBILITY',
              title: 'Contrast & Safe-Area Guard',
              description: 'Built-in WCAG contrast verification and viewport margin protection.',
              badge: 'GUARDRAILS',
              accentColor: '#22C55E',
            },
            {
              id: 'bento_6',
              category: 'DEPLOYMENT',
              title: 'Instant Branch Previews',
              description: 'Push directly to Git branches or preview live URLs on every layout edit.',
              badge: 'GIT SYNC',
              accentColor: '#A855F7',
            },
          ],
        },
      },

      // SHOT 4: Crop Callout Focus Scanline (cut3 -> cut4)
      {
        id: 'zg_shot_4_crop_callout',
        startFrame: cut3,
        durationInFrames: cut4 - cut3,
        type: 'crop_callout',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'obsidian',
          grainOpacity: 0.024,
          vignetteStrength: 0.44,
          dustParticles: true,
          gridFloor: false,
        },
        modifiers: {
          captionBar: {
            index: '04 / LIVE SURFACE INSPECTION',
            text: 'Real-Time Grid Track, Token & TSX Compiler Verification',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'whip-pan-brake',
          durationInFrames: 12,
        },
        debugMeta: {
          recipeId: 'effects/scanline-annotate-focus',
          ruleRefs: ['Q11', 'S5'],
        },
        payload: {
          statusLabel: 'AST & GRID LOCK',
          windowTitle: 'ZentioGrid Studio — Live Workspace Inspector',
          headline: 'Inspect Grid Tracks, Token Bindings & TSX Output in Place',
          mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
          targets: [
            {
              id: 'scan_grid_span',
              head: 'SPAN 8 • HERO CONTAINER',
              detail: 'Responsive 12-column CSS Grid track with automatic tablet/mobile reflow',
              metricValue: '12-Col',
              provenance: 'product-spec',
              x: 0.24,
              y: 0.24,
              width: 0.28,
              height: 0.16,
            },
            {
              id: 'scan_token_vars',
              head: 'DESIGN TOKEN BINDING',
              detail: 'Zero raw hex literals — all surfaces bound to semantic CSS variables',
              metricValue: '3 Viewports',
              provenance: 'product-spec',
              x: 0.52,
              y: 0.52,
              width: 0.28,
              height: 0.16,
            },
            {
              id: 'scan_tsx_compiler',
              head: 'LIVE TSX COMPILER',
              detail: 'Outputs production-ready React components with strict TypeScript types',
              metricValue: 'Strict TSX',
              provenance: 'product-spec',
              x: 0.78,
              y: 0.76,
              width: 0.28,
              height: 0.16,
            },
          ],
        },
      },

      // SHOT 5: Whip-Pan Brake Pipeline (cut4 -> cut5)
      {
        id: 'zg_shot_5_whip_pan',
        startFrame: cut4,
        durationInFrames: cut5 - cut4,
        type: 'whip_pan',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'aurora-blur',
          grainOpacity: 0.022,
          vignetteStrength: 0.4,
          dustParticles: true,
          gridFloor: true,
        },
        modifiers: {
          captionBar: {
            index: '05 / CONTINUOUS DELIVERY',
            text: 'From Visual Grid Canvas to Git Pull Request in One Workflow',
            appearAt: 2,
          },
        },
        transitionOut: {
          type: 'flash-cut',
          durationInFrames: 8,
        },
        debugMeta: {
          recipeId: 'transition/whip-brake',
          ruleRefs: ['Q9', 'R1'],
        },
        payload: {
          eyebrow: 'END-TO-END SYSTEM PIPELINE',
          targetIndex: 3,
          direction: 'horizontal',
          panels: [
            {
              id: 'wp_1',
              category: 'STEP 01',
              title: 'Compose CSS Grid',
              description: 'Define 12-column tracks, gaps, and named areas visually.',
              badge: 'CANVAS',
            },
            {
              id: 'wp_2',
              category: 'STEP 02',
              title: 'Bind Design Tokens',
              description: 'Attach semantic color, typography, and spacing variables.',
              badge: 'TOKENS',
            },
            {
              id: 'wp_3',
              category: 'STEP 03',
              title: 'Synthesize React TSX',
              description: 'Compile clean, type-safe components with zero runtime CSS.',
              badge: 'COMPILER',
            },
            {
              id: 'wp_4',
              category: 'STEP 04',
              title: 'Ship to Production',
              description: 'Open a clean Git PR or deploy an instant branch preview.',
              badge: 'LIVE READY',
            },
          ],
        },
      },

      // SHOT 6: Brand Closing CTA (cut5 -> 480)
      {
        id: 'zg_shot_6_closing_cta',
        startFrame: cut5,
        durationInFrames: totalFrames - cut5,
        type: 'brand_closing_cta',
        layoutPreset: 'lower-third',
        stageOverride: {
          look: 'obsidian',
          grainOpacity: 0.022,
          vignetteStrength: 0.45,
          dustParticles: true,
          gridFloor: true,
        },
        cameraRecipe: {
          mode: 'dolly-push-in',
        },
        modifiers: {
          sheen: {
            enabled: true,
            startFrame: 12,
            durationInFrames: 24,
          },
          captionBar: {
            index: '06 / ZENTIOGRID.IO',
            text: 'Design Visually in CSS Grid. Ship Production React & TypeScript.',
            appearAt: 2,
          },
        },
        autoSfxEvents: [
          { id: 'closing_chime', event: 'cta-chime', frame: 8 },
        ],
        payload: {
          productName: 'ZentioGrid',
          tagline: 'Visual CSS Grid & React/TypeScript Systems Studio',
          showLogo: true,
          buttonText: 'Launch Studio Free',
        },
      },
    ],
  };

  const quantizedScenes = quantizeScenesToBeatGrid(
    rawGraph.scenes,
    beatGrid,
    totalFrames,
    fps
  );

  const candidate: SceneGraph = {
    ...rawGraph,
    scenes: quantizedScenes,
  };

  const parsed = SceneGraphSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(
      `ZentioGrid v3 SceneGraph validation failed: ${JSON.stringify(parsed.error.issues, null, 2)}`
    );
  }

  return parsed.data as SceneGraph;
}

/**
 * VIDEO 2: NovaPulse — Clinical Triage & Hospital Ward Operations Platform.
 * - Demonstrates engine versatility on a completely different product domain, aesthetic, rhythm, and asset set.
 * - Commercial Integrity Mode: 'demo-labeled' — illustrative sample metrics are explicitly registered
 *   with `provenance: 'demo-sample'` and rendered with visible `DEMO SAMPLE` badges.
 * - Rhythm: 108 BPM, Warm Light-Editorial & Studio-Light surfaces (`surfaceTheme: 'light'`), Terracotta `#FF5C35` accent.
 */
export function buildNovaPulseV3SceneGraph(options?: {
  vertical?: boolean;
}): SceneGraph {
  const fps = 30;
  const isVertical = Boolean(options?.vertical);
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;

  const beatGrid = {
    bpm: 108,
    beat0Seconds: 0,
    beatsPerBar: 4,
    outputAudioOffsetFrames: 1,
  };

  // Beat-synced shot cut boundaries at 108 BPM (1 beat = 16.67 frames)
  const cut0 = beatF(0, beatGrid, fps);
  const cut1 = beatF(6, beatGrid, fps);
  const cut2 = beatF(12, beatGrid, fps);
  const cut3 = beatF(18, beatGrid, fps);
  const cut4 = beatF(24, beatGrid, fps);
  const totalFrames = 450; // 15.0s at 30fps

  const rawGraph: SceneGraph = {
    version: '3.0',
    commercialIntegrityMode: 'demo-labeled',
    verifiedMetricsRegistry: [
      {
        value: '18 / 20',
        label: 'ICU North Bed Capacity',
        source: 'Illustrative hospital ward simulation dataset',
        provenance: 'demo-sample',
      },
      {
        value: '31 / 36',
        label: 'Step-Down Telemetry Beds',
        source: 'Illustrative hospital ward simulation dataset',
        provenance: 'demo-sample',
      },
      {
        value: '4.2 min',
        label: 'Sample Triage Routing Window',
        source: 'Illustrative hospital ward simulation dataset',
        provenance: 'demo-sample',
      },
    ],
    canvas: {
      width,
      height,
      fps,
      durationInFrames: totalFrames,
    },
    beatGrid,
    artDirection: {
      backdropVariant: 'light-editorial',
      surfaceTheme: 'light',
      primaryAccent: '#FF5C35',
      archetype: 'base44-studio',
      stage: {
        look: 'light-editorial',
        grainOpacity: 0.015,
        vignetteStrength: 0.22,
        dustParticles: false,
        gridFloor: false,
        horizon: 0.62,
        keyLight: { x: 0.48, y: 0.28 },
      },
    },
    cameraTrack: [
      { frame: 0, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
      { frame: 225, x: 0.5, y: 0.5, zoom: 1.03, easing: 'ease-in-out' },
      { frame: 450, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
    ],
    cursorTrack: [
      { frame: 0, x: 0.25, y: 0.65 },
      { frame: 95, x: 0.48, y: 0.42, controlX: 0.35, controlY: 0.3, click: true },
      { frame: 260, x: 0.66, y: 0.5, controlX: 0.58, controlY: 0.36, click: true },
      { frame: 450, x: 0.5, y: 0.7 },
    ],
    audioTrack: [
      {
        id: 'np-ambient-beat',
        frame: 0,
        asset: 'ambient-beat',
        volume: 0.4,
        fadeInFrames: 15,
        fadeOutFrames: 28,
      },
    ],
    scenes: [
      // SHOT 1: Crop Callout Scanline Inspection on Light Editorial Surface (0 -> cut1)
      {
        id: 'np_shot_1_triage_scan',
        startFrame: cut0,
        durationInFrames: cut1 - cut0,
        type: 'crop_callout',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'light-editorial',
          grainOpacity: 0.014,
          vignetteStrength: 0.18,
          dustParticles: false,
          gridFloor: false,
        },
        modifiers: {
          captionBar: {
            index: '01 / NOVAPULSE CLINICAL OPS',
            text: 'Real-Time Ward Capacity & Acuity Triage Coordination (Demo Dataset)',
            appearAt: 2,
          },
        },
        transitionOut: {
          type: 'whip-pan-brake',
          durationInFrames: 12,
        },
        payload: {
          statusLabel: 'WARD TELEMETRY DEMO',
          windowTitle: 'NovaPulse Command Center — Multi-Wing Bed & Triage Matrix',
          headline: 'Coordinate Admissions, Bed Turnover & Shift Handoffs in One View',
          mediaUrl: 'demo-assets/novapulse-clinical-capture.svg',
          targets: [
            {
              id: 'np_target_icu',
              head: 'ICU NORTH CAPACITY',
              detail: '2 rapid-response beds available with cardiac telemetry ready',
              metricValue: '18 / 20',
              provenance: 'demo-sample',
              x: 0.25,
              y: 0.24,
              width: 0.28,
              height: 0.16,
            },
            {
              id: 'np_target_stepdown',
              head: 'STEP-DOWN TELEMETRY',
              detail: '5 scheduled discharges synced with environmental services',
              metricValue: '31 / 36',
              provenance: 'demo-sample',
              x: 0.54,
              y: 0.52,
              width: 0.28,
              height: 0.16,
            },
            {
              id: 'np_target_routing',
              head: 'TRIAGE ROUTING WINDOW',
              detail: 'Automated SBAR handoff packet sent to receiving charge nurse',
              metricValue: '4.2 min',
              provenance: 'demo-sample',
              x: 0.78,
              y: 0.76,
              width: 0.28,
              height: 0.16,
            },
          ],
        },
      },

      // SHOT 2: Bento Cascade on Studio Light Surface (cut1 -> cut2)
      {
        id: 'np_shot_2_bento_workflows',
        startFrame: cut1,
        durationInFrames: cut2 - cut1,
        type: 'bento_cascade',
        layoutPreset: 'bento',
        stageOverride: {
          look: 'studio-light',
          grainOpacity: 0.014,
          vignetteStrength: 0.2,
          dustParticles: false,
          gridFloor: false,
        },
        modifiers: {
          captionBar: {
            index: '02 / CLINICAL WORKFLOW MODULES',
            text: 'Designed for Charge Nurses, Bed Coordinators & Care Teams',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'portal-zoom-wipe',
          durationInFrames: 12,
        },
        payload: {
          eyebrow: 'CARE COORDINATION SUITE',
          headline: 'Every Handoff Tracked From Triage Intake to Discharge',
          counterLabel: '4 CLINICAL MODULES • DEMO',
          cards: [
            {
              id: 'np_bento_1',
              category: 'INTAKE ROUTING',
              title: 'Acuity-Matched Bed Assignment',
              description: 'Matches incoming patients to telemetry-equipped rooms and nurse ratios.',
              badge: 'TRIAGE',
              accentColor: '#FF5C35',
            },
            {
              id: 'np_bento_2',
              category: 'SHIFT HANDOFF',
              title: 'Structured SBAR Checklists',
              description: 'Keeps labs, imaging, and escalation notes attached during shift changes.',
              badge: 'HANDOFF',
              accentColor: '#5E6AD2',
            },
            {
              id: 'np_bento_3',
              category: 'ANCILLARY SYNC',
              title: 'Pharmacy & Lab Readiness',
              description: 'Surfaces pending medication verifications before transport is dispatched.',
              badge: 'CLINICAL',
              accentColor: '#22C55E',
            },
            {
              id: 'np_bento_4',
              category: 'BED TURNOVER',
              title: 'Environmental Services Queue',
              description: 'Notifies sanitation teams the moment discharge orders are finalized.',
              badge: 'TURNOVER',
              accentColor: '#FF5C35',
            },
          ],
        },
      },

      // SHOT 3: Exploded 2.5D UI + Demo-Labeled Metric Callouts (cut2 -> cut3)
      {
        id: 'np_shot_3_exploded_25d',
        startFrame: cut2,
        durationInFrames: cut3 - cut2,
        type: 'exploded_25d_ui',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'light-editorial',
          grainOpacity: 0.015,
          vignetteStrength: 0.22,
          dustParticles: false,
          gridFloor: false,
        },
        cameraRecipe: {
          mode: 'page-cam-2.5d',
          keys: [
            {
              frame: 0,
              cx: width / 2,
              cy: height / 2,
              zoom: 1.03,
              rotX: 8,
              rotY: 10,
              rotZ: 0.5,
              persp: 1520,
            },
            {
              frame: 60,
              cx: width / 2,
              cy: height / 2,
              zoom: 1.12,
              rotX: 4,
              rotY: 3,
              rotZ: 0,
              persp: 1560,
            },
            {
              frame: 100,
              cx: width / 2,
              cy: height / 2,
              zoom: 1.06,
              rotX: 2,
              rotY: 0,
              rotZ: 0,
              persp: 1600,
            },
          ],
        },
        cropCallouts: [
          {
            id: 'np_callout_triage',
            label: 'Sample Triage Routing Window',
            metricValue: '4.2 min',
            sublabel: 'Simulated SBAR handoff latency',
            provenance: 'demo-sample',
            sourceRef: 'Illustrative hospital ward simulation dataset',
            showBracket: true,
            x: 0.74,
            y: 0.78,
            width: 390,
            height: 150,
            elevationZ: 88,
            enterFrame: 14,
            accentColor: '#5E6AD2',
          },
        ],
        modifiers: {
          captionBar: {
            index: '03 / TRANSPARENT DEMO METRICS',
            text: 'Sample Operational Telemetry Clearly Labeled as Illustrative Demo Data',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'whip-pan-brake',
          durationInFrames: 12,
        },
        payload: {
          eyebrow: 'MULTI-WING COMMAND BOARD',
          headline: 'Unified Visibility Across Triage, Nursing & Ancillary Teams',
          surfaceTitle: 'novapulse.ward-filter --wing=east-icu --acuity=priority-1',
          mediaUrl: 'demo-assets/novapulse-clinical-capture.svg',
          heroIndex: 0,
          cameraDrivePx: isVertical ? 76 : 136,
          foregroundPills: ['SBAR Packet Ready', 'Pharmacy Verified', 'Demo Dataset Mode'],
          layers: [
            {
              id: 'np_layer_1',
              title: 'Cardiac & ICU Telemetry Board',
              subtitle: 'Real-time bed readiness and acuity staffing balance across wings',
              badge: 'WARD MATRIX',
              depthPlane: 'midground',
              items: ['ICU North', 'Step-Down', 'Recovery'],
              accentColor: '#FF5C35',
            },
            {
              id: 'np_layer_2',
              title: 'Nurse Shift Handoff Queue',
              subtitle: 'Structured SBAR notes with lab and medication sign-off tracking',
              badge: 'SHIFT SYNC',
              depthPlane: 'midground',
              items: ['SBAR Checklist', 'Lab Alerts', 'Escalation Path'],
              accentColor: '#5E6AD2',
            },
            {
              id: 'np_layer_3',
              title: 'Discharge & Turnover Coordinator',
              subtitle: 'Automated bed cleaning dispatch and transport queue updates',
              badge: 'TURNOVER',
              depthPlane: 'midground',
              items: ['Transport Ready', 'Sanitation Sync', 'Zero Bottlenecks'],
              accentColor: '#22C55E',
            },
          ],
        },
      },

      // SHOT 4: Whip-Pan Brake Care Pathway (cut3 -> cut4)
      {
        id: 'np_shot_4_whip_pan',
        startFrame: cut3,
        durationInFrames: cut4 - cut3,
        type: 'whip_pan',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'studio-light',
          grainOpacity: 0.014,
          vignetteStrength: 0.2,
          dustParticles: false,
          gridFloor: false,
        },
        modifiers: {
          captionBar: {
            index: '04 / PATIENT FLOW PATHWAY',
            text: 'Four Coordinated Stages From Emergency Intake to Safe Discharge',
            appearAt: 2,
          },
        },
        transitionOut: {
          type: 'flash-cut',
          durationInFrames: 8,
        },
        payload: {
          eyebrow: 'COORDINATED CARE PATHWAY',
          targetIndex: 2,
          direction: 'horizontal',
          panels: [
            {
              id: 'np_wp_1',
              category: 'STAGE 01',
              title: 'Emergency Triage Intake',
              description: 'Capture acuity level, vitals, and required telemetry equipment.',
              badge: 'INTAKE',
            },
            {
              id: 'np_wp_2',
              category: 'STAGE 02',
              title: 'Smart Bed Allocation',
              description: 'Assign optimal ward bed and notify receiving charge nurse.',
              badge: 'ASSIGNED',
            },
            {
              id: 'np_wp_3',
              category: 'STAGE 03',
              title: 'SBAR Shift Handoff',
              description: 'Synchronize care plan, labs, and pharmacy across nursing shifts.',
              badge: 'ACTIVE LOCK',
            },
            {
              id: 'np_wp_4',
              category: 'STAGE 04',
              title: 'Rapid Bed Turnover',
              description: 'Coordinate discharge clearance and environmental readiness.',
              badge: 'TURNOVER',
            },
          ],
        },
      },

      // SHOT 5: Brand Closing CTA (cut4 -> 450)
      {
        id: 'np_shot_5_closing_cta',
        startFrame: cut4,
        durationInFrames: totalFrames - cut4,
        type: 'brand_closing_cta',
        layoutPreset: 'lower-third',
        stageOverride: {
          look: 'light-editorial',
          grainOpacity: 0.014,
          vignetteStrength: 0.2,
          dustParticles: false,
          gridFloor: false,
        },
        cameraRecipe: {
          mode: 'dolly-push-in',
        },
        modifiers: {
          sheen: {
            enabled: true,
            startFrame: 10,
            durationInFrames: 24,
          },
          captionBar: {
            index: '05 / NOVAPULSE HEALTH',
            text: 'Calm, Coordinated Clinical Operations for Modern Care Teams',
            appearAt: 2,
          },
        },
        autoSfxEvents: [
          { id: 'np_closing_chime', event: 'cta-chime', frame: 8 },
        ],
        payload: {
          productName: 'NovaPulse',
          tagline: 'Clinical Triage & Ward Operations Platform (Demo Showcase)',
          showLogo: true,
          buttonText: 'Explore Interactive Demo',
        },
      },
    ],
  };

  const quantizedScenes = quantizeScenesToBeatGrid(
    rawGraph.scenes,
    beatGrid,
    totalFrames,
    fps
  );

  const candidate: SceneGraph = {
    ...rawGraph,
    scenes: quantizedScenes,
  };

  const parsed = SceneGraphSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(
      `NovaPulse v3 SceneGraph validation failed: ${JSON.stringify(parsed.error.issues, null, 2)}`
    );
  }

  return parsed.data as SceneGraph;
}

async function renderVideoAndStills() {
  const outDir = path.resolve(process.cwd(), 'out');
  const stillsDir = path.resolve(outDir, 'stills');
  fs.mkdirSync(stillsDir, { recursive: true });

  // 1. Build & Persist SceneGraphs (16:9 and 9:16)
  const zgGraph16x9 = buildZentioGridV3SceneGraph({ vertical: false });
  const zgGraph9x16 = buildZentioGridV3SceneGraph({ vertical: true });
  const npGraph16x9 = buildNovaPulseV3SceneGraph({ vertical: false });
  const npGraph9x16 = buildNovaPulseV3SceneGraph({ vertical: true });

  const zgAudioTimeline = buildAudioTimeline({
    audioTrack: zgGraph16x9.audioTrack,
    scenes: zgGraph16x9.scenes,
    beatGrid: zgGraph16x9.beatGrid,
    durationInFrames: zgGraph16x9.canvas.durationInFrames,
    fps: zgGraph16x9.canvas.fps,
  });

  const npAudioTimeline = buildAudioTimeline({
    audioTrack: npGraph16x9.audioTrack,
    scenes: npGraph16x9.scenes,
    beatGrid: npGraph16x9.beatGrid,
    durationInFrames: npGraph16x9.canvas.durationInFrames,
    fps: npGraph16x9.canvas.fps,
  });

  console.log(
    `[ZentioGrid v3] Validated ${zgGraph16x9.scenes.length} shots (${zgGraph16x9.canvas.durationInFrames}f @ 124 BPM), ${zgAudioTimeline.sfxCues.length} SFX cues.`
  );
  console.log(
    `[NovaPulse v3] Validated ${npGraph16x9.scenes.length} shots (${npGraph16x9.canvas.durationInFrames}f @ 108 BPM), ${npAudioTimeline.sfxCues.length} SFX cues.`
  );

  const zgPropsPath = path.resolve(outDir, 'zentiogrid-props.json');
  const npPropsPath = path.resolve(outDir, 'novapulse-props.json');
  fs.writeFileSync(zgPropsPath, JSON.stringify({ sceneGraph: zgGraph16x9 }, null, 2));
  fs.writeFileSync(npPropsPath, JSON.stringify({ sceneGraph: npGraph16x9 }, null, 2));

  // Use @remotion/bundler and @remotion/renderer programmatic API with CRF=20
  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, renderStill, selectComposition } = await import(
    '@remotion/renderer'
  );

  console.log('[Phase 2 Renderer] Bundling Remotion entry...');
  const serveUrl = await bundle({
    entryPoint: path.resolve(process.cwd(), 'remotion/index.ts'),
  });

  // Render Video 1: out/Zentiogrid.mp4 (16:9, CRF 20)
  const zgComp = await selectComposition({
    serveUrl,
    id: 'InteractiveSurfaceDemo',
    inputProps: { sceneGraph: zgGraph16x9 },
  });
  const zgOutputMp4 = path.resolve(outDir, 'Zentiogrid.mp4');
  console.log('[Phase 2 Renderer] Rendering Video 1: out/Zentiogrid.mp4 (CRF 20)...');
  await renderMedia({
    composition: zgComp,
    serveUrl,
    codec: 'h264',
    audioCodec: 'aac',
    imageFormat: 'jpeg',
    jpegQuality: 88,
    crf: 20,
    outputLocation: zgOutputMp4,
    inputProps: { sceneGraph: zgGraph16x9 },
  });
  const zgSizeMiB = (fs.statSync(zgOutputMp4).size / (1024 * 1024)).toFixed(2);
  console.log(`[Phase 2 Renderer] Completed out/Zentiogrid.mp4 (${zgSizeMiB} MiB)`);

  // Render Video 2: out/NovaPulse-Demo.mp4 (16:9, CRF 20)
  const npComp = await selectComposition({
    serveUrl,
    id: 'InteractiveSurfaceDemo',
    inputProps: { sceneGraph: npGraph16x9 },
  });
  const npOutputMp4 = path.resolve(outDir, 'NovaPulse-Demo.mp4');
  console.log('[Phase 2 Renderer] Rendering Video 2: out/NovaPulse-Demo.mp4 (CRF 20)...');
  await renderMedia({
    composition: npComp,
    serveUrl,
    codec: 'h264',
    audioCodec: 'aac',
    imageFormat: 'jpeg',
    jpegQuality: 88,
    crf: 20,
    outputLocation: npOutputMp4,
    inputProps: { sceneGraph: npGraph16x9 },
  });
  const npSizeMiB = (fs.statSync(npOutputMp4).size / (1024 * 1024)).toFixed(2);
  console.log(`[Phase 2 Renderer] Completed out/NovaPulse-Demo.mp4 (${npSizeMiB} MiB)`);

  // Render Representative Stills in 16:9 and 9:16 for visual margin/legibility audit
  const zgComp9x16 = await selectComposition({
    serveUrl,
    id: 'InteractiveSurfaceDemo',
    inputProps: { sceneGraph: zgGraph9x16 },
  });
  const npComp9x16 = await selectComposition({
    serveUrl,
    id: 'InteractiveSurfaceDemo',
    inputProps: { sceneGraph: npGraph9x16 },
  });

  const stillSpecs = [
    { comp: zgComp, graph: zgGraph16x9, frame: 18, name: 'zg-16x9-shot1-mask.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 145, name: 'zg-16x9-shot2-exploded25d.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 255, name: 'zg-16x9-shot3-bento.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 345, name: 'zg-16x9-shot4-crop-scan.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 418, name: 'zg-16x9-shot5-whip-pan.png' },
    { comp: zgComp9x16, graph: zgGraph9x16, frame: 145, name: 'zg-9x16-shot2-exploded25d.png' },
    { comp: npComp, graph: npGraph16x9, frame: 65, name: 'np-16x9-shot1-triage-scan.png' },
    { comp: npComp, graph: npGraph16x9, frame: 265, name: 'np-16x9-shot3-exploded-demo-labeled.png' },
    { comp: npComp9x16, graph: npGraph9x16, frame: 265, name: 'np-9x16-shot3-exploded-demo-labeled.png' },
  ];

  for (const s of stillSpecs) {
    await renderStill({
      composition: s.comp,
      serveUrl,
      frame: s.frame,
      imageFormat: 'png',
      output: path.resolve(stillsDir, s.name),
      inputProps: { sceneGraph: s.graph },
    });
  }
  console.log(`[Phase 2 Renderer] Rendered ${stillSpecs.length} verification stills in out/stills/`);
}

if (require.main === module) {
  renderVideoAndStills().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
