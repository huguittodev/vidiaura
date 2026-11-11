/**
 * schema.ts
 * Strict Zod validation schemas for the SceneGraph contract.
 */

import { z } from 'zod';

export const HexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const BackdropVariantSchema = z.enum([
  'dark-precision',
  'light-editorial',
  'aurora-blur',
  'solid',
]);

export const MotionArchetypeSchema = z.enum([
  'base44-studio',
  'linear-dark',
  'bento-grid',
  'kinetic-hook',
]);
export type MotionArchetypeParsed = z.infer<typeof MotionArchetypeSchema>;

export const SurfaceThemeSchema = z.enum(['light', 'dark']);

/* ========================================================================= */
/* Layer 1: Stage & Backdrop Atom (SceneGraph v3)                            */
/* ========================================================================= */

export const StageLookSchema = z.enum([
  'obsidian',
  'dark-precision',
  'light-editorial',
  'studio-light',
  'aurora-blur',
]);

export const StageKeyLightSchema = z.object({
  x: z.number().min(0.0).max(1.0),
  y: z.number().min(0.0).max(1.0),
});

export const StageLayerConfigSchema = z.object({
  look: StageLookSchema.optional(),
  grainOpacity: z.number().min(0.0).max(0.25).optional(),
  vignetteStrength: z.number().min(0.0).max(0.85).optional(),
  dustParticles: z.boolean().optional(),
  gridFloor: z.boolean().optional(),
  horizon: z.number().min(0.2).max(0.9).optional(),
  keyLight: StageKeyLightSchema.optional(),
  backdropVideoUrl: z.string().optional(),
});

export const ArtDirectionSchema = z.object({
  backdropVariant: BackdropVariantSchema,
  surfaceTheme: SurfaceThemeSchema,
  primaryAccent: z
    .string()
    .regex(HexColorRegex, { message: 'primaryAccent must be a valid hex color code (#RGB or #RRGGBB)' }),
  archetype: MotionArchetypeSchema.optional(),
  stage: StageLayerConfigSchema.optional(),
});

export const CanvasConfigSchema = z.object({
  width: z.number().int().positive({ message: 'Canvas width must be a positive integer' }),
  height: z.number().int().positive({ message: 'Canvas height must be a positive integer' }),
  fps: z.number().int().positive({ message: 'Canvas fps must be a positive integer' }),
  durationInFrames: z
    .number()
    .int()
    .positive({ message: 'Canvas durationInFrames must be a positive integer' }),
});

export const CameraKeyframeSchema = z.object({
  frame: z.number().int().nonnegative({ message: 'CameraKeyframe frame must be non-negative' }),
  x: z.number().min(0.0).max(1.0, { message: 'Camera focal x must be normalized [0.0, 1.0]' }),
  y: z.number().min(0.0).max(1.0, { message: 'Camera focal y must be normalized [0.0, 1.0]' }),
  zoom: z.number().min(0.8).max(3.5, { message: 'Zoom factor must be between 0.8 and 3.5' }),
  rotateX: z.number().min(-90).max(90).optional(),
  rotateY: z.number().min(-90).max(90).optional(),
  rotateZ: z.number().min(-180).max(180).optional(),
  easing: z.enum(['linear', 'ease-in-out', 'spring']).optional(),
});

export const CursorKeyframeSchema = z.object({
  frame: z.number().int().nonnegative({ message: 'CursorKeyframe frame must be non-negative' }),
  x: z.number().min(0.0).max(1.0, { message: 'Cursor coordinate x must be normalized [0.0, 1.0]' }),
  y: z.number().min(0.0).max(1.0, { message: 'Cursor coordinate y must be normalized [0.0, 1.0]' }),
  controlX: z.number().optional(), // Permitted to extend outside [0, 1] for curved arcs
  controlY: z.number().optional(),
  click: z.boolean().optional(),
});

export const AudioAssetSchema = z.enum([
  'mouse-click',
  'camera-whoosh',
  'keyboard-tap',
  'chime',
  'soft-pop',
  'ambient-beat',
  'transition-whoosh-heavy',
  'transition-whoosh-fast',
  'sound-riser',
  'sub-bass-drop',
  'click-switch',
  'click-soft',
  'mechanical-tap-1',
  'mechanical-tap-2',
  'mechanical-tap-3',
  'mechanical-tap-4',
  'pop-clean',
  'success-chime',
]);

export const AudioCueSchema = z.object({
  id: z.string().min(1, { message: 'AudioCue id cannot be empty' }),
  frame: z.number().int().nonnegative({ message: 'AudioCue frame must be non-negative' }),
  asset: AudioAssetSchema,
  volume: z.number().min(0.0).max(1.0, { message: 'Volume must be between 0.0 and 1.0' }).optional(),
  fadeInFrames: z.number().int().nonnegative().optional(),
  fadeOutFrames: z.number().int().nonnegative().optional(),
});

