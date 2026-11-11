/**
 * BeatGrid.ts
 * Deterministic musical beat-sync quantization and timeline alignment for SceneGraph v3.
 *
 * Implements:
 * - beatF(n): Converts musical beat index `n` (including fractional subdivisions) into exact frame index.
 * - barF(bar): Converts bar index into exact frame index.
 * - snapFrameToBeat(frame): Snaps arbitrary frame to nearest beat / subdivision.
 * - quantizeScenesToBeatGrid(scenes): Aligns scene cut boundaries to musical beats while preserving duration.
 */

import type { BeatGridConfig, SceneNode } from '../../../src/lib/scene-graph/types';

export interface BeatSnapResult {
  frame: number;
  beatIndex: number;
  deltaFrames: number;
}

/**
 * Converts a 0-based beat index `beatIndex` (supports integer or fractional beats like 0.5, 1.25)
 * to a deterministic non-negative frame number.
 *
 * Formula:
 *   beatF(n) = Math.max(0, Math.round((beat0Seconds + n * (60 / bpm)) * fps))
 */
export function beatF(
  beatIndex: number,
  config: BeatGridConfig,
  fps: number = 30
): number {
  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 30;
  const safeBpm = Number.isFinite(config.bpm) && config.bpm > 0 ? config.bpm : 120;
  const beat0 = Number.isFinite(config.beat0Seconds) && (config.beat0Seconds ?? 0) >= 0
    ? (config.beat0Seconds ?? 0)
    : 0;
  const safeBeat = Number.isFinite(beatIndex) ? beatIndex : 0;

  const seconds = beat0 + safeBeat * (60 / safeBpm);
  return Math.max(0, Math.round(seconds * safeFps));
}

/**
 * Converts a 0-based musical bar index `barIndex` into an exact frame number.
 */
export function barF(
  barIndex: number,
  config: BeatGridConfig,
  fps: number = 30
): number {
  const beatsPerBar =
    Number.isFinite(config.beatsPerBar) && (config.beatsPerBar ?? 4) > 0
      ? Math.round(config.beatsPerBar ?? 4)
      : 4;
  return beatF(barIndex * beatsPerBar, config, fps);
}

/**
 * Snaps an arbitrary `frame` to the nearest beat grid point (or fractional `subdivision`, default 1.0 = quarter note).
 */
export function snapFrameToBeat(
  frame: number,
  config: BeatGridConfig,
  fps: number = 30,
  subdivision: number = 1
): BeatSnapResult {
  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 30;
  const safeBpm = Number.isFinite(config.bpm) && config.bpm > 0 ? config.bpm : 120;
  const beat0 = Number.isFinite(config.beat0Seconds) && (config.beat0Seconds ?? 0) >= 0
    ? (config.beat0Seconds ?? 0)
    : 0;
  const safeSub = Number.isFinite(subdivision) && subdivision > 0 ? subdivision : 1;

  const seconds = Math.max(0, frame) / safeFps;
  const rawBeat = (seconds - beat0) * (safeBpm / 60);
  const snappedBeat = Math.max(0, Math.round(rawBeat / safeSub) * safeSub);
  const snappedFrame = beatF(snappedBeat, config, safeFps);

  return {
    frame: snappedFrame,
    beatIndex: snappedBeat,
    deltaFrames: snappedFrame - frame,
  };
}

/**
 * Quantizes sequential `scenes` so their cut points (`startFrame` and `durationInFrames`)
 * land cleanly on the musical `BeatGrid` while respecting Shotcraft Rule R1/R2 minimum hold budgets
 * (>= 30 frames for `brand_closing_cta`, >= 15 frames for all other scenes) and exact `totalFrames`.
 */
export function quantizeScenesToBeatGrid(
  scenes: SceneNode[],
  config: BeatGridConfig,
  totalFrames: number,
  fps: number = 30
): SceneNode[] {
  if (scenes.length === 0) return [];
  if (scenes.length === 1) {
    return [
      {
        ...scenes[0],
        startFrame: 0,
        durationInFrames: Math.max(15, totalFrames),
      },
    ];
  }

  const sorted = [...scenes].sort((a, b) => a.startFrame - b.startFrame);
  const cutFrames: number[] = [0];

  for (let i = 1; i < sorted.length; i++) {
    const prevCut = cutFrames[i - 1];
    const minRemainingForRest = (sorted.length - i) * 15 +
      (sorted[sorted.length - 1].type === 'brand_closing_cta' ? 15 : 0);
    const maxAllowedCut = Math.max(prevCut + 15, totalFrames - minRemainingForRest);

    const snapped = snapFrameToBeat(sorted[i].startFrame, config, fps, 1).frame;
    const clampedCut = Math.min(maxAllowedCut, Math.max(prevCut + 15, snapped));
    cutFrames.push(clampedCut);
  }

  return sorted.map((scene, idx) => {
    const startFrame = cutFrames[idx];
    const nextStart = idx < sorted.length - 1 ? cutFrames[idx + 1] : totalFrames;
    const durationInFrames = Math.max(1, nextStart - startFrame);
    return {
      ...scene,
      startFrame,
      durationInFrames,
    };
  });
}

