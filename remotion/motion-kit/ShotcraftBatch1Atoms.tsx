/**
 * remotion/motion-kit/ShotcraftBatch1Atoms.tsx
 *
 * Phase 2 (Batch 1) — First 5 Reusable Shotcraft Studio Atoms:
 *   1. Exploded25DUI (`exploded_25d_ui`) — 3-plane multiplane depth parallax + progressive card assembly + hero lift.
 *   2. MaskReveal (`mask_reveal`) — Giant SVG display wordmark mask with 1/S counter-scaled live dashboard + exponential zoom-through.
 *   3. BentoCascade (`bento_cascade`) — Stacked deck anticipation press + quadratic accelerating deal (Rule R2) + Z-arc + shadow lag.
 *   4. CropCalloutFocus (`crop_callout`) — Constant-velocity laser scanline + dot-matrix trail + spring HUD corner brackets + typewriter tags.
 *   5. WhipPanScene (`whip_pan`) — Pre-integrated monotonic velocity integral v(u) + directional <SpeedBlur /> + mechanical odometer + brake lock.
 *
 * Enforces:
 * - Zero raw #hex literals (all colors from `src/lib/design/tokens.ts`).
 * - 100% deterministic frame math (zero Math.random() / Date.now()).
 * - Responsive safe-area layout across 16:9 (1920x1080) and 9:16 (1080x1920) via `getSafeArea`.
 * - Commercial metric provenance transparency (`[DEMO SAMPLE]` badges when provenance === 'demo-sample').
 */

import React from 'react';
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {
  BentoCascadePayload,
  CanvasConfig,
  CropCalloutPayload,
  Exploded25DUIPayload,
  MaskRevealPayload,
  WhipPanPayload,
} from '../../src/lib/scene-graph/types';
import { getSafeArea } from '../../src/lib/scene-graph/layout';
import {
  brand,
  neutral,
  radius as tokenRadius,
  sceneThemes,
  signal,
  typography,
} from '../../src/lib/design/tokens';
import { DigitRoll } from './SpotlightSweep';
import { EASE, Sheen, SpeedBlur, ramp, rgbaOf, softShadow } from './Polish';

const VIDI_TYPOGRAPHY = {
  fontSans: typography.fontFamily,
  fontMono: typography.monoFamily,
  fontDisplay: typography.fontFamily,
} as const;

const VIDI_RADII = {
  lg: 16,
  xl: tokenRadius.xl,
  pill: tokenRadius.pill,
} as const;

const VIDI_Z_INDEX = {
  backdrop: 1,
  surface: 10,
  floatingCards: 20,
  overlay: 40,
} as const;

const VIDI_SHADOWS = {
  cardSubtle: softShadow(14, { color: neutral.void, strength: 1.0 }),
  cardElevated: softShadow(22, { color: neutral.void, strength: 1.5 }),
  Stage3D: softShadow(32, { color: neutral.void, strength: 2.0 }),
} as const;

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

export function resolveMediaAssetSrc(rawUrl: string): string {
  if (
    rawUrl.startsWith('http://') ||
    rawUrl.startsWith('https://') ||
    rawUrl.startsWith('data:') ||
    rawUrl.startsWith('blob:')
  ) {
    return rawUrl;
  }
  const clean = rawUrl.startsWith('/') ? rawUrl.slice(1) : rawUrl;
  return staticFile(clean);
}

/**
 * Adaptive Media Surface for arbitrary real PNG/JPG/WebP/SVG captures of any aspect ratio
 * (e.g. 3840x3492 tall full-page captures, 320x647 vertical sidebars, 1728x1080 16:10 windows).
 * Combines a soft-blurred ambient backdrop fill (`objectFit: 'cover'`) with a crisp
 * non-cropping foreground capture (`objectFit: 'contain'`) so UI headers and sidebars are never cut off.
 */
export const AdaptiveMediaSurface: React.FC<{
  mediaUrl: string;
  isDark: boolean;
  accentColor: string;
  fitMode?: 'contain' | 'cover';
  scrollProgress?: number;
  style?: React.CSSProperties;
}> = ({
  mediaUrl,
  isDark,
  accentColor,
  fitMode = 'contain',
  scrollProgress = 0,
  style,
}) => {
  const src = resolveMediaAssetSrc(mediaUrl);
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const clampedScroll = Math.max(0, Math.min(1, scrollProgress));

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: isDark ? palette.bgPrimary : palette.surfaceSubtle,
        ...style,
      }}
    >
      {/* Ambient blurred fill eliminating dead letterbox/pillarbox bars for non-16:9 captures */}
      <Img
        src={src}
        style={{
          position: 'absolute',
          inset: -16,
          width: 'calc(100% + 32px)',
          height: 'calc(100% + 32px)',
          objectFit: 'cover',
          filter: 'blur(22px)',
          opacity: isDark ? 0.28 : 0.22,
          pointerEvents: 'none',
        }}
      />
      {/* Subtle radial keylight tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 40%, ${withAlpha(
            accentColor,
            isDark ? 0.12 : 0.06
          )} 0%, transparent 72%)`,
          pointerEvents: 'none',
        }}
      />
      {/* Sharp foreground capture preserving full UI hierarchy */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: fitMode === 'contain' ? 12 : 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fitMode,
            objectPosition: `50% ${(clampedScroll * 100).toFixed(1)}%`,
            borderRadius: fitMode === 'contain' ? VIDI_RADII.lg : 0,
            boxShadow: fitMode === 'contain' ? VIDI_SHADOWS.cardSubtle : undefined,
          }}
        />
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 1. EXPLODED 2.5D UI (`exploded_25d_ui`)                                   */
/*    Ported from MultiplaneReal.tsx + ProductCardProgressiveAssemble.tsx    */
/* ========================================================================= */