/* ========================================================================= */
/* Scene Node Payloads                                                       */
/* ========================================================================= */

export const KineticTypographyPayloadSchema = z.object({
  words: z.array(z.string().min(1)).min(1, { message: 'Typography scene requires at least one word' }),
  accentWordIndex: z.number().int().nonnegative().optional(),
  symbols: z.array(z.string()).optional(),
  staggerFrames: z.number().int().positive().optional(),
});

export const SyntheticPromptBoxPayloadSchema = z.object({
  textToType: z.string().min(1).max(200, { message: 'Prompt box text must not exceed 200 characters' }),
  charsPerFrame: z.number().positive().optional(),
  typingSpeed: z.number().positive().optional(),
  showMicrophone: z.boolean().optional(),
  submitOnComplete: z.boolean().optional(),
});

export const ProductInteraction3DPayloadSchema = z.object({
  assetId: z.string().optional(),
  windowTitle: z.string().max(80).optional(),
  url: z.string().optional(),
  mockInterface: z.string().optional(),
  /** width/height of the embedded recording; lets cursor and camera map onto real pixels. */
  mediaAspect: z.number().min(0.3).max(4).optional(),
  eventsCount: z.number().int().nonnegative().optional(),
  cameraRig: z.record(z.string(), z.unknown()).optional(),
  cursor: z.record(z.string(), z.unknown()).optional(),
  textToType: z.string().max(200).optional(),
  promptText: z.string().max(200).optional(),
  buttonText: z.string().max(30).optional(),
  productName: z.string().max(50).optional(),
  tagline: z.string().max(100).optional(),
  title: z.string().max(50).optional(),
  headline: z.string().max(60).optional(),
});

export const IconGridMorphPayloadSchema = z.object({
  rows: z.number().int().min(1).max(10).optional(),
  cols: z.number().int().min(1).max(15).optional(),
  initialColor: z.string().regex(HexColorRegex).optional(),
  targetColor: z.string().regex(HexColorRegex).optional(),
  headline: z.string().max(60).optional(),
  waveStartFrame: z.number().int().nonnegative().optional(),
});

export const SyntheticHeroButtonPayloadSchema = z.object({
  buttonText: z.string().min(1).max(30, { message: 'Hero button text must not exceed 30 characters' }),
  variant: z.enum(['glow-primary', 'outline', 'minimal']).optional(),
  clickFrame: z.number().int().nonnegative().optional(),
});

export const SyntheticConnectPillsPayloadSchema = z.object({
  sourceText: z.string().min(1).max(30),
  targetText: z.string().min(1).max(30),
});

export const SyntheticCodeTreePayloadSchema = z.object({
  title: z.string().min(1).max(50),
  files: z.array(z.string()).optional(),
});

export const BrandClosingCtaPayloadSchema = z.object({
  productName: z.string().min(1).max(50),
  tagline: z.string().min(1).max(100),
  showLogo: z.boolean().optional(),
  buttonText: z.string().max(30).optional(),
});

export const MediaShowcasePayloadSchema = z.object({
  mediaUrl: z.string().optional(),
  mediaType: z.enum(['image', 'video']).optional(),
  headline: z.string().max(80).optional(),
  tagline: z.string().max(100).optional(),
  zoomScale: z.number().min(1.0).max(2.5).optional(),
  panDirection: z.enum(['none', 'left', 'right', 'up', 'down']).optional(),
});

export const MetricCardItemSchema = z.object({
  value: z.string().min(1).max(20),
  label: z.string().min(1).max(60),
  trend: z.string().max(40).optional(),
  badge: z.string().max(30).optional(),
});

export const MetricCardsPayloadSchema = z.object({
  headline: z.string().max(80).optional(),
  subheadline: z.string().max(120).optional(),
  metrics: z.array(MetricCardItemSchema),
});

export const ChatMessageItemSchema = z.object({
  sender: z.enum(['user', 'assistant']),
  text: z.string().min(1).max(250),
  time: z.string().max(10).optional(),
});

export const ConversationalMockupPayloadSchema = z.object({
  headline: z.string().max(80).optional(),
  messages: z.array(ChatMessageItemSchema),
});

export const SaaSFeatureItemSchema = z.object({
  icon: z.string().max(10),
  name: z.string().max(40),
  description: z.string().max(120),
});

export const SaaSFeatureGridPayloadSchema = z.object({
  headline: z.string().max(80),
  features: z.array(SaaSFeatureItemSchema).min(2).max(6),
  staggerFrames: z.number().int().min(1).max(30).optional(),
});

