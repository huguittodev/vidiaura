/**
 * PageCam25D.tsx
 * Layer 2 & 3 Shotcraft Primitives:
 * - computePageCam25DTransform: Layout-scale CSS `zoom` 2.5D camera transform (Rule Q2) with frustum clamping.
 * - computeCameraFrustumSafeBounds: Projects screen-space safe area into 2.5D page coordinates at depth Z.
 * - resolveCalloutPositions: Clamps and de-collides floating Z-elevated callout cards for 16:9 and 9:16.
 * - computeEffectiveFontPx: Effective pixel height calculator for 3D perspective text (Rule Q11).
 * - <PageCam25D />: 2.5D camera container that rasterizes child UI/text at magnified layout scale without clipping headers.
 * - <CropCalloutCard />: Elastic, non-truncating Z-elevated (`translateZ`) region callout card with DigitRoll, provenance badge & Sheen.
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
  signal,
  space,
  typography,
} from '../../src/lib/design/tokens';
import { getSafeArea } from '../../src/lib/scene-graph/layout';
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

export interface CameraFrustumSafeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ResolvedCalloutBox {
  id: string;
  leftPx: number;
  topPx: number;
  widthPx: number;
  minHeightPx: number;
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
        { frame: 0, cx: cxMid, cy: cyMid, zoom: 1.0, rotX: 5, rotY: -6, rotZ: 0, persp: 1450 },
        { frame: end, cx: cxMid, cy: cyMid * 0.96, zoom: 1.18, rotX: 2, rotY: 0, rotZ: 0, persp: 1450 },
      ];
    case 'isometric-tilt-reveal':
      return [
        { frame: 0, cx: cxMid * 0.96, cy: cyMid * 1.02, zoom: 1.04, rotX: 13, rotY: -14, rotZ: -1.5, persp: 1400 },
        { frame: Math.round(end * 0.55), cx: cxMid, cy: cyMid, zoom: 1.12, rotX: 8, rotY: -8, rotZ: -0.5, persp: 1450 },
        { frame: end, cx: cxMid * 1.02, cy: cyMid * 0.98, zoom: 1.16, rotX: 4, rotY: -3, rotZ: 0, persp: 1500 },
      ];
    case 'orbit-drift':
      return [
        { frame: 0, cx: cxMid * 0.97, cy: cyMid, zoom: 1.06, rotX: 6, rotY: 9, rotZ: 0.8, persp: 1450 },
        { frame: end, cx: cxMid * 1.03, cy: cyMid, zoom: 1.1, rotX: 6, rotY: -9, rotZ: -0.8, persp: 1450 },
      ];
    case 'whip-pan':
      return [
        { frame: 0, cx: cxMid * 0.72, cy: cyMid, zoom: 1.1, rotX: 3, rotY: -12, rotZ: 0, persp: 1380 },
        { frame: Math.min(18, Math.round(end * 0.3)), cx: cxMid, cy: cyMid, zoom: 1.04, rotX: 1, rotY: 0, rotZ: 0, persp: 1450 },
        { frame: end, cx: cxMid, cy: cyMid, zoom: 1.08, rotX: 0, rotY: 0, rotZ: 0, persp: 1450 },
      ];
    case 'page-cam-2.5d':
    case 'track':
    default:
      return [
        { frame: 0, cx: cxMid, cy: cyMid, zoom: 1.0, rotX: 0, rotY: 0, rotZ: 0, persp: 1450 },
        { frame: end, cx: cxMid, cy: cyMid, zoom: 1.06, rotX: 0, rotY: 0, rotZ: 0, persp: 1450 },
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
 *
 * Also clamps focal excursion `(cx, cy)` relative to `zoom` so the camera never pans
 * the primary canvas safe zone outside the viewport.
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

  const rawCx = mix(
    resolveCoord(a.cx, viewport.width),
    resolveCoord(b.cx, viewport.width),
    t
  );
  const rawCy = mix(
    resolveCoord(a.cy, viewport.height),
    resolveCoord(b.cy, viewport.height),
    t
  );
  const zoom = Math.max(0.5, Math.min(4.0, mix(a.zoom, b.zoom, t)));

  // Clamp focal center excursion so panning at zoom > 1 does not expose canvas edges or clip central headers
  const maxPanRatioX = Math.min(0.22, Math.max(0.06, (zoom - 0.85) * 0.25));
  const maxPanRatioY = Math.min(0.18, Math.max(0.05, (zoom - 0.85) * 0.2));
  const cx = Math.max(
    viewport.width * (0.5 - maxPanRatioX),
    Math.min(viewport.width * (0.5 + maxPanRatioX), rawCx)
  );
  const cy = Math.max(
    viewport.height * (0.5 - maxPanRatioY),
    Math.min(viewport.height * (0.5 + maxPanRatioY), rawCy)
  );

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
 * Projects the screen-space safe area (`getSafeArea(viewport)`) into 2.5D page-space coordinates
 * for an element elevated at `elevationZ` (`translateZ`), accounting for camera `zoom`,
 * focal offset `(cx, cy)`, perspective magnification `persp / (persp - Z)`, and 3D rotation foreshortening.
 *
 * Guarantees that any element clamped to `[minX, maxX] × [minY, maxY]` inside `<PageCam25D />`
 * remains 100% inside the screen safe margins on both 16:9 (1920×1080) and 9:16 (1080×1920).
 */
