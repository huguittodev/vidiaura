/**
 * tests/phase2-batch2-shotcraft.test.ts
 *
 * Automated verification suite for Phase 2 (Batch 2):
 * - Part A (Pre-Batch 2 Audit Fixes):
 *   1. Non-occluding peripheral callout docking (`avoidFocalZone`) & stray cursor elimination.
 *   2. Audio presence optimization (transient-windowed ducking & quadrature peak limiter).
 *   3. 480-frame (16.00s @ 30fps) standardization across ZentioGrid and NovaPulse demos.
 *   4. Real un-tailored raster PNG adaptation (`public/demo-assets/real-captures/*.png` across 5 aspect ratios).
 * - Part B (Shotcraft Top 25 — Atoms 6–10):
 *   `lead_word_assemble`, `chart_live_moves`, `type_and_filter`, `steep_tilt_glide`, `portal_zoom_hub`,
 *   plus new camera modes (`steep-tilt-glide`, `crash-zoom-punch`), new seam transitions
 *   (`card-flip-reveal`, `iris-portal-wipe`), and Auto-SFX compilation in 16:9 and 9:16.
 */

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import { SceneGraphSchema } from '../src/lib/scene-graph/schema';
import { resolveSceneLayout } from '../src/lib/scene-graph/layout';
import {
  buildAudioTimeline,
  buildDefaultRecipeKeys,
  calculateDuckingFactor,
  compileSceneAutoSfx,
  computePageCam25DTransform,
  resolveCalloutPositions,
  softLimitGain,
} from '../remotion/motion-kit';
import {
  buildNovaPulseRealPngSceneGraph,
  buildNovaPulseV3SceneGraph,
  buildZentioGridBatch2SceneGraph,
  buildZentioGridV3SceneGraph,
} from '../scripts/generate-and-render-zentiogrid';

