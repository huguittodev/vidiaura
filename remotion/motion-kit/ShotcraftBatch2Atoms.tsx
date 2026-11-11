/**
 * ShotcraftBatch2Atoms.tsx
 *
 * Phase 2 (Shotcraft Top 25 — Batch 2: Atoms 6–10) Reusable Motion Graphics Components:
 * 6. `LeadWordAssemble` (`lead_word_assemble`) — Ported from `typography/lead-word-zoom-assemble` + `pill-slot-cycle`
 * 7. `ChartLiveMoves` (`chart_live_moves`) — Ported from `data/chart-live-moves/OscilloscopeStreamV2`
 * 8. `TypeAndFilterFlow` (`type_and_filter`) — Ported from `interaction/type-and-filter` + `camera/cursor-flyover`
 * 9. `SteepTiltGlide` (`steep_tilt_glide`) — Ported from `camera/steep-tilt-glide` (`FloatWrap` + 3-layer velocity trail)
 * 10. `PortalZoomHub` (`portal_zoom_hub`) — Ported from `transition/shot-transitions/PortalWipeV2` + `ui-entrance/integration-hub-map`
 *
 * Invariants enforced:
 * - Zero raw hex literals (reads 100% from `src/lib/design/tokens.ts`; verified by `tests/design-tokens.test.ts`).
 * - 100% deterministic math (no `Math.random()` or `Date.now()`).
 * - Responsive safe-area geometry across both 16:9 (`1920x1080`) and 9:16 (`1080x1920`).
 * - Native support for arbitrary real PNG/JPG/WebP captures via `<AdaptiveMediaSurface />`.
 */

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  brand,
  neutral,
  radius as tokenRadius,
  sceneThemes,
  signal,
  typography,
} from '../../src/lib/design/tokens';
import { getSafeArea } from '../../src/lib/scene-graph/layout';
import type {
  CanvasConfig,
  ChartLiveMovesPayload,
  LeadWordAssemblePayload,
  PortalZoomHubPayload,
  SteepTiltGlidePayload,
  TypeAndFilterPayload,
} from '../../src/lib/scene-graph/types';
import { EASE, mix, ramp, rgbaOf, softShadow, SpeedBlur, velocity } from './Polish';
import { DigitRoll } from './SpotlightSweep';
import { AdaptiveMediaSurface } from './ShotcraftBatch1Atoms';

const VIDI_PALETTES = {
  dark: {
    bgPrimary: brand.obsidian,
    bgSecondary: brand.surfaceRaised,
    surfaceCard: brand.surfaceRaised,
    surfaceSubtle: brand.surface,
    surfaceBorder: brand.border,
    textPrimary: brand.text,
    textSecondary: brand.textSecondary,
    accentSecondary: brand.purpleAccent,
    statusSuccess: signal.green,
    statusWarning: signal.trafficAmber,
    statusDanger: signal.red,
  },
  light: {
    bgPrimary: sceneThemes.lightEditorial.background,
    bgSecondary: sceneThemes.studioLight.surfaceRaised,
    surfaceCard: neutral.white,
    surfaceSubtle: neutral.well,
    surfaceBorder: neutral.border,
    textPrimary: neutral.ink,
    textSecondary: neutral.textSecondary,
    accentSecondary: signal.indigo,
    statusSuccess: signal.trafficGreen,
    statusWarning: signal.trafficAmber,
    statusDanger: signal.trafficRed,
  },
} as const;

const withAlpha = rgbaOf;

/* ========================================================================= */
/* 6. LEAD WORD ZOOM ASSEMBLE (`lead_word_assemble`)                         */
/*    Ported from typography/lead-word-zoom-assemble + pill-slot-cycle       */
/* ========================================================================= */

export interface LeadWordAssembleProps {
  payload: LeadWordAssemblePayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

const PUSH_EASE = Easing.bezier(0.25, 1, 0.5, 1);
const ZOOM_EASE = Easing.bezier(0.5, 0, 0.05, 1);
const WORD_EASE = Easing.bezier(0.22, 0.8, 0.36, 1);

export const LeadWordAssemble: React.FC<LeadWordAssembleProps> = ({
  payload,
  canvas,
  accentColor,
  isDark,
  hasTopCaption = false,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const isVertical = canvas.width < canvas.height;
  const safe = getSafeArea({ width: canvas.width, height: canvas.height });

  const initialScale = isVertical ? 1.85 : 2.25;
  const introDuration = 6;
  const holdDuration = 12;
  const pushScale = 1.06;
  const recedeDuration = 12;
  const assembleDuration = 22;
  const wordDelay = 5;
  const wordStagger = 4;
  const wordDuration = 12;

  const lineScaleAt = (f: number) =>
    interpolate(
      f,
      [0, holdDuration],
      [initialScale, initialScale * pushScale],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: PUSH_EASE,
      }
    ) +
    interpolate(
      f,
      [holdDuration, holdDuration + recedeDuration],
      [0, 1 - initialScale * pushScale],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ZOOM_EASE,
      }
    );

