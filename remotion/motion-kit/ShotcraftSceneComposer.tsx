/**
 * ShotcraftSceneComposer.tsx
 * Deterministic 5-Layer Composable Shot Engine for SceneGraph v3.
 *
 * Orchestrates:
 * - Layer 1: Stage & Backdrop Atmosphere (<StageAtmosphereLayer />: GridFloor, Dust, ClipCard video backdrop, Vignette, Grain)
 * - Layer 2: Spatial Slot & 2.5D Layout-Scale Camera Rig (<PageCam25D /> per Rule Q2)
 * - Layer 3: Primary Subject Atom + Floating Z-Elevated Cutouts (<CropCalloutCard /> in preserve-3d)
 * - Layer 4: Light & Emphasis Modifiers (<SpeedBlur />, <SpotlightSweep />, single-pass <Sheen /> per Rule Q4, <ShotcraftCaptionBar /> per Rule Q11)
 * - Layer 5: Temporal Seam Transitions (<ShotTransitionOverlay />: flash-cut, whip-pan-brake, portal-zoom-wipe)
 *
 * Preserves 100% backward compatibility: when a v2.0 SceneNode has no v3 descriptors,
 * it renders the children untouched with zero overhead.
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  alpha,
  brand,
  neutral,
  radius as tokenRadius,
  space,
  typography,
} from '../../src/lib/design/tokens';
import { getSafeArea } from '../../src/lib/scene-graph/layout';
import type {
  ArtDirection,
  CanvasConfig,
  CaptionBarModifier,
  SceneNode,
  StageLayerConfig,
} from '../../src/lib/scene-graph/types';
import {
  Dust,
  EASE,
  Grain,
  GridFloor,
  Sheen,
  SpeedBlur,
  Vignette,
  mix,
  ramp,
  rgbaOf,
} from './Polish';
import { CropCalloutCard, PageCam25D } from './PageCam25D';
import {
  ClipCard,
  ShotTransitionOverlay,
  SpotlightSweep,
} from './SpotlightSweep';

/**
 * Layer 1 Stage & Atmosphere Overlay.
 * Renders optional video backdrop (<ClipCard />), perspective <GridFloor />,
 * deterministic <Dust /> particles, <Vignette />, and cached 6-tile <Grain />.
 */
