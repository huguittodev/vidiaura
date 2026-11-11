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
 * PHASE 2 BATCH 1 BUILDER (Preserved for 100% Backward Compatibility):
 * ZentioGrid — 5 Batch 1 Shotcraft atoms + Brand Closing CTA.
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

  const cut0 = beatF(0, beatGrid, fps);
  const cut1 = beatF(6, beatGrid, fps);
  const cut2 = beatF(13, beatGrid, fps);
  const cut3 = beatF(19, beatGrid, fps);
  const cut4 = beatF(25, beatGrid, fps);
  const cut5 = beatF(29, beatGrid, fps);
  const totalFrames = 480;

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
    cursorTrack: [],
    audioTrack: [
      {
        id: 'bg-ambient-beat',
        frame: 0,
        asset: 'ambient-beat',
        volume: 0.48,
        fadeInFrames: 12,
        fadeOutFrames: 28,
      },
    ],
    scenes: [
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
        cameraRecipe: { mode: 'dolly-push-in' },
        modifiers: {
          captionBar: {
            index: '01 / ZENTIOGRID STUDIO',
            text: 'Visual CSS Grid & Design-to-React Systems Builder',
            appearAt: 2,
          },
          sheen: { enabled: true, startFrame: 24, durationInFrames: 24 },
        },
        transitionOut: { type: 'flash-cut', durationInFrames: 10 },
        debugMeta: { recipeId: 'opening/text-as-mask', ruleRefs: ['R1', 'Q2', 'Q11'] },
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
        cameraRecipe: { mode: 'isometric-tilt-reveal' },
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
        transitionOut: { type: 'whip-pan-brake', durationInFrames: 12 },
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
        transitionOut: { type: 'portal-zoom-wipe', durationInFrames: 12 },
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
        transitionOut: { type: 'whip-pan-brake', durationInFrames: 12 },
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
        transitionOut: { type: 'flash-cut', durationInFrames: 8 },
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
        cameraRecipe: { mode: 'dolly-push-in' },
        modifiers: {
          sheen: { enabled: true, startFrame: 12, durationInFrames: 24 },
          captionBar: {
            index: '06 / ZENTIOGRID.IO',
            text: 'Design Visually in CSS Grid. Ship Production React & TypeScript.',
            appearAt: 2,
          },
        },
        autoSfxEvents: [{ id: 'closing_chime', event: 'cta-chime', frame: 8 }],
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
  const parsed = SceneGraphSchema.safeParse({ ...rawGraph, scenes: quantizedScenes });
  if (!parsed.success) {
    throw new Error(
      `ZentioGrid v3 SceneGraph validation failed: ${JSON.stringify(parsed.error.issues, null, 2)}`
    );
  }
  return parsed.data as SceneGraph;
}

/**
 * PHASE 2 BATCH 1 BUILDER (Preserved for 100% Backward Compatibility, standardized to 480 frames):
 * NovaPulse — Clinical Triage & Hospital Ward Operations Platform.
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

  const cut0 = beatF(0, beatGrid, fps);
  const cut1 = beatF(6, beatGrid, fps);
  const cut2 = beatF(12, beatGrid, fps);
  const cut3 = beatF(18, beatGrid, fps);
  const cut4 = beatF(24, beatGrid, fps);
  const totalFrames = 480; // Standardized to 480 frames (16.00s at 30fps)

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
      { frame: 240, x: 0.5, y: 0.5, zoom: 1.03, easing: 'ease-in-out' },
      { frame: 480, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
    ],
    cursorTrack: [],
    audioTrack: [
      {
        id: 'np-ambient-beat',
        frame: 0,
        asset: 'ambient-beat',
        volume: 0.48,
        fadeInFrames: 15,
        fadeOutFrames: 28,
      },
    ],
    scenes: [
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
        transitionOut: { type: 'whip-pan-brake', durationInFrames: 12 },
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
        transitionOut: { type: 'portal-zoom-wipe', durationInFrames: 12 },
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
        cameraRecipe: { mode: 'page-cam-2.5d' },
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
        transitionOut: { type: 'whip-pan-brake', durationInFrames: 12 },
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
        transitionOut: { type: 'flash-cut', durationInFrames: 8 },
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
        cameraRecipe: { mode: 'dolly-push-in' },
        modifiers: {
          sheen: { enabled: true, startFrame: 10, durationInFrames: 24 },
          captionBar: {
            index: '05 / NOVAPULSE HEALTH',
            text: 'Calm, Coordinated Clinical Operations for Modern Care Teams',
            appearAt: 2,
          },
        },
        autoSfxEvents: [{ id: 'np_closing_chime', event: 'cta-chime', frame: 8 }],
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
  const parsed = SceneGraphSchema.safeParse({ ...rawGraph, scenes: quantizedScenes });
  if (!parsed.success) {
    throw new Error(
      `NovaPulse v3 SceneGraph validation failed: ${JSON.stringify(parsed.error.issues, null, 2)}`
    );
  }
  return parsed.data as SceneGraph;
}

/**
 * PHASE 2 BATCH 2 DEMO 1:
 * ZentioGrid — Combines Batch 2 + Batch 1 Shotcraft atoms (`lead_word_assemble`, `type_and_filter`,
 * `steep_tilt_glide`, `chart_live_moves`, `portal_zoom_hub`, `brand_closing_cta`).
 * - Strict commercial integrity mode, 124 BPM, Dark Obsidian / Aurora / Dark-Precision multi-stage look.
 * - Root `cursorTrack: []` so no stray mouse cursor floats over non-interactive shots,
 *   while `type_and_filter` renders its own purposeful scene-scoped interactive cursor.
 */
