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

export const MetricProvenanceSchema = z.enum([
  'user-verified',
  'product-spec',
  'demo-sample',
]);

export const VerifiedMetricEntrySchema = z.object({
  value: z.string().min(1).max(32),
  label: z.string().min(1).max(80),
  source: z.string().max(120).optional(),
  provenance: MetricProvenanceSchema.optional(),
});

export const CommercialIntegrityModeSchema = z.enum([
  'strict',
  'demo-labeled',
  'legacy',
]);

/**
 * Matches internal engine/debug terminology that must never appear in visible commercial UI copy.
 */
export const FORBIDDEN_INTERNAL_ANNOTATION_REGEX =
  /\b(Rule\s+[RQS]\d+|Anti-Machine-Gun|SceneGraph|PageCam25D|Floating\s+Z-Axis|Normalized\s+Coordinate\s+Telemetry)\b/i;

export function hasInternalDebugAnnotation(text: string): boolean {
  return FORBIDDEN_INTERNAL_ANNOTATION_REGEX.test(text);
}

/**
 * Checks whether a value string contains a quantitative commercial claim
 * (percentages, multipliers, latency/SLA figures, currency, or numeric counters).
 */
export function isQuantitativeClaim(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return (
    /\d+(\.\d+)?\s*(%|x|×|ms|s|fps|k|m|b|\$|€)/i.test(trimmed) ||
    /^[+-]?\d+(\.\d+)?/.test(trimmed)
  );
}

export const MetricCardItemSchema = z.object({
  value: z.string().min(1).max(20),
  label: z.string().min(1).max(60),
  trend: z.string().max(40).optional(),
  badge: z.string().max(30).optional(),
  provenance: MetricProvenanceSchema.optional(),
  sourceRef: z.string().max(120).optional(),
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
  assistantName: z.string().max(50).optional(),
  statusText: z.string().max(60).optional(),
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
/* Phase 2 (Shotcraft Top 25 — Batch 1) Reusable Atom Payloads               */
/* ========================================================================= */

export const ExplodedLayerCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(60),
  subtitle: z.string().max(100).optional(),
  badge: z.string().max(32).optional(),
  depthPlane: z.enum(['background', 'midground', 'foreground']).optional(),
  items: z.array(z.string().max(80)).max(5).optional(),
  accentColor: z.string().regex(HexColorRegex).optional(),
});

export const Exploded25DUIPayloadSchema = z.object({
  eyebrow: z.string().max(50).optional(),
  headline: z.string().min(1).max(80),
  subheadline: z.string().max(140).optional(),
  surfaceTitle: z.string().max(80).optional(),
  mediaUrl: z.string().optional(),
  heroIndex: z.number().int().nonnegative().optional(),
  cameraDrivePx: z.number().min(-1600).max(1600).optional(),
  layers: z.array(ExplodedLayerCardSchema).min(2).max(6),
  foregroundPills: z.array(z.string().max(32)).max(6).optional(),
});

export const MaskRevealModuleSchema = z.object({
  label: z.string().min(1).max(40),
  progress: z.number().min(0).max(1),
});

export const MaskRevealPayloadSchema = z.object({
  maskWord: z.string().min(2).max(12),
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(80),
  subheadline: z.string().max(120).optional(),
  dashboardTitle: z.string().min(1).max(60),
  statusBadge: z.string().max(32).optional(),
  mediaUrl: z.string().optional(),
  sidebarItems: z.array(z.string().max(32)).max(6).optional(),
  kpis: z.array(MetricCardItemSchema).max(3).optional(),
  modules: z.array(MaskRevealModuleSchema).max(5).optional(),
});

export const BentoCascadeCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(60),
  category: z.string().min(1).max(36),
  description: z.string().min(1).max(120),
  badge: z.string().max(30).optional(),
  accentColor: z.string().regex(HexColorRegex).optional(),
  span: z.enum(['normal', 'wide']).optional(),
});