/* ========================================================================= */
/* Layers 2–5: Composable Shot Descriptors (SceneGraph v3)                   */
/* ========================================================================= */

export const LayoutPresetIdSchema = z.enum([
  'hook',
  'stage',
  'split',
  'bento',
  'lower-third',
  'pair',
]);

export const PageCamKeySchema = z.object({
  frame: z.number().int().nonnegative(),
  cx: z.number(),
  cy: z.number(),
  zoom: z.number().min(0.5).max(4.0),
  rotX: z.number().min(-60).max(60).optional(),
  rotY: z.number().min(-60).max(60).optional(),
  rotZ: z.number().min(-90).max(90).optional(),
  persp: z.number().min(400).max(4000).optional(),
});

export const CameraRecipeModeSchema = z.enum([
  'track',
  'page-cam-2.5d',
  'dolly-push-in',
  'isometric-tilt-reveal',
  'orbit-drift',
  'whip-pan',
]);

export const CameraDofConfigSchema = z.object({
  focusY: z.number().min(0).max(1920),
  strength: z.number().min(0).max(24),
});

export const CameraRecipeConfigSchema = z.object({
  mode: CameraRecipeModeSchema,
  keys: z.array(PageCamKeySchema).optional(),
  dof: CameraDofConfigSchema.optional(),
});

export const CropCalloutSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  sublabel: z.string().max(100).optional(),
  metricValue: z.string().max(24).optional(),
  badge: z.string().max(30).optional(),
  x: z.number().min(0.0).max(1.0),
  y: z.number().min(0.0).max(1.0),
  width: z.number().int().min(120).max(720).optional(),
  height: z.number().int().min(60).max(400).optional(),
  elevationZ: z.number().min(10).max(220).optional(),
  enterFrame: z.number().int().nonnegative().optional(),
  accentColor: z.string().regex(HexColorRegex).optional(),
});

export const SpotlightModifierSchema = z.object({
  enabled: z.boolean(),
  fromX: z.number().min(0.0).max(1.0),
  fromY: z.number().min(0.0).max(1.0),
  toX: z.number().min(0.0).max(1.0).optional(),
  toY: z.number().min(0.0).max(1.0).optional(),
  radius: z.number().min(80).max(900).optional(),
  dimOpacity: z.number().min(0.0).max(0.9).optional(),
  startFrame: z.number().int().nonnegative().optional(),
  durationInFrames: z.number().int().positive().optional(),
});

export const SheenModifierSchema = z.object({
  enabled: z.boolean(),
  startFrame: z.number().int().nonnegative().optional(),
  durationInFrames: z.number().int().positive().optional(),
  angle: z.number().min(-45).max(45).optional(),
  strength: z.number().min(0.05).max(0.8).optional(),
});

export const SpeedBlurModifierSchema = z.object({
  enabled: z.boolean(),
  vx: z.number().min(-120).max(120),
  vy: z.number().min(-120).max(120).optional(),
  startFrame: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
});

export const CaptionBarModifierSchema = z.object({
  index: z.string().min(1).max(32),
  text: z.string().min(1).max(100),
  appearAt: z.number().int().nonnegative().optional(),
});

export const SceneModifiersSchema = z.object({
  spotlight: SpotlightModifierSchema.optional(),
  sheen: SheenModifierSchema.optional(),
  speedBlur: SpeedBlurModifierSchema.optional(),
  captionBar: CaptionBarModifierSchema.optional(),
});

export const TransitionTypeSchema = z.enum([
  'hard-cut',
  'flash-cut',
  'whip-pan-brake',
  'portal-zoom-wipe',
]);

export const SceneTransitionSchema = z.object({
  type: TransitionTypeSchema,
  durationInFrames: z.number().int().min(4).max(30).optional(),
});

export const AutoSfxEventTypeSchema = z.enum([
  'hero-slam',
  'ui-card-pop',
  'rapid-batch-tick',
  'spotlight-whoosh',
  'sheen-shimmer',
  'metric-roll',
  'cta-chime',
  'whip-transition',
]);

export const AutoSfxEventSchema = z.object({
  id: z.string().min(1),
  event: AutoSfxEventTypeSchema,
  frame: z.number().int().nonnegative(),
  volume: z.number().min(0.0).max(1.0).optional(),
  burstCount: z.number().int().min(1).max(16).optional(),
  burstIntervalFrames: z.number().int().min(1).max(12).optional(),
});

export const BeatGridConfigSchema = z.object({
  bpm: z.number().min(60).max(200),
  beat0Seconds: z.number().min(0).max(10).optional(),
  beatsPerBar: z.number().int().min(2).max(8).optional(),
  outputAudioOffsetFrames: z.number().int().min(-15).max(15).optional(),
});

