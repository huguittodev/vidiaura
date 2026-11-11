/**
 * AudioTimeline.ts
 * Frame-accurate deterministic audio cue scheduler consuming SceneGraph.audioTrack.
 * Supports 18 allowlisted commercial SFX assets, dynamic sidechain ducking profiles,
 * and procedural sound scheduling (keystroke cycling, click alternation, scene transition whooshes).
 */

import type {
  AudioAsset,
  AudioCue,
  BeatGridConfig,
  SceneNode,
} from '../../../src/lib/scene-graph/types';

export interface AssetProfile {
  asset: AudioAsset;
  filename: string;
  durationSec: number;
  durationFramesAt30Fps: number;
  isMusic: boolean;
  duckingPriority: number; // 0 = background, 1 = subtle (no ducking), 2 = energetic (triggers sidechain ducking)
  nominalVolume: number;
  /** Shotcraft Rule S5: Acoustic sample peak lag in frames at 30fps so peak aligns with visual apex. */
  samplePeakLagFrames?: number;
}

/**
 * Complete 18-Asset Catalog of Studio-Grade Commercial Audio Profiles.
 * Adheres strictly to AGENTS.md Rule 14 and Vidiaura Art Direction.
 */
export const SFX_CATALOG: Record<AudioAsset, AssetProfile> = {
  // --- Legacy Assets (Preserved 100% Backward Compatible) ---
  'ambient-beat': {
    asset: 'ambient-beat',
    filename: 'sfx/ambient-beat.wav',
    durationSec: 18.0,
    durationFramesAt30Fps: 540,
    isMusic: true,
    duckingPriority: 0,
    nominalVolume: 0.32,
  },
  'camera-whoosh': {
    asset: 'camera-whoosh',
    filename: 'sfx/camera-whoosh.wav',
    durationSec: 0.35,
    durationFramesAt30Fps: 12,
    isMusic: false,
    duckingPriority: 2,
    nominalVolume: 0.65,
    samplePeakLagFrames: 3,
  },
  'chime': {
    asset: 'chime',
    filename: 'sfx/chime.wav',
    durationSec: 0.45,
    durationFramesAt30Fps: 15,
    isMusic: false,
    duckingPriority: 2,
    nominalVolume: 0.75,
    samplePeakLagFrames: 1,
  },
  'keyboard-tap': {
    asset: 'keyboard-tap',
    filename: 'sfx/keyboard-tap.wav',
    durationSec: 0.05,
    durationFramesAt30Fps: 4,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.50,
    samplePeakLagFrames: 0,
  },
  'mouse-click': {
    asset: 'mouse-click',
    filename: 'sfx/mouse-click.wav',
    durationSec: 0.08,
    durationFramesAt30Fps: 5,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.85,
    samplePeakLagFrames: 0,
  },
  'soft-pop': {
    asset: 'soft-pop',
    filename: 'sfx/soft-pop.wav',
    durationSec: 0.12,
    durationFramesAt30Fps: 6,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.65,
    samplePeakLagFrames: 1,
  },

  // --- Expanded 12-Piece SaaS SFX Bank (Base44 Cinematic Direction) ---
  'transition-whoosh-heavy': {
    asset: 'transition-whoosh-heavy',
    filename: 'sfx/transition-whoosh-heavy.wav',
    durationSec: 0.50,
    durationFramesAt30Fps: 15,
    isMusic: false,
    duckingPriority: 2,
    nominalVolume: 0.70,
    samplePeakLagFrames: 4,
  },
  'transition-whoosh-fast': {
    asset: 'transition-whoosh-fast',
    filename: 'sfx/transition-whoosh-fast.wav',
    durationSec: 0.30,
    durationFramesAt30Fps: 9,
    isMusic: false,
    duckingPriority: 2,
    nominalVolume: 0.65,
    samplePeakLagFrames: 2,
  },
  'sound-riser': {
    asset: 'sound-riser',
    filename: 'sfx/sound-riser.wav',
    durationSec: 1.20,
    durationFramesAt30Fps: 36,
    isMusic: false,
    duckingPriority: 2,
    nominalVolume: 0.60,
    samplePeakLagFrames: 18,
  },
  'sub-bass-drop': {
    asset: 'sub-bass-drop',
    filename: 'sfx/sub-bass-drop.wav',
    durationSec: 0.80,
    durationFramesAt30Fps: 24,
    isMusic: false,
    duckingPriority: 2,
    nominalVolume: 0.75,
    samplePeakLagFrames: 1,
  },
  'click-switch': {
    asset: 'click-switch',
    filename: 'sfx/click-switch.wav',
    durationSec: 0.06,
    durationFramesAt30Fps: 4,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.80,
    samplePeakLagFrames: 0,
  },
  'click-soft': {
    asset: 'click-soft',
    filename: 'sfx/click-soft.wav',
    durationSec: 0.05,
    durationFramesAt30Fps: 3,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.60,
    samplePeakLagFrames: 0,
  },
  'mechanical-tap-1': {
    asset: 'mechanical-tap-1',
    filename: 'sfx/mechanical-tap-1.wav',
    durationSec: 0.05,
    durationFramesAt30Fps: 3,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.45,
    samplePeakLagFrames: 0,
  },
  'mechanical-tap-2': {
    asset: 'mechanical-tap-2',
    filename: 'sfx/mechanical-tap-2.wav',
    durationSec: 0.05,
    durationFramesAt30Fps: 3,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.45,
    samplePeakLagFrames: 0,
  },
  'mechanical-tap-3': {
    asset: 'mechanical-tap-3',
    filename: 'sfx/mechanical-tap-3.wav',
    durationSec: 0.05,
    durationFramesAt30Fps: 3,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.45,
    samplePeakLagFrames: 0,
  },
  'mechanical-tap-4': {
    asset: 'mechanical-tap-4',
    filename: 'sfx/mechanical-tap-4.wav',
    durationSec: 0.05,
    durationFramesAt30Fps: 3,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.45,
    samplePeakLagFrames: 0,
  },
  'pop-clean': {
    asset: 'pop-clean',
    filename: 'sfx/pop-clean.wav',
    durationSec: 0.10,
    durationFramesAt30Fps: 5,
    isMusic: false,
    duckingPriority: 1,
    nominalVolume: 0.65,
    samplePeakLagFrames: 1,
  },
  'success-chime': {
    asset: 'success-chime',
    filename: 'sfx/success-chime.wav',
    durationSec: 0.60,
    durationFramesAt30Fps: 18,
    isMusic: false,
    duckingPriority: 2,
    nominalVolume: 0.70,
    samplePeakLagFrames: 1,
  },
};