  const currentScale = lineScaleAt(frame);
  const scaleVelocity = Math.abs(lineScaleAt(frame + 0.5) - lineScaleAt(frame - 0.5));
  const introBlur = interpolate(frame, [0, introDuration], [8 / initialScale, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const dynamicBlur = Math.min(3.5, scaleVelocity * 10) + introBlur;

  // Estimate lead word center ratio deterministically from character lengths
  const allWords = [payload.leadWord, ...payload.trailingWords];
  const totalChars = Math.max(1, allWords.join(' ').length);
  const leadRatio = Math.max(
    0.12,
    Math.min(0.38, (payload.leadWord.length * 0.5) / totalChars)
  );
  const estimatedLineWidth = Math.min(
    safe.width * 0.9,
    totalChars * (isVertical ? 28 : 42)
  );
  const slideDistance = isVertical ? 0 : estimatedLineWidth * (0.5 - leadRatio);
  const slideOffsetPx = interpolate(
    frame,
    [holdDuration, holdDuration + assembleDuration],
    [slideDistance, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ZOOM_EASE,
    }
  );

  // Subheadline & cycling pill slot lift (f30..44)
  const liftProgress = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const liftY = liftProgress * (isVertical ? -36 : -44);

  // Optional end-of-shot crash-zoom handoff
  const crashFrames = 10;
  const crashProgress = payload.crashZoomOut
    ? interpolate(
        frame,
        [Math.max(48, durationInFrames - crashFrames), durationInFrames - 1],
        [0, 1],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.in(Easing.quad),
        }
      )
    : 0;

  // Inline cycling capability pills (`pill-slot-cycle`)
  const pills =
    payload.cyclingPills && payload.cyclingPills.length > 0
      ? payload.cyclingPills
      : [payload.leadWord, ...payload.trailingWords.slice(0, 2)];
  const pillCycleStart = 34;
  const framesPerPill = 14;
  const rawPillIndex =
    frame < pillCycleStart
      ? 0
      : Math.min(
          pills.length - 1,
          Math.floor((frame - pillCycleStart) / framesPerPill)
        );
  const pillSlotLocalF =
    frame < pillCycleStart ? 0 : (frame - pillCycleStart) % framesPerPill;
  const pillSlideY = interpolate(pillSlotLocalF, [0, 5], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.4)),
  });

  const baseFontSize = isVertical
    ? Math.min(64, Math.max(42, Math.floor((safe.width * 1.15) / Math.max(8, totalChars * 0.52))))
    : Math.min(86, Math.max(52, Math.floor((safe.width * 0.94) / Math.max(10, totalChars * 0.56))));

  const topOffset = hasTopCaption ? 42 : 0;

  return (
    <AbsoluteFill
      style={{
        fontFamily: typography.fontFamily,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${(1 + crashProgress * 0.18).toFixed(4)})`,
          filter:
            crashProgress > 0.01
              ? `blur(${(crashProgress * 7).toFixed(2)}px)`
              : undefined,
          opacity: 1 - crashProgress * 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: safe.x,
          paddingRight: safe.x,
          paddingTop: safe.y + topOffset,
          paddingBottom: safe.y,
        }}
      >
        {/* Eyebrow Pill */}
        {payload.eyebrow && (
          <div
            style={{
              marginBottom: 22,
              padding: '7px 18px',
              borderRadius: tokenRadius.pill,
              backgroundColor: withAlpha(accentColor, isDark ? 0.16 : 0.1),
              border: `1px solid ${withAlpha(accentColor, 0.38)}`,
              fontFamily: typography.monoFamily,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: accentColor,
              opacity: interpolate(frame, [4, 16], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              transform: `translateY(${liftY.toFixed(1)}px)`,
            }}
          >
            {payload.eyebrow}
          </div>
        )}

        {/* Assembled Lead + Trailing Word Line */}
        <div
          style={{
            transform: `translateY(${liftY.toFixed(1)}px)`,
            maxWidth: safe.width,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              flexWrap: isVertical ? 'wrap' : 'nowrap',
              justifyContent: 'center',
              alignItems: 'baseline',
              columnGap: Math.round(baseFontSize * 0.26),
              rowGap: 8,
              fontSize: baseFontSize,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: palette.textPrimary,
              transformOrigin: isVertical
                ? '50% 50%'
                : `${(leadRatio * 100).toFixed(1)}% 78%`,
              transform: `translateX(${slideOffsetPx.toFixed(1)}px) scale(${currentScale.toFixed(4)})`,
              filter:
                dynamicBlur > 0.06
                  ? `blur(${dynamicBlur.toFixed(2)}px)`
                  : undefined,
            }}
          >
            {allWords.map((word, idx) => {
              const isLead = idx === 0;
              const pushStart =
                holdDuration + wordDelay + (idx - 1) * wordStagger;
              const wordOpacity = isLead
                ? interpolate(frame, [0, introDuration], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  })
                : interpolate(frame, [pushStart, pushStart + 3], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
              const wordPushX = isLead
                ? 0
                : interpolate(
                    frame,
                    [pushStart, pushStart + wordDuration],
                    [0.5 * baseFontSize, 0],
                    {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                      easing: WORD_EASE,
                    }
                  );
              const isHighlighted =
                payload.highlightWord
                  ? word.toLowerCase() === payload.highlightWord.toLowerCase()
                  : idx === allWords.length - 1;

              return (
                <span
                  key={`${word}-${idx}`}
                  style={{
                    display: 'inline-block',
                    opacity: wordOpacity,
                    transform:
                      wordPushX !== 0
                        ? `translateX(${wordPushX.toFixed(1)}px)`
                        : undefined,
                    color: isHighlighted ? accentColor : palette.textPrimary,
                    textShadow: isHighlighted
                      ? `0 0 32px ${withAlpha(accentColor, isDark ? 0.38 : 0.18)}`
                      : undefined,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Subheadline + Inline Pill-Slot-Cycle Row */}
        <div
          style={{
            marginTop: isVertical ? 28 : 34,
            opacity: liftProgress,
            transform: `translateY(${((1 - liftProgress) * 20).toFixed(1)}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            maxWidth: safe.width * 0.88,
            textAlign: 'center',
          }}
        >
          {payload.subheadline && (
            <div
              style={{
                fontSize: isVertical ? 26 : 32,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: palette.textSecondary,
                lineHeight: 1.3,
              }}
            >
              {payload.subheadline}
            </div>
          )}

          {/* Pill-Slot-Cycle Capability Lockup */}
          {pills.length > 0 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 22px',
                borderRadius: tokenRadius.pill,
                backgroundColor: isDark
                  ? withAlpha(palette.bgSecondary, 0.9)
                  : withAlpha(palette.surfaceCard, 0.95),
                border: `1.5px solid ${withAlpha(accentColor, 0.52)}`,
                boxShadow: softShadow(14, { color: neutral.void, strength: isDark ? 1.4 : 0.7 }),
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: tokenRadius.pill,
                  backgroundColor: accentColor,
                  boxShadow: `0 0 12px ${accentColor}`,
                }}
              />
              <span
                style={{
                  fontFamily: typography.monoFamily,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: palette.textSecondary,
                  textTransform: 'uppercase',
                }}
              >
                ACTIVE MODE
              </span>
              <span
                style={{
                  padding: '4px 14px',
                  borderRadius: tokenRadius.pill,
                  backgroundColor: withAlpha(accentColor, 0.18),
                  color: accentColor,
                  fontFamily: typography.monoFamily,
                  fontSize: 18,
                  fontWeight: 800,
                  transform: `translateY(${pillSlideY.toFixed(1)}px)`,
                }}
              >
                {pills[rawPillIndex]}
              </span>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ========================================================================= */
/* 7. CHART LIVE MOVES (`chart_live_moves`)                                  */
/*    Ported from data/chart-live-moves/OscilloscopeStreamV2.tsx             */
/* ========================================================================= */

