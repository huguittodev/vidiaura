import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
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

export function buildZentioGridV3SceneGraph(): SceneGraph {
  const fps = 30;
  const beatGrid = {
    bpm: 120,
    beat0Seconds: 0,
    beatsPerBar: 4,
    outputAudioOffsetFrames: 1,
  };

  // Beat-synced shot cut boundaries at 120 BPM (1 beat = 15 frames, 1 bar = 60 frames)
  const cut0 = beatF(0, beatGrid, fps); // 0
  const cut1 = beatF(6, beatGrid, fps); // 90
  const cut2 = beatF(14, beatGrid, fps); // 210
  const cut3 = beatF(20, beatGrid, fps); // 300
  const cut4 = beatF(26, beatGrid, fps); // 390
  const totalFrames = beatF(32, beatGrid, fps); // 480 (16.0s = 8 bars)

  const rawGraph: SceneGraph = {
    version: '3.0',
    canvas: {
      width: 1920,
      height: 1080,
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
        grainOpacity: 0.07,
        vignetteStrength: 0.45,
        dustParticles: true,
        gridFloor: true,
        horizon: 0.64,
        keyLight: { x: 0.5, y: 0.34 },
      },
    },
    cameraTrack: [
      { frame: 0, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
      { frame: 150, x: 0.52, y: 0.48, zoom: 1.08, easing: 'ease-in-out' },
      { frame: 320, x: 0.48, y: 0.5, zoom: 1.04, easing: 'ease-in-out' },
      { frame: 480, x: 0.5, y: 0.5, zoom: 1.0, easing: 'ease-in-out' },
    ],
    cursorTrack: [
      { frame: 0, x: 0.2, y: 0.72 },
      { frame: 115, x: 0.54, y: 0.48, controlX: 0.38, controlY: 0.32, click: true },
      { frame: 175, x: 0.74, y: 0.34, controlX: 0.66, controlY: 0.28, click: true },
      { frame: 430, x: 0.5, y: 0.68, controlX: 0.62, controlY: 0.52, click: true },
      { frame: 480, x: 0.55, y: 0.72 },
    ],
    audioTrack: [
      {
        id: 'bg-ambient-beat',
        frame: 0,
        asset: 'ambient-beat',
        volume: 0.32,
        fadeInFrames: 15,
        fadeOutFrames: 30,
      },
      {
        id: 'cursor-click-1',
        frame: 115,
        asset: 'mouse-click',
        volume: 0.78,
      },
      {
        id: 'cursor-click-2',
        frame: 175,
        asset: 'click-switch',
        volume: 0.75,
      },
    ],
    scenes: [
      {
        id: 'shot_1_hook',
        startFrame: cut0,
        durationInFrames: cut1 - cut0,
        type: 'kinetic_typography',
        layoutPreset: 'hook',
        cameraRecipe: {
          mode: 'dolly-push-in',
        },
        modifiers: {
          captionBar: {
            index: '01 / ZENTIOGRID OS',
            text: 'The Autonomous E-Commerce Operating System',
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
          { id: 'shimmer_open', event: 'sheen-shimmer', frame: 20 },
        ],
        payload: {
          words: ['Autonomous', 'Commerce', 'At', 'Global', 'Scale'],
          accentWordIndex: 0,
          staggerFrames: 5,
        },
      },
      {
        id: 'shot_2_control_plane_25d',
        startFrame: cut1,
        durationInFrames: cut2 - cut1,
        type: 'product_interaction_3d',
        layoutPreset: 'stage',
        cameraRecipe: {
          mode: 'isometric-tilt-reveal',
          keys: [
            { frame: 0, cx: 960, cy: 540, zoom: 1.08, rotX: 14, rotY: -16, rotZ: -1, persp: 1380 },
            { frame: 60, cx: 980, cy: 515, zoom: 1.24, rotX: 8, rotY: -8, rotZ: 0, persp: 1420 },
            { frame: 120, cx: 960, cy: 540, zoom: 1.15, rotX: 4, rotY: 0, rotZ: 0, persp: 1450 },
          ],
          dof: {
            focusY: 190,
            strength: 4,
          },
        },
        cropCallouts: [
          {
            id: 'callout_sync',
            label: 'Omnichannel Sync SLA',
            metricValue: '99.98%',
            sublabel: 'Zero inventory drift',
            badge: 'LIVE MESH',
            x: 0.76,
            y: 0.28,
            width: 396,
            height: 144,
            elevationZ: 115,
            enterFrame: 14,
            accentColor: '#A855F7',
          },
          {
            id: 'callout_routing',
            label: 'Order Routing Latency',
            metricValue: '14.2ms',
            sublabel: '38 global edge regions',
            badge: 'SUB-SECOND',
            x: 0.31,
            y: 0.72,
            width: 384,
            height: 140,
            elevationZ: 88,
            enterFrame: 26,
            accentColor: '#22C55E',
          },
        ],
        modifiers: {
          spotlight: {
            enabled: true,
            fromX: 0.34,
            fromY: 0.48,
            toX: 0.74,
            toY: 0.3,
            radius: 380,
            dimOpacity: 0.42,
            startFrame: 10,
            durationInFrames: 85,
          },
          sheen: {
            enabled: true,
            startFrame: 22,
            durationInFrames: 26,
          },
          captionBar: {
            index: '02 / CONTROL PLANE',
            text: '2.5D Isometric Surface + Floating Z-Axis Callouts',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'whip-pan-brake',
          durationInFrames: 12,
        },
        autoSfxEvents: [
          { id: 'spot_whoosh', event: 'spotlight-whoosh', frame: 10 },
          { id: 'callout_pop_1', event: 'ui-card-pop', frame: 14 },
          { id: 'callout_roll_2', event: 'metric-roll', frame: 26 },
        ],
        payload: {
          windowTitle: 'ZentioGrid OS — Autonomous Inventory & Demand Mesh',
          productName: 'ZentioGrid',
          tagline: 'Sub-second omnichannel synchronization',
          promptText: 'Rebalance 48,000 SKUs across EU & North America warehouses',
          buttonText: 'Execute Sync',
        },
      },
      {
        id: 'shot_3_ai_copilot',
        startFrame: cut2,
        durationInFrames: cut3 - cut2,
        type: 'conversational_mockup',
        layoutPreset: 'pair',
        cameraRecipe: {
          mode: 'page-cam-2.5d',
          keys: [
            { frame: 0, cx: 960, cy: 540, zoom: 1.04, rotX: 6, rotY: 10, rotZ: 0, persp: 1400 },
            { frame: 90, cx: 960, cy: 530, zoom: 1.14, rotX: 2, rotY: 0, rotZ: 0, persp: 1420 },
          ],
        },
        modifiers: {
          speedBlur: {
            enabled: true,
            vx: 42,
            vy: 0,
            startFrame: 0,
            durationInFrames: 12,
          },
          captionBar: {
            index: '03 / AI COPILOT',
            text: 'Predictive Demand Forecasting & Autonomous Restock',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'portal-zoom-wipe',
          durationInFrames: 12,
        },
        autoSfxEvents: [
          { id: 'msg_1', event: 'ui-card-pop', frame: 8 },
          { id: 'msg_2', event: 'ui-card-pop', frame: 24 },
        ],
        payload: {
          headline: 'Autonomous Margin & Inventory Copilot',
          messages: [
            {
              sender: 'user',
              text: 'Forecast Q4 surge for Tokyo & Berlin hubs and lock safety stock.',
              time: '09:41',
            },
            {
              sender: 'assistant',
              text: 'Predicted +38% velocity spike. Reallocated 12,400 units with zero stockouts.',
              time: '09:41',
            },
          ],
        },
      },
      {
        id: 'shot_4_verified_metrics',
        startFrame: cut3,
        durationInFrames: cut4 - cut3,
        type: 'metric_cards',
        layoutPreset: 'bento',
        cameraRecipe: {
          mode: 'orbit-drift',
        },
        cropCallouts: [
          {
            id: 'callout_gmv',
            label: 'Verified Net GMV Lift',
            metricValue: '+42.8%',
            sublabel: 'Across 1,200+ enterprise brands',
            badge: 'AUDITED',
            x: 0.78,
            y: 0.24,
            width: 390,
            height: 136,
            elevationZ: 95,
            enterFrame: 12,
            accentColor: '#7C3AED',
          },
        ],
        modifiers: {
          sheen: {
            enabled: true,
            startFrame: 18,
            durationInFrames: 24,
          },
          captionBar: {
            index: '04 / IMPACT PROOF',
            text: 'Anti-Machine-Gun Rapid-Fire Batch Entrance (Rule S2)',
            appearAt: 3,
          },
        },
        transitionOut: {
          type: 'flash-cut',
          durationInFrames: 10,
        },
        autoSfxEvents: [
          {
            id: 'metrics_burst',
            event: 'rapid-batch-tick',
            frame: 8,
            burstCount: 4,
            burstIntervalFrames: 4,
          },
        ],
        payload: {
          headline: 'Engineered for High-Velocity Commerce',
          subheadline: 'Deterministic inventory accuracy and instant storefront sync',
          metrics: [
            { value: '99.98%', label: 'Inventory Accuracy', trend: '+4.2% vs ERP', badge: 'REAL-TIME' },
            { value: '14.2ms', label: 'Omnichannel Sync', trend: '-74% Latency', badge: 'GLOBAL' },
            { value: '3.6x', label: 'Inventory Turnover', trend: 'Zero Deadstock', badge: 'AI NATIVE' },
          ],
        },
      },
      {
        id: 'shot_5_closing_cta',
        startFrame: cut4,
        durationInFrames: totalFrames - cut4,
        type: 'brand_closing_cta',
        layoutPreset: 'lower-third',
        cameraRecipe: {
          mode: 'dolly-push-in',
        },
        modifiers: {
          sheen: {
            enabled: true,
            startFrame: 18,
            durationInFrames: 28,
          },
          captionBar: {
            index: '05 / GET STARTED',
            text: 'Deploy Your Autonomous Grid in 60 Seconds',
            appearAt: 3,
          },
        },
        autoSfxEvents: [
          { id: 'cta_chime', event: 'cta-chime', frame: 12 },
        ],
        payload: {
          productName: 'ZentioGrid',
          tagline: 'The Autonomous E-Commerce Operating System',
          showLogo: true,
          buttonText: 'Deploy Your Grid Free',
        },
      },
    ],
  };

  rawGraph.scenes = quantizeScenesToBeatGrid(
    rawGraph.scenes,
    beatGrid,
    totalFrames,
    fps
  );

  return SceneGraphSchema.parse(rawGraph);
}

async function run() {
  console.log('--- GENERATING & RENDERING ZENTIOGRID SCENEGRAPH V3 (5-LAYER SHOTCRAFT ENGINE) ---');

  const validated = buildZentioGridV3SceneGraph();
  const timeline = buildAudioTimeline({
    audioTrack: validated.audioTrack,
    scenes: validated.scenes,
    beatGrid: validated.beatGrid,
    durationInFrames: validated.canvas.durationInFrames,
    fps: validated.canvas.fps,
  });

  console.log('SceneGraph Version:', validated.version);
  console.log(
    'BeatGrid:',
    `${validated.beatGrid?.bpm} BPM, ${validated.canvas.durationInFrames} frames (${
      validated.canvas.durationInFrames / validated.canvas.fps
    }s)`
  );
  console.log(
    'Scenes sequence:',
    validated.scenes.map(
      (s) =>
        `${s.id} [${s.type}] (${s.startFrame}..${s.startFrame + s.durationInFrames}f, cam=${
          s.cameraRecipe?.mode ?? 'track'
        }, callouts=${s.cropCallouts?.length ?? 0}, trans=${
          s.transitionOut?.type ?? 'none'
        })`
    )
  );
  console.log(
    'Total Scheduled Audio Cues (Music + Declarative + Auto-SFX):',
    timeline.cues.length
  );

  const propsPath = path.resolve('out/zentiogrid-props.json');
  fs.mkdirSync(path.dirname(propsPath), { recursive: true });
  fs.writeFileSync(propsPath, JSON.stringify({ sceneGraph: validated }, null, 2));
  console.log('Wrote v3 props to:', propsPath);

  const outputPath = path.resolve('out/Zentiogrid.mp4');
  console.log(`Rendering Remotion MP4 video to ${outputPath}...`);
  const remotionBin = fs.existsSync('./node_modules/.bin/remotion')
    ? './node_modules/.bin/remotion'
    : 'npx remotion';
  const cmd = `${remotionBin} render remotion/index.ts InteractiveSurfaceDemo ${outputPath} --props=${propsPath} --overwrite`;
  console.log('Executing:', cmd);
  execSync(cmd, { stdio: 'inherit' });

  const stats = fs.statSync(outputPath);
  console.log(
    `\nRender complete! File size: ${(stats.size / (1024 * 1024)).toFixed(
      2
    )} MB at ${outputPath}`
  );
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve('scripts/generate-and-render-zentiogrid.ts');

if (isMain) {
  run().catch((err) => {
    console.error('Fatal error during generation or render:', err);
    process.exit(1);
  });
}