/* ========================================================================= */
/* Procedural Audio Scheduling Constants & Utilities                        */
/* ========================================================================= */

/**
 * 4-Variant mechanical tap cycle avoiding machine-gun acoustic repetition.
 */
export const MECHANICAL_TAPS: readonly AudioAsset[] = [
  'mechanical-tap-1',
  'mechanical-tap-2',
  'mechanical-tap-3',
  'mechanical-tap-4',
] as const;

/**
 * Returns round-robin mechanical tap asset for a given keystroke index.
 */
export function getMechanicalTapAsset(index: number): AudioAsset {
  const safeIndex = Math.abs(Math.floor(index));
  return MECHANICAL_TAPS[safeIndex % MECHANICAL_TAPS.length];
}

/**
 * Click interaction roles for procedural dispatch.
 */
export type ClickInteractionRole = 'subtle' | 'primary' | 'standard';

/**
 * Resolves appropriate click SFX asset based on interaction weight and sequence index.
 */
export function resolveClickAsset(role: ClickInteractionRole = 'standard', index = 0): AudioAsset {
  switch (role) {
    case 'subtle':
      return 'click-soft';
    case 'primary':
      return 'click-switch';
    case 'standard':
    default:
      // Alternates between mouse-click and click-soft to eliminate repetition
      return index % 2 === 0 ? 'mouse-click' : 'click-soft';
  }
}

export interface SceneBoundary {
  startFrame: number;
  durationInFrames: number;
  type?: string;
}

export interface ProceduralAudioOptions {
  /**
   * If true, remaps repetitive 'keyboard-tap' cues across mechanical-tap-1..4.
   */
  enableKeystrokeCycling?: boolean;

  /**
   * If true, alternates generic 'mouse-click' cues across click-soft, click-switch, and mouse-click.
   */
  enableClickAlternation?: boolean;

  /**
   * If true and scenes are provided, automatically schedules transition whooshes at scene boundaries.
   */
  enableSceneTransitions?: boolean;

  /**
   * Scene nodes or boundary descriptors used for scene transition whooshes.
   */
  scenes?: SceneBoundary[];

