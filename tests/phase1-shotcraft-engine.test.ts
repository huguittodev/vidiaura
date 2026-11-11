/**
 * tests/phase1-shotcraft-engine.test.ts
 *
 * Automated verification suite for Phase 1:
 * 1. SceneGraph v3 5-Layer Schema & v2.0 Backward Compatibility + Rule R4 Slam Cap
 * 2. Layer 2: PageCam25D Layout-Scale CSS `zoom` Math (Rule Q2) & Rule Q11 Effective Font Height
 * 3. Layer 5: BeatGrid Musical Quantization (`beatF`, `barF`, `snapFrameToBeat`, `quantizeScenesToBeatGrid`)
 * 4. Layer 5: Auto-SFX (`sfxFrom` Rule S5 Dual Offset + `scheduleRapidFireBurst` Rule S2 Step-Down + `compileSceneAutoSfx`)
 * 5. Layer 1 & 4: Polish Primitives Determinism (`bezier`, `EASE`, `ramp`, `softShadow`, 6-tile `Grain` cache)
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SceneGraphSchema } from '../src/lib/scene-graph/schema';
import type { SceneGraph } from '../src/lib/scene-graph/types';
import {
  barF,
  beatF,
  buildAudioTimeline,
  compileSceneAutoSfx,
   computeEffectiveFontPx,
  computePageCam25DTransform,
  deterministicHash,
  EASE,
  getGrainTileDataUri,
  isFontReadableOn1080p,
  quantizeScenesToBeatGrid,
  ramp,
  RAPID_FIRE_VOLUME_LADDER,
  scheduleRapidFireBurst,
  sfxFrom,
  snapFrameToBeat,
  softLimitGain,
  softShadow,
  velocity,
} from '../remotion/motion-kit';

const baseV3SceneGraph: SceneGraph = {
  version: '3.0',
  canvas: {
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 480,
  },
  beatGrid: {
    bpm: 120,
    beat0Seconds: 0,
    beatsPerBar: 4,
    outputAudioOffsetFrames: 1,
  },
  artDirection: {
    backdropVariant: 'dark-precision',
    surfaceTheme: 'dark',
    primaryAccent: '#7C3AED',
    archetype: 'linear-dark',
    stage: {
      look: 'obsidian',
      grainOpacity: 0.07,
      vignetteStrength: 0.45,
      dustParticles: true,
      gridFloor: true,
      horizon: 0.64,
      keyLight: { x: 0.5, y: 0.32 },
    },
  },
  cameraTrack: [
    { frame: 0, x: 0.5, y: 0.5, zoom: 1.0 },
    { frame: 480, x: 0.5, y: 0.5, zoom: 1.05 },
  ],
  cursorTrack: [
    { frame: 0, x: 0.25, y: 0.65 },
    { frame: 150, x: 0.52, y: 0.48, click: true },
    { frame: 480, x: 0.75, y: 0.55 },
  ],
  audioTrack: [
    {
      id: 'bg-music',
      frame: 0,
      asset: 'ambient-beat',
      volume: 0.3,
      fadeInFrames: 15,
      fadeOutFrames: 30,
    },
  ],
  scenes: [
    {
      id: 'shot_1_hook',
      startFrame: 0,
      durationInFrames: 90,
      type: 'kinetic_typography',
      layoutPreset: 'hook',
      cameraRecipe: {
        mode: 'dolly-push-in',
      },
      modifiers: {
        captionBar: {
          index: '01 / HOOK',
          text: 'ZentioGrid Autonomous Cloud Mesh',
          appearAt: 2,
        },
        sheen: {
          enabled: true,
          startFrame: 18,
          durationInFrames: 24,
        },
      },
      transitionOut: {
        type: 'flash-cut',
        durationInFrames: 10,
      },
      autoSfxEvents: [
        { id: 'slam_open', event: 'hero-slam', frame: 4 },
        { id: 'shimmer_1', event: 'sheen-shimmer', frame: 20 },
      ],
      payload: {
        words: ['Orchestrate', 'Every', 'Edge', 'Cluster', 'Instantly'],
        accentWordIndex: 0,
        staggerFrames: 5,
      },
    },
    {
      id: 'shot_2_product_25d',
      startFrame: 90,
      durationInFrames: 150,
      type: 'product_interaction_3d',
      layoutPreset: 'stage',
      cameraRecipe: {
        mode: 'isometric-tilt-reveal',
        keys: [
          { frame: 0, cx: 960, cy: 540, zoom: 1.08, rotX: 14, rotY: -16, rotZ: -1, persp: 1380 },
          { frame: 75, cx: 980, cy: 520, zoom: 1.24, rotX: 8, rotY: -8, rotZ: 0, persp: 1420 },
          { frame: 150, cx: 960, cy: 540, zoom: 1.16, rotX: 4, rotY: 0, rotZ: 0, persp: 1450 },
        ],
        dof: {
          focusY: 220,
          strength: 4,
        },
      },
      cropCallouts: [
        {
          id: 'callout_latency',
          label: 'Global P99 Latency',
          metricValue: '12.4ms',
          sublabel: '-68% vs legacy',
          badge: 'LIVE SLA',
          x: 0.76,
          y: 0.3,
          width: 390,
          height: 144,
          elevationZ: 110,
          enterFrame: 16,
          accentColor: '#A855F7',
        },
        {
          id: 'callout_nodes',
          label: 'Active Edge Nodes',
          metricValue: '4,096',
          sublabel: 'Auto-healing mesh',
          badge: 'SYNCED',
          x: 0.24,
          y: 0.72,
          width: 370,
          height: 138,
          elevationZ: 85,
          enterFrame: 28,
          accentColor: '#22C55E',
        },
      ],
      modifiers: {
        spotlight: {
          enabled: true,
          fromX: 0.35,
          fromY: 0.45,
          toX: 0.72,
          toY: 0.34,
          radius: 380,
          dimOpacity: 0.44,
          startFrame: 12,
          durationInFrames: 95,
        },
        sheen: {
          enabled: true,
          startFrame: 24,
          durationInFrames: 26,
        },
        captionBar: {
          index: '02 / TELEMETRY',
          text: '2.5D Isometric Surface + Z-Axis Callout Cutouts',
          appearAt: 4,
        },
      },
      transitionOut: {
        type: 'whip-pan-brake',
        durationInFrames: 12,
      },
      autoSfxEvents: [
        { id: 'spot_sweep', event: 'spotlight-whoosh', frame: 12 },
        { id: 'callout_1', event: 'ui-card-pop', frame: 16 },
        { id: 'callout_2', event: 'metric-roll', frame: 28 },
      ],
      payload: {
        windowTitle: 'ZentioGrid Control Plane — Multi-Region Fleet',
        productName: 'ZentioGrid',
        tagline: 'Zero-drift edge orchestration',
        promptText: 'Scale EU-Central & US-East to 4,096 nodes with zero downtime',
        buttonText: 'Deploy Mesh',
      },
    },
    {
      id: 'shot_3_metrics_batch',
      startFrame: 240,
      durationInFrames: 120,
      type: 'metric_cards',
      layoutPreset: 'bento',
      cameraRecipe: {
        mode: 'orbit-drift',
      },
      modifiers: {
        speedBlur: {
          enabled: true,
          vx: 36,
          vy: 0,
          startFrame: 0,
          durationInFrames: 14,
        },
        captionBar: {
          index: '03 / PROOF',
          text: 'Verified Production Throughput at Scale',
          appearAt: 4,
        },
      },
      transitionOut: {
        type: 'portal-zoom-wipe',
        durationInFrames: 12,
      },
      autoSfxEvents: [
        {
          id: 'cards_burst',
          event: 'rapid-batch-tick',
          frame: 8,
          burstCount: 4,
          burstIntervalFrames: 4,
        },
      ],
      payload: {
        headline: 'Built for Hyper-Scale Workloads',
        subheadline: 'Real-time telemetry across 38 global availability zones',
        metrics: [
          { value: '99.99%', label: 'Mesh Uptime SLA', trend: '+0.09% YoY', badge: 'ENTERPRISE' },
          { value: '12.4ms', label: 'Global P99 Routing', trend: '-68% Latency', badge: 'EDGE' },
          { value: '10.8x', label: 'Deploy Velocity', trend: 'Zero-config CI', badge: 'TURBO' },
        ],
      },
    },
    {
      id: 'shot_4_closing_cta',
      startFrame: 360,
      durationInFrames: 120,
      type: 'brand_closing_cta',
      layoutPreset: 'lower-third',
      cameraRecipe: {
        mode: 'dolly-push-in',
      },
      modifiers: {
        sheen: {
          enabled: true,
          startFrame: 22,
          durationInFrames: 28,
        },
        captionBar: {
          index: '04 / LAUNCH',
          text: 'Start Deploying on ZentioGrid Today',
          appearAt: 4,
        },
      },
      autoSfxEvents: [
        { id: 'closing_chime', event: 'cta-chime', frame: 14 },
      ],
      payload: {
        productName: 'ZentioGrid',
        tagline: 'Autonomous Cloud Mesh for Modern Engineering Teams',
        showLogo: true,
        buttonText: 'Start Free at zentiogrid.io',
      },
    },
  ],
};

describe('Phase 1: Shotcraft Atomic 5-Layer Engine, BeatGrid & Auto-SFX', () => {
  describe('1. SceneGraph v3 Schema & v2.0 Backward Compatibility', () => {
    it('1.1 validates a complete 5-layer SceneGraph v3.0 payload', () => {
      const parsed = SceneGraphSchema.safeParse(baseV3SceneGraph);
      assert.equal(parsed.success, true, parsed.success ? '' : JSON.stringify(parsed.error.issues));
    });

    it('1.2 preserves 100% backward compatibility with SceneGraph v2.0 payloads', () => {
      const v2Payload = {
        ...baseV3SceneGraph,
        version: '2.0' as const,
        beatGrid: undefined,
        artDirection: {
          backdropVariant: 'dark-precision' as const,
          surfaceTheme: 'dark' as const,
          primaryAccent: '#7C3AED',
        },
        scenes: [
          {
            id: 'legacy_scene',
            startFrame: 0,
            durationInFrames: 480,
            type: 'kinetic_typography' as const,
            payload: {
              words: ['Legacy', 'Compatible'],
            },
          },
        ],
      };
      const parsed = SceneGraphSchema.safeParse(v2Payload);
      assert.equal(parsed.success, true);
    });

    it('1.3 enforces Shotcraft Rule R4: rejects SceneGraph with > 3 full-frame beat slams', () => {
      const excessiveSlamsGraph: SceneGraph = {
        ...baseV3SceneGraph,
        scenes: [
          {
            ...baseV3SceneGraph.scenes[0],
            transitionOut: { type: 'flash-cut', durationInFrames: 8 },
            autoSfxEvents: [
              { id: 's1', event: 'hero-slam', frame: 5 },
              { id: 's2', event: 'hero-slam', frame: 20 },
              { id: 's3', event: 'hero-slam', frame: 40 },
            ],
          },
        ],
      };
      const parsed = SceneGraphSchema.safeParse(excessiveSlamsGraph);
      assert.equal(parsed.success, false, 'Must reject > 3 full-frame beat slams (Rule R4)');
    });
  });

  describe('2. Layer 2: PageCam25D Layout-Scale CSS zoom Math (Rule Q2) & Rule Q11 Font Height', () => {
    it('2.1 proves exact focal centering (cx + tx) * zoom === width/2 across zooms and 3D tilts', () => {
      const keys = [
        { frame: 0, cx: 640, cy: 360, zoom: 1.0, rotX: 14, rotY: -18, rotZ: -2, persp: 1400 },
        { frame: 60, cx: 1280, cy: 720, zoom: 2.25, rotX: 6, rotY: 12, rotZ: 1, persp: 1400 },
      ];
      for (let f = 0; f <= 60; f += 5) {
        const res = computePageCam25DTransform(keys, f, { width: 1920, height: 1080 });
        assert.equal(res.has3D, true);
        const screenCenterX = (res.cx + res.tx) * res.zoom;
        const screenCenterY = (res.cy + res.ty) * res.zoom;
        assert.ok(Math.abs(screenCenterX - 960) < 1e-6, `Expected 960, got ${screenCenterX}`);
        assert.ok(Math.abs(screenCenterY - 540) < 1e-6, `Expected 540, got ${screenCenterY}`);
        assert.ok(!res.cssTransform.includes('scale('), '3D mode must use layout-scale CSS zoom, not scale()');
      }
    });

    it('2.2 verifies Rule Q11 effective on-screen pixel height under 3D perspective compression', () => {
      const captionEff = computeEffectiveFontPx({
        fontSizePx: 64,
        parentScale: 1,
        cameraZoom: 1,
        rotYDeg: 18,
      });
      assert.ok(captionEff >= 56, `Caption effective height ${captionEff}px must be >= 56px`);
      assert.equal(isFontReadableOn1080p(captionEff, 'caption'), true);

      const secondaryEff = computeEffectiveFontPx({
        fontSizePx: 32,
        parentScale: 1,
        cameraZoom: 1.15,
        rotYDeg: 16,
      });
      assert.ok(secondaryEff >= 32, `Secondary effective height ${secondaryEff}px must be >= 32px`);
      assert.equal(isFontReadableOn1080p(secondaryEff, 'secondary'), true);
      assert.equal(isFontReadableOn1080p(24, 'secondary'), false);
    });
  });

  describe('3. Layer 5: BeatGrid Musical Quantization', () => {
    it('3.1 computes exact beatF and barF frame numbers at 120 BPM (30 FPS)', () => {
      const cfg = { bpm: 120, beat0Seconds: 0, beatsPerBar: 4 };
      // At 120 BPM, 1 beat = 0.5s = 15 frames at 30fps; 1 bar (4 beats) = 60 frames
      assert.equal(beatF(0, cfg, 30), 0);
      assert.equal(beatF(1, cfg, 30), 15);
      assert.equal(beatF(2, cfg, 30), 30);
      assert.equal(beatF(4, cfg, 30), 60);
      assert.equal(barF(1, cfg, 30), 60);
      assert.equal(barF(2, cfg, 30), 120);
    });

    it('3.2 snaps arbitrary frames to nearest beat and quantizes scene cuts cleanly', () => {
      const cfg = { bpm: 120, beat0Seconds: 0, beatsPerBar: 4 };
      const snap = snapFrameToBeat(88, cfg, 30);
      assert.equal(snap.frame, 90);
      assert.equal(snap.beatIndex, 6);
      assert.equal(snap.deltaFrames, 2);

      const quantized = quantizeScenesToBeatGrid(baseV3SceneGraph.scenes, cfg, 480, 30);
      assert.equal(quantized.length, 4);
      assert.equal(quantized[0].startFrame, 0);
      const totalDur = quantized.reduce((acc, s) => acc + s.durationInFrames, 0);
      assert.equal(totalDur, 480);
    });
  });

  describe('4. Layer 5: Auto-SFX, Rule S5 sfxFrom Offset & Rule S2 Anti-Machine-Gun Burst', () => {
    it('4.1 applies Rule S5 dual audio offset compensation in sfxFrom', () => {
      // transition-whoosh-heavy has samplePeakLagFrames = 4
      const start = sfxFrom(90, 'transition-whoosh-heavy', 1);
      assert.equal(start, 85);
      // Clamps to 0 when targetPeakFrame < lag
      assert.equal(sfxFrom(2, 'sound-riser', 2), 0);
    });

    it('4.2 schedules rapid-fire bursts with sample alternation and volume step-down (0.40 -> 0.25)', () => {
      const burst = scheduleRapidFireBurst({
        startFrame: 100,
        count: 6,
        intervalFrames: 3,
      });
      assert.equal(burst.length, 6);
      assert.equal(burst[0].volume, RAPID_FIRE_VOLUME_LADDER[0]); // 0.40
      assert.equal(burst[1].volume, RAPID_FIRE_VOLUME_LADDER[1]); // 0.34
      assert.equal(burst[2].volume, RAPID_FIRE_VOLUME_LADDER[2]); // 0.29
      assert.equal(burst[3].volume, RAPID_FIRE_VOLUME_LADDER[3]); // 0.25
      assert.equal(burst[4].volume, 0.25);

      for (let i = 1; i < burst.length; i++) {
        assert.notEqual(
          burst[i].asset,
          burst[i - 1].asset,
          'Rule S2: consecutive rapid-fire hits must never repeat the same sample'
        );
      }
    });

    it('4.3 compiles v3 scene autoSfxEvents and seam transitions into bounded AudioTimeline (<= 0.95)', () => {
      const autoCues = compileSceneAutoSfx({
        scenes: baseV3SceneGraph.scenes,
        beatGrid: baseV3SceneGraph.beatGrid,
        durationInFrames: 480,
      });
      assert.ok(autoCues.length >= 10, `Expected >= 10 compiled Auto-SFX cues, got ${autoCues.length}`);

      const timeline = buildAudioTimeline({
        audioTrack: baseV3SceneGraph.audioTrack,
        scenes: baseV3SceneGraph.scenes,
        beatGrid: baseV3SceneGraph.beatGrid,
        durationInFrames: 480,
        fps: 30,
      });
      assert.ok(timeline.sfxCues.length >= 10);

      for (let f = 0; f < 480; f++) {
        const active = timeline.cues.filter((c) => f >= c.startFrame && f < c.endFrame);
        const rawSum = active.reduce((acc, c) => acc + c.volume, 0);
        const { limitedGain } = softLimitGain(rawSum);
        assert.ok(limitedGain <= 0.95 + 1e-6, `Frame ${f} exceeded 0.95 ceiling: ${limitedGain}`);
      }
    });
  });

  describe('5. Layer 1 & 4: Polish Primitives Determinism & 6-Tile Grain Cache', () => {
    it('5.1 evaluates bezier, ramp, velocity, softShadow, and 6-tile SVG grain deterministically', () => {
      assert.equal(ramp(0, 10, 20, EASE.snappy), 0);
      assert.equal(ramp(30, 10, 20, EASE.snappy), 1);
      const mid = ramp(20, 10, 20, EASE.snappy);
      assert.ok(mid > 0.5 && mid < 1.0);

      const v = velocity((f) => f * 12, 10);
      assert.ok(Math.abs(v - 12) < 1e-6);

      const h1 = deterministicHash(42);
      const h2 = deterministicHash(42);
      assert.equal(h1, h2, 'deterministicHash must be bit-identical across calls');

      const shadow = softShadow(24);
      assert.ok(shadow.includes('rgba('));

      const tile0A = getGrainTileDataUri(0);
      const tile0B = getGrainTileDataUri(6); // 6 % 6 === 0 -> cache hit
      assert.equal(tile0A, tile0B);
    });
  });
});

