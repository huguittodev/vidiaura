/**
 * PageCam25D.tsx
 * Layer 2 & 3 Shotcraft Primitives:
 * - computePageCam25DTransform: Layout-scale CSS `zoom` 2.5D camera transform (Rule Q2).
 * - computeEffectiveFontPx: Effective pixel height calculator for 3D perspective text (Rule Q11).
 * - <PageCam25D />: 2.5D camera container that rasterizes child UI/text at magnified layout scale.
 * - <CropCalloutCard />: Floating Z-elevated (`translateZ`) region callout card with DigitRoll & Sheen.
 *
 * Strictly consumes `src/lib/design/tokens.ts` with zero raw hex literals.
 */

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from 'remotion';
import {
  brand,
  neutral,
  radius as tokenRadius,
  sceneThemes,
  space,
  typography,
} from '../../src/lib/design/tokens';
import type {
  CameraRecipeConfig,
  CropCallout,
  PageCamKey,
} from '../../src/lib/scene-graph/types';
import {
  EASE,
  Sheen,
  hairline,
  innerHighlight,
  mix,
  ramp,
  rgbaOf,
  softShadow,
} from './Polish';
import { DigitRoll } from './SpotlightSweep';

export interface PageCam25DTransformResult {
  cx: number;
  cy: number;
  zoom: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  persp: number;
  tx: number;
  ty: number;
  has3D: boolean;
  cssTransform: string;
  transformOrigin: string;
  perspectivePx: number;
}

/**
 * Resolves a keyframe coordinate (`cx` or `cy`):
 * - Values in [0, 1] are treated as normalized viewport fractions and multiplied by `dimension`.
 * - Values > 1 are treated as direct page-space CSS pixels (e.g. 960, 540).
 */
function resolveCoord(val: number, dimension: number): number {
  if (!Number.isFinite(val)) return dimension / 2;
  if (val >= 0 && val <= 1) {
    return val * dimension;
  }
  return val;
}

/**
 * Generates default 2.5D keyframes for named `CameraRecipeConfig['mode']` recipes
 * when explicit `keys` are not provided.
 */
export function buildDefaultRecipeKeys(
  mode: CameraRecipeConfig['mode'],
  durationInFrames: number = 90,
  width: number = 1920,
  height: number = 1080
): PageCamKey[] {
  const cxMid = width / 2;
  const cyMid = height / 2;
  const end = Math.max(15, durationInFrames);

  switch (mode) {
    case 'dolly-push-in':
      return [
        { frame: 0, cx: cxMid, cy: cyMid, zoom: 1.0, rotX: 6, rotY: -8, rotZ: 0, persp: 1400 },
        { frame: end, cx: cxMid, cy: cyMid * 0.94, zoom: 1.32, rotX: 2, rotY: 0, rotZ: 0, persp: 1400 },
      ];
    case 'isometric-tilt-reveal':
      return [
        { frame: 0, cx: cxMid * 0.92, cy: cyMid * 1.05, zoom: 1.08, rotX: 16, rotY: -18, rotZ: -2, persp: 1350 },
        { frame: Math.round(end * 0.55), cx: cxMid, cy: cyMid, zoom: 1.18, rotX: 10, rotY: -10, rotZ: -1, persp: 1400 },
        { frame: end, cx: cxMid * 1.04, cy: cyMid * 0.96, zoom: 1.24, rotX: 6, rotY: -4, rotZ: 0, persp: 1450 },
      ];
    case 'orbit-drift':
      return [
        { frame: 0, cx: cxMid * 0.96, cy: cyMid, zoom: 1.12, rotX: 8, rotY: 12, rotZ: 1, persp: 1400 },
        { frame: end, cx: cxMid * 1.04, cy: cyMid, zoom: 1.16, rotX: 8, rotY: -12, rotZ: -1, persp: 1400 },
      ];
    case 'whip-pan':
      return [
        { frame: 0, cx: cxMid * 0.65, cy: cyMid, zoom: 1.15, rotX: 4, rotY: -14, rotZ: 0, persp: 1300 },
        { frame: Math.min(18, Math.round(end * 0.3)), cx: cxMid, cy: cyMid, zoom: 1.08, rotX: 2, rotY: 0, rotZ: 0, persp: 1400 },
        { frame: end, cx: cxMid, cy: cyMid, zoom: 1.14, rotX: 0, rotY: 0, rotZ: 0, persp: 1400 },
      ];
    case 'page-cam-2.5d':
    case 'track':
    default:
      return [
        { frame: 0, cx: cxMid, cy: cyMid, zoom: 1.0, rotX: 0, rotY: 0, rotZ: 0, persp: 1400 },
        { frame: end, cx: cxMid, cy: cyMid, zoom: 1.08, rotX: 0, rotY: 0, rotZ: 0, persp: 1400 },
      ];
  }
}