  /**
   * Lead frame offset for scene transition whoosh (e.g. 2 frames before boundary).
   */
  sceneWhooshLeadFrames?: number;
}

/**
 * Generates an array of AudioCues for simulated typing with round-robin tap variations.
 */
export function scheduleProceduralKeystrokes(params: {
  startFrame: number;
  charCount: number;
  framesPerChar?: number;
  volume?: number;
  idPrefix?: string;
}): AudioCue[] {
  const { startFrame, charCount, framesPerChar = 3, volume, idPrefix = 'type' } = params;
  const cues: AudioCue[] = [];

  for (let i = 0; i < charCount; i++) {
    const frame = startFrame + i * framesPerChar;
    const asset = getMechanicalTapAsset(i);
    cues.push({
      id: `${idPrefix}-${i}-${frame}`,
      frame,
      asset,
      volume: volume ?? SFX_CATALOG[asset]?.nominalVolume ?? 0.45,
    });
  }

  return cues;
}

/**
 * Generates transition whooshes on scene boundaries.
 */
export function scheduleSceneTransitionWhooshes(params: {
  scenes: SceneBoundary[];
  canvasDurationInFrames: number;
  leadFrames?: number;
  volume?: number;
}): AudioCue[] {
  const { scenes, canvasDurationInFrames, leadFrames = 2, volume } = params;
  const whooshCues: AudioCue[] = [];

  // Skip scene 0 start frame (0) since intro music starts there
  for (let i = 1; i < scenes.length; i++) {
    const scene = scenes[i];
    const triggerFrame = Math.max(0, scene.startFrame - leadFrames);
    if (triggerFrame >= canvasDurationInFrames) continue;

    // Heavy transition for 3D product entry or brand closing CTA, fast for intermediate feature cards
    const isHeavy =
      scene.type === 'product_interaction_3d' ||
      scene.type === 'brand_closing_cta' ||
      i === 1 ||
      i === scenes.length - 1;

    const asset: AudioAsset = isHeavy ? 'transition-whoosh-heavy' : 'transition-whoosh-fast';

    whooshCues.push({
      id: `scene-trans-whoosh-${i}-${triggerFrame}`,
      frame: triggerFrame,
      asset,
      volume: volume ?? SFX_CATALOG[asset]?.nominalVolume ?? 0.70,
    });
  }

  return whooshCues;
}

/* ========================================================================= */
/* Shotcraft Rules S2 & S5: Offset Compensation & Anti-Machine-Gun Auto-SFX   */
/* ========================================================================= */

/**
 * Shotcraft Rule S5: Dual Audio Offset Compensation.
 * Computes the exact start frame for an SFX cue so its acoustic envelope peak
 * lands on `targetPeakFrame`, compensating for both the sample's internal
 * attack lag (`samplePeakLagFrames`) and the pipeline output offset (`outputPipelineOffsetFrames`).
 */
export function sfxFrom(
  targetPeakFrame: number,
  asset: AudioAsset,
  outputPipelineOffsetFrames: number = 0
): number {
  const sampleLag = SFX_CATALOG[asset]?.samplePeakLagFrames ?? 0;
  return Math.max(
    0,
    Math.round(targetPeakFrame - sampleLag - outputPipelineOffsetFrames)
  );
}

/**
 * Shotcraft Rule S2: Anti-Machine-Gun Rapid-Fire Volume Step-Down Ladder.
 * Starts at 0.40 and steps down to 0.25 across rapid consecutive entrances.
 */
export const RAPID_FIRE_VOLUME_LADDER: readonly number[] = [
  0.40,
  0.34,
  0.29,
  0.25,
] as const;

export const RAPID_FIRE_SAMPLE_POOL: readonly AudioAsset[] = [
  'click-soft',
  'pop-clean',
  'mechanical-tap-1',
  'mechanical-tap-2',
  'click-switch',
  'mechanical-tap-3',
] as const;

/**
 * Schedules a rapid-fire batch entrance burst (Rule S2):
 * - Alternates across distinct samples so no identical sample repeats back-to-back.
 * - Steps down volume from 0.40 -> 0.34 -> 0.29 -> 0.25 to prevent acoustic fatigue.
 */