export interface ChartLiveMovesProps {
  payload: ChartLiveMovesPayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const ChartLiveMoves: React.FC<ChartLiveMovesProps> = ({
  payload,
  canvas,
  accentColor,
  isDark,
  hasTopCaption = false,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const isVertical = canvas.width < canvas.height;
  const safe = getSafeArea({ width: canvas.width, height: canvas.height });

  const topInset = safe.y + (hasTopCaption ? (isVertical ? 164 : 90) : 0);
  const availW = safe.width;
  const availH = Math.max(380, canvas.height - topInset - safe.y);

  const speed = 8;
  const freeze0 = Math.max(48, Math.floor(durationInFrames * 0.66));
  const freeze1 = Math.min(durationInFrames - 18, freeze0 + 14);
  const offset = 1400 + (payload.seriesSeed ?? 0) * 37;

  const worldAt = (f: number) => {
    if (f <= freeze0) return offset + f * speed;
    const brake = (speed * Math.max(1, freeze1 - freeze0)) / 3;
    return (
      offset +
      freeze0 * speed +
      brake * ramp(f, freeze0, Math.max(1, freeze1 - freeze0), EASE.out)
    );
  };

  // Gaussian burst spike around mid-shot (f = 34..58)
  const spikeFrame = Math.min(44, Math.max(22, Math.floor(durationInFrames * 0.38)));
  const s0 = offset + spikeFrame * speed;
  const sw = 168;
  const sc = s0 + sw * 0.5;
  const gauss = (x: number, c: number, w: number) =>
    Math.exp(-Math.pow((x - c) / w, 2));
  const bump = (x: number) =>
    2.1 * gauss(x, sc, 26) +
    0.45 * gauss(x, sc - 58, 18) +
    0.58 * gauss(x, sc + 46, 20);
  const burstK = (x: number) => Math.min(1, bump(x) / 2.1);
  const wave = (x: number) =>
    0.34 * Math.sin(x * 0.019) +
    0.26 * Math.sin(x * 0.047 + 1.7) +
    0.18 * Math.sin(x * 0.011 + 4.2) +
    0.11 * Math.sin(x * 0.083 + 2.3);
  const signalAt = (x: number) =>
    wave(x) * (1 + 0.55 * gauss(x, sc, sw * 0.45)) + bump(x);

  const chartW = payload.mediaUrl && !isVertical ? Math.round(availW * 0.62) : availW;
  const chartH = isVertical ? Math.round(availH * 0.48) : Math.round(availH * 0.56);
  const writeHeadX = Math.round(chartW * 0.86);

  const yOf = (x: number) => {
    const normalized = 0.34 + signalAt(x) * 0.22;
    const clamped = Math.max(0.08, Math.min(0.92, normalized));
    return chartH * (1 - clamped);
  };

  const T = worldAt(frame);
  const worldOf = (px: number) => T - (writeHeadX - px);

  const stepPx = 6;
  const pts: Array<[number, number, number]> = [];
  for (let px = 0; px <= writeHeadX; px += stepPx) {
    pts.push([px, yOf(worldOf(px)), worldOf(px)]);
  }
  if (pts[pts.length - 1][0] !== writeHeadX) {
    pts.push([writeHeadX, yOf(T), T]);
  }

  const toPathD = (arr: Array<[number, number, number]>) =>
    arr
      .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');
  const lineD = toPathD(pts);
  const areaD = `${lineD} L${writeHeadX},${chartH} L0,${chartH} Z`;
  const spikePts = pts.filter(
    ([, , w]) => w >= s0 + 8 && w <= Math.min(T, s0 + sw - 8)
  );
  const spikeD = spikePts.length > 1 ? toPathD(spikePts) : '';
  const headY = yOf(T);

  const spikeK = Math.max(burstK(T), 0.78 * burstK(T - 28), 0.48 * burstK(T - 56));
  const hotProgress = EASE.out(Math.min(1, spikeK * 1.55));
  const liveProgress = 1 - ramp(frame, freeze0, Math.max(1, freeze1 - freeze0), EASE.out);
  const gridReveal = ramp(frame, 0, 16, EASE.snappy);

  const peakPx = writeHeadX - (T - sc);
  const peakY = yOf(sc);
  const passFrame = (sc - offset) / speed;
  const tagIn = ramp(frame, passFrame + 2, 14, EASE.overshoot);

  const isDemo = payload.provenance === 'demo-sample';
  const secondaryReadouts = payload.secondaryReadouts ?? [];

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: typography.fontFamily,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: safe.x,
          top: topInset,
          width: availW,
          height: availH,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        {/* Top Telemetry Header & Primary / Secondary Readouts */}
        <div
          style={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isVertical ? 'flex-start' : 'flex-end',
            gap: 16,
            padding: '20px 26px',
            borderRadius: tokenRadius.xl,
            backgroundColor: isDark
              ? withAlpha(palette.bgSecondary, 0.92)
              : withAlpha(palette.surfaceCard, 0.96),
            border: `1.5px solid ${
              hotProgress > 0.25
                ? withAlpha(palette.statusWarning, 0.65)
                : palette.surfaceBorder
            }`,
            boxShadow: softShadow(18, { color: neutral.void, strength: isDark ? 1.5 : 0.8 }),
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: tokenRadius.pill,
                  backgroundColor:
                    liveProgress > 0.5
                      ? withAlpha(palette.statusSuccess, 0.16)
                      : withAlpha(accentColor, 0.16),
                  border: `1px solid ${
                    liveProgress > 0.5 ? palette.statusSuccess : accentColor
                  }`,
                  fontFamily: typography.monoFamily,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: liveProgress > 0.5 ? palette.statusSuccess : accentColor,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: tokenRadius.pill,
                    backgroundColor:
                      liveProgress > 0.5 ? palette.statusSuccess : accentColor,
                  }}
                />
                {liveProgress > 0.5 ? 'LIVE STREAM' : 'LOCKED SNAPSHOT'}
              </span>
              {payload.eyebrow && (
                <span
                  style={{
                    fontFamily: typography.monoFamily,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.09em',
                    color: palette.textSecondary,
                    textTransform: 'uppercase',
                  }}
                >
                  {payload.eyebrow}
                </span>
              )}
              {isDemo && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: tokenRadius.pill,
                    backgroundColor: withAlpha(palette.statusWarning, 0.18),
                    color: palette.statusWarning,
                    fontFamily: typography.monoFamily,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  DEMO SAMPLE
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: isVertical ? 28 : 34,
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: palette.textPrimary,
                lineHeight: 1.15,
              }}
            >
              {payload.headline}
            </div>