/**
 * Shotcraft Rule Q2: Layout-Scale CSS `zoom` 2.5D Transform.
 *
 * Instead of `transform: scale(zoom)` inside a 3D perspective container (which causes Chromium
 * to rasterize the layer at 1920px layout size and GPU-upscale it, blurring glyph edges),
 * we apply magnification via CSS `zoom` and compute:
 *   Tx = (width / 2) / zoom - cx
 *   Ty = (height / 2) / zoom - cy
 * with `transformOrigin: "${cx}px ${cy}px"`.
 */
export function computePageCam25DTransform(
  keys: PageCamKey[],
  frame: number,
  viewport: { width: number; height: number } = { width: 1920, height: 1080 },
  ease: (t: number) => number = Easing.bezier(0.33, 0, 0.15, 1)
): PageCam25DTransformResult {
  const safeKeys =
    keys.length > 0
      ? keys
      : [{ frame: 0, cx: viewport.width / 2, cy: viewport.height / 2, zoom: 1 }];

  let a = safeKeys[0];
  let b = safeKeys[safeKeys.length - 1];
  for (let i = 0; i < safeKeys.length - 1; i++) {
    if (frame >= safeKeys[i].frame && frame <= safeKeys[i + 1].frame) {
      a = safeKeys[i];
      b = safeKeys[i + 1];
      break;
    }
  }

  const t =
    a.frame === b.frame
      ? 1
      : interpolate(frame, [a.frame, b.frame], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        });

  const cx = mix(
    resolveCoord(a.cx, viewport.width),
    resolveCoord(b.cx, viewport.width),
    t
  );
  const cy = mix(
    resolveCoord(a.cy, viewport.height),
    resolveCoord(b.cy, viewport.height),
    t
  );
  const zoom = Math.max(0.5, Math.min(4.0, mix(a.zoom, b.zoom, t)));

  const has3D = safeKeys.some(
    (k) =>
      k.rotX !== undefined ||
      k.rotY !== undefined ||
      k.rotZ !== undefined ||
      k.persp !== undefined
  );

  const rotX = mix(a.rotX ?? 0, b.rotX ?? 0, t);
  const rotY = mix(a.rotY ?? 0, b.rotY ?? 0, t);
  const rotZ = mix(a.rotZ ?? 0, b.rotZ ?? 0, t);
  const persp = mix(a.persp ?? 1400, b.persp ?? 1400, t);

  const tx = viewport.width / 2 / zoom - cx;
  const ty = viewport.height / 2 / zoom - cy;

  const cssTransform = has3D
    ? `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) rotateY(${rotY.toFixed(
        3
      )}deg) rotateX(${rotX.toFixed(3)}deg) rotateZ(${rotZ.toFixed(3)}deg)`
    : `translate(${(viewport.width / 2 - cx * zoom).toFixed(3)}px, ${(
        viewport.height / 2 -
        cy * zoom
      ).toFixed(3)}px) scale(${zoom.toFixed(4)})`;

  return {
    cx,
    cy,
    zoom,
    rotX,
    rotY,
    rotZ,
    persp,
    tx,
    ty,
    has3D,
    cssTransform,
    transformOrigin: has3D ? `${cx.toFixed(2)}px ${cy.toFixed(2)}px` : '0 0',
    perspectivePx: persp * zoom,
  };
}

/**
 * Shotcraft Rule Q11: Computes effective on-screen glyph height in pixels on a 1080p canvas
 * after parent `scale`, camera `zoom`, and 3D `rotY` foreshortening (`cos(rotY)`).
 */
export function computeEffectiveFontPx(params: {
  fontSizePx: number;
  parentScale?: number;
  cameraZoom?: number;
  rotYDeg?: number;
}): number {
  const { fontSizePx, parentScale = 1, cameraZoom = 1, rotYDeg = 0 } = params;
  const foreshortening = Math.cos((Math.abs(rotYDeg) * Math.PI) / 180);
  return fontSizePx * parentScale * cameraZoom * Math.max(0.1, foreshortening);
}

/**
 * Shotcraft Rule Q11 Readability Check:
 * - Narrative captions (`'caption'`) must render at >= 56px effective height.
 * - Secondary labels (`'secondary'`) must render at >= 32px effective height.
 */
export function isFontReadableOn1080p(
  effectivePx: number,
  role: 'caption' | 'secondary' = 'secondary'
): boolean {
  const minThreshold = role === 'caption' ? 56 : 32;
  return effectivePx >= minThreshold - 1e-6;
}