export const StageAtmosphereLayer: React.FC<{
  stage?: StageLayerConfig;
  isDark: boolean;
  accentColor: string;
  canvas: CanvasConfig;
  frame?: number;
}> = ({ stage, isDark, accentColor, canvas, frame: frameProp }) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  if (!stage) return null;

  const grainOpacity = stage.grainOpacity ?? (isDark ? 0.07 : 0.04);
  const vignetteStrength = stage.vignetteStrength ?? (isDark ? 0.42 : 0.16);
  const keyLightX = stage.keyLight?.x ?? 0.5;
  const keyLightY = stage.keyLight?.y ?? 0.38;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 1 }}>
      {/* Optional external Google Flow / Veo B-roll video backdrop */}
      {stage.backdropVideoUrl ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isDark ? 0.28 : 0.18,
          }}
        >
          <ClipCard
            src={stage.backdropVideoUrl}
            width={canvas.width}
            height={canvas.height}
            radius={0}
            muted={true}
            loopDurationInFrames={120}
            loopCrossfadeInFrames={12}
            durationInFrames={canvas.durationInFrames}
            style={{ border: 'none', boxShadow: 'none' }}
          />
        </div>
      ) : null}

      {/* Key-light atmospheric bloom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 58% 60% at ${(
            keyLightX * 100
          ).toFixed(1)}% ${(keyLightY * 100).toFixed(1)}%, ${rgbaOf(
            accentColor,
            isDark ? 0.22 : 0.12
          )} 0%, transparent 70%)`,
        }}
      />

      {/* Optional perspective horizon SVG GridFloor */}
      {stage.gridFloor ? (
        <GridFloor
          horizon={stage.horizon ?? 0.64}
          scroll={frame * 0.035}
          opacity={isDark ? 0.38 : 0.22}
          color={accentColor}
          dark={isDark}
        />
      ) : null}

      {/* Optional deterministic floating bokeh Dust particles */}
      {stage.dustParticles ? (
        <Dust
          count={32}
          seed={7}
          drift={0.28}
          opacity={isDark ? 0.65 : 0.35}
          color={accentColor}
        />
      ) : null}

      {/* Studio Vignette */}
      {vignetteStrength > 0 ? (
        <Vignette
          strength={vignetteStrength}
          color={isDark ? brand.obsidian : neutral.ink}
          cx={keyLightX}
          cy={Math.min(0.65, keyLightY + 0.1)}
        />
      ) : null}

      {/* Cached 6-tile SVG feTurbulence Film Grain */}
      {grainOpacity > 0 ? (
        <Grain
          opacity={grainOpacity}
          blend={isDark ? 'soft-light' : 'overlay'}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Shotcraft Rule Q11 Compliant Editorial Caption Bar (>= 32px secondary text inside safe area).
 */
export const ShotcraftCaptionBar: React.FC<{
  caption: CaptionBarModifier;
  canvas: CanvasConfig;
  accentColor: string;
  isDark: boolean;
  frame?: number;
}> = ({ caption, canvas, accentColor, isDark, frame: frameProp }) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;
  const safe = getSafeArea(canvas);
  const appearAt = caption.appearAt ?? 2;

  const p = ramp(frame, appearAt, 14, EASE.snappy);
  if (p <= 0.01) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: safe.x,
        top: safe.y,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: space.md,
        opacity: p,
        transform: `translateX(${mix(-20, 0, p).toFixed(2)}px)`,
        pointerEvents: 'none',
        zIndex: 45,
        fontFamily: typography.fontFamily,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: tokenRadius.pill,
          backgroundColor: accentColor,
          boxShadow: `0 0 16px ${alpha.purpleHalo}`,
        }}
      />
      <span
        style={{
          fontSize: 32,
          fontWeight: typography.weight.bold,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: accentColor,
          fontFamily: typography.monoFamily,
        }}
      >
        {caption.index}
      </span>
      <span
        style={{
          fontSize: 32,
          fontWeight: typography.weight.medium,
          letterSpacing: '-0.01em',
          color: isDark ? brand.text : neutral.ink,
        }}
      >
        {caption.text}
      </span>
    </div>
  );
};

/**
 * Checks whether a SceneNode declares any SceneGraph v3 composable layers (Layers 2–5).
 */
export function hasV3ShotLayers(node: SceneNode): boolean {
  return Boolean(
    node.cameraRecipe ||
      (node.cropCallouts && node.cropCallouts.length > 0) ||
      node.modifiers ||
      node.transitionOut
  );
}

/**
 * 5-Layer Composable Shot Wrapper for any SceneNode.
 */