export function scheduleRapidFireBurst(params: {
  startFrame: number;
  count: number;
  intervalFrames?: number;
  outputPipelineOffsetFrames?: number;
  idPrefix?: string;
}): AudioCue[] {
  const {
    startFrame,
    count,
    intervalFrames = 3,
    outputPipelineOffsetFrames = 0,
    idPrefix = 'burst',
  } = params;
  const safeCount = Math.max(0, Math.min(16, Math.floor(count)));
  const step = Math.max(1, Math.floor(intervalFrames));
  const cues: AudioCue[] = [];

  for (let i = 0; i < safeCount; i++) {
    const asset = RAPID_FIRE_SAMPLE_POOL[i % RAPID_FIRE_SAMPLE_POOL.length];
    const volume =
      RAPID_FIRE_VOLUME_LADDER[
        Math.min(i, RAPID_FIRE_VOLUME_LADDER.length - 1)
      ];
    const targetFrame = startFrame + i * step;
    const frame = sfxFrom(targetFrame, asset, outputPipelineOffsetFrames);
    cues.push({
      id: `${idPrefix}-${i}-${frame}`,
      frame,
      asset,
      volume,
    });
  }

  return cues;
}

/**
 * Compiles declarative `SceneNode` v3 `autoSfxEvents` and `transitionOut` seam transitions
 * into frame-accurate `AudioCue[]` with Rule S5 `sfxFrom` offset compensation and Rule S2
 * rapid-fire volume step-down.
 */
