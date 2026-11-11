/**
 * ShotcraftSceneComposer.tsx
 * Deterministic 5-Layer Composable Shot Engine for SceneGraph v3.
 *
 * Orchestrates:
 * - Layer 1: Stage & Backdrop Atmosphere (<StageAtmosphereLayer />: per-scene look surface, GridFloor, Dust, ClipCard video backdrop, Vignette, encoder-friendly Grain)
 * - Layer 2: Spatial Slot & 2.5D Layout-Scale Camera Rig (<PageCam25D /> per Rule Q2 with safe-area frustum compensation)
 * - Layer 3: Primary Subject Atom + Floating Z-Elevated Cutouts (<CropCalloutCard /> with frustum clamping & collision resolution)
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
  sceneThemes,
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
  StageLook,
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
import {
  CropCalloutCard,
  PageCam25D,
  buildDefaultRecipeKeys,
  computePageCam25DTransform,
  resolveCalloutPositions,
} from './PageCam25D';
import {
  ClipCard,
  ShotTransitionOverlay,
  SpotlightSweep,
} from './SpotlightSweep';

/**
 * Resolves the background gradient/fill and theme polarity for a given `StageLook`.
 */
export function resolveStageLookStyle(
  look: StageLook | undefined,
  fallbackIsDark: boolean,
  accentColor: string
): { isDark: boolean; background: string } {
  switch (look) {
    case 'light-editorial':
      return {
        isDark: false,
        background: `radial-gradient(ellipse 80% 70% at 50% 25%, ${neutral.white} 0%, ${sceneThemes.lightEditorial.background} 70%, ${neutral.cream} 100%)`,
      };
    case 'studio-light':
      return {
        isDark: false,
        background: `radial-gradient(ellipse 75% 65% at 50% 20%, ${neutral.white} 0%, ${sceneThemes.studioLight.background} 65%, ${neutral.well} 100%)`,
      };
    case 'aurora-blur':
      return {
        isDark: true,
        background: `radial-gradient(ellipse 70% 60% at 35% 28%, ${rgbaOf(accentColor, 0.28)} 0%, ${sceneThemes.obsidian.background} 62%, ${neutral.void} 100%)`,
      };
    case 'dark-precision':
      return {
        isDark: true,
        background: `radial-gradient(ellipse 75% 65% at 50% 35%, ${neutral.nightRaised} 0%, ${neutral.night} 68%, ${neutral.void} 100%)`,
      };
    case 'obsidian':
      return {
        isDark: true,
        background: `radial-gradient(ellipse 72% 62% at 50% 30%, ${sceneThemes.obsidian.surface} 0%, ${sceneThemes.obsidian.background} 72%, ${neutral.void} 100%)`,
      };
    default:
      return {
        isDark: fallbackIsDark,
        background: 'transparent',
      };
  }
}

/**
 * Layer 1 Stage & Atmosphere Overlay.
 * Renders optional per-scene `look` stage surface, video backdrop (<ClipCard />), perspective <GridFloor />,
 * deterministic <Dust /> particles, <Vignette />, and cached 6-tile <Grain />.
 */