export function buildZentioGridBatch2SceneGraph(options?: {
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

  const cut0 = beatF(0, beatGrid, fps);
  const cut1 = beatF(6, beatGrid, fps);
  const cut2 = beatF(12, beatGrid, fps);
  const cut3 = beatF(18, beatGrid, fps);
  const cut4 = beatF(24, beatGrid, fps);
  const cut5 = beatF(29, beatGrid, fps);
  const totalFrames = 480;

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
        grainOpacity: 0.024,
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
    cursorTrack: [],
    audioTrack: [
      {
        id: 'bg-ambient-beat',
        frame: 0,
        asset: 'ambient-beat',
        volume: 0.48,
        fadeInFrames: 12,
        fadeOutFrames: 28,
      },
    ],
    scenes: [
      // SHOT 1: Lead Word Zoom Assemble + Pill Slot Cycle (0 -> cut1)
      {
        id: 'zg_b2_shot_1_lead_word',
        startFrame: cut0,
        durationInFrames: cut1 - cut0,
        type: 'lead_word_assemble',
        layoutPreset: 'hook',
        stageOverride: {
          look: 'obsidian',
          grainOpacity: 0.024,
          vignetteStrength: 0.45,
          dustParticles: true,
          gridFloor: true,
        },
        cameraRecipe: { mode: 'crash-zoom-punch' },
        modifiers: {
          captionBar: {
            index: '01 / ZENTIOGRID STUDIO',
            text: 'Kinetic Lead-Word Opener & Rotating Capability Slot Reel',
            appearAt: 2,
          },
          sheen: { enabled: true, startFrame: 22, durationInFrames: 24 },
        },
        transitionOut: { type: 'flash-cut', durationInFrames: 8 },
        debugMeta: {
          recipeId: 'typography/lead-word-zoom-assemble',
          ruleRefs: ['R1', 'Q2', 'Q11'],
        },
        payload: {
          eyebrow: 'VISUAL WEB SYSTEMS STUDIO',
          leadWord: 'ZENTIO',
          trailingWords: ['builds', 'responsive', 'React', 'systems'],
          highlightWord: 'React',
          subheadline: 'Compose 12-column CSS grids visually and compile strict TypeScript components.',
          cyclingPills: [
            '12-COL CSS SUBGRID',
            'DESIGN TOKEN GRAPH',
            'STRICT REACT TSX',
            'MULTI-VIEWPORT MATRIX',
          ],
          crashZoomOut: true,
        },
      },

      // SHOT 2: Type-and-Filter Interactive Search + Grid Reflow + Cursor Flyover (cut1 -> cut2)
      {
        id: 'zg_b2_shot_2_type_filter',
        startFrame: cut1,
        durationInFrames: cut2 - cut1,
        type: 'type_and_filter',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'dark-precision',
          grainOpacity: 0.022,
          vignetteStrength: 0.38,
          dustParticles: false,
          gridFloor: true,
        },
        modifiers: {
          captionBar: {
            index: '02 / COMMAND PALETTE',
            text: 'Human-Paced Search Typing, Live Grid Reflow & Purposeful Cursor Selection',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'card-flip-reveal', durationInFrames: 12 },
        debugMeta: {
          recipeId: 'interaction/type-and-filter',
          ruleRefs: ['R2', 'Q11', 'S2'],
        },
        payload: {
          eyebrow: 'INSTANT COMPONENT & TOKEN SEARCH',
          headline: 'Filter Layout Primitives & Token Bindings in Real Time',
          searchPlaceholder: 'Search grid modules, subgrid tracks, or TSX compilers...',
          searchQuery: 'subgrid token',
          targetCardId: 'zg_card_subgrid',
          mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
          cards: [
            {
              id: 'zg_card_subgrid',
              category: 'CSS GRID ENGINE',
              title: '12-Col Subgrid Token Lock',
              subtitle: 'Binds nested card tracks directly to parent CSS Grid & design token variables.',
              badge: 'MATCHED',
              mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
              accentColor: '#A855F7',
            },
            {
              id: 'zg_card_tokens',
              category: 'TOKEN COMPILER',
              title: 'Semantic Subgrid Token Sync',
              subtitle: 'Generates zero-runtime CSS custom properties and typed TS token maps.',
              badge: 'TOKENS',
              accentColor: '#7C3AED',
            },
            {
              id: 'zg_card_tsx',
              category: 'CODE SYNTHESIS',
              title: 'Strict React TSX Emitter',
              subtitle: 'Compiles visual grid spans into clean, human-readable React components.',
              badge: 'COMPILER',
              accentColor: '#22C55E',
            },
            {
              id: 'zg_card_viewports',
              category: 'RESPONSIVE MATRIX',
              title: '3-Viewport Breakpoint Inspector',
              subtitle: 'Preview 16:9 desktop, tablet, and 9:16 mobile layouts simultaneously.',
              badge: 'VIEWPORTS',
              accentColor: '#5E6AD2',
            },
            {
              id: 'zg_card_a11y',
              category: 'GUARDRAILS',
              title: 'Safe-Area & Contrast Verifier',
              subtitle: 'Enforces WCAG contrast ratios and viewport margin budgets automatically.',
              badge: 'WCAG AA',
              accentColor: '#22C55E',
            },
            {
              id: 'zg_card_git',
              category: 'DEPLOYMENT',
              title: 'Git Pull Request Sync',
              subtitle: 'Commits generated TSX and token diffs directly to feature branches.',
              badge: 'GIT SYNC',
              accentColor: '#A855F7',
            },
          ],
        },
      },

      // SHOT 3: Steep-Tilt Oblique 3D Table-Top Glide + FloatWrap Widgets (cut2 -> cut3)
      {
        id: 'zg_b2_shot_3_steep_glide',
        startFrame: cut2,
        durationInFrames: cut3 - cut2,
        type: 'steep_tilt_glide',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'aurora-blur',
          grainOpacity: 0.024,
          vignetteStrength: 0.4,
          dustParticles: true,
          gridFloor: false,
        },
        cameraRecipe: { mode: 'steep-tilt-glide' },
        cropCallouts: [
          {
            id: 'zg_glide_callout',
            label: 'CSS Grid Engine',
            metricValue: '12-Col',
            sublabel: 'Docked in peripheral safe zone — zero UI occlusion',
            badge: 'PRODUCT SPEC',
            provenance: 'product-spec',
            sourceRef: 'ZentioGrid Layout Spec v3',
            showBracket: true,
            x: 0.5,
            y: 0.48,
            width: 376,
            height: 144,
            elevationZ: 88,
            enterFrame: 14,
            accentColor: '#A855F7',
          },
        ],
        modifiers: {
          captionBar: {
            index: '03 / 3D TABLE-TOP GLIDE',
            text: 'Steep-Angle Perspective Glide With Zero-Phase FloatWrap Telemetry Cards',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'whip-pan-brake', durationInFrames: 12 },
        debugMeta: {
          recipeId: 'camera/steep-tilt-glide',
          ruleRefs: ['Q2', 'Q9', 'Q11'],
        },
        payload: {
          eyebrow: 'SPATIAL CANVAS TRAVERSAL',
          headline: 'Glide Across Complex Grid Systems Without Losing Crisp Typography',
          subheadline: 'CSS zoom layout scaling keeps every label razor-sharp under 3D perspective.',
          surfaceTitle: 'zentiogrid.canvas --grid=12col --tokens=strict',
          mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
          tiltAngleDeg: 42,
          glideDistancePx: isVertical ? 210 : 280,
          widgets: [
            {
              id: 'zg_w1',
              category: 'TRACK SOLVER',
              title: 'repeat(12, minmax(0, 1fr))',
              detail: 'Fluid gap & subgrid alignment across nested containers',
              badge: '12-COL',
              accentColor: '#A855F7',
            },
            {
              id: 'zg_w2',
              category: 'TOKEN GRAPH',
              title: 'Zero Raw Hex Literals',
              detail: 'Every surface color and radius bound to design tokens',
              badge: 'STRICT TOKENS',
              accentColor: '#7C3AED',
            },
            {
              id: 'zg_w3',
              category: 'AST OUTPUT',
              title: 'Typed React Components',
              detail: 'Deterministic JSX + TypeScript interfaces ready for production',
              badge: 'STRICT TSX',
              accentColor: '#22C55E',
            },
          ],
        },
      },

      // SHOT 4: Chart Live Moves — Oscilloscope Telemetry & Provenance Readouts (cut3 -> cut4)
      {
        id: 'zg_b2_shot_4_chart_live',
        startFrame: cut3,
        durationInFrames: cut4 - cut3,
        type: 'chart_live_moves',
        layoutPreset: 'split',
        stageOverride: {
          look: 'obsidian',
          grainOpacity: 0.024,
          vignetteStrength: 0.44,
          dustParticles: true,
          gridFloor: true,
        },
        modifiers: {
          captionBar: {
            index: '04 / COMPILER TELEMETRY',
            text: 'Live Dual-Trace Waveform With Verified Product-Spec Parameters',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'iris-portal-wipe', durationInFrames: 12 },
        debugMeta: {
          recipeId: 'data/chart-live-moves',
          ruleRefs: ['Q11', 'S5'],
        },
        payload: {
          eyebrow: 'VERIFIED ARCHITECTURE SPECS',
          headline: 'Deterministic Layout Compilation Across Every Viewport',
          primaryMetricValue: '12-Col',
          primaryMetricUnit: 'CSS GRID',
          primaryMetricLabel: 'CSS Grid Engine • Subgrid & Fluid Tracks',
          provenance: 'product-spec',
          burstTagLabel: 'AST COMPILER VERIFIED',
          mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
          seriesSeed: 17,
          secondaryReadouts: [
            {
              label: 'Responsive Breakpoints',
              value: '3 Viewports',
              unit: '16:9 / 9:16',
              provenance: 'product-spec',
            },
            {
              label: 'Code Synthesis Target',
              value: 'Strict TSX',
              unit: 'ZERO RUNTIME',
              provenance: 'product-spec',
            },
          ],
        },
      },

      // SHOT 5: Portal Zoom Hub — Card Expansion into Radial Architecture Map (cut4 -> cut5)
      {
        id: 'zg_b2_shot_5_portal_hub',
        startFrame: cut4,
        durationInFrames: cut5 - cut4,
        type: 'portal_zoom_hub',
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
            index: '05 / ECOSYSTEM CONDUIT HUB',
            text: 'Portal Zoom Expansion From Workspace Card to Radial System Map',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'flash-cut', durationInFrames: 8 },
        debugMeta: {
          recipeId: 'transition/portal-wipe-hub',
          ruleRefs: ['R2', 'Q9', 'S2'],
        },
        payload: {
          eyebrow: 'CONNECTED FRONTEND PIPELINE',
          workspaceTitle: 'ZentioGrid Studio — System Architecture',
          portalCardTitle: 'ZENTIO CORE',
          hubHeadline: 'One Visual Grid Graph Feeding Your Entire Codebase',
          hubSubheadline: 'Portal transition into connected design token, compiler, and Git nodes.',
          mediaUrl: 'demo-assets/zentiogrid-studio-capture.svg',
          nodes: [
            {
              id: 'zg_hub_1',
              label: '12-Col Grid Canvas',
              detail: 'Interactive drag-to-span tracks',
              iconKind: 'capture',
              accentColor: '#A855F7',
            },
            {
              id: 'zg_hub_2',
              label: 'Design Token Graph',
              detail: 'CSS custom properties & TS map',
              iconKind: 'recipe',
              accentColor: '#7C3AED',
            },
            {
              id: 'zg_hub_3',
              label: 'Strict TSX Compiler',
              detail: 'Clean React component output',
              iconKind: 'code',
              accentColor: '#22C55E',
            },
            {
              id: 'zg_hub_4',
              label: '3-Viewport Matrix',
              detail: 'Desktop, Tablet & Mobile sync',
              iconKind: 'capture',
              accentColor: '#5E6AD2',
            },
            {
              id: 'zg_hub_5',
              label: 'Git Branch Sync',
              detail: 'Instant PR & preview deploy',
              iconKind: 'code',
              accentColor: '#A855F7',
            },
          ],
        },
      },

      // SHOT 6: Brand Closing CTA (cut5 -> 480)
      {
        id: 'zg_b2_shot_6_closing_cta',
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
        cameraRecipe: { mode: 'dolly-push-in' },
        modifiers: {
          sheen: { enabled: true, startFrame: 12, durationInFrames: 24 },
          captionBar: {
            index: '06 / ZENTIOGRID.IO',
            text: 'Design Visually in CSS Grid. Ship Production React & TypeScript.',
            appearAt: 2,
          },
        },
        autoSfxEvents: [{ id: 'closing_chime', event: 'cta-chime', frame: 8 }],
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
  const parsed = SceneGraphSchema.safeParse({ ...rawGraph, scenes: quantizedScenes });
  if (!parsed.success) {
    throw new Error(
      `ZentioGrid Batch 2 SceneGraph validation failed: ${JSON.stringify(parsed.error.issues, null, 2)}`
    );
  }
  return parsed.data as SceneGraph;
}

/**
 * PHASE 2 BATCH 2 DEMO 2 (Real Un-Tailored Raster PNG Showcase):
 * NovaPulse / AIFL Operations Workbench — Uses real raster PNG captures with diverse aspect ratios:
 * - `demo-assets/real-captures/aifl-projects-full.png` (3840x3492, aspect 1.10:1 tall capture)
 * - `demo-assets/real-captures/aifl-detail-full.png` (3840x2344, aspect 1.64:1)
 * - `demo-assets/real-captures/aifl-wbr-full.png` (3840x2160, aspect 1.78:1)
 * - `demo-assets/real-captures/workbench-overview.png` (1728x1080, aspect 1.60:1)
 * - `demo-assets/real-captures/workbench-inspector.png` (320x647, aspect 0.49:1 vertical sidebar)
 * - Exact 480 frames (16.00s at 30fps), 108 BPM, Warm Light-Editorial & Studio-Light surfaces.
 */
export function buildNovaPulseRealPngSceneGraph(options?: {
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

  const cut0 = beatF(0, beatGrid, fps);
  const cut1 = beatF(5, beatGrid, fps);
  const cut2 = beatF(10, beatGrid, fps);
  const cut3 = beatF(15, beatGrid, fps);
  const cut4 = beatF(20, beatGrid, fps);
  const cut5 = beatF(25, beatGrid, fps);
  const totalFrames = 480;

  const rawGraph: SceneGraph = {
    version: '3.0',
    commercialIntegrityMode: 'demo-labeled',
    verifiedMetricsRegistry: [
      {
        value: '18 / 20',
        label: 'Active Pipeline Lanes',
        source: 'Illustrative operations workbench simulation dataset',
        provenance: 'demo-sample',
      },
      {
        value: '31 / 36',
        label: 'Weekly WBR Sync Nodes',
        source: 'Illustrative operations workbench simulation dataset',
        provenance: 'demo-sample',
      },
      {
        value: '4.2 min',
        label: 'Sample Review Turnaround',
        source: 'Illustrative operations workbench simulation dataset',
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
      { frame: 240, x: 0.5, y: 0.5, zoom: 1.03, easing: 'ease-in-out' },
      { frame: 480, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
    ],
    cursorTrack: [],
    audioTrack: [
      {
        id: 'np-ambient-beat',
        frame: 0,
        asset: 'ambient-beat',
        volume: 0.48,
        fadeInFrames: 15,
        fadeOutFrames: 28,
      },
    ],
    scenes: [
      // SHOT 1: Non-Occluding Crop Callout Inspection on Real Tall PNG (3840x3492, 1.10:1)
      {
        id: 'np_b2_shot_1_real_png_crop',
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
            index: '01 / REAL PNG (3840×3492)',
            text: 'Non-Occluding Split Dock + Adaptive Contain Framing on Tall Capture',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'card-flip-reveal', durationInFrames: 12 },
        payload: {
          statusLabel: 'REAL RASTER PNG • 1.10:1',
          windowTitle: 'NovaPulse Workbench — Real Un-Tailored Project Directory Capture',
          headline: 'Inspect Arbitrary Aspect-Ratio Captures Without Cropping or Occlusion',
          mediaUrl: 'demo-assets/real-captures/aifl-projects-full.png',
          targets: [
            {
              id: 'np_target_lanes',
              head: 'ACTIVE PIPELINE LANES',
              detail: 'Transparent reticle marks the table header while card docks on the right rail',
              metricValue: '18 / 20',
              provenance: 'demo-sample',
              x: 0.28,
              y: 0.26,
              width: 0.26,
              height: 0.16,
            },
            {
              id: 'np_target_wbr',
              head: 'WEEKLY WBR SYNC NODES',
              detail: 'Full 3840×3492 screenshot preserved via AdaptiveMediaSurface contain framing',
              metricValue: '31 / 36',
              provenance: 'demo-sample',
              x: 0.54,
              y: 0.52,
              width: 0.28,
              height: 0.16,
            },
            {
              id: 'np_target_turnaround',
              head: 'SAMPLE REVIEW WINDOW',
              detail: 'Explicitly badged as DEMO SAMPLE under commercialIntegrityMode',
              metricValue: '4.2 min',
              provenance: 'demo-sample',
              x: 0.74,
              y: 0.76,
              width: 0.26,
              height: 0.16,
            },
          ],
        },
      },

      // SHOT 2: Type-and-Filter with Real PNG Captures + Purposeful Cursor Flyover
      {
        id: 'np_b2_shot_2_type_filter',
        startFrame: cut1,
        durationInFrames: cut2 - cut1,
        type: 'type_and_filter',
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
            index: '02 / WORKSPACE FILTERING',
            text: 'Search Typing, Grid Reflow & Cursor Click Across Real PNG Screenshots',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'whip-pan-brake', durationInFrames: 12 },
        payload: {
          eyebrow: 'OPERATIONS COMMAND SEARCH',
          headline: 'Locate Any Project Board, WBR Deck, or Inspector View Instantly',
          searchPlaceholder: 'Filter real captures by board, WBR, or inspector...',
          searchQuery: 'wbr telemetry',
          targetCardId: 'np_filter_wbr',
          mediaUrl: 'demo-assets/real-captures/aifl-wbr-full.png',
          cards: [
            {
              id: 'np_filter_wbr',
              category: 'WBR TELEMETRY • 3840×2160',
              title: 'Weekly WBR Telemetry Deck',
              subtitle: 'Real high-DPI raster capture adapted automatically inside card slot.',
              badge: 'SELECTED',
              mediaUrl: 'demo-assets/real-captures/aifl-wbr-full.png',
              accentColor: '#FF5C35',
            },
            {
              id: 'np_filter_detail',
              category: 'DETAIL VIEW • 3840×2344',
              title: 'WBR Telemetry Detail Drilldown',
              subtitle: '1.64:1 desktop capture framed with blurred ambient backdrop fill.',
              badge: 'MATCHED',
              mediaUrl: 'demo-assets/real-captures/aifl-detail-full.png',
              accentColor: '#5E6AD2',
            },
            {
              id: 'np_filter_projects',
              category: 'DIRECTORY • 3840×3492',
              title: 'Full-Page Project Matrix',
              subtitle: 'Tall 1.10:1 capture scaled without cutting off top navigation or footer.',
              badge: 'CAPTURE',
              mediaUrl: 'demo-assets/real-captures/aifl-projects-full.png',
              accentColor: '#22C55E',
            },
            {
              id: 'np_filter_workbench',
              category: 'WORKBENCH • 1728×1080',
              title: 'Timeline & Canvas Overview',
              subtitle: '16:10 dark studio capture rendered inside light-editorial card shell.',
              badge: 'STUDIO',
              mediaUrl: 'demo-assets/real-captures/workbench-overview.png',
              accentColor: '#FF5C35',
            },
            {
              id: 'np_filter_inspector',
              category: 'SIDEBAR • 320×647',
              title: 'Vertical Property Inspector',
              subtitle: 'Narrow 0.49:1 sidebar PNG centered cleanly with ambient glass fill.',
              badge: 'PANEL',
              mediaUrl: 'demo-assets/real-captures/workbench-inspector.png',
              accentColor: '#5E6AD2',
            },
            {
              id: 'np_filter_clinical',
              category: 'TRIAGE BOARD',
              title: 'Multi-Wing Ward Matrix',
              subtitle: 'Synchronized shift handoff and acuity routing overview.',
              badge: 'SYNCED',
              mediaUrl: 'demo-assets/novapulse-clinical-capture.svg',
              accentColor: '#22C55E',
            },
          ],
        },
      },

      // SHOT 3: Steep-Tilt Glide on Real PNG (3840x2344) + Sidebar PNG (320x647)
      {
        id: 'np_b2_shot_3_steep_glide',
        startFrame: cut2,
        durationInFrames: cut3 - cut2,
        type: 'steep_tilt_glide',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'light-editorial',
          grainOpacity: 0.015,
          vignetteStrength: 0.22,
          dustParticles: false,
          gridFloor: false,
        },
        cameraRecipe: { mode: 'steep-tilt-glide' },
        cropCallouts: [
          {
            id: 'np_callout_triage',
            label: 'Sample Review Turnaround',
            metricValue: '4.2 min',
            sublabel: 'Peripheral dock avoids central UI focal zone',
            provenance: 'demo-sample',
            sourceRef: 'Illustrative operations workbench simulation dataset',
            showBracket: true,
            x: 0.5,
            y: 0.5,
            width: 384,
            height: 146,
            elevationZ: 88,
            enterFrame: 12,
            accentColor: '#5E6AD2',
          },
        ],
        modifiers: {
          captionBar: {
            index: '03 / 3D GLIDE ON REAL PNG',
            text: 'Oblique Camera Glide Over 3840×2344 & 320×647 Captures + Peripheral Callout',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'iris-portal-wipe', durationInFrames: 12 },
        payload: {
          eyebrow: 'MULTI-RESOLUTION CAPTURE GLIDE',
          headline: 'Combine Wide Desktop & Narrow Sidebar PNGs in One 3D Plane',
          subheadline: 'Both 1.64:1 and 0.49:1 captures preserve 100% of their UI chrome.',
          surfaceTitle: 'novapulse.inspect --source=aifl-detail-full.png --aspect=1.64',
          mediaUrl: 'demo-assets/real-captures/aifl-detail-full.png',
          secondaryMediaUrl: 'demo-assets/real-captures/workbench-inspector.png',
          tiltAngleDeg: 40,
          glideDistancePx: isVertical ? 200 : 260,
          widgets: [
            {
              id: 'np_w1',
              category: 'ASPECT 1.64:1',
              title: '3840×2344 Detail Capture',
              detail: 'Zero header or sidebar clipping under oblique 3D camera tilt',
              badge: 'REAL PNG',
              accentColor: '#FF5C35',
            },
            {
              id: 'np_w2',
              category: 'ASPECT 0.49:1',
              title: '320×647 Inspector Rail',
              detail: 'Portrait sidebar capture paired cleanly beside primary canvas',
              badge: 'PORTRAIT PNG',
              accentColor: '#5E6AD2',
            },
            {
              id: 'np_w3',
              category: 'DEMO INTEGRITY',
              title: 'Labeled Sample Metrics',
              detail: 'All illustrative figures carry visible DEMO SAMPLE provenance badges',
              badge: 'DEMO SAMPLE',
              accentColor: '#22C55E',
            },
          ],
        },
      },

      // SHOT 4: Chart Live Moves — Live Telemetry Stream + Demo-Labeled Readouts
      {
        id: 'np_b2_shot_4_chart_live',
        startFrame: cut3,
        durationInFrames: cut4 - cut3,
        type: 'chart_live_moves',
        layoutPreset: 'split',
        stageOverride: {
          look: 'studio-light',
          grainOpacity: 0.014,
          vignetteStrength: 0.2,
          dustParticles: false,
          gridFloor: false,
        },
        modifiers: {
          captionBar: {
            index: '04 / TELEMETRY & PROVENANCE',
            text: 'Real-Time Oscilloscope Stream With Explicit DEMO SAMPLE Provenance',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'portal-zoom-wipe', durationInFrames: 12 },
        payload: {
          eyebrow: 'ILLUSTRATIVE TELEMETRY STREAM',
          headline: 'Track Weekly WBR Cadence & Review Turnaround Live',
          primaryMetricValue: '4.2 min',
          primaryMetricUnit: 'TURNAROUND',
          primaryMetricLabel: 'Sample Review Turnaround • Illustrative Dataset',
          provenance: 'demo-sample',
          burstTagLabel: 'DEMO SAMPLE STREAM',
          mediaUrl: 'demo-assets/real-captures/aifl-wbr-full.png',
          seriesSeed: 42,
          secondaryReadouts: [
            {
              label: 'Active Pipeline Lanes',
              value: '18 / 20',
              unit: 'DEMO SAMPLE',
              provenance: 'demo-sample',
            },
            {
              label: 'Weekly WBR Sync Nodes',
              value: '31 / 36',
              unit: 'DEMO SAMPLE',
              provenance: 'demo-sample',
            },
          ],
        },
      },

      // SHOT 5: Portal Zoom Hub — Real Workbench PNG Expanding into Operations Hub
      {
        id: 'np_b2_shot_5_portal_hub',
        startFrame: cut4,
        durationInFrames: cut5 - cut4,
        type: 'portal_zoom_hub',
        layoutPreset: 'stage',
        stageOverride: {
          look: 'light-editorial',
          grainOpacity: 0.014,
          vignetteStrength: 0.2,
          dustParticles: false,
          gridFloor: false,
        },
        modifiers: {
          captionBar: {
            index: '05 / PORTAL OPERATIONS HUB',
            text: 'Expanding Real 1728×1080 Workbench Capture Into Connected Workflow Nodes',
            appearAt: 2,
          },
        },
        transitionOut: { type: 'flash-cut', durationInFrames: 8 },
        payload: {
          eyebrow: 'UNIFIED OPERATIONS TOPOLOGY',
          workspaceTitle: 'NovaPulse Workbench — 1728×1080 Real Capture',
          portalCardTitle: 'NOVAPULSE HUB',
          hubHeadline: 'Connect Every Capture, Metric & Review Stream in One Hub',
          hubSubheadline: 'Portal transition from real workbench screenshot into radial ecosystem map.',
          mediaUrl: 'demo-assets/real-captures/workbench-overview.png',
          nodes: [
            {
              id: 'np_hub_1',
              label: 'Project Directory',
              detail: '3840×3492 full-page capture',
              iconKind: 'capture',
              accentColor: '#FF5C35',
            },
            {
              id: 'np_hub_2',
              label: 'Detail Drilldown',
              detail: '3840×2344 view inspection',
              iconKind: 'recipe',
              accentColor: '#5E6AD2',
            },
            {
              id: 'np_hub_3',
              label: 'WBR Telemetry Deck',
              detail: '3840×2160 live metrics',
              iconKind: 'code',
              accentColor: '#22C55E',
            },
            {
              id: 'np_hub_4',
              label: 'Timeline Workbench',
              detail: '1728×1080 studio canvas',
              iconKind: 'music',
              accentColor: '#FF5C35',
            },
            {
              id: 'np_hub_5',
              label: 'Inspector Sidebar',
              detail: '320×647 portrait panel',
              iconKind: 'sfx',
              accentColor: '#5E6AD2',
            },
          ],
        },
      },

      // SHOT 6: Brand Closing CTA (cut5 -> 480)
      {
        id: 'np_b2_shot_6_closing_cta',
        startFrame: cut5,
        durationInFrames: totalFrames - cut5,
        type: 'brand_closing_cta',
        layoutPreset: 'lower-third',
        stageOverride: {
          look: 'light-editorial',
          grainOpacity: 0.014,
          vignetteStrength: 0.2,
          dustParticles: false,
          gridFloor: false,
        },
        cameraRecipe: { mode: 'dolly-push-in' },
        modifiers: {
          sheen: { enabled: true, startFrame: 10, durationInFrames: 24 },
          captionBar: {
            index: '06 / NOVAPULSE OPERATIONS',
            text: 'Adaptive Motion Graphics for Any Real Product Screenshot (480 Frames)',
            appearAt: 2,
          },
        },
        autoSfxEvents: [{ id: 'np_closing_chime', event: 'cta-chime', frame: 8 }],
        payload: {
          productName: 'NovaPulse',
          tagline: 'Operations & Telemetry Workbench (Real PNG Demo Showcase)',
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
  const parsed = SceneGraphSchema.safeParse({ ...rawGraph, scenes: quantizedScenes });
  if (!parsed.success) {
    throw new Error(
      `NovaPulse Real PNG Batch 2 SceneGraph validation failed: ${JSON.stringify(parsed.error.issues, null, 2)}`
    );
  }
  return parsed.data as SceneGraph;
}

async function renderVideoAndStills() {
  const outDir = path.resolve(process.cwd(), 'out');
  const stillsDir = path.resolve(outDir, 'stills');
  fs.mkdirSync(stillsDir, { recursive: true });

  // Build & Persist Batch 2 SceneGraphs (16:9 and 9:16)
  const zgGraph16x9 = buildZentioGridBatch2SceneGraph({ vertical: false });
  const zgGraph9x16 = buildZentioGridBatch2SceneGraph({ vertical: true });
  const npGraph16x9 = buildNovaPulseRealPngSceneGraph({ vertical: false });
  const npGraph9x16 = buildNovaPulseRealPngSceneGraph({ vertical: true });

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
    `[ZentioGrid Batch 2] Validated ${zgGraph16x9.scenes.length} shots (${zgGraph16x9.canvas.durationInFrames}f @ 124 BPM), ${zgAudioTimeline.sfxCues.length} SFX cues.`
  );
  console.log(
    `[NovaPulse Real PNG Batch 2] Validated ${npGraph16x9.scenes.length} shots (${npGraph16x9.canvas.durationInFrames}f @ 108 BPM), ${npAudioTimeline.sfxCues.length} SFX cues.`
  );

  const zgPropsPath = path.resolve(outDir, 'zentiogrid-props.json');
  const npPropsPath = path.resolve(outDir, 'novapulse-props.json');
  fs.writeFileSync(zgPropsPath, JSON.stringify({ sceneGraph: zgGraph16x9 }, null, 2));
  fs.writeFileSync(npPropsPath, JSON.stringify({ sceneGraph: npGraph16x9 }, null, 2));

  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, renderStill, selectComposition } = await import(
    '@remotion/renderer'
  );

  console.log('[Phase 2 Batch 2 Renderer] Bundling Remotion entry...');
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
  console.log('[Phase 2 Batch 2 Renderer] Rendering Video 1: out/Zentiogrid.mp4 (CRF 20)...');
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
  console.log(`[Phase 2 Batch 2 Renderer] Completed out/Zentiogrid.mp4 (${zgSizeMiB} MiB)`);

  // Render Video 2: out/NovaPulse-Demo.mp4 (16:9, CRF 20)
  const npComp = await selectComposition({
    serveUrl,
    id: 'InteractiveSurfaceDemo',
    inputProps: { sceneGraph: npGraph16x9 },
  });
  const npOutputMp4 = path.resolve(outDir, 'NovaPulse-Demo.mp4');
  console.log('[Phase 2 Batch 2 Renderer] Rendering Video 2: out/NovaPulse-Demo.mp4 (CRF 20)...');
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
  console.log(`[Phase 2 Batch 2 Renderer] Completed out/NovaPulse-Demo.mp4 (${npSizeMiB} MiB)`);

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
    // ZentioGrid (16:9 & 9:16) — Batch 2 atoms
    { comp: zgComp, graph: zgGraph16x9, frame: 36, name: 'zg-b2-16x9-shot1-lead-word.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 145, name: 'zg-b2-16x9-shot2-type-filter.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 220, name: 'zg-b2-16x9-shot3-steep-glide.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 310, name: 'zg-b2-16x9-shot4-chart-live.png' },
    { comp: zgComp, graph: zgGraph16x9, frame: 395, name: 'zg-b2-16x9-shot5-portal-hub.png' },
    { comp: zgComp9x16, graph: zgGraph9x16, frame: 145, name: 'zg-b2-9x16-shot2-type-filter.png' },
    { comp: zgComp9x16, graph: zgGraph9x16, frame: 395, name: 'zg-b2-9x16-shot5-portal-hub.png' },
    // NovaPulse Real PNG Captures (16:9 & 9:16)
    { comp: npComp, graph: npGraph16x9, frame: 55, name: 'np-b2-16x9-shot1-real-png-crop-dock.png' },
    { comp: npComp, graph: npGraph16x9, frame: 140, name: 'np-b2-16x9-shot2-real-png-type-filter.png' },
    { comp: npComp, graph: npGraph16x9, frame: 215, name: 'np-b2-16x9-shot3-real-png-steep-glide.png' },
    { comp: npComp, graph: npGraph16x9, frame: 295, name: 'np-b2-16x9-shot4-real-png-chart-live.png' },
    { comp: npComp, graph: npGraph16x9, frame: 385, name: 'np-b2-16x9-shot5-real-png-portal-hub.png' },
    { comp: npComp9x16, graph: npGraph9x16, frame: 55, name: 'np-b2-9x16-shot1-real-png-crop-dock.png' },
    { comp: npComp9x16, graph: npGraph9x16, frame: 215, name: 'np-b2-9x16-shot3-real-png-steep-glide.png' },
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
  console.log(`[Phase 2 Batch 2 Renderer] Rendered ${stillSpecs.length} verification stills in out/stills/`);
}

if (require.main === module) {
  renderVideoAndStills().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