export const PageCam25D: React.FC<{
  recipe: CameraRecipeConfig;
  durationInFrames: number;
  width?: number;
  height?: number;
  frame?: number;
  children: React.ReactNode;
}> = ({
  recipe,
  durationInFrames,
  width = 1920,
  height = 1080,
  frame: frameProp,
  children,
}) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  const keys =
    recipe.keys && recipe.keys.length > 0
      ? recipe.keys
      : buildDefaultRecipeKeys(recipe.mode, durationInFrames, width, height);

  const cam = computePageCam25DTransform(keys, frame, { width, height });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          perspective: cam.has3D ? `${cam.perspectivePx.toFixed(1)}px` : undefined,
          perspectiveOrigin: `${width / 2}px ${height / 2}px`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width,
            height,
            zoom: cam.has3D ? cam.zoom : undefined,
            transform: cam.cssTransform,
            transformOrigin: cam.transformOrigin,
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>
      </div>

      {/* Optional screen-space depth-of-field tilt-shift top band */}
      {recipe.dof && recipe.dof.strength > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: Math.max(0, recipe.dof.focusY),
            backdropFilter: `blur(${recipe.dof.strength}px)`,
            WebkitBackdropFilter: `blur(${recipe.dof.strength}px)`,
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Layer 3 Floating Z-Axis Region Cutout Card (`CropCalloutCard`).
 * Elevates a key product metric or region above the main UI surface in `preserve-3d` space (`translateZ(elevationZ)`),
 * with a two-layer contact + ambient shadow, top inner highlight, optional `<DigitRoll />`, and clipped `<Sheen />`.
 */
export const CropCalloutCard: React.FC<{
  callout: CropCallout;
  canvasWidth?: number;
  canvasHeight?: number;
  isDark?: boolean;
  defaultAccent?: string;
  frame?: number;
  enableSheen?: boolean;
}> = ({
  callout,
  canvasWidth = 1920,
  canvasHeight = 1080,
  isDark = true,
  defaultAccent = brand.purpleGlow,
  frame: frameProp,
  enableSheen = false,
}) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  const enterFrame = callout.enterFrame ?? 8;
  const popSpring = spring({
    frame: frame - enterFrame,
    fps: 30,
    config: { damping: 16, stiffness: 160, mass: 0.9 },
  });

  if (frame < enterFrame - 1) return null;

  const cardW = callout.width ?? 380;
  const cardH = callout.height ?? 138;
  const targetZ = callout.elevationZ ?? 95;
  const currentZ = mix(10, targetZ, popSpring);
  const floatY = Math.sin(((frame - enterFrame) / 28) * Math.PI) * 5;
  const accent = callout.accentColor ?? defaultAccent;
  const tone = isDark ? 'dark' : 'light';

  const leftPx = Math.round(callout.x * canvasWidth - cardW / 2);
  const topPx = Math.round(callout.y * canvasHeight - cardH / 2);
  const sheenProgress = enableSheen
    ? ramp(frame, enterFrame + 10, 24, EASE.smooth)
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: leftPx,
        top: topPx,
        width: cardW,
        minHeight: cardH,
        padding: `${space.md}px ${space.lg}px`,
        borderRadius: tokenRadius.xl,
        background: isDark
          ? sceneThemes.obsidian.surfaceRaised
          : sceneThemes.studioLight.surface,
        border: `1.5px solid ${rgbaOf(accent, 0.55)}`,
        boxShadow: `${innerHighlight(isDark ? 0.14 : 0.85)}, ${softShadow(
          currentZ * 0.45,
          {
            strength: isDark ? 2.5 : 1.2,
            color: brand.obsidian,
          }
        )}, 0 0 28px ${rgbaOf(accent, 0.25)}`,
        transform: `translate3d(0px, ${((1 - popSpring) * 28 + floatY).toFixed(
          2
        )}px, ${currentZ.toFixed(1)}px) scale(${mix(0.86, 1, popSpring).toFixed(3)})`,
        opacity: Math.min(1, popSpring * 1.35),
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: space.xs,
        fontFamily: typography.fontFamily,
        zIndex: 25,
      }}
    >
      {/* Top badge + label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.sm,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: typography.weight.bold,
            color: isDark ? brand.textSecondary : neutral.textSecondary,
            letterSpacing: '-0.01em',
          }}
        >
          {callout.label}
        </span>
        {callout.badge ? (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: tokenRadius.pill,
              background: rgbaOf(accent, 0.18),
              border: hairline(0.16, tone),
              color: accent,
              fontSize: 16,
              fontWeight: typography.weight.bold,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {callout.badge}
          </span>
        ) : null}
      </div>

      {/* Primary Metric / Value (Rule Q11: >= 36px tabular-nums) */}
      {callout.metricValue ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: space.sm,
          }}
        >
          <DigitRoll
            value={callout.metricValue}
            delay={enterFrame + 2}
            fontSize={42}
            color={isDark ? brand.text : neutral.ink}
            frame={frame}
          />
          {callout.sublabel ? (
            <span
              style={{
                fontSize: 20,
                fontWeight: typography.weight.medium,
                color: accent,
              }}
            >
              {callout.sublabel}
            </span>
          ) : null}
        </div>
      ) : callout.sublabel ? (
        <div
          style={{
            fontSize: 32,
            fontWeight: typography.weight.bold,
            color: isDark ? brand.text : neutral.ink,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}
        >
          {callout.sublabel}
        </div>
      ) : null}

      {/* Rule Q4: Single-pass clipped Sheen on hero callout */}
      {enableSheen ? (
        <Sheen progress={sheenProgress} color={neutral.white} strength={0.38} />
      ) : null}
    </div>
  );
};