            {/* Primary Giant Odometer Readout */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
              <DigitRoll
                value={payload.primaryMetricValue}
                delay={4}
                fontSize={isVertical ? 52 : 64}
                color={hotProgress > 0.35 ? accentColor : palette.textPrimary}
                frame={frame}
              />
              {payload.primaryMetricUnit && (
                <span
                  style={{
                    fontFamily: typography.monoFamily,
                    fontSize: 22,
                    fontWeight: 700,
                    color: accentColor,
                  }}
                >
                  {payload.primaryMetricUnit}
                </span>
              )}
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: palette.textSecondary,
                }}
              >
                {payload.primaryMetricLabel}
              </span>
            </div>
          </div>

          {/* Secondary Readout Strip */}
          {secondaryReadouts.length > 0 && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {secondaryReadouts.map((sr, idx) => {
                const srDemo = sr.provenance === 'demo-sample';
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 18px',
                      borderRadius: tokenRadius.lg,
                      backgroundColor: isDark
                        ? withAlpha(palette.bgPrimary, 0.72)
                        : withAlpha(palette.surfaceSubtle, 0.85),
                      border: `1px solid ${palette.surfaceBorder}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontFamily: typography.monoFamily,
                          fontSize: 12,
                          fontWeight: 700,
                          color: palette.textSecondary,
                          textTransform: 'uppercase',
                        }}
                      >
                        {sr.label}
                      </span>
                      {srDemo && (
                        <span
                          style={{
                            fontFamily: typography.monoFamily,
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: tokenRadius.pill,
                            backgroundColor: withAlpha(palette.statusWarning, 0.2),
                            color: palette.statusWarning,
                          }}
                        >
                          DEMO SAMPLE
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <DigitRoll
                        value={sr.value}
                        delay={8 + idx * 4}
                        fontSize={32}
                        color={palette.textPrimary}
                        frame={frame}
                      />
                      {sr.unit && (
                        <span
                          style={{
                            fontFamily: typography.monoFamily,
                            fontSize: 15,
                            fontWeight: 700,
                            color: accentColor,
                          }}
                        >
                          {sr.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lower Split: Oscilloscope Telemetry Wall + Optional Real PNG Capture */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            gap: 18,
            minHeight: 0,
          }}
        >
          {/* Oscilloscope Plot Panel */}
          <div
            style={{
              position: 'relative',
              width: chartW,
              height: chartH,
              borderRadius: tokenRadius.xl,
              backgroundColor: isDark
                ? withAlpha(palette.bgSecondary, 0.94)
                : withAlpha(palette.surfaceCard, 0.97),
              border: `1.5px solid ${palette.surfaceBorder}`,
              boxShadow: softShadow(20, { color: neutral.void, strength: isDark ? 1.6 : 0.8 }),
              overflow: 'hidden',
            }}
          >
            <svg
              width={chartW}
              height={chartH}
              style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            >
              {/* Coordinate Grid expanding from center */}
              <g opacity={gridReveal}>
                {Array.from({ length: 13 }, (_, i) => {
                  const x = (i / 12) * chartW;
                  const reach = (chartH / 2) * gridReveal;
                  return (
                    <line
                      key={`v-${i}`}
                      x1={x}
                      x2={x}
                      y1={chartH / 2 - reach}
                      y2={chartH / 2 + reach}
                      stroke={accentColor}
                      strokeOpacity={i === 0 || i === 12 ? 0.24 : 0.11}
                      strokeWidth={1.2}
                    />
                  );
                })}
                {Array.from({ length: 7 }, (_, i) => {
                  const y = (i / 6) * chartH;
                  const reach = (chartW / 2) * gridReveal;
                  return (
                    <line
                      key={`h-${i}`}
                      x1={chartW / 2 - reach}
                      x2={chartW / 2 + reach}
                      y1={y}
                      y2={y}
                      stroke={accentColor}
                      strokeOpacity={i === 0 || i === 6 ? 0.24 : 0.11}
                      strokeWidth={1.2}
                    />
                  );
                })}
              </g>

              {/* Area fill + primary phosphor trace + burst spike highlight */}
              <path d={areaD} fill={withAlpha(accentColor, isDark ? 0.22 : 0.14)} />
              <path
                d={lineD}
                fill="none"
                stroke={accentColor}
                strokeWidth={4}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {spikeD && (
                <path
                  d={spikeD}
                  fill="none"
                  stroke={palette.statusWarning}
                  strokeWidth={5.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {/* Write Head Vertical Scanline + Reference Crosshair + Glow Orb */}
              <line
                x1={writeHeadX}
                x2={writeHeadX}
                y1={0}
                y2={chartH}
                stroke={accentColor}
                strokeOpacity={0.55}
                strokeWidth={1.5}
              />
              <line
                x1={writeHeadX}
                x2={chartW}
                y1={headY}
                y2={headY}
                stroke={accentColor}
                strokeOpacity={0.45}
                strokeWidth={1.5}
                strokeDasharray="4 6"
              />
              <circle
                cx={writeHeadX}
                cy={headY}
                r={8}
                fill={palette.surfaceCard}
                stroke={accentColor}
                strokeWidth={4}
              />
            </svg>

            {/* Burst Peak Callout Tag pinned to the waveform apex */}
            {tagIn > 0.01 && peakPx > 60 && peakPx < writeHeadX - 16 && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.max(16, Math.min(chartW - 180, peakPx - 72)),
                  top: Math.max(14, peakY - 54),
                  padding: '6px 14px',
                  borderRadius: tokenRadius.pill,
                  backgroundColor: palette.statusWarning,
                  color: neutral.ink,
                  fontFamily: typography.monoFamily,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  transform: `scale(${tagIn.toFixed(3)})`,
                  boxShadow: softShadow(12, { color: neutral.void, strength: 1.2 }),
                }}
              >
                {payload.burstTagLabel ?? 'PEAK BURST LOCKED'}
              </div>
            )}
          </div>

          {/* Optional Companion Real PNG Capture Surface */}
          {payload.mediaUrl && (
            <div
              style={{
                flex: 1,
                height: chartH,
                borderRadius: tokenRadius.xl,
                overflow: 'hidden',
                border: `1.5px solid ${palette.surfaceBorder}`,
                boxShadow: softShadow(18, { color: neutral.void, strength: isDark ? 1.5 : 0.8 }),
              }}
            >
              <AdaptiveMediaSurface
                mediaUrl={payload.mediaUrl}
                isDark={isDark}
                accentColor={accentColor}
                fitMode="contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 8. TYPE AND FILTER FLOW (`type_and_filter`)                               */
/*    Ported from interaction/type-and-filter/TypeAndFilter.tsx              */
/* ========================================================================= */

export interface TypeAndFilterFlowProps {
  payload: TypeAndFilterPayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const TypeAndFilterFlow: React.FC<TypeAndFilterFlowProps> = ({
  payload,
  canvas,
  accentColor,
  isDark,
  hasTopCaption = false,
}) => {
  const frame = useCurrentFrame();
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const isVertical = canvas.width < canvas.height;
  const safe = getSafeArea({ width: canvas.width, height: canvas.height });

  const topInset = safe.y + (hasTopCaption ? (isVertical ? 164 : 88) : 0);
  const stageW = safe.width;
  const stageH = Math.max(420, canvas.height - topInset - safe.y);

  const typeStart = 8;
  const query = payload.searchQuery;
  const typedCount =
    frame < typeStart
      ? 0
      : Math.min(query.length, Math.floor((frame - typeStart) / 3) + 1);
  const typingDoneFrame = typeStart + query.length * 3;
  const filterStart = Math.min(40, typingDoneFrame + 4);
  const clickFrame = filterStart + 18;

  // Caret solid while typing, blinks on 8f cycle afterwards
  const caretOn =
    frame >= typeStart - 2 &&
    frame <= clickFrame + 14 &&
    (frame <= typingDoneFrame ||
      Math.floor((frame - typingDoneFrame) / 8) % 2 === 0);

  // Search box focus ring
  const focusRingAlpha = interpolate(
    frame,
    [typeStart - 5, typeStart - 1, clickFrame, clickFrame + 8],
    [0, 1, 1, 0.25],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // 3-stage camera zoom choreography: close on search bar -> pull back to full stage -> push into clicked result
  const camZoom = (() => {
    if (frame <= 28) {
      return interpolate(frame, [0, 10], [1.08, isVertical ? 1.18 : 1.28], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE.out,
      });
    }
    if (frame <= 42) {
      return interpolate(frame, [28, 42], [isVertical ? 1.18 : 1.28, 1.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE.smooth,
      });
    }
    if (frame <= clickFrame - 2) {
      return 1.0;
    }
    return interpolate(
      frame,
      [clickFrame - 2, clickFrame + 18],
      [1.0, isVertical ? 1.08 : 1.14],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: EASE.smooth,
      }
    );
  })();

  const camOriginY = frame <= 38 ? '18%' : '46%';

  // Target card slide progress
  const slideAt = (f: number) =>
    interpolate(f, [filterStart, filterStart + 12], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.35, 0, 0.2, 1),
    });
  const slideT = slideAt(frame);
  const slideVy = velocity((f) => -120 * slideAt(f), frame);

  // Scene-local vector cursor path (fades in at f = filterStart..filterStart+5, clicks at clickFrame, fades out at clickFrame+10)
  const cursorT = interpolate(
    frame,
    [filterStart + 2, clickFrame - 1],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.45, 0, 0.2, 1),
    }
  );
  const cursorFromX = stageW * 0.68;
  const cursorFromY = 88;
  const cursorToX = isVertical ? stageW * 0.5 : stageW * 0.28;
  const cursorToY = 230;
  const cursorArc = Math.sin(cursorT * Math.PI) * 44;
  const cursorX = cursorFromX + (cursorToX - cursorFromX) * cursorT;
  const cursorY = cursorFromY + (cursorToY - cursorFromY) * cursorT + cursorArc;

  const cursorOpacity = interpolate(
    frame,
    [filterStart, filterStart + 5, clickFrame + 6, clickFrame + 12],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const cursorPress = interpolate(
    frame,
    [clickFrame - 1, clickFrame + 1, clickFrame + 5],
    [1, 0.86, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const cursorScale = (1 / camZoom) * cursorPress;

  const targetIdx = Math.max(
    0,
    payload.cards.findIndex((c) => c.id === payload.targetCardId)
  );

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: typography.fontFamily,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: safe.x,
          top: topInset,
          width: stageW,
          height: stageH,
          borderRadius: tokenRadius.xl,
          backgroundColor: isDark
            ? withAlpha(palette.bgSecondary, 0.95)
            : withAlpha(palette.surfaceCard, 0.97),
          border: `1.5px solid ${palette.surfaceBorder}`,
          boxShadow: softShadow(24, { color: neutral.void, strength: isDark ? 1.8 : 0.9 }),
          overflow: 'hidden',
          transform: `scale(${camZoom.toFixed(4)})`,
          transformOrigin: `50% ${camOriginY}`,
          display: 'flex',
          flexDirection: 'column',
          padding: isVertical ? 22 : 28,
          gap: 20,
          boxSizing: 'border-box',
        }}
      >
        {/* Optional Subtle Real Capture Backdrop Underlay */}
        {payload.mediaUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isDark ? 0.14 : 0.1,
              pointerEvents: 'none',
            }}
          >
            <AdaptiveMediaSurface
              mediaUrl={payload.mediaUrl}
              isDark={isDark}
              accentColor={accentColor}
              fitMode="cover"
            />
          </div>
        )}

        {/* Header + Interactive Search Bar */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: isVertical ? 24 : 28,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: palette.textPrimary,
              }}
            >
              {payload.headline}
            </span>
            {payload.eyebrow && (
              <span
                style={{
                  fontFamily: typography.monoFamily,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.09em',
                  color: accentColor,
                  textTransform: 'uppercase',
                }}
              >
                {payload.eyebrow}
              </span>
            )}
          </div>

          {/* Search Input Bar with Focus Ring & Caret */}
          <div
            style={{
              height: 54,
              padding: '0 20px',
              borderRadius: tokenRadius.lg,
              backgroundColor: isDark ? palette.bgPrimary : palette.surfaceSubtle,
              border: `1.5px solid ${
                focusRingAlpha > 0.2
                  ? withAlpha(accentColor, 0.78)
                  : palette.surfaceBorder
              }`,
              boxShadow:
                focusRingAlpha > 0.2
                  ? `0 0 0 4px ${withAlpha(accentColor, 0.18 * focusRingAlpha)}`
                  : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: typography.monoFamily,
                fontSize: 18,
                fontWeight: 800,
                color: accentColor,
              }}
            >
              ⌕
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 20,
                fontWeight: 600,
                color:
                  typedCount > 0 ? palette.textPrimary : palette.textSecondary,
                fontFamily: typography.monoFamily,
              }}
            >
              <span>
                {typedCount > 0
                  ? query.slice(0, typedCount)
                  : payload.searchPlaceholder ?? 'Filter modules...'}
              </span>
              {caretOn && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2.5,
                    height: 24,
                    marginLeft: 3,
                    borderRadius: 1,
                    backgroundColor: accentColor,
                  }}
                />
              )}
            </div>
            <span
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                borderRadius: tokenRadius.pill,
                backgroundColor: withAlpha(accentColor, 0.15),
                color: accentColor,
                fontFamily: typography.monoFamily,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {frame >= filterStart ? '1 MATCH LOCKED' : `${payload.cards.length} ITEMS`}
            </span>
          </div>
        </div>

        {/* Filterable Card Grid */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            flex: 1,
            display: 'grid',
            gridTemplateColumns: isVertical ? '1fr' : 'repeat(3, 1fr)',
            gap: 18,
            alignContent: 'start',
          }}
        >
          {payload.cards.map((card, idx) => {
            const isTarget = idx === targetIdx;
            const cardAccent = card.accentColor ?? accentColor;

            if (!isTarget) {
              const outCue = filterStart + idx * 1.2;
              const outT = interpolate(frame, [outCue, outCue + 7], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.inOut(Easing.quad),
              });
              return (
                <div
                  key={card.id}
                  style={{
                    padding: 20,
                    borderRadius: tokenRadius.lg,
                    backgroundColor: isDark
                      ? withAlpha(palette.bgPrimary, 0.85)
                      : withAlpha(palette.surfaceSubtle, 0.9),
                    border: `1px solid ${palette.surfaceBorder}`,
                    opacity: Math.max(0.08, 1 - outT * 0.88),
                    transform: `translateY(${(10 * outT).toFixed(1)}px) scale(${(
                      1 -
                      0.03 * outT
                    ).toFixed(3)})`,
                    filter:
                      outT > 0.05
                        ? `blur(${(1.6 * outT).toFixed(2)}px)`
                        : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: typography.monoFamily,
                      fontSize: 12,
                      fontWeight: 700,
                      color: palette.textSecondary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.category}
                  </span>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: palette.textPrimary,
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: palette.textSecondary,
                      lineHeight: 1.35,
                    }}
                  >
                    {card.subtitle}
                  </div>
                </div>
              );
            }

            // Target card: floats up into primary prominence + receives click outline
            const floatLift = Math.sin(slideT * Math.PI);
            const isClicked = frame >= clickFrame + 1;
            const clickOutlineAlpha = isClicked
              ? interpolate(frame, [clickFrame + 1, clickFrame + 6], [0.4, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              : 0;

            return (
              <SpeedBlur key={card.id} vx={0} vy={slideVy}>
                <div
                  style={{
                    position: 'relative',
                    padding: 22,
                    borderRadius: tokenRadius.lg,
                    backgroundColor: isDark
                      ? palette.bgPrimary
                      : palette.surfaceCard,
                    border: `${isClicked ? 2.5 : 1.5}px solid ${
                      isClicked ? cardAccent : withAlpha(cardAccent, 0.65)
                    }`,
                    boxShadow: isClicked
                      ? `0 0 0 4px ${withAlpha(cardAccent, 0.2 * clickOutlineAlpha)}, ${softShadow(
                          24,
                          { color: neutral.void, strength: 1.6 }
                        )}`
                      : softShadow(14 + 12 * floatLift, {
                          color: neutral.void,
                          strength: 1.3,
                        }),
                    transform: `translateY(${(-8 * slideT).toFixed(1)}px) scale(${(
                      1 +
                      0.03 * floatLift +
                      0.02 * slideT
                    ).toFixed(3)})`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    zIndex: 5,
                  }}
                >
                  {card.mediaUrl && (
                    <div
                      style={{
                        height: 110,
                        borderRadius: tokenRadius.md,
                        overflow: 'hidden',
                        border: `1px solid ${palette.surfaceBorder}`,
                      }}
                    >
                      <AdaptiveMediaSurface
                        mediaUrl={card.mediaUrl}
                        isDark={isDark}
                        accentColor={cardAccent}
                        fitMode="contain"
                      />
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: typography.monoFamily,
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: tokenRadius.pill,
                        backgroundColor: withAlpha(cardAccent, 0.18),
                        color: cardAccent,
                      }}
                    >
                      {card.category}
                    </span>
                    {card.badge && (
                      <span
                        style={{
                          fontFamily: typography.monoFamily,
                          fontSize: 13,
                          fontWeight: 800,
                          color: cardAccent,
                        }}
                      >
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: palette.textPrimary,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: palette.textSecondary,
                      lineHeight: 1.35,
                    }}
                  >
                    {card.subtitle}
                  </div>
                </div>
              </SpeedBlur>
            );
          })}
        </div>

        {/* Dual Concentric Shockwave Click Ripples */}
        {[0, 1].map((ringIdx) => {
          const start = clickFrame + ringIdx * 3;
          if (frame < start || frame > start + 12) return null;
          const t = interpolate(frame, [start, start + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          const rad = interpolate(t, [0, 1], [14, ringIdx === 0 ? 54 : 78]);
          return (
            <div
              key={`ripple-${ringIdx}`}
              style={{
                position: 'absolute',
                left: cursorToX - rad,
                top: cursorToY - rad,
                width: rad * 2,
                height: rad * 2,
                borderRadius: tokenRadius.pill,
                border: `${ringIdx === 0 ? 2.5 : 1.5}px solid ${accentColor}`,
                opacity: 1 - t,
                pointerEvents: 'none',
                zIndex: 18,
              }}
            />
          );
        })}

        {/* Zoom-Compensated Vector Pointer (Only visible during active interaction window) */}
        {cursorOpacity > 0.01 && (
          <svg
            width={28}
            height={28}
            viewBox="0 0 28 28"
            style={{
              position: 'absolute',
              left: cursorX - 2,
              top: cursorY - 1,
              zIndex: 20,
              opacity: cursorOpacity,
              overflow: 'visible',
              transformOrigin: '2px 1px',
              transform: `scale(${(cursorScale * 1.45).toFixed(4)})`,
              pointerEvents: 'none',
            }}
          >
            <path
              d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z"
              fill={neutral.ink}
              stroke={neutral.white}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 9. STEEP TILT GLIDE (`steep_tilt_glide`)                                  */
/*    Ported from camera/steep-tilt-glide/SteepTiltGlide.tsx                 */
/* ========================================================================= */

export interface SteepTiltGlideProps {
  payload: SteepTiltGlidePayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

const GLIDE_EASE = Easing.bezier(0.3, 0.12, 0.72, 0.9);
const FALL_EASE = Easing.bezier(0.5, 0.05, 0.6, 1);

const liftOf = (t: number, land: number, maxLift = 110) => {
  const fallWindow = 0.34;
  const p = Math.min(1, Math.max(0, (t - (land - fallWindow)) / fallWindow));
  return (1 - FALL_EASE(p)) * maxLift;
};

const FloatWrap: React.FC<{ h: number; children: React.ReactNode }> = ({
  h,
  children,
}) => (
  <div style={{ position: 'relative' }}>
    {h > 2 && (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${(h * 0.22).toFixed(1)}px, ${(h * 0.42).toFixed(
            1
          )}px) scale(${(1 + h * 0.001).toFixed(4)})`,
          filter: `blur(${(8 + h * 0.12).toFixed(1)}px) brightness(0.2) saturate(0)`,
          opacity: Math.min(0.26, 0.08 + h * 0.0012),
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
    )}
    <div
      style={{
        transform: `translate(${(-h * 0.28).toFixed(1)}px, ${(
          -h * 0.65
        ).toFixed(1)}px)`,
      }}
    >
      {children}
    </div>
  </div>
);

export const SteepTiltGlide: React.FC<SteepTiltGlideProps> = ({
  payload,
  canvas,
  accentColor,
  isDark,
  hasTopCaption = false,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const isVertical = canvas.width < canvas.height;
  const safe = getSafeArea({ width: canvas.width, height: canvas.height });

  const glideDist = payload.glideDistancePx ?? (isVertical ? 640 : 1080);
  const rotY = payload.tiltAngleDeg ?? (isVertical ? -28 : -42);

  const lxAt = (f: number) => {
    const p = interpolate(f, [0, Math.max(30, durationInFrames)], [0, 1], {
      easing: GLIDE_EASE,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return interpolate(p, [0, 1], [40, -glideDist]);
  };

  const lx = lxAt(frame);
  const speed = Math.abs(lxAt(frame - 1) - lxAt(frame + 1)) / 2;
  const g1 = Math.min(0.26, speed * 0.018);
  const g2 = Math.min(0.16, speed * 0.011);
  const dropProgress = interpolate(
    frame,
    [2, Math.max(28, Math.floor(durationInFrames * 0.78))],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const panelW = isVertical ? 1860 : 2840;
  const panelH = isVertical ? 1180 : 940;

  const renderGlidingPanel = (
    localX: number,
    layerOpacity: number,
    keySuffix: string
  ) => (
    <AbsoluteFill key={keySuffix} style={{ opacity: layerOpacity, pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          perspective: 1180,
          perspectiveOrigin: isVertical ? '38% 54%' : '30% 58%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: isVertical ? '18%' : '26%',
            top: isVertical ? '30%' : '14%',
            transform: `rotateY(${rotY}deg) rotateX(10deg) rotateZ(-2deg)`,
            transformOrigin: 'left top',
          }}
        >
          <div
            style={{
              transform: `scale(${isVertical ? 0.68 : 0.76}) translateX(${localX.toFixed(1)}px)`,
              transformOrigin: 'left top',
            }}
          >
            <div
              style={{
                width: panelW,
                height: panelH,
                borderRadius: 42,
                backgroundColor: isDark ? palette.bgSecondary : palette.surfaceCard,
                border: `2px solid ${withAlpha(accentColor, 0.38)}`,
                boxShadow: softShadow(36, { color: neutral.void, strength: isDark ? 2.2 : 1.1 }),
                padding: 44,
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
                boxSizing: 'border-box',
              }}
            >
              {/* Top Gliding Chrome Bar */}
              <FloatWrap h={liftOf(dropProgress, 0.34, 90)}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 24,
                    borderBottom: `2px solid ${palette.surfaceBorder}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: tokenRadius.pill,
                        backgroundColor: accentColor,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 42,
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        color: palette.textPrimary,
                      }}
                    >
                      {payload.surfaceTitle ?? payload.headline}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 28 }}>
                    {payload.widgets.slice(0, 3).map((w) => (
                      <span
                        key={w.id}
                        style={{
                          padding: '8px 20px',
                          borderRadius: tokenRadius.pill,
                          backgroundColor: withAlpha(accentColor, 0.14),
                          color: accentColor,
                          fontFamily: typography.monoFamily,
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {w.category}
                      </span>
                    ))}
                  </div>
                </div>
              </FloatWrap>

              {/* Gliding Body: Real PNG Capture(s) + Floating Widget Bricks */}
              <div style={{ flex: 1, display: 'flex', gap: 34, minHeight: 0 }}>
                {payload.mediaUrl && (
                  <div
                    style={{
                      width: 1080,
                      height: '100%',
                      borderRadius: 28,
                      overflow: 'hidden',
                      border: `2px solid ${palette.surfaceBorder}`,
                      flexShrink: 0,
                    }}
                  >
                    <AdaptiveMediaSurface
                      mediaUrl={payload.mediaUrl}
                      isDark={isDark}
                      accentColor={accentColor}
                      fitMode="contain"
                    />
                  </div>
                )}

                <div
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 28,
                  }}
                >
                  {payload.widgets.map((w, idx) => {
                    const wAccent = w.accentColor ?? accentColor;
                    return (
                      <FloatWrap
                        key={w.id}
                        h={liftOf(dropProgress, 0.48 + idx * 0.12, 110)}
                      >
                        <div
                          style={{
                            height: '100%',
                            padding: 32,
                            borderRadius: 28,
                            backgroundColor: isDark
                              ? palette.bgPrimary
                              : palette.surfaceSubtle,
                            border: `2px solid ${withAlpha(wAccent, 0.45)}`,
                            boxShadow: softShadow(20, {
                              color: neutral.void,
                              strength: 1.2,
                            }),
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 14,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: typography.monoFamily,
                                fontSize: 20,
                                fontWeight: 800,
                                color: wAccent,
                                textTransform: 'uppercase',
                              }}
                            >
                              {w.category}
                            </span>
                            {w.badge && (
                              <span
                                style={{
                                  padding: '4px 14px',
                                  borderRadius: tokenRadius.pill,
                                  backgroundColor: withAlpha(wAccent, 0.16),
                                  color: wAccent,
                                  fontFamily: typography.monoFamily,
                                  fontSize: 18,
                                  fontWeight: 800,
                                }}
                              >
                                {w.badge}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 38,
                              fontWeight: 800,
                              letterSpacing: '-0.025em',
                              color: palette.textPrimary,
                              lineHeight: 1.15,
                            }}
                          >
                            {w.title}
                          </div>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 500,
                              color: palette.textSecondary,
                              lineHeight: 1.35,
                            }}
                          >
                            {w.detail}
                          </div>
                        </div>
                      </FloatWrap>
                    );
                  })}
                </div>

                {payload.secondaryMediaUrl && (
                  <div
                    style={{
                      width: 820,
                      height: '100%',
                      borderRadius: 28,
                      overflow: 'hidden',
                      border: `2px solid ${palette.surfaceBorder}`,
                      flexShrink: 0,
                    }}
                  >
                    <AdaptiveMediaSurface
                      mediaUrl={payload.secondaryMediaUrl}
                      isDark={isDark}
                      accentColor={accentColor}
                      fitMode="contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: typography.fontFamily,
        userSelect: 'none',
      }}
    >
      {/* Velocity Ghost Trails (f - 3.2, f - 1.6) + Primary Gliding Plane */}
      {g2 > 0.02 && renderGlidingPanel(lxAt(frame - 3.2), g2, 'trail-2')}
      {g1 > 0.02 && renderGlidingPanel(lxAt(frame - 1.6), g1, 'trail-1')}
      {renderGlidingPanel(lx, 1, 'main-plane')}

      {/* Screen-Space Left Depth Fog & Pinned Editorial Header inside Safe Area */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(100deg, ${withAlpha(
            palette.bgPrimary,
            isDark ? 0.82 : 0.76
          )} 0%, ${withAlpha(palette.bgPrimary, 0.36)} 32%, transparent 58%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: safe.x,
          top: safe.y + (hasTopCaption ? (isVertical ? 164 : 90) : 0),
          maxWidth: isVertical ? safe.width : safe.width * 0.44,
          padding: '20px 26px',
          borderRadius: tokenRadius.xl,
          backgroundColor: isDark
            ? withAlpha(palette.bgSecondary, 0.9)
            : withAlpha(palette.surfaceCard, 0.92),
          border: `1.5px solid ${withAlpha(accentColor, 0.48)}`,
          boxShadow: softShadow(20, { color: neutral.void, strength: isDark ? 1.6 : 0.8 }),
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 25,
        }}
      >
        {payload.eyebrow && (
          <span
            style={{
              fontFamily: typography.monoFamily,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: accentColor,
              textTransform: 'uppercase',
            }}
          >
            {payload.eyebrow}
          </span>
        )}
        <div
          style={{
            fontSize: isVertical ? 30 : 36,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: palette.textPrimary,
            lineHeight: 1.12,
          }}
        >
          {payload.headline}
        </div>
        {payload.subheadline && (
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: palette.textSecondary,
              lineHeight: 1.35,
            }}
          >
            {payload.subheadline}
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 10. PORTAL ZOOM HUB (`portal_zoom_hub`)                                   */
/*     Ported from PortalWipeV2.tsx + IntegrationHubMap.tsx                  */
/* ========================================================================= */

export interface PortalZoomHubProps {
  payload: PortalZoomHubPayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const PortalZoomHub: React.FC<PortalZoomHubProps> = ({
  payload,
  canvas,
  accentColor,
  isDark,
  hasTopCaption = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const isVertical = canvas.width < canvas.height;
  const safe = getSafeArea({ width: canvas.width, height: canvas.height });

  // Act 1: Target card hover lift (f = 6..16) -> Portal window expansion (f = 16..46)
  const hover = ramp(frame, 6, 10, EASE.snappy);
  const portalT = interpolate(frame, [16, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.7, 0, 0.3, 1),
  });
  const spread = interpolate(frame, [30, 58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const innerScale = mix(0.46, 1, portalT);

  const cardSlotW = isVertical ? 440 : 520;
  const cardSlotH = isVertical ? 260 : 300;
  const slotX = (canvas.width - cardSlotW) / 2;
  const slotY = (canvas.height - cardSlotH) / 2 + 24;

  const portalX = mix(slotX, 0, portalT);
  const portalY = mix(slotY - 10 * hover, 0, portalT);
  const portalW = mix(cardSlotW * (1 + 0.03 * hover), canvas.width, portalT);
  const portalH = mix(cardSlotH * (1 + 0.03 * hover), canvas.height, portalT);
  const portalRadius = mix(24, 0, portalT);

  const topInset = safe.y + (hasTopCaption ? (isVertical ? 164 : 88) : 0);
  const nodes = payload.nodes;
  const centerX = canvas.width / 2;
  const centerY = topInset + (canvas.height - topInset - safe.y) * 0.54;
  const hubW = isVertical ? Math.min(680, safe.width * 0.84) : 680;
  const hubH = isVertical ? 360 : 390;

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: typography.fontFamily,
        userSelect: 'none',
      }}
    >
      {/* Outer Workspace Grid (Visible while portalT < 1) */}
      {portalT < 1 && (
        <AbsoluteFill
          style={{
            paddingLeft: safe.x,
            paddingRight: safe.x,
            paddingTop: topInset,
            opacity: 1 - portalT * 0.85,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {payload.eyebrow && (
              <span
                style={{
                  fontFamily: typography.monoFamily,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: accentColor,
                }}
              >
                {payload.eyebrow}
              </span>
            )}
            <div
              style={{
                fontSize: isVertical ? 42 : 54,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: palette.textPrimary,
              }}
            >
              {payload.workspaceTitle}
            </div>
          </div>

          {/* Neighbor Workspace Tiles */}
          <div
            style={{
              marginTop: 36,
              display: 'grid',
              gridTemplateColumns: isVertical ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: 24,
              opacity: 1 - 0.22 * hover,
            }}
          >
            {nodes.slice(0, isVertical ? 4 : 6).map((n, idx) => (
              <div
                key={n.id}
                style={{
                  height: 220,
                  borderRadius: tokenRadius.xl,
                  backgroundColor: isDark
                    ? palette.bgSecondary
                    : palette.surfaceCard,
                  border: `1px solid ${palette.surfaceBorder}`,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: idx === 1 ? 0 : 0.82,
                }}
              >
                <span
                  style={{
                    fontFamily: typography.monoFamily,
                    fontSize: 13,
                    fontWeight: 700,
                    color: n.accentColor ?? accentColor,
                  }}
                >
                  MODULE 0{idx + 1}
                </span>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: palette.textPrimary,
                  }}
                >
                  {n.label}
                </div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* Expanding Portal Window containing the Ecosystem Hub World */}
      <div
        style={{
          position: 'absolute',
          left: portalX,
          top: portalY,
          width: portalW,
          height: portalH,
          borderRadius: portalRadius,
          overflow: 'hidden',
          boxShadow:
            portalT < 1
              ? softShadow(32, { color: neutral.void, strength: 1.8 })
              : undefined,
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: canvas.width,
            height: canvas.height,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${innerScale.toFixed(4)})`,
            backgroundColor: isDark ? palette.bgPrimary : palette.surfaceSubtle,
            overflow: 'hidden',
          }}
        >
          {/* Inner Hub Header inside Safe Area */}
          <div
            style={{
              position: 'absolute',
              left: safe.x,
              right: safe.x,
              top: topInset,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 6,
              zIndex: 12,
            }}
          >
            <div
              style={{
                fontSize: isVertical ? 34 : 44,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: palette.textPrimary,
              }}
            >
              {payload.hubHeadline}
            </div>
            {payload.hubSubheadline && (
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: palette.textSecondary,
                }}
              >
                {payload.hubSubheadline}
              </div>
            )}
          </div>

          {/* Glowing SVG Data Conduits & Flowing Comet Pulses */}
          <svg
            width={canvas.width}
            height={canvas.height}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}
          >
            {nodes.map((node, idx) => {
              const angle =
                (idx / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
              const radiusX = isVertical ? safe.width * 0.36 : safe.width * 0.38;
              const radiusY = isVertical ? 360 : 250;
              const nx = centerX + Math.cos(angle) * radiusX * spread;
              const ny = centerY + Math.sin(angle) * radiusY * spread;
              const midX = (nx + centerX) / 2;
              const midY = ny;
              const pathD = `M ${nx.toFixed(1)} ${ny.toFixed(1)} Q ${midX.toFixed(
                1
              )} ${midY.toFixed(1)} ${centerX.toFixed(1)} ${centerY.toFixed(1)}`;
              const pipeGrow = interpolate(frame, [38 + idx * 2, 50 + idx * 2], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.quad),
              });
              const nodeColor = node.accentColor ?? accentColor;
              const flowOffset = -((frame - 40) * 5.2 + idx * 34);

              return (
                <g key={`pipe-${node.id}`} opacity={pipeGrow}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={withAlpha(nodeColor, 0.35)}
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray="18 56"
                    strokeDashoffset={flowOffset}
                  />
                </g>
              );
            })}
          </svg>

          {/* Central Hub Panel (with optional Real PNG Capture) */}
          <div
            style={{
              position: 'absolute',
              left: centerX - hubW / 2,
              top: centerY - hubH / 2,
              width: hubW,
              height: hubH,
              borderRadius: tokenRadius.xl,
              backgroundColor: isDark ? palette.bgSecondary : palette.surfaceCard,
              border: `2px solid ${withAlpha(accentColor, 0.65)}`,
              boxShadow: `${softShadow(28, {
                color: neutral.void,
                strength: isDark ? 2.0 : 1.0,
              })}, 0 0 48px ${withAlpha(accentColor, 0.24)}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 8,
            }}
          >
            <div
              style={{
                height: 46,
                padding: '0 20px',
                borderBottom: `1px solid ${palette.surfaceBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isDark ? palette.bgPrimary : palette.surfaceSubtle,
              }}
            >
              <span
                style={{
                  fontFamily: typography.monoFamily,
                  fontSize: 14,
                  fontWeight: 800,
                  color: accentColor,
                }}
              >
                {payload.portalCardTitle}
              </span>
              <span
                style={{
                  fontFamily: typography.monoFamily,
                  fontSize: 12,
                  fontWeight: 700,
                  color: palette.statusSuccess,
                }}
              >
                ● ECOSYSTEM SYNCED
              </span>
            </div>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {payload.mediaUrl ? (
                <AdaptiveMediaSurface
                  mediaUrl={payload.mediaUrl}
                  isDark={isDark}
                  accentColor={accentColor}
                  fitMode="contain"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 24,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 14,
                  }}
                >
                  {nodes.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: 16,
                        borderRadius: tokenRadius.lg,
                        backgroundColor: isDark
                          ? palette.bgPrimary
                          : palette.surfaceSubtle,
                        border: `1px solid ${palette.surfaceBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: palette.textPrimary,
                        }}
                      >
                        {n.label}
                      </span>
                      {n.detail && (
                        <span
                          style={{
                            fontSize: 13,
                            color: palette.textSecondary,
                          }}
                        >
                          {n.detail}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orbiting Ecosystem Node Cards */}
          {nodes.map((node, idx) => {
            const angle =
              (idx / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
            const radiusX = isVertical ? safe.width * 0.36 : safe.width * 0.38;
            const radiusY = isVertical ? 360 : 250;
            const nx = centerX + Math.cos(angle) * radiusX * spread;
            const ny = centerY + Math.sin(angle) * radiusY * spread;
            const nodePop = spring({
              frame: Math.max(0, frame - (32 + idx * 2)),
              fps,
              config: { damping: 14, stiffness: 190, mass: 0.8 },
            });
            const nodeColor = node.accentColor ?? accentColor;
            const nodeW = isVertical ? 190 : 220;

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: Math.max(
                    safe.x,
                    Math.min(canvas.width - safe.x - nodeW, nx - nodeW / 2)
                  ),
                  top: Math.max(
                    topInset + 72,
                    Math.min(canvas.height - safe.y - 84, ny - 40)
                  ),
                  width: nodeW,
                  padding: '12px 16px',
                  borderRadius: tokenRadius.lg,
                  backgroundColor: isDark
                    ? palette.bgSecondary
                    : palette.surfaceCard,
                  border: `1.5px solid ${withAlpha(nodeColor, 0.72)}`,
                  boxShadow: softShadow(16, {
                    color: neutral.void,
                    strength: isDark ? 1.5 : 0.8,
                  }),
                  transform: `scale(${nodePop.toFixed(3)})`,
                  opacity: Math.min(1, nodePop * 1.2),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  zIndex: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: typography.monoFamily,
                    fontSize: 13,
                    fontWeight: 800,
                    color: nodeColor,
                  }}
                >
                  {node.label}
                </span>
                {node.detail && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: palette.textSecondary,
                      lineHeight: 1.25,
                    }}
                  >
                    {node.detail}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Portal Card Front Cover (Fades out during the first 30% of portal expansion) */}
        {portalT < 0.32 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: Math.max(0, 1 - portalT * 3.4),
              backgroundColor: isDark ? palette.bgSecondary : palette.surfaceCard,
              border: `2px solid ${accentColor}`,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: typography.monoFamily,
                fontSize: 14,
                fontWeight: 800,
                color: accentColor,
              }}
            >
              PORTAL ENTRY
            </span>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: palette.textPrimary,
              }}
            >
              {payload.portalCardTitle}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