const baseSceneFields = {
  id: z.string().min(1),
  startFrame: z.number().int().nonnegative(),
  fromFrame: z.number().int().nonnegative().optional(),
  durationInFrames: z.number().int().positive(),
  soundCues: z.array(AudioCueSchema).optional(),
  // Layer 1 override
  stageOverride: StageLayerConfigSchema.optional(),
  // Layer 2 spatial & 2.5D camera rig
  layoutPreset: LayoutPresetIdSchema.optional(),
  cameraRecipe: CameraRecipeConfigSchema.optional(),
  // Layer 3 floating Z-elevated cutouts
  cropCallouts: z.array(CropCalloutSchema).optional(),
  // Layer 4 light & emphasis modifiers
  modifiers: SceneModifiersSchema.optional(),
  // Layer 5 temporal seam transitions & event-driven Auto-SFX
  transitionOut: SceneTransitionSchema.optional(),
  autoSfxEvents: z.array(AutoSfxEventSchema).optional(),
};

export const SceneNodeSchema = z.discriminatedUnion('type', [
  z.object({
    ...baseSceneFields,
    type: z.literal('kinetic_typography'),
    payload: KineticTypographyPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('synthetic_prompt_box'),
    payload: SyntheticPromptBoxPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('product_interaction_3d'),
    payload: ProductInteraction3DPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('icon_grid_morph'),
    payload: IconGridMorphPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('synthetic_hero_button'),
    payload: SyntheticHeroButtonPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('synthetic_connect_pills'),
    payload: SyntheticConnectPillsPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('synthetic_code_tree'),
    payload: SyntheticCodeTreePayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('brand_closing_cta'),
    payload: BrandClosingCtaPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('media_showcase'),
    payload: MediaShowcasePayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('metric_cards'),
    payload: MetricCardsPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('conversational_mockup'),
    payload: ConversationalMockupPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('saas_feature_grid'),
    payload: SaaSFeatureGridPayloadSchema,
  }),
]);

export const SceneGraphVersionSchema = z.enum(['2.0', '3.0']);

export const SceneGraphSchema = z
  .object({
    version: SceneGraphVersionSchema,
    canvas: CanvasConfigSchema,
    artDirection: ArtDirectionSchema,
    cameraTrack: z.array(CameraKeyframeSchema),
    cursorTrack: z.array(CursorKeyframeSchema),
    audioTrack: z.array(AudioCueSchema),
    scenes: z.array(SceneNodeSchema),
    beatGrid: BeatGridConfigSchema.optional(),
  })
  .refine(
    (data) => {
      const maxFrame = data.canvas.durationInFrames;
      const camOk = data.cameraTrack.every((kf) => kf.frame <= maxFrame);
      const curOk = data.cursorTrack.every((kf) => kf.frame <= maxFrame);
      const audOk = data.audioTrack.every((cue) => cue.frame <= maxFrame);
      const scnOk = data.scenes.every((sc) => sc.startFrame <= maxFrame);
      return camOk && curOk && audOk && scnOk;
    },
    {
      message: 'All keyframes, audio cues, and scene start frames must be within canvas.durationInFrames',
      path: ['canvas'],
    }
  )
  .refine(
    (data) => {
      // Shotcraft Rule R4: Maximum 3 full-frame beat slams (hero-slam / flash-cut) per video
      let slamCount = 0;
      for (const sc of data.scenes) {
        if (sc.transitionOut?.type === 'flash-cut') {
          slamCount += 1;
        }
        if (sc.autoSfxEvents) {
          slamCount += sc.autoSfxEvents.filter((ev) => ev.event === 'hero-slam').length;
        }
      }
      return slamCount <= 3;
    },
    {
      message: 'Shotcraft Rule R4 violation: full-frame beat slams (flash-cut + hero-slam) must not exceed 3 per video',
      path: ['scenes'],
    }
  );

export type BackdropVariantParsed = z.infer<typeof BackdropVariantSchema>;
export type SurfaceThemeParsed = z.infer<typeof SurfaceThemeSchema>;
export type ArtDirectionParsed = z.infer<typeof ArtDirectionSchema>;
export type CanvasConfigParsed = z.infer<typeof CanvasConfigSchema>;
export type CameraKeyframeParsed = z.infer<typeof CameraKeyframeSchema>;
export type CursorKeyframeParsed = z.infer<typeof CursorKeyframeSchema>;
export type AudioAssetParsed = z.infer<typeof AudioAssetSchema>;
export type AudioCueParsed = z.infer<typeof AudioCueSchema>;
export type SceneNodeParsed = z.infer<typeof SceneNodeSchema>;
export type SceneGraphParsed = z.infer<typeof SceneGraphSchema>;
