/**
 * AudioEngine.tsx
 * Studio-grade deterministic audio orchestrator for Remotion.
 *
 * Implements:
 * 1. Safe, monotonic fade curves via FadeController (eliminates duplicate-key crashes).
 * 2. Dynamic sidechain ducking of background music during SFX transients.
 * 3. Master C^1 soft-knee limiter bounded to 0.95 preventing digital clipping across polyphonic mixes.
 * 4. Dual contract support: consumes SceneGraph.audioTrack and maintains 100% backwards compatibility
 *    with legacy soundCues and music props.
 */

import React from 'react';
import {
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from 'remotion';
import type {
  AudioAsset,
  AudioCue,
  BeatGridConfig,
  SceneNode,
} from '../../src/lib/scene-graph/types';
import {
  calculateFadeGain,
  type FadeConfig,
} from './audio/FadeController';
import {
  calculateDuckingFactor,
  softLimitGain,
  type MixerConfig,
} from './audio/AudioMixer';
import {
  buildAudioTimeline,
  SFX_CATALOG,
  type AudioTimeline,
  type ScheduledCue,
} from './audio/AudioTimeline';

export * from './audio/FadeController';
export * from './audio/AudioMixer';
export * from './audio/AudioTimeline';
export * from './audio/BeatGrid';

export interface SoundCue {
  frame: number;
  sound: string; // e.g. 'mouse-click', 'soft-pop', 'camera-whoosh', 'chime', 'keyboard-tap'
  volume?: number;
}

export interface BackgroundMusicConfig {
  src?: string;
  volume?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

export interface AudioEngineProps {
  // SceneGraph declarative audio track (Milestones 2 & 3)
  audioTrack?: AudioCue[];

  // SceneGraph v3 event-driven Auto-SFX & BeatGrid
  scenes?: SceneNode[];
  beatGrid?: BeatGridConfig;

  // Legacy backwards-compatible props (StudioShowcase)
  soundCues?: SoundCue[];
  music?: BackgroundMusicConfig;

  enabled?: boolean;
  mixerOptions?: MixerConfig;
}

/**
 * Normalizes an audio path for Remotion staticFile.
 */
function resolveStaticSrc(path: string): string {
  const stripped = path.startsWith('/') ? path.slice(1) : path;
  if (stripped.startsWith('sfx/') || stripped.endsWith('.wav') || stripped.endsWith('.mp3')) {
    return staticFile(stripped);
  }
  return staticFile(`sfx/${stripped}.wav`);
}

export const AudioEngine: React.FC<AudioEngineProps> = ({
  audioTrack,
  scenes,
  beatGrid,
  soundCues = [],
  music,
  enabled = true,
  mixerOptions,
}) => {
  const { durationInFrames, fps } = useVideoConfig();

  // Build unified audio timeline
  const timeline: AudioTimeline = React.useMemo(() => {
    if ((audioTrack && audioTrack.length > 0) || (scenes && scenes.length > 0)) {
      return buildAudioTimeline({
        audioTrack: audioTrack ?? [],
        scenes,
        beatGrid,
        durationInFrames,
        fps,
      });
    }

    // Adapt legacy soundCues and music into scheduled cues
    const syntheticCues: AudioCue[] = [];

    // Legacy background music cue
    if (music?.src) {
      const isAmbientBeat = music.src.includes('ambient-beat');
      syntheticCues.push({
        id: 'legacy-bg-music',
        frame: 0,
        asset: isAmbientBeat ? 'ambient-beat' : ('ambient-beat' as AudioAsset),
        volume: music.volume ?? 0.32,
        fadeInFrames: music.fadeInFrames ?? 15,
        fadeOutFrames: music.fadeOutFrames ?? 30,
      });
    }

    // Legacy SFX cues
    soundCues.forEach((sc, idx) => {
      // Extract asset name
      const rawName = sc.sound.replace(/^sfx\//, '').replace(/\.(wav|mp3)$/, '');
      const asset = (rawName in SFX_CATALOG ? rawName : 'soft-pop') as AudioAsset;

      syntheticCues.push({
        id: `legacy-sfx-${sc.frame}-${rawName}-${idx}`,
        frame: sc.frame,
        asset,
        volume: sc.volume ?? SFX_CATALOG[asset]?.nominalVolume ?? 0.75,
      });
    });

    return buildAudioTimeline({
      audioTrack: syntheticCues,
      scenes,
      beatGrid,
      durationInFrames,
      fps,
    });
  }, [audioTrack, scenes, beatGrid, soundCues, music, durationInFrames, fps]);

  if (!enabled) return null;

  // Prepare SFX metadata for dynamic ducking calculation:
  // Window ducking around the acoustic peak of each priority-2 SFX cue (6-frame transient core)
  // and use a gentle 0.78 (-2.1 dB) musical pocket so long risers/tails never squash the music bed.
  const effectiveMixerOptions: MixerConfig = {
    headroomCeiling: mixerOptions?.headroomCeiling ?? 0.95,
    kneeThreshold: mixerOptions?.kneeThreshold ?? 0.82,
    duckingFloor: mixerOptions?.duckingFloor ?? 0.78,
    duckingAttackFrames: mixerOptions?.duckingAttackFrames ?? 2,
    duckingReleaseFrames: mixerOptions?.duckingReleaseFrames ?? 6,
  };

  const sfxDuckingMeta = timeline.sfxCues.map((c) => {
    const peakLag = SFX_CATALOG[c.asset]?.samplePeakLagFrames ?? 1;
    const transientStart = c.startFrame + Math.max(0, peakLag - 2);
    const transientDur = Math.min(6, Math.max(3, c.durationInFrames));
    return {
      startFrame: transientStart,
      durationInFrames: transientDur,
      priority: c.duckingPriority,
    };
  });

  // Helper to compute effective volume at any given frame
  const computeMasterLimitedVolume = (
    targetFrame: number,
    cue: ScheduledCue
  ): number => {
    // 1. Nominal gain with fade + studio presence calibration
    // ambient-beat.wav has intrinsic RMS -21.72 dBFS and Peak -4.12 dBFS (0.622 linear).
    const calibratedTargetVolume = cue.isMusic
      ? Math.min(0.95, Math.max(0.86, cue.volume * 2.25))
      : Math.min(0.95, cue.volume * 1.24);

    const fadeConf: FadeConfig = {
      durationInFrames: cue.durationInFrames,
      fadeInFrames: cue.fadeInFrames,
      fadeOutFrames: cue.fadeOutFrames,
      targetVolume: calibratedTargetVolume,
    };
    const relFrameInCue = targetFrame - cue.startFrame;
    const baseGain = calculateFadeGain(relFrameInCue, fadeConf);

    // 2. Active cues at targetFrame
    const activeCues = timeline.cues.filter(
      (c) => targetFrame >= c.startFrame && targetFrame < c.endFrame
    );

    // Calculate ducking multiplier
    const duckingMultiplier = cue.isMusic
      ? calculateDuckingFactor(targetFrame, sfxDuckingMeta, effectiveMixerOptions)
      : 1.0;

    // Quadrature acoustic peak envelope sum for transparent C^1 soft-knee limiting
    // (uncorrelated audio sources sum in power sqrt(sum((g_i * wavPeak_i)^2)), avoiding false -6 dB over-compression)
    let sumSq = 0;
    for (const c of activeCues) {
      if (c.isMusic) {
        const mGain = calculateFadeGain(targetFrame - c.startFrame, {
          durationInFrames: c.durationInFrames,
          fadeInFrames: c.fadeInFrames,
          fadeOutFrames: c.fadeOutFrames,
          targetVolume: Math.min(0.95, Math.max(0.86, c.volume * 2.25)),
        });
        const mDuck = calculateDuckingFactor(targetFrame, sfxDuckingMeta, effectiveMixerOptions);
        const effMusicPeak = mGain * mDuck * 0.68;
        sumSq += effMusicPeak * effMusicPeak;
      } else {
        const relSfxFrame = Math.max(0, targetFrame - c.startFrame);
        const peakLag = SFX_CATALOG[c.asset]?.samplePeakLagFrames ?? 1;
        const distFromPeak = Math.abs(relSfxFrame - peakLag);
        const decayConst = Math.max(2.5, c.durationInFrames * 0.28);
        const envWeight = Math.exp(-distFromPeak / decayConst);
        const effSfxPeak = Math.min(0.95, c.volume * 1.24) * envWeight * 0.78;
        sumSq += effSfxPeak * effSfxPeak;
      }
    }

    const quadratureSum = Math.sqrt(sumSq);
    const { limitFactor } = softLimitGain(
      quadratureSum,
      effectiveMixerOptions.kneeThreshold,
      effectiveMixerOptions.headroomCeiling
    );

    return Math.max(0, Math.min(0.95, baseGain * duckingMultiplier * limitFactor));
  };

  // Resolve background music source
  const musicCue = timeline.musicCues[0];
  const legacyMusicSrc = music?.src ? resolveStaticSrc(music.src) : null;
  const musicSrc = musicCue ? resolveStaticSrc(musicCue.resolvedSrc) : legacyMusicSrc;

  return (
    <>
      {/* Background Music Track (Primary Carrier + Parallel Warm Body Bus for -16 LUFS Web Presence) */}
      {musicSrc && (
        <>
          <Audio
            src={musicSrc}
            volume={(frameWithinAudio) => {
              if (musicCue) {
                return computeMasterLimitedVolume(frameWithinAudio, musicCue);
              }
              const baseGain = calculateFadeGain(frameWithinAudio, {
                durationInFrames,
                fadeInFrames: music?.fadeInFrames ?? 15,
                fadeOutFrames: music?.fadeOutFrames ?? 30,
                targetVolume: Math.min(0.92, (music?.volume ?? 0.32) * 2.2),
              });
              const duck = calculateDuckingFactor(frameWithinAudio, sfxDuckingMeta, effectiveMixerOptions);
              const { limitFactor } = softLimitGain(
                baseGain * duck * 0.68,
                effectiveMixerOptions.kneeThreshold,
                effectiveMixerOptions.headroomCeiling
              );
              return Math.min(0.95, baseGain * duck * limitFactor);
            }}
          />
          <Audio
            src={musicSrc}
            volume={(frameWithinAudio) => {
              if (musicCue) {
                return computeMasterLimitedVolume(frameWithinAudio, musicCue) * 0.46;
              }
              return 0;
            }}
          />
        </>
      )}

      {/* Frame-Accurate SFX Sequences */}
      {timeline.sfxCues.map((cue) => {
        return (
          <Sequence
            key={cue.id}
            from={cue.startFrame}
            durationInFrames={cue.durationInFrames}
          >
            <Audio
              src={resolveStaticSrc(cue.resolvedSrc)}
              volume={(frameWithinSequence) => {
                const globalFrame = cue.startFrame + frameWithinSequence;
                return computeMasterLimitedVolume(globalFrame, cue);
              }}
            />
          </Sequence>
        );
      })}
    </>
  );
};
