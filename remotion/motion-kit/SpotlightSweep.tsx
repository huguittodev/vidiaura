/**
 * SpotlightSweep.tsx
 * Layer 3, 4 & 5 Shotcraft Primitives:
 * - <DigitRoll />: Odometer-style tabular-nums digit column roll for metrics.
 * - <ClipCard />: External video card wrapper with complementary audio/opacity crossfade loop.
 * - <SpotlightSweep />: Dimmed radial mask overlay that sweeps across the stage to isolate the hero area.
 * - <ShotTransitionOverlay />: Seam transitions (`flash-cut`, `whip-pan-brake`, `portal-zoom-wipe`).
 *
 * Strictly consumes `src/lib/design/tokens.ts` with zero raw hex literals.
 */

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  brand,
  neutral,
  radius as tokenRadius,
  sceneThemes,
  typography,
} from '../../src/lib/design/tokens';
import { EASE, mix, ramp, rgbaOf } from './Polish';
import type {
  SceneTransition,
  SpotlightModifier,
} from '../../src/lib/scene-graph/types';

const DIGITS = '0123456789';

/**
 * Odometer-style digit column roll for monospace / tabular-nums metrics.
 */
export const DigitRoll: React.FC<{
  value: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  frame?: number;
}> = ({
  value,
  delay = 0,
  fontSize = 36,
  color = brand.text,
  frame: frameProp,
}) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;
  const lineH = Math.round(fontSize * 1.15);

  return (
    <span
      style={{
        display: 'inline-flex',
        overflow: 'hidden',
        height: lineH,
        verticalAlign: 'bottom',
        fontFamily: typography.monoFamily,
      }}
    >
      {value.split('').map((ch, i) => {
        const target = DIGITS.indexOf(ch);
        if (target < 0) {
          return (
            <span
              key={i}
              style={{
                fontSize,
                lineHeight: `${lineH}px`,
                color,
                fontWeight: typography.weight.bold,
                whiteSpace: 'pre',
              }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          );
        }
        const t = interpolate(frame, [delay + i * 4, delay + i * 4 + 22], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.25, 0.8, 0.25, 1),
        });
        const offset = (10 + target) * t * lineH;
        return (
          <span key={i} style={{ display: 'inline-block', height: lineH }}>
            <span
              style={{
                display: 'block',
                transform: `translateY(${-offset.toFixed(2)}px)`,
              }}
            >
              {(DIGITS + DIGITS).split('').map((d, j) => (
                <span
                  key={j}
                  style={{
                    display: 'block',
                    fontSize,
                    lineHeight: `${lineH}px`,
                    color,
                    fontWeight: typography.weight.bold,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

const LoopLayer: React.FC<{
  src: string;
  width: number;
  height: number;
  muted: boolean;
  startFrom: number;
  fadeIn: number;
  fadeOut: number;
  step: number;
}> = ({ src, width, height, muted, startFrom, fadeIn, fadeOut, step }) => {
  const frame = useCurrentFrame();

  let envelope: number;
  if (frame <= fadeIn) {
    envelope =
      fadeIn === 0
        ? 1
        : interpolate(frame, [0, fadeIn], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
  } else if (frame <= step) {
    envelope = 1;
  } else {
    envelope = interpolate(frame, [step, step + fadeOut], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  const opacity = Math.max(0, Math.min(1, envelope));
  const volume = muted ? 0 : opacity;
  const resolvedSrc =
    src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')
      ? src
      : staticFile(src.startsWith('/') ? src.slice(1) : src);

  return (
    <OffthreadVideo
      src={resolvedSrc}
      muted={muted}
      volume={volume}
      startFrom={startFrom}
      style={{
        position: 'absolute',
        inset: 0,
        width,
        height,
        objectFit: 'cover',
        opacity,
      }}
    />
  );
};

/**
 * External video card wrapper with complementary audio/opacity crossfade looping.
 * Enforces Rule Q11 caption readability (default captionSize >= 32px on 1080p).
 */
export const ClipCard: React.FC<{
  src: string;
  caption?: string;
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  muted?: boolean;
  captionSize?: number;
  startFrom?: number;
  style?: React.CSSProperties;
  loopDurationInFrames?: number;
  loopCrossfadeInFrames?: number;
  durationInFrames?: number;
  accentColor?: string;
}> = ({
  src,
  caption,
  size = 560,
  width,
  height,
  radius = tokenRadius.xl,
  muted = true,
  startFrom = 0,
  style,
  captionSize = 32,
  loopDurationInFrames,
  loopCrossfadeInFrames = 8,
  durationInFrames,
  accentColor = brand.purpleGlow,
}) => {
  const { durationInFrames: compDuration } = useVideoConfig();
  const cardW = width ?? size;
  const cardH = height ?? size;
  const capH = caption ? Math.round(captionSize * 2.2) : 0;

  const step = loopDurationInFrames
    ? loopDurationInFrames - startFrom - loopCrossfadeInFrames
    : 0;
  const canLoop =
    Boolean(loopDurationInFrames) &&
    (loopDurationInFrames ?? 0) > loopCrossfadeInFrames &&
    step >= loopCrossfadeInFrames;

  const resolvedSrc =
    src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')
      ? src
      : staticFile(src.startsWith('/') ? src.slice(1) : src);

  let video: React.ReactNode;
  if (canLoop && loopDurationInFrames) {
    const shotFrames = durationInFrames ?? compDuration;
    const n = Math.max(1, Math.ceil(shotFrames / step));
    video = (
      <div style={{ position: 'relative', width: cardW, height: cardH }}>
        {Array.from({ length: n }, (_, i) => (
          <Sequence
            key={i}
            from={i * step}
            durationInFrames={loopDurationInFrames}
            layout="none"
          >
            <LoopLayer
              src={src}
              width={cardW}
              height={cardH}
              muted={muted}
              startFrom={startFrom}
              fadeIn={i === 0 ? 0 : loopCrossfadeInFrames}
              fadeOut={loopCrossfadeInFrames}
              step={step}
            />
          </Sequence>
        ))}
      </div>
    );
  } else {
    video = (
      <OffthreadVideo
        src={resolvedSrc}
        muted={muted}
        startFrom={startFrom}
        style={{
          width: cardW,
          height: cardH,
          objectFit: 'cover',
          display: 'block',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: cardW,
        height: cardH + capH,
        borderRadius: radius,
        background: sceneThemes.obsidian.surface,
        border: `1px solid ${sceneThemes.obsidian.borderStrong}`,
        boxShadow: `0 24px 80px ${rgbaOf(brand.obsidian, 0.55)}`,
        overflow: 'hidden',
        ...style,
      }}
    >
      {video}
      {caption ? (
        <div
          style={{
            height: capH,
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            fontFamily: typography.monoFamily,
            fontSize: captionSize,
            fontWeight: typography.weight.medium,
            color: brand.textSecondary,
            letterSpacing: 0.5,
            borderTop: `1px solid ${sceneThemes.obsidian.borderStrong}`,
          }}
        >
          <span style={{ color: accentColor, marginRight: 12 }}>▸</span>
          {caption}
        </div>
      ) : null}
    </div>
  );
};

/**
 * Layer 4 Modifier: Dimmed radial spotlight mask that sweeps from (fromX, fromY) to (toX, toY)
 * to isolate the hero UI region.
 */
export const SpotlightSweep: React.FC<{
  config: SpotlightModifier;
  frame?: number;
  accentColor?: string;
}> = ({ config, frame: frameProp, accentColor = brand.purpleGlow }) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  if (!config.enabled) return null;

  const start = config.startFrame ?? 0;
  const dur = config.durationInFrames ?? 45;
  const p = ramp(frame, start, dur, EASE.smooth);
  const fadeIn = ramp(frame, Math.max(0, start - 6), 10, EASE.out);
  const fadeOut =
    frame > start + dur
      ? 1 - ramp(frame, start + dur, 14, EASE.out)
      : 1;
  const activeAlpha = fadeIn * fadeOut;

  if (activeAlpha <= 0.01) return null;

  const cx = mix(config.fromX, config.toX ?? config.fromX, p) * 100;
  const cy = mix(config.fromY, config.toY ?? config.fromY, p) * 100;
  const r = config.radius ?? 320;
  const dim = (config.dimOpacity ?? 0.52) * activeAlpha;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 35,
        background:
          `radial-gradient(circle ${r}px at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ` +
          `${rgbaOf(accentColor, 0.14 * activeAlpha)} 0%, ` +
          `transparent 58%, ` +
          `${rgbaOf(brand.obsidian, dim)} 100%)`,
      }}
    />
  );
};

/**
 * Layer 5 Seam Transition Overlay (`flash-cut`, `whip-pan-brake`, `portal-zoom-wipe`).
 * Triggers at the end of a scene over `durationInFrames`.
 */
export const ShotTransitionOverlay: React.FC<{
  transition?: SceneTransition;
  sceneDurationInFrames: number;
  accentColor?: string;
  frame?: number;
}> = ({
  transition,
  sceneDurationInFrames,
  accentColor = brand.purpleGlow,
  frame: frameProp,
}) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  if (!transition || transition.type === 'hard-cut') return null;

  const dur = Math.max(4, transition.durationInFrames ?? 10);
  const start = Math.max(0, sceneDurationInFrames - dur);
  if (frame < start) return null;

  const localFrame = frame - start;

  if (transition.type === 'flash-cut') {
    const o = interpolate(localFrame, [0, dur * 0.4, dur], [0, 0.85, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return (
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          zIndex: 60,
          opacity: o,
          background:
            `radial-gradient(ellipse at 50% 45%, ${rgbaOf(neutral.white, 0.96)}, ` +
            `${rgbaOf(accentColor, 0.52)} 55%, transparent 82%)`,
        }}
      />
    );
  }

  if (transition.type === 'whip-pan-brake') {
    const p = ramp(localFrame, 0, dur, EASE.exit);
    const streakOpacity = interpolate(localFrame, [0, dur * 0.6, dur], [0, 0.78, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const shiftX = mix(180, -320, p);
    return (
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          zIndex: 60,
          opacity: streakOpacity,
          transform: `translateX(${shiftX.toFixed(1)}px) scaleX(${(1 + p * 0.65).toFixed(2)})`,
          background:
            `linear-gradient(90deg, transparent 0%, ${rgbaOf(accentColor, 0.45)} 40%, ` +
            `${rgbaOf(neutral.white, 0.75)} 50%, ${rgbaOf(accentColor, 0.45)} 60%, transparent 100%)`,
          filter: 'blur(18px)',
        }}
      />
    );
  }

  if (transition.type === 'card-flip-reveal') {
    const p = ramp(localFrame, 0, dur, EASE.snappy);
    const beamOpacity = interpolate(localFrame, [0, dur * 0.45, dur], [0, 0.92, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const sweepX = mix(-42, 42, p);
    return (
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          zIndex: 60,
          opacity: beamOpacity,
          transform: `translateX(${sweepX.toFixed(1)}%) scaleX(${(1.2 - Math.abs(p - 0.5) * 1.4).toFixed(2)})`,
          background:
            `linear-gradient(90deg, transparent 22%, ${rgbaOf(accentColor, 0.55)} 44%, ` +
            `${rgbaOf(neutral.white, 0.94)} 50%, ${rgbaOf(accentColor, 0.55)} 56%, transparent 78%)`,
          filter: 'blur(8px)',
        }}
      />
    );
  }

  if (transition.type === 'iris-portal-wipe') {
    const p = ramp(localFrame, 0, dur, EASE.swift);
    const irisRadius = mix(12, 1480, p);
    const irisAlpha = interpolate(localFrame, [0, dur * 0.55, dur], [0, 0.92, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return (
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          zIndex: 60,
          opacity: irisAlpha,
          background:
            `radial-gradient(circle ${irisRadius.toFixed(0)}px at 50% 50%, ` +
            `${rgbaOf(neutral.white, 0.26)} 0%, transparent 56%, ` +
            `${rgbaOf(accentColor, 0.85)} 74%, ${rgbaOf(brand.obsidian, 0.96)} 100%)`,
        }}
      />
    );
  }

  // portal-zoom-wipe
  const p = ramp(localFrame, 0, dur, EASE.snappy);
  const ringRadius = mix(40, 1400, p);
  const ringAlpha = interpolate(localFrame, [0, dur * 0.5, dur], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 60,
        opacity: ringAlpha,
        background:
          `radial-gradient(circle ${ringRadius.toFixed(0)}px at 50% 50%, ` +
          `transparent 68%, ${rgbaOf(accentColor, 0.72)} 82%, ${rgbaOf(brand.obsidian, 0.95)} 100%)`,
      }}
    />
  );
};