function readPngDimensions(filePath: string): { width: number; height: number } {
  const buf = fs.readFileSync(filePath);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A, followed by IHDR chunk length (4B), 'IHDR' (4B), width (4B BE), height (4B BE)
  assert.equal(buf[0], 0x89);
  assert.equal(buf.toString('ascii', 1, 4), 'PNG');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

describe('Phase 2 (Batch 2): Pre-Batch 2 Audit Fixes, Atoms 6–10 & Real PNG Validation', () => {
  describe('1. Audit Fix #1 — Non-Occluding Peripheral Callouts & Cursor Discipline', () => {
    it('1.1 pushes center-anchored callouts out of the central UI focal zone while preserving anchorX/anchorY for HUD reticles', () => {
      for (const viewport of [
        { width: 1920, height: 1080 },
        { width: 1080, height: 1920 },
      ]) {
        const cam = computePageCam25DTransform(
          [{ frame: 0, cx: viewport.width / 2, cy: viewport.height / 2, zoom: 1.08, rotX: 8, rotY: -6, persp: 1480 }],
          0,
          viewport
        );

        const resolvedMap = resolveCalloutPositions(
          [
            {
              id: 'focal_center_callout',
              label: 'Central Table Metric',
              metricValue: '12-Col',
              sublabel: 'Should dock peripherally without covering (0.5, 0.5)',
              x: 0.5,
              y: 0.5,
              width: 376,
              height: 144,
            },
          ],
          cam,
          viewport,
          { hasCaptionBar: true, avoidFocalZone: true }
        );

        const box = resolvedMap.get('focal_center_callout');
        assert.ok(box, 'Expected resolved callout box');
        // Original anchor is preserved at the center (960, 540 or 540, 960)
        assert.equal(Math.round(box.anchorX), viewport.width / 2);
        assert.equal(Math.round(box.anchorY), viewport.height / 2);

        // Verify the callout card is pushed to a peripheral dock and never covers the focal center
        const coversCenter =
          box.leftPx <= viewport.width / 2 &&
          box.leftPx + box.widthPx >= viewport.width / 2 &&
          box.topPx <= viewport.height / 2 &&
          box.topPx + box.minHeightPx >= viewport.height / 2;
        assert.equal(
          coversCenter,
          false,
          `Expected docked callout (${box.leftPx}, ${box.topPx}) not to cover focal center (${viewport.width / 2}, ${viewport.height / 2})`
        );
      }
    });

    it('1.2 eliminates stray root cursorTrack keyframes on non-interactive scenes while keeping type_and_filter interactive', () => {
      const zg = buildZentioGridBatch2SceneGraph();
      const np = buildNovaPulseRealPngSceneGraph();

      assert.equal(zg.cursorTrack.length, 0);
      assert.equal(np.cursorTrack.length, 0);

      const zgTypeFilter = zg.scenes.find((s) => s.type === 'type_and_filter');
      const npTypeFilter = np.scenes.find((s) => s.type === 'type_and_filter');
      assert.ok(zgTypeFilter && zgTypeFilter.type === 'type_and_filter');
      assert.ok(npTypeFilter && npTypeFilter.type === 'type_and_filter');
      assert.equal(zgTypeFilter.payload.targetCardId, 'zg_card_subgrid');
      assert.equal(npTypeFilter.payload.targetCardId, 'np_filter_wbr');
    });
  });

  describe('2. Audit Fix #2 & #3 — Audio Presence Limiter & 480-Frame Standardization', () => {
    it('2.1 maintains soft-limiter headroom <= 0.96 and gentle ducking floor', () => {
      const gainSingle = softLimitGain(0.48, 0.78, 0.96);
      assert.equal(gainSingle.limitFactor, 1);
      assert.equal(gainSingle.limitedGain, 0.48);

      const quadratureSum = Math.hypot(0.75, 0.7, 0.65, 0.6);
      const gainPolyphonic = softLimitGain(quadratureSum, 0.78, 0.96);
      assert.ok(gainPolyphonic.limitFactor > 0 && gainPolyphonic.limitFactor <= 1);
      // Verify limitedGain never exceeds ceiling (0.96)
      assert.ok(gainPolyphonic.limitedGain <= 0.96 + 1e-6);

      const duckFactor = calculateDuckingFactor(
        12,
        [
          {
            startFrame: 10,
            durationInFrames: 6,
            priority: 2,
          },
        ],
        { duckingFloor: 0.78 }
      );
      assert.ok(duckFactor >= 0.78 && duckFactor <= 1.0);
    });

    it('2.2 standardizes both ZentioGrid and NovaPulse SceneGraphs to exact 480 frames (16.00s @ 30fps)', () => {
      for (const graph of [
        buildZentioGridV3SceneGraph(),
        buildNovaPulseV3SceneGraph(),
        buildZentioGridBatch2SceneGraph(),
        buildNovaPulseRealPngSceneGraph(),
      ]) {
        assert.equal(graph.canvas.durationInFrames, 480);
        assert.equal(graph.canvas.fps, 30);
        const lastScene = graph.scenes[graph.scenes.length - 1];
        assert.equal(
          lastScene.startFrame + lastScene.durationInFrames,
          480,
          `Expected final scene ${lastScene.id} to end at frame 480`
        );
      }
    });
  });

  describe('3. Audit Fix #4 — Adaptation to Real Un-Tailored Raster PNG Screenshots', () => {
    it('3.1 verifies all 5 real PNG captures on disk have authentic non-16:9 raster dimensions and are bound in NovaPulse', () => {
      const expectedPngs: Record<string, { width: number; height: number }> = {
        'demo-assets/real-captures/aifl-projects-full.png': { width: 3840, height: 3492 },
        'demo-assets/real-captures/aifl-detail-full.png': { width: 3840, height: 2344 },
        'demo-assets/real-captures/aifl-wbr-full.png': { width: 3840, height: 2160 },
        'demo-assets/real-captures/workbench-overview.png': { width: 1728, height: 1080 },
        'demo-assets/real-captures/workbench-inspector.png': { width: 320, height: 647 },
      };

      for (const [relPath, expected] of Object.entries(expectedPngs)) {
        const absPath = path.resolve(process.cwd(), 'public', relPath);
        assert.ok(fs.existsSync(absPath), `Missing real PNG capture: ${absPath}`);
        const dims = readPngDimensions(absPath);
        assert.equal(dims.width, expected.width, `Width mismatch for ${relPath}`);
        assert.equal(dims.height, expected.height, `Height mismatch for ${relPath}`);
      }

      const npGraph = buildNovaPulseRealPngSceneGraph();
      const serialized = JSON.stringify(npGraph);
      for (const relPath of Object.keys(expectedPngs)) {
        assert.ok(
          serialized.includes(relPath),
          `Expected NovaPulse Real PNG SceneGraph to reference ${relPath}`
        );
      }
    });
  });

  describe('4. Part B — Shotcraft Batch 2 Atoms (Atoms 6–10), Camera Modes, Transitions & Auto-SFX', () => {
    it('4.1 validates all 5 Batch 2 atoms in 16:9 and 9:16 across ZentioGrid (strict) and NovaPulse (demo-labeled)', () => {
      for (const vertical of [false, true]) {
        const zg = buildZentioGridBatch2SceneGraph({ vertical });
        const np = buildNovaPulseRealPngSceneGraph({ vertical });

        assert.equal(SceneGraphSchema.safeParse(zg).success, true);
        assert.equal(SceneGraphSchema.safeParse(np).success, true);

        const zgTypes = new Set(zg.scenes.map((s) => s.type));
        assert.ok(zgTypes.has('lead_word_assemble'));
        assert.ok(zgTypes.has('type_and_filter'));
        assert.ok(zgTypes.has('steep_tilt_glide'));
        assert.ok(zgTypes.has('chart_live_moves'));
        assert.ok(zgTypes.has('portal_zoom_hub'));
        assert.ok(zgTypes.has('brand_closing_cta'));

        const npTypes = new Set(np.scenes.map((s) => s.type));
        assert.ok(npTypes.has('crop_callout'));
        assert.ok(npTypes.has('type_and_filter'));
        assert.ok(npTypes.has('steep_tilt_glide'));
        assert.ok(npTypes.has('chart_live_moves'));
        assert.ok(npTypes.has('portal_zoom_hub'));
        assert.ok(npTypes.has('brand_closing_cta'));

        for (const scene of [...zg.scenes, ...np.scenes]) {
          const canvas = vertical
            ? { width: 1080, height: 1920, fps: 30, durationInFrames: 480 }
            : { width: 1920, height: 1080, fps: 30, durationInFrames: 480 };
          const layout = resolveSceneLayout(scene, canvas);
          assert.ok(layout.safeArea.width > 0);
          assert.ok(layout.safeArea.height > 0);
        }
      }
    });

    it('4.2 enforces commercial metric provenance on chart_live_moves in strict mode', () => {
      const zg = buildZentioGridBatch2SceneGraph();
      const tampered = structuredClone(zg);
      const chartShot = tampered.scenes.find((s) => s.type === 'chart_live_moves');
      assert.ok(chartShot && chartShot.type === 'chart_live_moves');
      chartShot.payload.primaryMetricValue = '99.999%';
      chartShot.payload.provenance = 'user-verified';

      const res = SceneGraphSchema.safeParse(tampered);
      assert.equal(
        res.success,
        false,
        'Expected strict commercialIntegrityMode to reject unverified chart_live_moves metric'
      );
    });

    it('4.3 generates camera trajectories for steep-tilt-glide and crash-zoom-punch and compiles Auto-SFX for all Batch 2 atoms', () => {
      const glideKeys = buildDefaultRecipeKeys('steep-tilt-glide', 90, 1920, 1080);
      const punchKeys = buildDefaultRecipeKeys('crash-zoom-punch', 90, 1920, 1080);
      assert.equal(glideKeys.length, 3);
      assert.equal(punchKeys.length, 3);
      assert.ok((glideKeys[0].rotX ?? 0) >= 12);
      assert.ok(Math.abs(glideKeys[0].rotY ?? 0) >= 20);
      assert.ok(punchKeys[1].zoom >= 1.2);

      const zg = buildZentioGridBatch2SceneGraph();
      const autoCues = compileSceneAutoSfx({
        scenes: zg.scenes,
        beatGrid: zg.beatGrid,
        durationInFrames: zg.canvas.durationInFrames,
      });
      assert.ok(autoCues.length >= 18, `Expected >= 18 Auto-SFX cues, got ${autoCues.length}`);

      const timeline = buildAudioTimeline({
        audioTrack: zg.audioTrack,
        scenes: zg.scenes,
        beatGrid: zg.beatGrid,
        durationInFrames: zg.canvas.durationInFrames,
        fps: zg.canvas.fps,
      });
      assert.ok(timeline.sfxCues.length >= 18);
    });
  });
});