export const ShotcraftSceneComposer: React.FC<{
  node: SceneNode;
  artDirection: ArtDirection;
  canvas: CanvasConfig;
  children: React.ReactNode;
}> = ({ node, artDirection, canvas, children }) => {
  const seqFrame = useCurrentFrame();

  // Fast-path for pure v2.0 scenes: render children untouched
  if (!hasV3ShotLayers(node)) {
    return <>{children}</>;
  }

  const isDark = artDirection.surfaceTheme === 'dark';
  const accent = artDirection.primaryAccent;
  const callouts = node.cropCallouts ?? [];
  const modifiers = node.modifiers;

  // Rule Q4: Apply <Sheen /> at most once per shot (either to the first hero callout or to the hero surface)
  const sheenWanted = Boolean(modifiers?.sheen?.enabled);
  const sheenOnCallout = sheenWanted && callouts.length > 0;
  const sheenOnSurface = sheenWanted && callouts.length === 0;

  const sheenStart = modifiers?.sheen?.startFrame ?? 12;
  const sheenDur = modifiers?.sheen?.durationInFrames ?? 24;
  const surfaceSheenProgress = sheenOnSurface
    ? ramp(seqFrame, sheenStart, sheenDur, EASE.smooth)
    : 0;

  // Layer 3: Primary subject + Z-elevated CropCalloutCards
  let subjectLayer: React.ReactNode = (
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}

      {/* Floating Z-Axis Region Cutouts (Layer 3) */}
      {callouts.map((c, idx) => (
        <CropCalloutCard
          key={c.id}
          callout={c}
          canvasWidth={canvas.width}
          canvasHeight={canvas.height}
          isDark={isDark}
          defaultAccent={accent}
          frame={seqFrame}
          enableSheen={sheenOnCallout && idx === 0}
        />
      ))}

      {/* Single-pass clipped Sheen when no callout card is present (Rule Q4) */}
      {sheenOnSurface && surfaceSheenProgress > 0 && surfaceSheenProgress < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: Math.round(canvas.width * 0.12),
            top: Math.round(canvas.height * 0.1),
            width: Math.round(canvas.width * 0.76),
            height: Math.round(canvas.height * 0.8),
            borderRadius: tokenRadius.xl,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <Sheen
            progress={surfaceSheenProgress}
            angle={modifiers?.sheen?.angle ?? 18}
            strength={modifiers?.sheen?.strength ?? 0.35}
          />
        </div>
      ) : null}
    </div>
  );

  // Layer 2: Wrap in 2.5D Layout-Scale CSS `zoom` Camera Rig if cameraRecipe is specified
  if (node.cameraRecipe && node.cameraRecipe.mode !== 'track') {
    subjectLayer = (
      <PageCam25D
        recipe={node.cameraRecipe}
        durationInFrames={node.durationInFrames}
        width={canvas.width}
        height={canvas.height}
        frame={seqFrame}
      >
        {subjectLayer}
      </PageCam25D>
    );
  }

  // Layer 4: Directional SpeedBlur wrapper during high-velocity frames
  if (
    modifiers?.speedBlur?.enabled &&
    seqFrame >= modifiers.speedBlur.startFrame &&
    seqFrame <=
      modifiers.speedBlur.startFrame + modifiers.speedBlur.durationInFrames
  ) {
    const sb = modifiers.speedBlur;
    const bell = Math.sin(
      ((seqFrame - sb.startFrame) / Math.max(1, sb.durationInFrames)) * Math.PI
    );
    subjectLayer = (
      <SpeedBlur
        vx={sb.vx * bell}
        vy={(sb.vy ?? 0) * bell}
      >
        {subjectLayer}
      </SpeedBlur>
    );
  }

  return (
    <AbsoluteFill>
      {subjectLayer}

      {/* Layer 4: Spotlight Sweep Mask */}
      {modifiers?.spotlight?.enabled ? (
        <SpotlightSweep
          config={modifiers.spotlight}
          frame={seqFrame}
          accentColor={accent}
        />
      ) : null}

      {/* Layer 4: Editorial Caption Bar (Rule Q11 >= 32px) */}
      {modifiers?.captionBar ? (
        <ShotcraftCaptionBar
          caption={modifiers.captionBar}
          canvas={canvas}
          accentColor={accent}
          isDark={isDark}
          frame={seqFrame}
        />
      ) : null}

      {/* Layer 5: Seam Transition Out (flash-cut, whip-pan-brake, portal-zoom-wipe) */}
      {node.transitionOut ? (
        <ShotTransitionOverlay
          transition={node.transitionOut}
          sceneDurationInFrames={node.durationInFrames}
          accentColor={accent}
          frame={seqFrame}
        />
      ) : null}
    </AbsoluteFill>
  );
};