export const BentoCascadePayloadSchema = z.object({
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(80),
  subheadline: z.string().max(120).optional(),
  counterLabel: z.string().max(50).optional(),
  cards: z.array(BentoCascadeCardSchema).min(3).max(9),
});

export const CropCalloutTargetSchema = z.object({
  id: z.string().min(1),
  head: z.string().min(1).max(40),
  detail: z.string().min(1).max(90),
  x: z.number().min(0.02).max(0.92),
  y: z.number().min(0.05).max(0.92),
  width: z.number().min(0.08).max(0.85),
  height: z.number().min(0.06).max(0.75),
  tagPosition: z.enum(['right', 'above', 'below', 'belowRight']).optional(),
  metricValue: z.string().max(24).optional(),
  provenance: MetricProvenanceSchema.optional(),
});

export const CropCalloutPayloadSchema = z.object({
  statusLabel: z.string().max(40).optional(),
  windowTitle: z.string().min(1).max(80),
  headline: z.string().min(1).max(80),
  subheadline: z.string().max(120).optional(),
  ctaLabel: z.string().max(40).optional(),
  mediaUrl: z.string().optional(),
  targets: z.array(CropCalloutTargetSchema).min(2).max(6),
});

export const WhipPanPanelSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(60),
  category: z.string().min(1).max(40),
  description: z.string().min(1).max(120),
  badge: z.string().max(30).optional(),
  highlights: z.array(z.string().max(60)).max(4).optional(),
  mediaUrl: z.string().optional(),
});

export const WhipPanPayloadSchema = z.object({
  eyebrow: z.string().min(1).max(50),
  targetIndex: z.number().int().nonnegative().optional(),
  direction: z.enum(['horizontal', 'vertical']).optional(),
  panels: z.array(WhipPanPanelSchema).min(3).max(8),
});

/* ========================================================================= */
/* Phase 2 (Shotcraft Top 25 — Batch 2) Reusable Atom Payloads               */
/* ========================================================================= */

export const LeadWordAssemblePayloadSchema = z.object({
  eyebrow: z.string().max(60).optional(),
  leadWord: z.string().min(1).max(32),
  trailingWords: z.array(z.string().min(1).max(36)).min(1).max(8),
  highlightWord: z.string().max(36).optional(),
  subheadline: z.string().max(140).optional(),
  cyclingPills: z.array(z.string().min(1).max(40)).max(6).optional(),
  crashZoomOut: z.boolean().optional(),
});

export const ChartSecondaryReadoutSchema = z.object({
  label: z.string().min(1).max(50),
  value: z.string().min(1).max(24),
  unit: z.string().max(16).optional(),
  provenance: MetricProvenanceSchema.optional(),
});

export const ChartLiveMovesPayloadSchema = z.object({
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(90),
  primaryMetricValue: z.string().min(1).max(24),
  primaryMetricUnit: z.string().max(24).optional(),
  primaryMetricLabel: z.string().min(1).max(60),
  provenance: MetricProvenanceSchema.optional(),
  burstTagLabel: z.string().max(40).optional(),
  secondaryReadouts: z.array(ChartSecondaryReadoutSchema).max(4).optional(),
  mediaUrl: z.string().optional(),
  seriesSeed: z.number().int().optional(),
});

export const TypeAndFilterCardItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(60),
  category: z.string().min(1).max(36),
  subtitle: z.string().min(1).max(110),
  badge: z.string().max(30).optional(),
  mediaUrl: z.string().optional(),
  accentColor: z.string().regex(HexColorRegex).optional(),
});

export const TypeAndFilterPayloadSchema = z.object({
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(80),
  searchPlaceholder: z.string().max(60).optional(),
  searchQuery: z.string().min(1).max(48),
  targetCardId: z.string().min(1),
  mediaUrl: z.string().optional(),
  cards: z.array(TypeAndFilterCardItemSchema).min(3).max(9),
});

export const SteepTiltGlideWidgetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(60),
  category: z.string().min(1).max(36),
  detail: z.string().min(1).max(110),
  badge: z.string().max(30).optional(),
  accentColor: z.string().regex(HexColorRegex).optional(),
});