export interface Exploded25DUIProps {
  payload: Exploded25DUIPayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const Exploded25DUI: React.FC<Exploded25DUIProps> = ({
  payload,
  canvas,
  accentColor,
  isDark,
  hasTopCaption = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const isVertical = canvas.width < canvas.height;
  const safe = getSafeArea({ width: canvas.width, height: canvas.height });

  const safeLeft = safe.x;
  const safeTop = safe.y;
  const safeBottom = canvas.height - (safe.y + safe.height);

  const topInset = safeTop + (hasTopCaption ? (isVertical ? 116 : 96) : 0);
  const availWidth = safe.width;
  const availHeight = Math.max(360, safe.height - (topInset - safeTop));

  // Continuous horizontal camera drift driving 3 depth planes (0.35x, 0.7x, 1.4x)
  const maxDrift = payload.cameraDrivePx ?? (isVertical ? 84 : 156);
  const cam = interpolate(frame, [0, Math.max(30, durationInFrames)], [0, maxDrift], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const camPrev = interpolate(
    Math.max(0, frame - 1),
    [0, Math.max(30, durationInFrames)],
    [0, maxDrift],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const camVel = cam - camPrev;

  // Autofill search bar typing
  const queryText =
    payload.surfaceTitle ??
    payload.subheadline ??
    `${payload.headline} — tokens, breakpoints & live components`;
  const typedCount = Math.floor(
    interpolate(frame, [6, 36], [0, queryText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const visibleQuery = queryText.slice(0, typedCount);

  // Hero card focus lift at f >= 34 (ProductCardProgressiveAssemble pattern)
  const layers = payload.layers;
  const heroIdx = Math.min(
    layers.length - 1,
    Math.max(0, payload.heroIndex ?? 0)
  );
  const heroLiftProgress = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.9 },
  });

  const bgPlaneShift = -cam * 0.35 + (isVertical ? 24 : 52);
  const midPlaneShift = -cam * 0.7 + (isVertical ? 38 : 68);
  const fgPlaneShift = -cam * 1.4 + (isVertical ? 54 : 96);

  const defaultBgGhostLabels = [
    'GRID TOKENS • 12-COL FLUID',
    'AST SYNTHESIS • STRICT TS',
    'VIEWPORT MATRIX • 16:9 / 9:16',
    'EDGE DEPLOY • ZERO COLD START',
  ];

  const defaultFgPills =
    payload.foregroundPills && payload.foregroundPills.length > 0
      ? payload.foregroundPills
      : ['Tokens Synced', 'WCAG AAA', 'Live Preview'];

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: VIDI_TYPOGRAPHY.fontSans,
        userSelect: 'none',
      }}
    >
      {/* PLANE 1 (0.35x Far Depth Layer): Soft-focus architectural ghost planes */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          top: topInset + (isVertical ? 120 : 96),
          width: availWidth,
          height: availHeight - 100,
          transform: `translate3d(${bgPlaneShift.toFixed(2)}px, 0, 0)`,
          filter: 'blur(4px)',
          opacity: isDark ? 0.34 : 0.42,
          pointerEvents: 'none',
          zIndex: VIDI_Z_INDEX.backdrop + 1,
        }}
      >
        {payload.mediaUrl ? (
          <div
            style={{
              width: isVertical ? availWidth * 0.92 : availWidth * 0.78,
              height: isVertical ? 360 : 420,
              borderRadius: VIDI_RADII.xl,
              overflow: 'hidden',
              border: `1px solid ${withAlpha(accentColor, 0.28)}`,
              backgroundColor: palette.bgSecondary,
            }}
          >
            <AdaptiveMediaSurface
              mediaUrl={payload.mediaUrl}
              isDark={isDark}
              accentColor={accentColor}
              fitMode="contain"
            />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isVertical ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {defaultBgGhostLabels.map((ghost, idx) => (
              <div
                key={idx}
                style={{
                  height: isVertical ? 150 : 220,
                  borderRadius: VIDI_RADII.lg,
                  backgroundColor: isDark
                    ? withAlpha(palette.bgSecondary, 0.85)
                    : withAlpha(palette.surfaceSubtle, 0.9),
                  border: `1px solid ${palette.surfaceBorder}`,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: VIDI_TYPOGRAPHY.fontMono,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: palette.textSecondary,
                  }}
                >
                  {ghost}
                </span>
                <div
                  style={{
                    height: 8,
                    width: `${62 + ((idx * 13) % 30)}%`,
                    borderRadius: VIDI_RADII.pill,
                    backgroundColor: withAlpha(accentColor, 0.35),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PLANE 0 (0.0x Pinned Viewport Header inside Safe Area) */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          top: topInset,
          width: availWidth,
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isVertical ? 'flex-start' : 'center',
          gap: 12,
          zIndex: VIDI_Z_INDEX.floatingCards,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {payload.eyebrow && (
            <span
              style={{
                fontFamily: VIDI_TYPOGRAPHY.fontMono,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: accentColor,
              }}
            >
              {payload.eyebrow}
            </span>
          )}
          <h2
            style={{
              margin: 0,
              fontSize: isVertical ? 40 : 48,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: palette.textPrimary,
            }}
          >
            {payload.headline}
          </h2>
        </div>

        {/* Autofill Search / Command Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderRadius: VIDI_RADII.lg,
            backgroundColor: isDark
              ? withAlpha(palette.bgSecondary, 0.94)
              : withAlpha(palette.surfaceCard, 0.96),
            border: `1.5px solid ${withAlpha(accentColor, 0.5)}`,
            boxShadow: VIDI_SHADOWS.cardElevated,
            minWidth: isVertical ? Math.min(availWidth, 520) : 440,
            maxWidth: isVertical ? availWidth : 540,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: VIDI_RADII.pill,
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: VIDI_TYPOGRAPHY.fontMono,
              fontSize: 16,
              fontWeight: 600,
              color: palette.textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {visibleQuery}
          </span>
        </div>
      </div>

      {/* PLANE 2 (0.70x Mid Product Plane): Progressive Card Assembly + Hero Lift */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          top: topInset + (isVertical ? 205 : 148),
          width: availWidth,
          transform: `translate3d(${(midPlaneShift * 0.35).toFixed(2)}px, 0, 0)`,
          display: 'grid',
          gridTemplateColumns: isVertical
            ? '1fr'
            : `repeat(${Math.min(4, layers.length)}, minmax(0, 1fr))`,
          gap: isVertical ? 18 : 22,
          zIndex: VIDI_Z_INDEX.surface + 2,
        }}
      >
        {layers.slice(0, isVertical ? 3 : 4).map((card, idx) => {
          const cardStart = 6 + idx * 5;
          const enterSpring = spring({
            frame: Math.max(0, frame - cardStart),
            fps,
            config: { damping: 16, stiffness: 170, mass: 0.85 },
          });
          const tagEnter = spring({
            frame: Math.max(0, frame - (cardStart + 4)),
            fps,
            config: { damping: 18, stiffness: 190 },
          });
          const valEnter = spring({
            frame: Math.max(0, frame - (cardStart + 8)),
            fps,
            config: { damping: 18, stiffness: 170 },
          });

          const isHero = idx === heroIdx;
          const cardAccent = card.accentColor ?? accentColor;
          const liftScale = isHero
            ? 1 + 0.045 * heroLiftProgress
            : 1 - 0.02 * heroLiftProgress;
          const liftY = isHero ? -12 * heroLiftProgress : 4 * heroLiftProgress;
          const siblingDim = isHero ? 1 : 1 - 0.26 * heroLiftProgress;

          return (
            <div
              key={card.id}
              style={{
                position: 'relative',
                padding: isVertical ? '22px 24px' : '26px 24px',
                borderRadius: VIDI_RADII.xl,
                backgroundColor: isDark
                  ? withAlpha(palette.bgSecondary, 0.94)
                  : withAlpha(palette.surfaceCard, 0.97),
                border: isHero
                  ? `2px solid ${cardAccent}`
                  : `1px solid ${palette.surfaceBorder}`,
                boxShadow: isHero ? VIDI_SHADOWS.Stage3D : VIDI_SHADOWS.cardSubtle,
                transform: `translate3d(0, ${((1 - enterSpring) * 32 + liftY).toFixed(2)}px, 0) scale(${(
                  (0.92 + 0.08 * enterSpring) *
                  liftScale
                ).toFixed(4)})`,
                opacity: enterSpring * siblingDim,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                minHeight: isVertical ? 168 : 250,
              }}
            >
              {isHero && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: VIDI_RADII.xl,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                  }}
                >
                  <Sheen
                    progress={ramp(frame, 36, 28, EASE.smooth)}
                    angle={24}
                  />
                </div>
              )}

              {/* Row 1: Tag Badge + Index */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  opacity: tagEnter,
                  transform: `translateY(${((1 - tagEnter) * 10).toFixed(1)}px)`,
                }}
              >
                <span
                  style={{
                    fontFamily: VIDI_TYPOGRAPHY.fontMono,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: VIDI_RADII.pill,
                    backgroundColor: isHero
                      ? withAlpha(cardAccent, 0.18)
                      : withAlpha(palette.textSecondary, 0.12),
                    color: isHero ? cardAccent : palette.textSecondary,
                  }}
                >
                  {card.badge ?? (isHero ? 'PRIMARY MODULE' : `PLANE 0${idx + 1}`)}
                </span>
                <span
                  style={{
                    fontFamily: VIDI_TYPOGRAPHY.fontMono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: palette.textSecondary,
                  }}
                >
                  0{idx + 1}
                </span>
              </div>

              {/* Row 2: Card Title + Subtitle + Items */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  opacity: valEnter,
                  transform: `translateY(${((1 - valEnter) * 12).toFixed(1)}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: isVertical ? 26 : 28,
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.15,
                    color: palette.textPrimary,
                  }}
                >
                  {card.title}
                </div>
                {card.subtitle && (
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 500,
                      color: palette.textSecondary,
                      lineHeight: 1.35,
                    }}
                  >
                    {card.subtitle}
                  </div>
                )}
                {card.items && card.items.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    {card.items.slice(0, 3).map((item, itemIdx) => (
                      <span
                        key={itemIdx}
                        style={{
                          fontFamily: VIDI_TYPOGRAPHY.fontMono,
                          fontSize: 13,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: VIDI_RADII.pill,
                          backgroundColor: withAlpha(cardAccent, 0.12),
                          color: isHero ? cardAccent : palette.textPrimary,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 3: Progressive Telemetry Bar */}
              <div
                style={{
                  height: 6,
                  width: '100%',
                  borderRadius: VIDI_RADII.pill,
                  backgroundColor: withAlpha(palette.textSecondary, 0.15),
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((isHero ? 92 : 68 + idx * 8) * valEnter)}%`,
                    borderRadius: VIDI_RADII.pill,
                    backgroundColor: isHero ? cardAccent : palette.accentSecondary,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* PLANE 3 (1.40x Near Foreground Layer): Floating glass pills with SpeedBlur */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          bottom: safeBottom + (isVertical ? 24 : 18),
          width: availWidth,
          height: 60,
          zIndex: VIDI_Z_INDEX.floatingCards + 2,
          pointerEvents: 'none',
        }}
      >
        <SpeedBlur vx={camVel * 1.4} vy={0}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              transform: `translate3d(${(fgPlaneShift * 0.28).toFixed(2)}px, 0, 0)`,
            }}
          >
            {defaultFgPills.map((pill, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 20px',
                  borderRadius: VIDI_RADII.pill,
                  backgroundColor: isDark
                    ? withAlpha(palette.bgPrimary, 0.88)
                    : withAlpha(palette.surfaceCard, 0.92),
                  border: `1.5px solid ${withAlpha(accentColor, idx === 0 ? 0.65 : 0.32)}`,
                  boxShadow: VIDI_SHADOWS.cardSubtle,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: VIDI_RADII.pill,
                    backgroundColor: idx === 0 ? palette.statusSuccess : accentColor,
                  }}
                />
                <span
                  style={{
                    fontFamily: VIDI_TYPOGRAPHY.fontMono,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: palette.textPrimary,
                  }}
                >
                  {pill}
                </span>
              </div>
            ))}
          </div>
        </SpeedBlur>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 2. MASK REVEAL (`mask_reveal`)                                            */
/*    Ported from opening/text-as-mask/TextAsMask.tsx                        */
/* ========================================================================= */

export interface MaskRevealProps {
  payload: MaskRevealPayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const MaskReveal: React.FC<MaskRevealProps> = ({
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

  const safeLeft = safe.x;
  const safeRight = canvas.width - (safe.x + safe.width);
  const safeTop = safe.y;
  const safeBottom = canvas.height - (safe.y + safe.height);

  const topInset = safeTop + (hasTopCaption ? (isVertical ? 112 : 88) : 0);

  // Phase 1 (0..22): Inhale (1.0 -> 0.965) so viewer reads the knock-out wordmark
  const inhale = interpolate(frame, [0, 22], [1, 0.965], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Phase 2 (22..52): Exponential rush through the center glyph (t^1.8 up to 38x)
  const rushProgress = interpolate(frame, [22, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const maskScale = inhale + Math.pow(rushProgress, 1.8) * 38;

  // Counter-scale inner dashboard during Phase 1 so UI inside letterforms stays crisp
  const innerCounterScale = 1 / Math.min(maskScale, 2.4);
  const dashboardZoom = interpolate(innerCounterScale, [1 / 2.4, 1], [1.0, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Mask overlay fades out cleanly once glyph aperture covers viewport
  const maskOverlayOpacity = interpolate(frame, [38, 52], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const maskId = `shotcraft-mask-${payload.maskWord.replace(/[^a-zA-Z0-9]/g, '')}`;
  const maskFontSize = isVertical
    ? Math.min(220, Math.floor((canvas.width * 0.86) / Math.max(3, payload.maskWord.length * 0.62)))
    : Math.min(340, Math.floor((canvas.width * 0.82) / Math.max(3, payload.maskWord.length * 0.58)));

  const kpis =
    payload.kpis && payload.kpis.length > 0
      ? payload.kpis
      : [
          { label: 'GRID ENGINE', value: '12-Col Fluid' },
          { label: 'CODE SYNTHESIS', value: 'Strict TS' },
          { label: 'VIEWPORTS', value: '16:9 + 9:16' },
        ];

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: VIDI_TYPOGRAPHY.fontSans,
        userSelect: 'none',
      }}
    >
      {/* INNER WORLD: Live Product Dashboard revealed through the letterforms */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${dashboardZoom.toFixed(4)})`,
          transformOrigin: '50% 50%',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: topInset,
          paddingBottom: safeBottom,
          paddingLeft: safeLeft,
          paddingRight: safeRight,
          gap: isVertical ? 20 : 24,
        }}
      >
        {/* Dashboard Top Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isVertical ? 'flex-start' : 'center',
            gap: 12,
            padding: '18px 24px',
            borderRadius: VIDI_RADII.xl,
            backgroundColor: isDark
              ? withAlpha(palette.bgSecondary, 0.92)
              : withAlpha(palette.surfaceCard, 0.94),
            border: `1.5px solid ${withAlpha(accentColor, 0.42)}`,
            boxShadow: VIDI_SHADOWS.cardElevated,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: VIDI_RADII.pill,
                  backgroundColor: palette.statusSuccess,
                  boxShadow: `0 0 10px ${palette.statusSuccess}`,
                }}
              />
              <span
                style={{
                  fontFamily: VIDI_TYPOGRAPHY.fontMono,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: accentColor,
                }}
              >
                {payload.eyebrow ?? payload.subheadline ?? 'LIVE SYSTEM ARCHITECTURE'}
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: isVertical ? 38 : 44,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: palette.textPrimary,
                lineHeight: 1.1,
              }}
            >
              {payload.dashboardTitle}
            </h2>
          </div>

          {payload.statusBadge && (
            <div
              style={{
                padding: '8px 18px',
                borderRadius: VIDI_RADII.pill,
                backgroundColor: withAlpha(accentColor, 0.14),
                border: `1px solid ${withAlpha(accentColor, 0.4)}`,
                fontFamily: VIDI_TYPOGRAPHY.fontMono,
                fontSize: 15,
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {payload.statusBadge}
            </div>
          )}
        </div>

        {/* KPI Strip + Optional Real Capture Preview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isVertical
              ? '1fr'
              : `repeat(${Math.min(4, kpis.length)}, minmax(0, 1fr))`,
            gap: 18,
          }}
        >
          {kpis.slice(0, isVertical ? 3 : 4).map((kpi, idx) => {
            const kpiSpring = spring({
              frame: Math.max(0, frame - (30 + idx * 4)),
              fps,
              config: { damping: 16, stiffness: 170 },
            });
            const isDemo = kpi.provenance === 'demo-sample';

            return (
              <div
                key={idx}
                style={{
                  padding: '20px 22px',
                  borderRadius: VIDI_RADII.lg,
                  backgroundColor: isDark
                    ? withAlpha(palette.bgSecondary, 0.92)
                    : withAlpha(palette.surfaceCard, 0.96),
                  border: `1px solid ${
                    idx === 0 ? withAlpha(accentColor, 0.65) : palette.surfaceBorder
                  }`,
                  boxShadow: VIDI_SHADOWS.cardSubtle,
                  transform: `translateY(${((1 - kpiSpring) * 18).toFixed(1)}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: VIDI_TYPOGRAPHY.fontMono,
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: palette.textSecondary,
                    }}
                  >
                    {kpi.label}
                  </span>
                  {isDemo && (
                    <span
                      style={{
                        fontFamily: VIDI_TYPOGRAPHY.fontMono,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: VIDI_RADII.pill,
                        backgroundColor: withAlpha(palette.statusWarning, 0.18),
                        color: palette.statusWarning,
                      }}
                    >
                      DEMO SAMPLE
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: idx === 0 ? accentColor : palette.textPrimary,
                  }}
                >
                  <DigitRoll
                    value={kpi.value}
                    delay={32 + idx * 4}
                    fontSize={36}
                    color={idx === 0 ? accentColor : palette.textPrimary}
                    frame={frame}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Lower Studio Surface Preview */}
        <div
          style={{
            flex: 1,
            minHeight: isVertical ? 240 : 280,
            borderRadius: VIDI_RADII.xl,
            overflow: 'hidden',
            border: `1.5px solid ${palette.surfaceBorder}`,
            backgroundColor: isDark
              ? withAlpha(palette.bgSecondary, 0.88)
              : withAlpha(palette.surfaceCard, 0.92),
            boxShadow: VIDI_SHADOWS.Stage3D,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {payload.mediaUrl ? (
            <Img
              src={resolveMediaAssetSrc(payload.mediaUrl)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: 28,
                display: 'grid',
                gridTemplateColumns: isVertical ? '1fr' : '1.4fr 1fr',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span
                  style={{
                    fontFamily: VIDI_TYPOGRAPHY.fontMono,
                    fontSize: 14,
                    fontWeight: 700,
                    color: accentColor,
                    letterSpacing: '0.08em',
                  }}
                >
                  LIVE WORKSPACE CANVAS
                </span>
                <div
                  style={{
                    fontSize: isVertical ? 28 : 34,
                    fontWeight: 750,
                    color: palette.textPrimary,
                    lineHeight: 1.2,
                  }}
                >
                  {payload.headline}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: 20,
                  borderRadius: VIDI_RADII.lg,
                  backgroundColor: withAlpha(accentColor, 0.08),
                  border: `1px solid ${withAlpha(accentColor, 0.28)}`,
                }}
              >
                {kpis.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 16,
                      fontWeight: 600,
                      color: palette.textPrimary,
                    }}
                  >
                    <span style={{ color: palette.textSecondary }}>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OUTER KNOCK-OUT SVG TEXT MASK OVERLAY */}
      {maskOverlayOpacity > 0.005 && (
        <svg
          width={canvas.width}
          height={canvas.height}
          viewBox={`0 0 ${canvas.width} ${canvas.height}`}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: maskOverlayOpacity,
            pointerEvents: 'none',
            zIndex: VIDI_Z_INDEX.overlay,
          }}
        >
          <defs>
            <mask id={maskId}>
              {/* White = opaque wall, Black = transparent letter window into dashboard */}
              <rect width={canvas.width} height={canvas.height} fill="white" />
              <g
                transform={`translate(${canvas.width / 2}, ${canvas.height / 2}) scale(${maskScale.toFixed(
                  4
                )})`}
              >
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontFamily={VIDI_TYPOGRAPHY.fontDisplay}
                  fontWeight={900}
                  fontSize={maskFontSize}
                  letterSpacing="-0.04em"
                >
                  {payload.maskWord}
                </text>
              </g>
            </mask>
          </defs>

          <rect
            width={canvas.width}
            height={canvas.height}
            fill={palette.bgPrimary}
            mask={`url(#${maskId})`}
          />

          {/* Crisp accent rim stroke around the letter aperture during Phase 1 */}
          <g
            transform={`translate(${canvas.width / 2}, ${canvas.height / 2}) scale(${maskScale.toFixed(
              4
            )})`}
            opacity={interpolate(frame, [0, 26, 40], [0.95, 0.85, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}
          >
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              fill="none"
              stroke={accentColor}
              strokeWidth={2.5}
              fontFamily={VIDI_TYPOGRAPHY.fontDisplay}
              fontWeight={900}
              fontSize={maskFontSize}
              letterSpacing="-0.04em"
            >
              {payload.maskWord}
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};

/* ========================================================================= */
/* 3. BENTO CASCADE (`bento_cascade`)                                        */
/*    Ported from ui-entrance/deck-deal-flyin/DeckDealFlyin.tsx              */
/* ========================================================================= */

export interface BentoCascadeProps {
  payload: BentoCascadePayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const BentoCascade: React.FC<BentoCascadeProps> = ({
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

  const safeLeft = safe.x;
  const safeTop = safe.y;
  const safeBottom = canvas.height - (safe.y + safe.height);

  const topInset = safeTop + (hasTopCaption ? (isVertical ? 164 : 92) : 0);
  const headerHeight = isVertical ? 110 : 96;
  const gridTop = topInset + headerHeight;
  const gridWidth = safe.width;
  const gridHeight = Math.max(360, canvas.height - gridTop - safeBottom);

  const cards = payload.cards.slice(0, 6);
  const cols = isVertical ? 2 : 3;
  const rows = Math.ceil(cards.length / cols);
  const gap = isVertical ? 18 : 22;
  const cellW = (gridWidth - gap * (cols - 1)) / cols;
  const cellH = Math.min(
    isVertical ? 250 : 240,
    (gridHeight - gap * Math.max(1, rows - 1)) / Math.max(1, rows)
  );

  // Deck origin coordinates in bottom-left of Bento stage
  const deckX = 0;
  const deckY = Math.max(0, gridHeight - cellH);

  // Anticipation press on stacked deck before deal starts (frames 4..12, Rule Q8)
  const deckStart = 12;
  const pressScale =
    frame < deckStart
      ? interpolate(frame, [0, 6, 10, deckStart], [1, 1, 0.94, 1.02], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  // Rule R2: Non-linear quadratic accelerating launch schedule
  const dealCue = (k: number) => Math.round(deckStart + k * 4.4 - 0.14 * k * (k - 1));

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: VIDI_TYPOGRAPHY.fontSans,
        userSelect: 'none',
      }}
    >
      {/* Header inside Safe Area */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          top: topInset,
          width: gridWidth,
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isVertical ? 'flex-start' : 'flex-end',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {payload.eyebrow && (
            <span
              style={{
                fontFamily: VIDI_TYPOGRAPHY.fontMono,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: accentColor,
              }}
            >
              {payload.eyebrow}
            </span>
          )}
          <h2
            style={{
              margin: 0,
              fontSize: isVertical ? 40 : 48,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: palette.textPrimary,
              lineHeight: 1.08,
            }}
          >
            {payload.headline}
          </h2>
        </div>

        <div
          style={{
            fontFamily: VIDI_TYPOGRAPHY.fontMono,
            fontSize: 14,
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: VIDI_RADII.pill,
            backgroundColor: withAlpha(accentColor, 0.14),
            border: `1px solid ${withAlpha(accentColor, 0.38)}`,
            color: accentColor,
          }}
        >
          {payload.counterLabel ?? `${cards.length} MODULAR UNITS • READY`}
        </div>
      </div>

      {/* Bento Deal Stage */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          top: gridTop,
          width: gridWidth,
          height: gridHeight,
        }}
      >
        {cards.map((card, k) => {
          const col = k % cols;
          const row = Math.floor(k / cols);
          const targetX = col * (cellW + gap);
          const targetY = row * (cellH + gap);

          const start = dealCue(k);
          const p = spring({
            frame: Math.max(0, frame - start),
            fps,
            config: { damping: 15, stiffness: 175, mass: 0.78 },
          });
          // 2-frame motion ghost & 3-frame shadow lag (DeckDealFlyin signature)
          const pGhost = spring({
            frame: Math.max(0, frame - start - 2),
            fps,
            config: { damping: 15, stiffness: 175, mass: 0.78 },
          });
          const pShadow = spring({
            frame: Math.max(0, frame - start - 3),
            fps,
            config: { damping: 18, stiffness: 120, mass: 0.9 },
          });

          const stackOffset = (cards.length - 1 - k) * 3;
          const x = interpolate(p, [0, 1], [deckX + stackOffset, targetX]);
          const yLin = interpolate(p, [0, 1], [deckY - stackOffset, targetY]);
          const arcLift = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI) * -52;
          const y = yLin + arcLift;

          const xGhost = interpolate(pGhost, [0, 1], [deckX + stackOffset, targetX]);
          const yGhost =
            interpolate(pGhost, [0, 1], [deckY - stackOffset, targetY]) +
            Math.sin(Math.min(1, Math.max(0, pGhost)) * Math.PI) * -52;

          const startRot = (k % 2 === 0 ? -1 : 1) * (3 + (k % 3));
          const rot = interpolate(p, [0, 1], [startRot, 0]);
          const inFlight = p > 0.02 && p < 0.96;

          const isPrimary = k === 0;
          const cardAccent = card.accentColor ?? accentColor;

          return (
            <React.Fragment key={card.id}>
              {/* Trailing Ghost Echo during Parabolic Flight */}
              {inFlight && (
                <div
                  style={{
                    position: 'absolute',
                    left: xGhost,
                    top: yGhost,
                    width: cellW,
                    height: cellH,
                    borderRadius: VIDI_RADII.xl,
                    backgroundColor: withAlpha(cardAccent, 0.16),
                    border: `1px solid ${withAlpha(cardAccent, 0.35)}`,
                    opacity: Math.sin(p * Math.PI) * 0.32,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Settled Bento Card */}
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: cellW,
                  height: cellH,
                  borderRadius: VIDI_RADII.xl,
                  padding: isVertical ? '20px 22px' : '24px 26px',
                  backgroundColor: isDark
                    ? withAlpha(palette.bgSecondary, 0.95)
                    : withAlpha(palette.surfaceCard, 0.98),
                  border: isPrimary
                    ? `2px solid ${cardAccent}`
                    : `1px solid ${palette.surfaceBorder}`,
                  boxShadow:
                    pShadow > 0.5 ? VIDI_SHADOWS.cardElevated : VIDI_SHADOWS.cardSubtle,
                  transform: `rotate(${rot.toFixed(2)}deg) scale(${(
                    frame < deckStart ? pressScale : 1
                  ).toFixed(4)})`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  zIndex: 10 + k,
                }}
              >
                {isPrimary && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: VIDI_RADII.xl,
                      overflow: 'hidden',
                      pointerEvents: 'none',
                    }}
                  >
                    <Sheen
                      progress={ramp(frame, 44, 26, EASE.smooth)}
                      angle={22}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: VIDI_TYPOGRAPHY.fontMono,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 12px',
                      borderRadius: VIDI_RADII.pill,
                      backgroundColor: isPrimary
                        ? withAlpha(cardAccent, 0.18)
                        : withAlpha(palette.textSecondary, 0.12),
                      color: isPrimary ? cardAccent : palette.textSecondary,
                    }}
                  >
                    {card.category}
                  </span>
                  {card.badge && (
                    <span
                      style={{
                        fontFamily: VIDI_TYPOGRAPHY.fontMono,
                        fontSize: 15,
                        fontWeight: 800,
                        color: cardAccent,
                      }}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div
                    style={{
                      fontSize: isVertical ? 24 : 26,
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      color: palette.textPrimary,
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1.35,
                      color: palette.textSecondary,
                    }}
                  >
                    {card.description}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4. CROP CALLOUT FOCUS (`crop_callout`)                                    */
/*    Ported from effects/scanline-annotate-focus/ScanlineAnnotateFocus.tsx  */
/* ========================================================================= */

export interface CropCalloutFocusProps {
  payload: CropCalloutPayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const CropCalloutFocus: React.FC<CropCalloutFocusProps> = ({
  payload,
  canvas,
  accentColor,
  isDark,
  hasTopCaption = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const palette = isDark ? VIDI_PALETTES.dark : VIDI_PALETTES.light;
  const isVertical = canvas.width < canvas.height;
  const safe = getSafeArea({ width: canvas.width, height: canvas.height });

  const safeLeft = safe.x;
  const safeTop = safe.y;
  const safeBottom = canvas.height - (safe.y + safe.height);

  const topInset = safeTop + (hasTopCaption ? (isVertical ? 164 : 92) : 0);
  const surfaceW = safe.width;
  const surfaceH = Math.max(400, canvas.height - topInset - safeBottom);

  // Constant-velocity horizontal laser scanline sweeping across the product window
  const scanStart = 6;
  const scanEnd = Math.max(scanStart + 24, Math.min(64, Math.floor(durationInFrames * 0.68)));
  const scanY = interpolate(frame, [scanStart, scanEnd], [-24, surfaceH + 36], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scanOpacity = interpolate(
    frame,
    [scanStart, scanStart + 5, scanEnd - 6, scanEnd],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Compute trigger frames when scanline crosses each target's normalized Y
  const targetsWithTrigger = payload.targets.map((t, idx) => {
    const targetPxY = t.y * surfaceH;
    const triggerFrame = Math.round(
      scanStart + ((targetPxY + 24) / (surfaceH + 60)) * (scanEnd - scanStart)
    );
    return {
      ...t,
      idx,
      targetPxX: t.x * surfaceW,
      targetPxY,
      triggerFrame,
    };
  });

  const activeSignalsCount = targetsWithTrigger.filter(
    (t) => frame >= t.triggerFrame
  ).length;

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: VIDI_TYPOGRAPHY.fontSans,
        userSelect: 'none',
      }}
    >
      {/* Main Product Inspection Window inside Safe Area */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          top: topInset,
          width: surfaceW,
          height: surfaceH,
          borderRadius: VIDI_RADII.xl,
          backgroundColor: isDark
            ? withAlpha(palette.bgSecondary, 0.95)
            : withAlpha(palette.surfaceCard, 0.97),
          border: `1.5px solid ${palette.surfaceBorder}`,
          boxShadow: VIDI_SHADOWS.Stage3D,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Window Top Chrome + Live Signal Counter */}
        <div
          style={{
            height: 60,
            padding: '0 24px',
            borderBottom: `1px solid ${palette.surfaceBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark
              ? withAlpha(palette.bgPrimary, 0.65)
              : withAlpha(palette.surfaceSubtle, 0.8),
            zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 7 }}>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: VIDI_RADII.pill,
                  backgroundColor: palette.statusDanger,
                }}
              />
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: VIDI_RADII.pill,
                  backgroundColor: palette.statusWarning,
                }}
              />
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: VIDI_RADII.pill,
                  backgroundColor: palette.statusSuccess,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: VIDI_TYPOGRAPHY.fontMono,
                fontSize: 15,
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {payload.windowTitle ?? payload.headline}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px',
              borderRadius: VIDI_RADII.pill,
              backgroundColor: withAlpha(accentColor, 0.15),
              border: `1px solid ${withAlpha(accentColor, 0.45)}`,
              fontFamily: VIDI_TYPOGRAPHY.fontMono,
              fontSize: 13,
              fontWeight: 700,
              color: accentColor,
            }}
          >
            <span>{payload.statusLabel ?? 'INSPECTION LOCK'}</span>
            <span>
              • {activeSignalsCount}/{payload.targets.length}
            </span>
          </div>
        </div>

        {/* Split Non-Occluding Inspection Layout:
            Zone A (UI Capture + Transparent HUD Reticles) + Zone B (Peripheral Callout Dock Rail) */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
          }}
        >
          {/* ZONE A: Unoccluded Product Capture Viewport with Transparent HUD Reticles */}
          <div
            style={{
              position: 'relative',
              flex: isVertical ? '0 0 58%' : '0 0 64%',
              height: isVertical ? '58%' : '100%',
              overflow: 'hidden',
              borderRight: isVertical ? undefined : `1px solid ${palette.surfaceBorder}`,
              borderBottom: isVertical ? `1px solid ${palette.surfaceBorder}` : undefined,
            }}
          >
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
                  padding: isVertical ? 20 : 28,
                  display: 'grid',
                  gridTemplateColumns: isVertical ? '1fr' : 'repeat(3, 1fr)',
                  gap: 16,
                  opacity: 0.55,
                }}
              >
                {payload.targets.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: VIDI_RADII.lg,
                      border: `1px solid ${palette.surfaceBorder}`,
                      backgroundColor: isDark ? palette.bgPrimary : palette.surfaceSubtle,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: VIDI_TYPOGRAPHY.fontMono,
                        fontSize: 13,
                        color: palette.textSecondary,
                      }}
                    >
                      {t.head}
                    </span>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: palette.textPrimary,
                      }}
                    >
                      {t.detail}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Laser Scanline + Trailing Dot-Matrix Band */}
            {scanOpacity > 0.01 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: scanY - 56,
                  height: 58,
                  opacity: scanOpacity,
                  pointerEvents: 'none',
                  zIndex: 12,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 56,
                    backgroundImage: `radial-gradient(${withAlpha(accentColor, 0.42)} 1.5px, transparent 1.5px)`,
                    backgroundSize: '12px 12px',
                    maskImage: 'linear-gradient(180deg, transparent 0%, black 100%)',
                    WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 100%)',
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: 2.5,
                    backgroundColor: accentColor,
                    boxShadow: `0 0 18px ${accentColor}`,
                  }}
                />
              </div>
            )}

            {/* Transparent HUD Reticle Boxes on the Capture (Zero UI Text Occlusion) */}
            {targetsWithTrigger.map((t) => {
              const localF = frame - t.triggerFrame;
              if (localF < 0) return null;

              const pop = spring({
                frame: localF,
                fps,
                config: { damping: 15, stiffness: 210, mass: 0.75 },
              });
              const zoneW = isVertical ? surfaceW : surfaceW * 0.64;
              const zoneH = isVertical ? (surfaceH - 60) * 0.58 : surfaceH - 60;
              const retW = Math.max(96, Math.min(220, (t.width ?? 0.24) * zoneW));
              const retH = Math.max(54, Math.min(110, (t.height ?? 0.14) * zoneH));
              const retLeft = Math.max(
                14,
                Math.min(zoneW - retW - 14, t.x * zoneW - retW * 0.5)
              );
              const retTop = Math.max(
                14,
                Math.min(zoneH - retH - 14, t.y * zoneH - retH * 0.5)
              );

              return (
                <div
                  key={`reticle-${t.id}`}
                  style={{
                    position: 'absolute',
                    left: retLeft,
                    top: retTop,
                    width: retW,
                    height: retH,
                    borderRadius: 10,
                    backgroundColor: withAlpha(accentColor, 0.06),
                    border: `1.5px dashed ${withAlpha(accentColor, 0.78)}`,
                    boxShadow: `0 0 0 2px ${withAlpha(accentColor, 0.14)}`,
                    transform: `scale(${(1.18 - 0.18 * pop).toFixed(4)})`,
                    opacity: Math.min(1, localF / 4),
                    pointerEvents: 'none',
                    zIndex: 14,
                  }}
                >
                  {/* 4 L-Corner HUD Brackets */}
                  {[
                    { top: -3, left: -3, borderTop: true, borderLeft: true },
                    { top: -3, right: -3, borderTop: true, borderRight: true },
                    { bottom: -3, left: -3, borderBottom: true, borderLeft: true },
                    { bottom: -3, right: -3, borderBottom: true, borderRight: true },
                  ].map((corner, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        position: 'absolute',
                        top: corner.top,
                        bottom: corner.bottom,
                        left: corner.left,
                        right: corner.right,
                        width: 11,
                        height: 11,
                        borderTop: corner.borderTop ? `2.5px solid ${accentColor}` : undefined,
                        borderBottom: corner.borderBottom
                          ? `2.5px solid ${accentColor}`
                          : undefined,
                        borderLeft: corner.borderLeft ? `2.5px solid ${accentColor}` : undefined,
                        borderRight: corner.borderRight
                          ? `2.5px solid ${accentColor}`
                          : undefined,
                      }}
                    />
                  ))}
                  {/* Compact Index Tag on Corner */}
                  <span
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: 8,
                      padding: '2px 8px',
                      borderRadius: VIDI_RADII.pill,
                      backgroundColor: accentColor,
                      color: neutral.white,
                      fontFamily: VIDI_TYPOGRAPHY.fontMono,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                    }}
                  >
                    0{t.idx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ZONE B: Peripheral Callout Dock Rail (Never Occludes the Capture in Zone A) */}
          <div
            style={{
              flex: 1,
              padding: isVertical ? '14px 18px' : '18px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: isVertical ? 10 : 14,
              backgroundColor: isDark
                ? withAlpha(palette.bgPrimary, 0.72)
                : withAlpha(palette.surfaceSubtle, 0.78),
              zIndex: 16,
            }}
          >
            {targetsWithTrigger.map((t) => {
              const localF = frame - t.triggerFrame;
              const isLocked = localF >= 0;
              const pop = isLocked
                ? spring({
                    frame: localF,
                    fps,
                    config: { damping: 15, stiffness: 210, mass: 0.75 },
                  })
                : 0;
              const tagChars = isLocked
                ? Math.min(t.head.length, Math.max(1, Math.floor((localF + 2) * 1.6)))
                : 0;
              const isDemo = t.provenance === 'demo-sample';

              return (
                <div
                  key={t.id}
                  style={{
                    position: 'relative',
                    padding: isVertical ? '12px 16px' : '14px 18px',
                    borderRadius: VIDI_RADII.lg,
                    backgroundColor: isDark
                      ? withAlpha(palette.bgSecondary, 0.96)
                      : withAlpha(palette.surfaceCard, 0.98),
                    border: `1.5px solid ${
                      isLocked ? withAlpha(accentColor, 0.78) : palette.surfaceBorder
                    }`,
                    boxShadow: isLocked ? VIDI_SHADOWS.cardElevated : VIDI_SHADOWS.cardSubtle,
                    transform: `translateX(${((1 - pop) * 18).toFixed(2)}px) scale(${(
                      0.94 +
                      0.06 * pop
                    ).toFixed(4)})`,
                    opacity: isLocked ? Math.min(1, localF / 5 + 0.2) : 0.26,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: VIDI_RADII.pill,
                          backgroundColor: withAlpha(accentColor, 0.18),
                          color: accentColor,
                          fontFamily: VIDI_TYPOGRAPHY.fontMono,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        0{t.idx + 1}
                      </span>
                      <span
                        style={{
                          fontFamily: VIDI_TYPOGRAPHY.fontMono,
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: '0.07em',
                          color: accentColor,
                        }}
                      >
                        {isLocked ? t.head.slice(0, tagChars) : t.head}
                      </span>
                    </div>
                    {isDemo && (
                      <span
                        style={{
                          fontFamily: VIDI_TYPOGRAPHY.fontMono,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: VIDI_RADII.pill,
                          backgroundColor: withAlpha(palette.statusWarning, 0.18),
                          color: palette.statusWarning,
                        }}
                      >
                        DEMO SAMPLE
                      </span>
                    )}
                  </div>

                  {t.metricValue && (
                    <div
                      style={{
                        fontSize: isVertical ? 24 : 26,
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: palette.textPrimary,
                        lineHeight: 1.1,
                      }}
                    >
                      <DigitRoll
                        value={t.metricValue}
                        delay={t.triggerFrame + 2}
                        fontSize={isVertical ? 24 : 26}
                        color={palette.textPrimary}
                        frame={frame}
                      />
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: isVertical ? 14 : 15,
                      fontWeight: 600,
                      color: palette.textSecondary,
                      lineHeight: 1.3,
                    }}
                  >
                    {t.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 5. WHIP-PAN BRAKE (`whip_pan`)                                            */
/*    Ported from transition/shot-transitions/WhipBrakeReal.tsx              */
/* ========================================================================= */

const WHIP_INTEGRAL_STEPS = 60;
const WHIP_V0 = 92;
const WHIP_DISP_TABLE: number[] = [0];
for (let i = 1; i <= WHIP_INTEGRAL_STEPS; i++) {
  const u = i - 0.5;
  const ramp =
    u < 3
      ? (() => {
          const x = u / 3;
          return x * x * (3 - 2 * x);
        })()
      : 1;
  const v = WHIP_V0 * Math.exp((-6 * u) / WHIP_INTEGRAL_STEPS) * ramp;
  WHIP_DISP_TABLE.push(WHIP_DISP_TABLE[i - 1] + v);
}
const WHIP_TOTAL_RAW_DISP = WHIP_DISP_TABLE[WHIP_INTEGRAL_STEPS];

function sampleWhipDisp(u: number): number {
  if (u <= 0) return 0;
  if (u >= WHIP_INTEGRAL_STEPS) return WHIP_TOTAL_RAW_DISP;
  const i = Math.floor(u);
  const frac = u - i;
  return WHIP_DISP_TABLE[i] * (1 - frac) + WHIP_DISP_TABLE[i + 1] * frac;
}

export interface WhipPanSceneProps {
  payload: WhipPanPayload;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  hasTopCaption?: boolean;
}

export const WhipPanScene: React.FC<WhipPanSceneProps> = ({
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

  const safeLeft = safe.x;
  const safeTop = safe.y;
  const safeBottom = canvas.height - (safe.y + safe.height);

  const topInset = safeTop + (hasTopCaption ? (isVertical ? 164 : 92) : 0);
  const panels = payload.panels;
  const targetIdx = Math.min(
    panels.length - 1,
    Math.max(0, payload.targetIndex ?? Math.min(3, panels.length - 1))
  );

  const cardW = isVertical ? Math.min(480, safe.width * 0.84) : 440;
  const cardH = isVertical ? 280 : 300;
  const gap = 36;
  const pitch = cardW + gap;
  const totalDist = targetIdx * pitch;

  const panStart = 4;
  const u = Math.max(0, Math.min(WHIP_INTEGRAL_STEPS, frame - panStart));
  const uPrev = Math.max(0, Math.min(WHIP_INTEGRAL_STEPS, frame - 1 - panStart));

  const scaleFactor = totalDist / Math.max(1, WHIP_TOTAL_RAW_DISP);
  const xOffset = -sampleWhipDisp(u) * scaleFactor;
  const xOffsetPrev = -sampleWhipDisp(uPrev) * scaleFactor;
  const instVelX = Math.abs(xOffset - xOffsetPrev);

  // Target lock elevation after braking settles (f >= 48)
  const lockSpring = spring({
    frame: Math.max(0, frame - 46),
    fps,
    config: { damping: 16, stiffness: 170 },
  });

  const activeIndexFloat = Math.min(
    panels.length - 1,
    Math.max(0, -xOffset / Math.max(1, pitch))
  );
  const currentCardNumber = Math.min(
    panels.length,
    Math.floor(activeIndexFloat + 0.5) + 1
  );

  const lockedTitle = panels[targetIdx]?.title ?? payload.eyebrow;

  return (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        overflow: 'hidden',
        fontFamily: VIDI_TYPOGRAPHY.fontSans,
        userSelect: 'none',
      }}
    >
      {/* Top Header + Mechanical Odometer Counter */}
      <div
        style={{
          position: 'absolute',
          left: safeLeft,
          top: topInset,
          width: safe.width,
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isVertical ? 'flex-start' : 'center',
          gap: 12,
          zIndex: VIDI_Z_INDEX.floatingCards,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontFamily: VIDI_TYPOGRAPHY.fontMono,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: accentColor,
            }}
          >
            {payload.eyebrow}
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: isVertical ? 40 : 48,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: palette.textPrimary,
              lineHeight: 1.08,
            }}
          >
            {lockedTitle}
          </h2>
        </div>

        {/* Odometer Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 20px',
            borderRadius: VIDI_RADII.pill,
            backgroundColor: isDark
              ? withAlpha(palette.bgSecondary, 0.92)
              : withAlpha(palette.surfaceCard, 0.95),
            border: `1.5px solid ${withAlpha(accentColor, 0.55)}`,
            fontFamily: VIDI_TYPOGRAPHY.fontMono,
            fontSize: 16,
            fontWeight: 800,
            color: palette.textPrimary,
          }}
        >
          <span style={{ color: accentColor }}>Nº 0{currentCardNumber}</span>
          <span style={{ color: palette.textSecondary }}>/ 0{panels.length}</span>
        </div>
      </div>

      {/* Center Playhead Bracket Indicator */}
      <div
        style={{
          position: 'absolute',
          left: canvas.width / 2,
          top: topInset + (isVertical ? 140 : 120),
          bottom: safeBottom + 36,
          width: 2,
          backgroundColor: withAlpha(accentColor, 0.28 * (1 - lockSpring * 0.5)),
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Horizontal Whip-Pan Track wrapped in directional SpeedBlur */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: topInset + (isVertical ? 190 : 165),
          height: cardH + 60,
          display: 'flex',
          alignItems: 'center',
          zIndex: VIDI_Z_INDEX.surface + 2,
        }}
      >
        <SpeedBlur vx={instVelX * 1.15} vy={0}>
          <div
            style={{
              position: 'relative',
              left: canvas.width / 2 - cardW / 2,
              display: 'flex',
              gap,
              transform: `translate3d(${xOffset.toFixed(2)}px, 0, 0)`,
            }}
          >
            {panels.map((card, idx) => {
              const isTarget = idx === targetIdx;
              const scale = isTarget ? 1 + 0.12 * lockSpring : 1 - 0.05 * lockSpring;
              const liftY = isTarget ? -14 * lockSpring : 0;
              const dimOpacity = isTarget ? 1 : 1 - 0.38 * lockSpring;

              return (
                <div
                  key={card.id}
                  style={{
                    position: 'relative',
                    width: cardW,
                    height: cardH,
                    flexShrink: 0,
                    padding: '28px 30px',
                    borderRadius: VIDI_RADII.xl,
                    backgroundColor: isDark
                      ? withAlpha(palette.bgSecondary, 0.96)
                      : withAlpha(palette.surfaceCard, 0.98),
                    border: isTarget
                      ? `2px solid ${accentColor}`
                      : `1px solid ${palette.surfaceBorder}`,
                    boxShadow: isTarget ? VIDI_SHADOWS.Stage3D : VIDI_SHADOWS.cardSubtle,
                    transform: `translateY(${liftY.toFixed(2)}px) scale(${scale.toFixed(4)})`,
                    opacity: dimOpacity,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {isTarget && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: VIDI_RADII.xl,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                      }}
                    >
                      <Sheen
                        progress={ramp(frame, 50, 26, EASE.smooth)}
                        angle={24}
                      />
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: VIDI_TYPOGRAPHY.fontMono,
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '5px 12px',
                        borderRadius: VIDI_RADII.pill,
                        backgroundColor: isTarget
                          ? withAlpha(accentColor, 0.18)
                          : withAlpha(palette.textSecondary, 0.12),
                        color: isTarget ? accentColor : palette.textSecondary,
                      }}
                    >
                      {card.category}
                    </span>
                    {card.badge && (
                      <span
                        style={{
                          fontFamily: VIDI_TYPOGRAPHY.fontMono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: isTarget ? palette.statusSuccess : palette.textSecondary,
                        }}
                      >
                        ● {card.badge}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: palette.textPrimary,
                        lineHeight: 1.15,
                      }}
                    >
                      {card.title}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: palette.textSecondary,
                        lineHeight: 1.35,
                      }}
                    >
                      {card.description}
                    </div>
                  </div>

                  <div
                    style={{
                      height: 6,
                      width: '100%',
                      borderRadius: VIDI_RADII.pill,
                      backgroundColor: withAlpha(palette.textSecondary, 0.15),
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: isTarget ? '100%' : '55%',
                        backgroundColor: isTarget ? accentColor : palette.textSecondary,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SpeedBlur>
      </div>
    </div>
  );
};