export function computeCameraFrustumSafeBounds(
  cam: PageCam25DTransformResult,
  viewport: { width: number; height: number } = { width: 1920, height: 1080 },
  options?: {
    elevationZ?: number;
    topClearancePx?: number;
  }
): CameraFrustumSafeBounds {
  const safe = getSafeArea(viewport);
  const elevationZ = options?.elevationZ ?? 0;
  const topClearancePx = options?.topClearancePx ?? 0;

  // Perspective magnification for a plane at +elevationZ toward the camera
  const persp = Math.max(600, cam.persp);
  const zMagnification = persp / Math.max(240, persp - Math.max(0, elevationZ));
  const effectiveZoom = Math.max(0.5, cam.zoom * zMagnification);

  // Rotational foreshortening + perspective edge swing safety factor
  const cosY = Math.max(0.74, Math.cos((Math.abs(cam.rotY) * Math.PI) / 180));
  const cosX = Math.max(0.74, Math.cos((Math.abs(cam.rotX) * Math.PI) / 180));

  const safeLeftScreen = safe.x;
  const safeRightScreen = safe.x + safe.width;
  const safeTopScreen = safe.y + topClearancePx;
  const safeBottomScreen = safe.y + safe.height;

  const halfWLeft = ((viewport.width / 2 - safeLeftScreen) / effectiveZoom) * cosY;
  const halfWRight = ((safeRightScreen - viewport.width / 2) / effectiveZoom) * cosY;
  const halfHTop = ((viewport.height / 2 - safeTopScreen) / effectiveZoom) * cosX;
  const halfHBottom = ((safeBottomScreen - viewport.height / 2) / effectiveZoom) * cosX;

  const minX = Math.round(Math.max(safe.x, cam.cx - halfWLeft));
  const maxX = Math.round(Math.min(safe.x + safe.width, cam.cx + halfWRight));
  const minY = Math.round(Math.max(safeTopScreen, cam.cy - halfHTop));
  const maxY = Math.round(Math.min(safeBottomScreen, cam.cy + halfHBottom));

  return {
    minX,
    maxX: Math.max(minX + 200, maxX),
    minY,
    maxY: Math.max(minY + 140, maxY),
    width: Math.max(200, maxX - minX),
    height: Math.max(140, maxY - minY),
  };
}

/**
 * Resolves clamped, non-overlapping page-space positions for all `CropCallout` cards in a scene.
 * Works across both 16:9 landscape and 9:16 vertical canvases.
 */