export const StageAtmosphereLayer: React.FC<{
  stage?: StageLayerConfig;
  isDark: boolean;
  accentColor: string;
  canvas: CanvasConfig;
  frame?: number;
  renderLookSurface?: boolean;
}> = ({
  stage,
  isDark: fallbackIsDark,
  accentColor,
  canvas,
  frame: frameProp,
  renderLookSurface = false,
}) => {
  const ownFrame = useCurrentFrame();
  const frame = frameProp ?? ownFrame;

  if (!stage) return null;

  const lookStyle = resolveStageLookStyle(stage.look, fallbackIsDark, accentColor);
  const isDark = lookStyle.isDark;
  // Encoder-friendly film grain default (avoids H.264 macroblock bitrate inflation while keeping organic texture)
  const grainOpacity = stage.grainOpacity ?? (isDark ? 0.026 : 0.016);
  const vignetteStrength = stage.vignetteStrength ?? (isDark ? 0.38 : 0.14);
  const keyLightX = stage.keyLight?.x ?? 0.5;
  const keyLightY = stage.keyLight?.y ?? 0.36;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 1 }}>
      {/* Optional per-scene StageLook surface fill for scene-to-scene visual variety */}
      {renderLookSurface && stage.look ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: lookStyle.background,
          }}
        />
      ) : null}

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
            isDark ? 0.2 : 0.11
          )} 0%, transparent 70%)`,
        }}
      />

      {/* Optional perspective horizon SVG GridFloor */}
      {stage.gridFloor ? (
        <GridFloor
          horizon={stage.horizon ?? 0.64}
          scroll={frame * 0.035}
          opacity={isDark ? 0.36 : 0.2}
          color={accentColor}
          dark={isDark}
        />
      ) : null}

      {/* Optional deterministic floating bokeh Dust particles */}
      {stage.dustParticles ? (
        <Dust
          count={28}
          seed={7}
          drift={0.26}
          opacity={isDark ? 0.58 : 0.32}
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
          frameHold={4}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Shotcraft Rule Q11 Compliant Editorial Caption Bar (>= 32px secondary text inside safe area).
 * Adapts layout and max-width automatically for both 16:9 (1920x1080) and 9:16 (1080x1920).
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
  const isVertical = canvas.width < canvas.height;
  const appearAt = caption.appearAt ?? 2;

  const p = ramp(frame, appearAt, 14, EASE.snappy);
  if (p <= 0.01) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: safe.x,
        top: safe.y,
        maxWidth: safe.width,
        minHeight: 56,
        padding: '8px 18px',
        borderRadius: tokenRadius.pill,
        backgroundColor: isDark
          ? rgbaOf(brand.obsidian, 0.72)
          : rgbaOf(neutral.white, 0.86),
        border: `1px solid ${rgbaOf(accentColor, isDark ? 0.32 : 0.24)}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: isVertical ? 'wrap' : 'nowrap',
        gap: space.sm,
        opacity: p,
        transform: `translateX(${mix(-18, 0, p).toFixed(2)}px)`,
        pointerEvents: 'none',
        boxSizing: 'border-box',
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
          boxShadow: `0 0 14px ${alpha.purpleHalo}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 32,
          fontWeight: typography.weight.bold,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: accentColor,
          fontFamily: typography.monoFamily,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {caption.index}
      </span>
      <span
        style={{
          width: 1,
          height: 22,
          backgroundColor: isDark ? alpha.white12 : neutral.border,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 32,
          fontWeight: typography.weight.medium,
          letterSpacing: '-0.01em',
          color: isDark ? brand.text : neutral.ink,
          lineHeight: 1.2,
        }}
      >
        {caption.text}
      </span>
    </div>
  );
};

/**
 * Checks whether a SceneNode declares any SceneGraph v3 composable layers (Layers 1–5).
 */
export function hasV3ShotLayers(node: SceneNode): boolean {
  return Boolean(
    node.stageOverride ||
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

  const effectiveStage = node.stageOverride ?? artDirection.stage;
  const stageLook = resolveStageLookStyle(
    effectiveStage?.look,
    artDirection.surfaceTheme === 'dark',
    artDirection.primaryAccent
  );
  const isDark = stageLook.isDark;
  const accent = artDirection.primaryAccent;
  const callouts = node.cropCallouts ?? [];
  const modifiers = node.modifiers;
  const hasCaptionBar = Boolean(modifiers?.captionBar);

  // Compute current 2.5D camera transform so floating CropCalloutCards are clamped & de-collided
  // against the active camera frustum and safe area on both 16:9 and 9:16
  const activeCameraKeys =
    node.cameraRecipe && node.cameraRecipe.mode !== 'track'
      ? node.cameraRecipe.keys && node.cameraRecipe.keys.length > 0
        ? node.cameraRecipe.keys
        : buildDefaultRecipeKeys(
            node.cameraRecipe.mode,
            node.durationInFrames,
            canvas.width,
            canvas.height
          )
      : [{ frame: 0, cx: canvas.width / 2, cy: canvas.height / 2, zoom: 1 }];

  // Use peak zoom keyframe blended with current frame so callouts never jump or clip at max zoom
  const currentCam = computePageCam25DTransform(activeCameraKeys, seqFrame, {
    width: canvas.width,
    height: canvas.height,
  });
  const peakZoom = Math.max(1, ...activeCameraKeys.map((k) => k.zoom ?? 1));
  const conservativeCam = {
    ...currentCam,
    zoom: Math.max(currentCam.zoom, peakZoom * 0.96),
  };

  const resolvedCalloutBoxes = resolveCalloutPositions(
    callouts,
    conservativeCam,
    { width: canvas.width, height: canvas.height },
    { hasCaptionBar }
  );

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
          resolvedBox={resolvedCalloutBoxes.get(c.id)}
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
        hasCaptionBar={hasCaptionBar}
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
      {/* Per-scene Stage Override (Layer 1) when node.stageOverride is defined */}
      {node.stageOverride ? (
        <StageAtmosphereLayer
          stage={node.stageOverride}
          isDark={isDark}
          accentColor={accent}
          canvas={canvas}
          frame={seqFrame}
          renderLookSurface={true}
        />
      ) : null}

      <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
        {subjectLayer}
      </div>

      {/* Layer 4: Spotlight Sweep Mask (0x Screen-Space) */}
      {modifiers?.spotlight?.enabled ? (
        <SpotlightSweep
          config={modifiers.spotlight}
          frame={seqFrame}
          accentColor={accent}
        />
      ) : null}

      {/* Layer 4: Editorial Caption Bar (0x Screen-Space HUD, Rule Q11 >= 32px) */}
      {modifiers?.captionBar ? (
        <ShotcraftCaptionBar
          caption={modifiers.captionBar}
          canvas={canvas}
          accentColor={accent}
          isDark={isDark}
          frame={seqFrame}
        />
      ) : null}

      {/* Layer 5: Seam Transition Out (0x Screen-Space: flash-cut, whip-pan-brake, portal-zoom-wipe) */}
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