export function compileSceneAutoSfx(params: {
  scenes: SceneNode[];
  beatGrid?: BeatGridConfig;
  durationInFrames: number;
}): AudioCue[] {
  const { scenes, beatGrid, durationInFrames } = params;
  const outputOffset = beatGrid?.outputAudioOffsetFrames ?? 0;
  const compiled: AudioCue[] = [];

  for (const scene of scenes) {
    // 1. Scene-level declarative soundCues
    if (scene.soundCues) {
      for (const cue of scene.soundCues) {
        const absFrame = cue.frame < scene.startFrame ? scene.startFrame + cue.frame : cue.frame;
        if (absFrame < durationInFrames) {
          compiled.push({
            ...cue,
            id: `scene-cue-${scene.id}-${cue.id}`,
            frame: absFrame,
          });
        }
      }
    }

    // 2. Event-driven Auto-SFX (Layer 5) + Default Atomic SFX for Batch 1 Atoms
    const explicitEvents = scene.autoSfxEvents && scene.autoSfxEvents.length > 0
      ? scene.autoSfxEvents
      : (() => {
          switch (scene.type) {
            case 'mask_reveal':
              return [
                { id: 'mask-riser', frame: 8, event: 'spotlight-whoosh' as const, volume: 0.62 },
                { id: 'mask-slam', frame: Math.min(36, Math.floor(scene.durationInFrames * 0.4)), event: 'hero-slam' as const, volume: 0.72 },
                { id: 'mask-kpis', frame: Math.min(54, Math.floor(scene.durationInFrames * 0.62)), event: 'rapid-batch-tick' as const, burstCount: 3, burstIntervalFrames: 4 },
              ];
            case 'exploded_25d_ui':
              return [
                { id: 'exploded-whoosh', frame: 6, event: 'spotlight-whoosh' as const, volume: 0.64 },
                { id: 'exploded-cards', frame: 18, event: 'rapid-batch-tick' as const, burstCount: 4, burstIntervalFrames: 4 },
                { id: 'exploded-lift', frame: Math.min(48, Math.floor(scene.durationInFrames * 0.55)), event: 'ui-card-pop' as const, volume: 0.65 },
              ];
            case 'bento_cascade': {
              const cardCount = Math.min(6, scene.payload.cards?.length ?? 5);
              return [
                { id: 'bento-press', frame: 8, event: 'ui-card-pop' as const, volume: 0.55 },
                { id: 'bento-deal', frame: 16, event: 'rapid-batch-tick' as const, burstCount: cardCount, burstIntervalFrames: 3 },
                { id: 'bento-settle', frame: Math.min(56, Math.floor(scene.durationInFrames * 0.68)), event: 'sheen-shimmer' as const, volume: 0.54 },
              ];
            }
            case 'crop_callout': {
              const targetCount = Math.min(4, scene.payload.targets?.length ?? 3);
              return [
                { id: 'scan-start', frame: 6, event: 'spotlight-whoosh' as const, volume: 0.56 },
                { id: 'scan-locks', frame: 18, event: 'rapid-batch-tick' as const, burstCount: targetCount, burstIntervalFrames: 8 },
                { id: 'scan-confirm', frame: Math.min(62, Math.floor(scene.durationInFrames * 0.72)), event: 'metric-roll' as const, volume: 0.58 },
              ];
            }
            case 'whip_pan':
              return [
                { id: 'whip-launch', frame: 4, event: 'whip-transition' as const, volume: 0.68 },
                { id: 'whip-ticks', frame: 10, event: 'rapid-batch-tick' as const, burstCount: 4, burstIntervalFrames: 4 },
                { id: 'whip-lock', frame: Math.min(54, Math.floor(scene.durationInFrames * 0.65)), event: 'cta-chime' as const, volume: 0.68 },
              ];
            default:
              return [];
          }
        })();

    if (explicitEvents.length > 0) {
      for (const ev of explicitEvents) {
        const targetPeak = scene.startFrame + ev.frame;
        if (targetPeak >= durationInFrames) continue;

        if (ev.event === 'rapid-batch-tick' || (ev.burstCount && ev.burstCount > 1)) {
          const burst = scheduleRapidFireBurst({
            startFrame: targetPeak,
            count: ev.burstCount ?? 4,
            intervalFrames: ev.burstIntervalFrames ?? 3,
            outputPipelineOffsetFrames: outputOffset,
            idPrefix: `autosfx-${scene.id}-${ev.id}`,
          });
          compiled.push(...burst.filter((b) => b.frame < durationInFrames));
          continue;
        }

        let asset: AudioAsset = 'soft-pop';
        let defaultVol = 0.65;
        switch (ev.event) {
          case 'hero-slam':
            asset = 'sub-bass-drop';
            defaultVol = 0.75;
            break;
          case 'ui-card-pop':
            asset = 'pop-clean';
            defaultVol = 0.60;
            break;
          case 'spotlight-whoosh':
            asset = 'camera-whoosh';
            defaultVol = 0.58;
            break;
          case 'sheen-shimmer':
            asset = 'chime';
            defaultVol = 0.52;
            break;
          case 'metric-roll':
            asset = 'click-switch';
            defaultVol = 0.55;
            break;
          case 'cta-chime':
            asset = 'success-chime';
            defaultVol = 0.72;
            break;
          case 'whip-transition':
            asset = 'transition-whoosh-fast';
            defaultVol = 0.65;
            break;
          default:
            asset = 'soft-pop';
            defaultVol = 0.60;
            break;
        }

        const compensatedFrame = sfxFrom(targetPeak, asset, outputOffset);
        compiled.push({
          id: `autosfx-${scene.id}-${ev.id}-${compensatedFrame}`,
          frame: compensatedFrame,
          asset,
          volume: ev.volume ?? defaultVol,
        });
      }
    }

    // 3. Seam Transition Out Auto-SFX
    if (scene.transitionOut && scene.transitionOut.type !== 'hard-cut') {
      const seamFrame = scene.startFrame + scene.durationInFrames;
      if (seamFrame <= durationInFrames) {
        const transAsset: AudioAsset =
          scene.transitionOut.type === 'flash-cut'
            ? 'sub-bass-drop'
            : scene.transitionOut.type === 'portal-zoom-wipe'
              ? 'transition-whoosh-heavy'
              : 'transition-whoosh-fast';
        const transFrame = sfxFrom(
          Math.max(0, seamFrame - 2),
          transAsset,
          outputOffset
        );
        if (transFrame < durationInFrames) {
          compiled.push({
            id: `autosfx-seam-${scene.id}-${scene.transitionOut.type}-${transFrame}`,
            frame: transFrame,
            asset: transAsset,
            volume: SFX_CATALOG[transAsset].nominalVolume,
          });
        }
      }
    }
  }

  return compiled;
}

/* ========================================================================= */
/* Audio Timeline Assembly & Scheduling Engine                              */
/* ========================================================================= */

export interface ScheduledCue {
  id: string;
  asset: AudioAsset;
  resolvedSrc: string;
  startFrame: number;
  durationInFrames: number;
  endFrame: number;
  volume: number;
  fadeInFrames: number;
  fadeOutFrames: number;
  isMusic: boolean;
  duckingPriority: number;
}