export function resolveCalloutPositions(
  callouts: CropCallout[],
  cam: PageCam25DTransformResult,
  viewport: { width: number; height: number } = { width: 1920, height: 1080 },
  options?: { hasCaptionBar?: boolean }
): Map<string, ResolvedCalloutBox> {
  const result = new Map<string, ResolvedCalloutBox>();
  if (callouts.length === 0) return result;

  const isVertical = viewport.width < viewport.height;
  const topClearancePx = options?.hasCaptionBar ? 74 : 16;

  const placed: ResolvedCalloutBox[] = [];

  for (const c of callouts) {
    const elevationZ = c.elevationZ ?? 95;
    const frustum = computeCameraFrustumSafeBounds(cam, viewport, {
      elevationZ,
      topClearancePx,
    });

    const desiredW = c.width ?? (isVertical ? 340 : 384);
    const maxAllowedW = Math.max(240, Math.round(frustum.width * (isVertical ? 0.88 : 0.46)));
    const widthPx = Math.min(desiredW, maxAllowedW);

    const hasBothMetricAndSub = Boolean(c.metricValue && c.sublabel);
    const naturalMinH = hasBothMetricAndSub ? 156 : 132;
    const minHeightPx = Math.max(c.height ?? naturalMinH, naturalMinH);

    const rawLeft = Math.round(c.x * viewport.width - widthPx / 2);
    const rawTop = Math.round(c.y * viewport.height - minHeightPx / 2);

    let leftPx = Math.max(
      frustum.minX,
      Math.min(frustum.maxX - widthPx, rawLeft)
    );
    let topPx = Math.max(
      frustum.minY,
      Math.min(frustum.maxY - minHeightPx, rawTop)
    );

    // Deterministic collision resolution against already-placed callouts
    const gap = 20;
    for (let pass = 0; pass < 3; pass++) {
      for (const other of placed) {
        const overlapX =
          leftPx < other.leftPx + other.widthPx + gap &&
          leftPx + widthPx + gap > other.leftPx;
        const overlapY =
          topPx < other.topPx + other.minHeightPx + gap &&
          topPx + minHeightPx + gap > other.topPx;

        if (overlapX && overlapY) {
          // Prefer vertical separation within frustum bounds
          const pushDown = other.topPx + other.minHeightPx + gap;
          const pushUp = other.topPx - minHeightPx - gap;
          if (pushDown + minHeightPx <= frustum.maxY) {
            topPx = pushDown;
          } else if (pushUp >= frustum.minY) {
            topPx = pushUp;
          } else {
            // Horizontal separation fallback
            const pushRight = other.leftPx + other.widthPx + gap;
            const pushLeft = other.leftPx - widthPx - gap;
            if (pushRight + widthPx <= frustum.maxX) {
              leftPx = pushRight;
            } else if (pushLeft >= frustum.minX) {
              leftPx = pushLeft;
            }
          }
        }
      }
    }

    const box: ResolvedCalloutBox = {
      id: c.id,
      leftPx,
      topPx,
      widthPx,
      minHeightPx,
    };
    placed.push(box);
    result.set(c.id, box);
  }

  return result;
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
  hasCaptionBar?: boolean;
  children: React.ReactNode;
}> = ({
  recipe,
  durationInFrames,
  width = 1920,
  height = 1080,
  frame: frameProp,
  hasCaptionBar = false,
  children,
}) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  const keys =
    recipe.keys && recipe.keys.length > 0
      ? recipe.keys
      : buildDefaultRecipeKeys(recipe.mode, durationInFrames, width, height);

  const cam = computePageCam25DTransform(keys, frame, { width, height });

  // Compute safe framing compensation so full-canvas headers/titles inside `children`
  // are never clipped by the viewport edges when `cam.zoom > 1` or when a top captionBar is present.
  const peakZoom = Math.max(1, ...keys.map((k) => k.zoom ?? 1));
  const subjectInsetScale = Math.min(
    1,
    Math.max(0.76, 0.92 / Math.max(1, peakZoom))
  );
  const topCaptionOffsetPx = hasCaptionBar ? 28 : 0;

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
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform:
                subjectInsetScale < 0.999 || topCaptionOffsetPx > 0
                  ? `translateY(${topCaptionOffsetPx}px) scale(${subjectInsetScale.toFixed(4)})`
                  : undefined,
              transformOrigin: '50% 52%',
              transformStyle: 'preserve-3d',
            }}
          >
            {children}
          </div>
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
 * with a two-layer contact + ambient shadow, top inner highlight, optional `<DigitRoll />`,
 * vertical non-overlapping text hierarchy, provenance badge, optional HUD lock-on bracket, and clipped `<Sheen />`.
 */
