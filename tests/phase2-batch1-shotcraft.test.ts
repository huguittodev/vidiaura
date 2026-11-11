/**
 * tests/phase2-batch1-shotcraft.test.ts
 *
 * Automated verification suite for Phase 2 (Batch 1):
 * - Block A: General 2.5D frustum safe-area bounds & callout de-collision (16:9 & 9:16),
 *   strict separation of debugMeta vs visible copy, and commercial metric provenance validation.
 * - Block B: First 5 Shotcraft Phase 2 atoms (`exploded_25d_ui`, `mask_reveal`,
 *   `bento_cascade`, `crop_callout`, `whip_pan`) schema, layout & Auto-SFX integration.
 * - Block C: Two distinct product videos (`ZentioGrid` in strict mode & `NovaPulse` in demo-labeled mode).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CaptionBarModifierSchema,
  CropCalloutSchema,
  SceneGraphSchema,
} from '../src/lib/scene-graph/schema';
import { resolveSceneLayout } from '../src/lib/scene-graph/layout';
import { ProductBriefSchema } from '../src/lib/ai/brief-schema';
import { extractAuthorizedMetricsFromBrief } from '../src/lib/ai/gemini-adapter';
import {
  computeCameraFrustumSafeBounds,
  computePageCam25DTransform,
  resolveCalloutPositions,
  buildAudioTimeline,
} from '../remotion/motion-kit';
import {
  buildNovaPulseV3SceneGraph,
  buildZentioGridV3SceneGraph,
} from '../scripts/generate-and-render-zentiogrid';

describe('Phase 2 (Batch 1): Engine Guardrails, 5 Shotcraft Atoms & Dual Product Validation', () => {
  describe('1. Block A — 2.5D Frustum Safe Bounds & Callout De-Collision (16:9 & 9:16)', () => {
    it('1.1 clamps extreme edge callouts inside safe bounds in both 16:9 and 9:16 under zoom & 3D tilt', () => {
      for (const viewport of [
        { width: 1920, height: 1080 },
        { width: 1080, height: 1920 },
      ]) {
        const cam = computePageCam25DTransform(
          [
            {
              frame: 0,
              cx: viewport.width / 2,
              cy: viewport.height / 2,
              zoom: 1.24,
              rotX: 12,
              rotY: -14,
              rotZ: 0,
              persp: 1400,
            },
          ],
          0,
          viewport
        );

        const safeBounds = computeCameraFrustumSafeBounds(cam, viewport, {
          elevationZ: 110,
          topClearancePx: 74,
        });

        const resolvedMap = resolveCalloutPositions(
          [
            {
              id: 'edge_left_top',
              label: 'Top Left Edge Test',
              metricValue: '12-Col',
              sublabel: 'Clamped inside safe frustum',
              x: 0.01,
              y: 0.01,
              width: 390,
              height: 144,
              elevationZ: 110,
            },
            {
              id: 'edge_right_bottom',
              label: 'Bottom Right Edge Test',
              metricValue: 'Strict TSX',
              sublabel: 'Clamped inside safe frustum',
              x: 0.99,
              y: 0.99,
              width: 390,
              height: 144,
              elevationZ: 110,
            },
          ],
          cam,
          viewport,
          { hasCaptionBar: true }
        );

        const resolved = Array.from(resolvedMap.values());
        assert.equal(resolved.length, 2);
        for (const box of resolved) {
          assert.ok(
            box.leftPx >= safeBounds.minX - 1,
            `Callout ${box.id} leftPx (${box.leftPx}) < minX (${safeBounds.minX}) in ${viewport.width}x${viewport.height}`
          );
          assert.ok(
            box.leftPx + box.widthPx <= safeBounds.maxX + 1,
            `Callout ${box.id} right edge (${box.leftPx + box.widthPx}) > maxX (${safeBounds.maxX}) in ${viewport.width}x${viewport.height}`
          );
          assert.ok(
            box.topPx >= safeBounds.minY - 1,
            `Callout ${box.id} topPx (${box.topPx}) < minY (${safeBounds.minY}) in ${viewport.width}x${viewport.height}`
          );
        }
      }
    });

    it('1.2 de-collides overlapping callouts so their bounding boxes never intersect', () => {
      const viewport = { width: 1920, height: 1080 };
      const cam = computePageCam25DTransform(
        [{ frame: 0, cx: 960, cy: 540, zoom: 1.15, rotX: 8, rotY: -8, persp: 1450 }],
        0,
        viewport
      );

      const resolvedMap = resolveCalloutPositions(
        [
          {
            id: 'co_a',
            label: 'Primary Metric Card',
            metricValue: '12-Col',
            sublabel: 'First overlapping card',
            x: 0.5,
            y: 0.5,
            width: 380,
            height: 148,
          },
          {
            id: 'co_b',
            label: 'Secondary Metric Card',
            metricValue: '3 Viewports',
            sublabel: 'Second overlapping card at same anchor',
            x: 0.5,
            y: 0.51,
            width: 380,
            height: 148,
          },
        ],
        cam,
        viewport,
        { hasCaptionBar: true }
      );

      const [a, b] = Array.from(resolvedMap.values());
      const horizOverlap =
        Math.min(a.leftPx + a.widthPx, b.leftPx + b.widthPx) -
        Math.max(a.leftPx, b.leftPx);
      const vertOverlap =
        Math.min(a.topPx + a.minHeightPx, b.topPx + b.minHeightPx) -
        Math.max(a.topPx, b.topPx);

      assert.ok(
        horizOverlap <= 0 || vertOverlap <= 0,
        `Expected zero bounding box intersection between de-collided callouts, got horizOverlap=${horizOverlap}, vertOverlap=${vertOverlap}`
      );
    });
  });

  describe('2. Block A — Separation of Debug Metadata & Commercial Metric Provenance', () => {
    it('2.1 rejects internal engine debug annotations in visible CaptionBar and CropCallout copy', () => {
      const badCaption = CaptionBarModifierSchema.safeParse({
        index: '02 / SHOT',
        text: 'Rule S2 Anti-Machine-Gun + PageCam25D Floating Z-Axis',
      });
      assert.equal(badCaption.success, false);

      const badCallout = CropCalloutSchema.safeParse({
        id: 'c1',
        label: 'Deterministic SceneGraph Telemetry',
        x: 0.5,
        y: 0.5,
      });
      assert.equal(badCallout.success, false);

      const cleanCaption = CaptionBarModifierSchema.safeParse({
        index: '02 / ARCHITECTURE',
        text: 'Visual CSS Grid & Token Compiler',
      });
      assert.equal(cleanCaption.success, true);
    });

    it('2.2 rejects unverified or fabricated quantitative metrics when commercialIntegrityMode is strict', () => {
      const baseValid = buildZentioGridV3SceneGraph();
      const tampered = structuredClone(baseValid);
      // Inject an invented 99.99% uptime claim not present in verifiedMetricsRegistry
      const shot1 = tampered.scenes[0];
      if (shot1.type === 'mask_reveal' && shot1.payload.kpis) {
        shot1.payload.kpis[0] = {
          value: '99.99%',
          label: 'Invented Uptime SLA',
          provenance: 'user-verified',
        };
      }

      const parsed = SceneGraphSchema.safeParse(tampered);
      assert.equal(
        parsed.success,
        false,
        'Expected strict commercialIntegrityMode to reject unverified 99.99% metric'
      );
    });

    it('2.3 extracts only authorized metrics from ProductBrief and blocks demo-sample in strict mode', () => {
      const emptyMetrics = extractAuthorizedMetricsFromBrief(
        ProductBriefSchema.parse({
          productName: 'ZentioGrid',
          description: 'Visual CSS Grid Studio and React TypeScript design-to-code platform.',
          tagline: 'Visual CSS Grid Studio',
          targetAudience: 'Frontend engineers',
          features: ['Visual CSS Grid', 'Design System Tokens', 'React TSX Export'],
          ctaText: 'Launch Studio',
        })
      );
      assert.equal(emptyMetrics.length, 0);

      const explicitMetrics = extractAuthorizedMetricsFromBrief(
        ProductBriefSchema.parse({
          productName: 'ZentioGrid',
          description: 'Visual CSS Grid Studio and React TypeScript design-to-code platform.',
          tagline: 'Visual CSS Grid Studio',
          targetAudience: 'Frontend engineers',
          features: ['12-column CSS grid', 'React TSX export'],
          ctaText: 'Launch Studio',
          verifiedMetrics: [
            {
              value: '12-Col',
              label: 'Grid Tracks',
              source: 'Product Spec',
              provenance: 'product-spec',
            },
          ],
        })
      );
      assert.equal(explicitMetrics.length, 1);
      assert.equal(explicitMetrics[0].value, '12-Col');
    });
  });

  describe('3. Block B & C — 5 Batch 1 Shotcraft Atoms & Dual Product SceneGraphs (16:9 & 9:16)', () => {
    it('3.1 validates ZentioGrid (strict mode, 124 BPM, 5 Batch 1 atoms) in 16:9 and 9:16', () => {
      for (const vertical of [false, true]) {
        const graph = buildZentioGridV3SceneGraph({ vertical });
        const parsed = SceneGraphSchema.safeParse(graph);
        assert.equal(parsed.success, true);
        assert.equal(graph.commercialIntegrityMode, 'strict');

        const types = new Set(graph.scenes.map((s) => s.type));
        assert.ok(types.has('mask_reveal'));
        assert.ok(types.has('exploded_25d_ui'));
        assert.ok(types.has('bento_cascade'));
        assert.ok(types.has('crop_callout'));
        assert.ok(types.has('whip_pan'));
        assert.ok(types.has('brand_closing_cta'));

        for (const scene of graph.scenes) {
          const layout = resolveSceneLayout(scene, graph.canvas);
          assert.ok(layout.safeArea.width > 0);
          assert.ok(layout.safeArea.height > 0);
        }

        const timeline = buildAudioTimeline({
          audioTrack: graph.audioTrack,
          scenes: graph.scenes,
          beatGrid: graph.beatGrid,
          durationInFrames: graph.canvas.durationInFrames,
          fps: graph.canvas.fps,
        });
        assert.ok(timeline.sfxCues.length >= 12);
      }
    });

    it('3.2 validates NovaPulse (demo-labeled mode, 108 BPM, light-editorial) in 16:9 and 9:16', () => {
      for (const vertical of [false, true]) {
        const graph = buildNovaPulseV3SceneGraph({ vertical });
        const parsed = SceneGraphSchema.safeParse(graph);
        assert.equal(parsed.success, true);
        assert.equal(graph.commercialIntegrityMode, 'demo-labeled');
        assert.equal(graph.artDirection.surfaceTheme, 'light');
        assert.equal(graph.beatGrid?.bpm, 108);

        // Every registered metric in NovaPulse is explicitly tagged 'demo-sample'
        for (const entry of graph.verifiedMetricsRegistry ?? []) {
          assert.equal(entry.provenance, 'demo-sample');
        }
      }
    });
  });
});