export interface AudioTimeline {
  durationInFrames: number;
  fps: number;
  cues: ScheduledCue[];
  musicCues: ScheduledCue[];
  sfxCues: ScheduledCue[];
}

export interface BuildAudioTimelineParams {
  audioTrack: AudioCue[];
  durationInFrames: number;
  fps?: number;
  procedural?: ProceduralAudioOptions;
  scenes?: SceneNode[];
  beatGrid?: BeatGridConfig;
}

/**
 * Builds a deterministic chronological AudioTimeline from SceneGraph audioTrack,
 * with optional procedural audio enhancement (keystroke cycling, click alternation, scene whooshes)
 * and SceneGraph v3 event-driven Auto-SFX compilation.
 */
export function buildAudioTimeline(params: BuildAudioTimelineParams): AudioTimeline {
  const fps = params.fps ?? 30;
  const durationInFrames = Math.max(1, params.durationInFrames);
  const procedural = params.procedural;

  // Process raw cues through procedural pipeline if requested
  let workingTrack = [...params.audioTrack];

  if (params.scenes && params.scenes.length > 0) {
    const autoCues = compileSceneAutoSfx({
      scenes: params.scenes,
      beatGrid: params.beatGrid,
      durationInFrames,
    });
    workingTrack.push(...autoCues);
  }

  if (procedural?.enableKeystrokeCycling) {
    let tapCounter = 0;
    workingTrack = workingTrack.map((cue) => {
      if (cue.asset === 'keyboard-tap') {
        const cycledAsset = getMechanicalTapAsset(tapCounter++);
        return { ...cue, asset: cycledAsset };
      }
      return cue;
    });
  }

  if (procedural?.enableClickAlternation) {
    let clickCounter = 0;
    workingTrack = workingTrack.map((cue) => {
      if (cue.asset === 'mouse-click') {
        const variants: AudioAsset[] = ['mouse-click', 'click-soft', 'click-switch'];
        const cycledAsset = variants[clickCounter % variants.length];
        clickCounter++;
        return { ...cue, asset: cycledAsset };
      }
      return cue;
    });
  }

  if (procedural?.enableSceneTransitions && procedural.scenes && procedural.scenes.length > 1) {
    const whooshCues = scheduleSceneTransitionWhooshes({
      scenes: procedural.scenes,
      canvasDurationInFrames: durationInFrames,
      leadFrames: procedural.sceneWhooshLeadFrames ?? 2,
    });
    workingTrack.push(...whooshCues);
  }

  const scheduled: ScheduledCue[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < workingTrack.length; i++) {
    const rawCue = workingTrack[i];
    if (rawCue.frame >= durationInFrames) continue;

    const profile = SFX_CATALOG[rawCue.asset];
    if (!profile) continue; // Unknown/unauthorized assets rejected

    let cueId = rawCue.id || `cue-${rawCue.asset}-${rawCue.frame}`;
    if (seenIds.has(cueId)) {
      cueId = `${cueId}-${i}`;
    }
    seenIds.add(cueId);

    const isMusic = profile.isMusic;
    const duration = isMusic
      ? durationInFrames
      : Math.max(profile.durationFramesAt30Fps, Math.ceil(profile.durationSec * fps));

    const endFrame = Math.min(durationInFrames, rawCue.frame + duration);
    const volume = rawCue.volume ?? profile.nominalVolume;

    scheduled.push({
      id: cueId,
      asset: rawCue.asset,
      resolvedSrc: profile.filename,
      startFrame: rawCue.frame,
      durationInFrames: duration,
      endFrame,
      volume,
      fadeInFrames: rawCue.fadeInFrames ?? (isMusic ? 15 : 0),
      fadeOutFrames: rawCue.fadeOutFrames ?? (isMusic ? 30 : 0),
      isMusic,
      duckingPriority: profile.duckingPriority,
    });
  }

  // Sort chronologically by startFrame
  scheduled.sort((a, b) => a.startFrame - b.startFrame);

  return {
    durationInFrames,
    fps,
    cues: scheduled,
    musicCues: scheduled.filter((c) => c.isMusic),
    sfxCues: scheduled.filter((c) => !c.isMusic),
  };
}

/**
 * Returns all active scheduled cues for a given frame.
 */
export function getActiveCuesAtFrame(
  timeline: AudioTimeline,
  frame: number
): ScheduledCue[] {
  return timeline.cues.filter((c) => frame >= c.startFrame && frame < c.endFrame);
}