export const CropCalloutCard: React.FC<{
  callout: CropCallout;
  resolvedBox?: ResolvedCalloutBox;
  canvasWidth?: number;
  canvasHeight?: number;
  isDark?: boolean;
  defaultAccent?: string;
  frame?: number;
  enableSheen?: boolean;
}> = ({
  callout,
  resolvedBox,
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

  const cardW = resolvedBox?.widthPx ?? callout.width ?? 384;
  const minCardH = resolvedBox?.minHeightPx ?? callout.height ?? 144;
  const leftPx =
    resolvedBox?.leftPx ?? Math.round(callout.x * canvasWidth - cardW / 2);
  const topPx =
    resolvedBox?.topPx ?? Math.round(callout.y * canvasHeight - minCardH / 2);

  const targetZ = callout.elevationZ ?? 95;
  const currentZ = mix(10, targetZ, popSpring);
  const floatY = Math.sin(((frame - enterFrame) / 28) * Math.PI) * 4;
  const accent = callout.accentColor ?? defaultAccent;
  const tone = isDark ? 'dark' : 'light';

  const sheenProgress = enableSheen
    ? ramp(frame, enterFrame + 10, 24, EASE.smooth)
    : 0;

  const isDemoSample = callout.provenance === 'demo-sample';
  const badgeText = isDemoSample
    ? 'DEMO SAMPLE'
    : callout.badge;
  const badgeColor = isDemoSample ? signal.trafficAmber : accent;

  // Optional HUD corner bracket animation (ported from ScanlineAnnotateFocus)
  const bracketPad = Math.max(0, (1 - popSpring) * 36);
  const bracketArm = 22;

  return (
    <div
      style={{
        position: 'absolute',
        left: leftPx,
        top: topPx,
        width: cardW,
        minHeight: minCardH,
        padding: `${space.md}px ${space.lg}px`,
        borderRadius: tokenRadius.xl,
        background: isDark
          ? sceneThemes.obsidian.surfaceRaised
          : sceneThemes.studioLight.surface,
        border: `1.5px solid ${rgbaOf(accent, 0.58)}`,
        boxShadow: `${innerHighlight(isDark ? 0.14 : 0.85)}, ${softShadow(
          currentZ * 0.45,
          {
            strength: isDark ? 2.4 : 1.15,
            color: brand.obsidian,
          }
        )}, 0 0 28px ${rgbaOf(accent, 0.22)}`,
        transform: `translate3d(0px, ${((1 - popSpring) * 24 + floatY).toFixed(
          2
        )}px, ${currentZ.toFixed(1)}px) scale(${mix(0.88, 1, popSpring).toFixed(3)})`,
        opacity: Math.min(1, popSpring * 1.35),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: space.xs,
        fontFamily: typography.fontFamily,
        boxSizing: 'border-box',
        zIndex: 25,
      }}
    >
      {/* Optional HUD Lock-On Corner Brackets */}
      {callout.showBracket ? (
        <svg
          width={cardW + bracketPad * 2 + 16}
          height={minCardH + bracketPad * 2 + 16}
          style={{
            position: 'absolute',
            left: -bracketPad - 8,
            top: -bracketPad - 8,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <path
            d={[
              `M0 ${bracketArm}V0H${bracketArm}`,
              `M${cardW + bracketPad * 2 + 16 - bracketArm} 0H${cardW + bracketPad * 2 + 16}V${bracketArm}`,
              `M${cardW + bracketPad * 2 + 16} ${minCardH + bracketPad * 2 + 16 - bracketArm}V${minCardH + bracketPad * 2 + 16}H${cardW + bracketPad * 2 + 16 - bracketArm}`,
              `M${bracketArm} ${minCardH + bracketPad * 2 + 16}H0V${minCardH + bracketPad * 2 + 16 - bracketArm}`,
            ].join(' ')}
            fill="none"
            stroke={accent}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {/* Row 1: Label + Badge Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.sm,
          width: '100%',
        }}
      >
        <span
          style={{
            fontSize: 19,
            fontWeight: typography.weight.bold,
            color: isDark ? brand.textSecondary : neutral.textSecondary,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            flex: 1,
            minWidth: 0,
          }}
        >
          {callout.label}
        </span>
        {badgeText ? (
          <span
            style={{
              padding: '4px 11px',
              borderRadius: tokenRadius.pill,
              background: rgbaOf(badgeColor, 0.18),
              border: hairline(0.18, tone),
              color: badgeColor,
              fontSize: 14,
              fontWeight: typography.weight.bold,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {badgeText}
          </span>
        ) : null}
      </div>

      {/* Row 2: Dedicated Metric Value Row (never collides horizontally with sublabel) */}
      {callout.metricValue ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            marginTop: 2,
          }}
        >
          <DigitRoll
            value={callout.metricValue}
            delay={enterFrame + 2}
            fontSize={40}
            color={isDark ? brand.text : neutral.ink}
            frame={frame}
          />
        </div>
      ) : null}

      {/* Row 3: Dedicated Sublabel Row (elastic height, zero truncation) */}
      {callout.sublabel ? (
        <div
          style={{
            fontSize: callout.metricValue ? 18 : 26,
            fontWeight: callout.metricValue
              ? typography.weight.medium
              : typography.weight.bold,
            color: callout.metricValue
              ? accent
              : isDark
                ? brand.text
                : neutral.ink,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}
        >
          {callout.sublabel}
        </div>
      ) : null}

      {/* Rule Q4: Single-pass clipped Sheen inside dedicated overflow-hidden overlay */}
      {enableSheen ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: tokenRadius.xl,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Sheen progress={sheenProgress} color={neutral.white} strength={0.36} />
        </div>
      ) : null}
    </div>
  );
};