export const SteepTiltGlidePayloadSchema = z.object({
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(80),
  subheadline: z.string().max(120).optional(),
  surfaceTitle: z.string().max(80).optional(),
  mediaUrl: z.string().optional(),
  secondaryMediaUrl: z.string().optional(),
  tiltAngleDeg: z.number().min(-60).max(60).optional(),
  glideDistancePx: z.number().min(200).max(2400).optional(),
  widgets: z.array(SteepTiltGlideWidgetSchema).min(2).max(6),
});

export const PortalHubNodeItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(40),
  detail: z.string().max(80).optional(),
  iconKind: z.enum(['capture', 'code', 'recipe', 'music', 'sfx']).optional(),
  accentColor: z.string().regex(HexColorRegex).optional(),
});

export const PortalZoomHubPayloadSchema = z.object({
  eyebrow: z.string().max(60).optional(),
  workspaceTitle: z.string().min(1).max(70),
  portalCardTitle: z.string().min(1).max(60),
  hubHeadline: z.string().min(1).max(80),
  hubSubheadline: z.string().max(120).optional(),
  mediaUrl: z.string().optional(),
  nodes: z.array(PortalHubNodeItemSchema).min(3).max(6),
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
  'steep-tilt-glide',
  'crash-zoom-punch',
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

export const CropCalloutSchema = z
  .object({
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
    provenance: MetricProvenanceSchema.optional(),
    sourceRef: z.string().max(120).optional(),
    showBracket: z.boolean().optional(),
  })
  .refine(
    (c) =>
      !hasInternalDebugAnnotation(c.label) &&
      !(c.sublabel && hasInternalDebugAnnotation(c.sublabel)),
    {
      message:
        'Visible CropCallout text must not contain internal engine debug annotations; use scene.debugMeta instead',
    }
  );

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

export const CaptionBarModifierSchema = z
  .object({
    index: z.string().min(1).max(32),
    text: z.string().min(1).max(100),
    appearAt: z.number().int().nonnegative().optional(),
  })
  .refine(
    (cb) =>
      !hasInternalDebugAnnotation(cb.index) &&
      !hasInternalDebugAnnotation(cb.text),
    {
      message:
        'Visible CaptionBar text must not contain internal engine debug annotations (e.g. Rule S2, PageCam25D); use scene.debugMeta instead',
    }
  );

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
  'card-flip-reveal',
  'iris-portal-wipe',
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

/**
 * Non-rendered internal engine metadata for a scene.
 * Keeps recipe IDs, Shotcraft rule references, and debug notes strictly separated from visible commercial copy.
 */
export const SceneDebugMetaSchema = z.object({
  recipeId: z.string().max(80).optional(),
  engineNotes: z.string().max(240).optional(),
  ruleRefs: z.array(z.string().max(32)).optional(),
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
  // Strictly non-rendered debug metadata
  debugMeta: SceneDebugMetaSchema.optional(),
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
  // Phase 2 (Shotcraft Top 25 — Batch 1) Reusable Scene Atoms
  z.object({
    ...baseSceneFields,
    type: z.literal('exploded_25d_ui'),
    payload: Exploded25DUIPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('mask_reveal'),
    payload: MaskRevealPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('bento_cascade'),
    payload: BentoCascadePayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('crop_callout'),
    payload: CropCalloutPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('whip_pan'),
    payload: WhipPanPayloadSchema,
  }),
  // Phase 2 (Shotcraft Top 25 — Batch 2) Reusable Scene Atoms
  z.object({
    ...baseSceneFields,
    type: z.literal('lead_word_assemble'),
    payload: LeadWordAssemblePayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('chart_live_moves'),
    payload: ChartLiveMovesPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('type_and_filter'),
    payload: TypeAndFilterPayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('steep_tilt_glide'),
    payload: SteepTiltGlidePayloadSchema,
  }),
  z.object({
    ...baseSceneFields,
    type: z.literal('portal_zoom_hub'),
    payload: PortalZoomHubPayloadSchema,
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
    commercialIntegrityMode: CommercialIntegrityModeSchema.optional(),
    verifiedMetricsRegistry: z.array(VerifiedMetricEntrySchema).optional(),
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
  )
  .superRefine((data, ctx) => {
    const mode = data.commercialIntegrityMode;
    const hasRegistry = Array.isArray(data.verifiedMetricsRegistry);
    if (!mode && !hasRegistry) {
      return;
    }

    const effectiveMode = mode ?? 'strict';
    if (effectiveMode === 'legacy') {
      return;
    }

    const authorizedValues = new Set(
      (data.verifiedMetricsRegistry ?? []).map((entry) =>
        entry.value.trim().toLowerCase()
      )
    );

    const checkMetricProvenance = (
      rawValue: string | undefined,
      provenance: z.infer<typeof MetricProvenanceSchema> | undefined,
      path: (string | number)[]
    ) => {
      if (!rawValue || !isQuantitativeClaim(rawValue)) return;
      const normalized = rawValue.trim().toLowerCase();

      if (effectiveMode === 'strict') {
        if (provenance === 'demo-sample') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path,
            message: `Demo sample metric "${rawValue}" is not permitted when commercialIntegrityMode is "strict"`,
          });
          return;
        }
        if (
          provenance !== 'user-verified' &&
          provenance !== 'product-spec'
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path,
            message: `Unverified commercial metric "${rawValue}" rejected: missing authorized provenance ("user-verified" or "product-spec")`,
          });
          return;
        }
        if (!authorizedValues.has(normalized)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path,
            message: `Unverified commercial metric "${rawValue}" rejected: value is not registered in verifiedMetricsRegistry`,
          });
        }
      } else if (effectiveMode === 'demo-labeled') {
        const isAuthorized =
          (provenance === 'user-verified' || provenance === 'product-spec') &&
          authorizedValues.has(normalized);
        if (!isAuthorized && provenance !== 'demo-sample') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path,
            message: `Metric "${rawValue}" in demo-labeled mode must either match verifiedMetricsRegistry or explicitly declare provenance: "demo-sample"`,
          });
        }
      }
    };

    data.scenes.forEach((sc, sIdx) => {
      if (sc.cropCallouts) {
        sc.cropCallouts.forEach((c, cIdx) => {
          checkMetricProvenance(c.metricValue, c.provenance, [
            'scenes',
            sIdx,
            'cropCallouts',
            cIdx,
            'metricValue',
          ]);
        });
      }
      if (sc.type === 'metric_cards') {
        sc.payload.metrics.forEach((m, mIdx) => {
          checkMetricProvenance(m.value, m.provenance, [
            'scenes',
            sIdx,
            'payload',
            'metrics',
            mIdx,
            'value',
          ]);
        });
      }
      if (sc.type === 'mask_reveal' && sc.payload.kpis) {
        sc.payload.kpis.forEach((m, mIdx) => {
          checkMetricProvenance(m.value, m.provenance, [
            'scenes',
            sIdx,
            'payload',
            'kpis',
            mIdx,
            'value',
          ]);
        });
      }
      if (sc.type === 'crop_callout') {
        sc.payload.targets.forEach((t, tIdx) => {
          checkMetricProvenance(t.metricValue, t.provenance, [
            'scenes',
            sIdx,
            'payload',
            'targets',
            tIdx,
            'metricValue',
          ]);
        });
      }
      if (sc.type === 'chart_live_moves') {
        checkMetricProvenance(
          sc.payload.primaryMetricValue,
          sc.payload.provenance,
          ['scenes', sIdx, 'payload', 'primaryMetricValue']
        );
        if (sc.payload.secondaryReadouts) {
          sc.payload.secondaryReadouts.forEach((sr, srIdx) => {
            checkMetricProvenance(sr.value, sr.provenance, [
              'scenes',
              sIdx,
              'payload',
              'secondaryReadouts',
              srIdx,
              'value',
            ]);
          });
        }
      }
    });
  });

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
