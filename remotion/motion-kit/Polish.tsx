/**
 * Polish.tsx
 * Studio-grade finish primitives ported from video-shotcraft into Vidiaura's Motion Kit.
 *
 * Includes:
 * - Deterministic cubic-bezier solver (`bezier`, `EASE`, `ramp`, `mix`, `velocity`)
 * - Materiality helpers (`softShadow`, `hairline`, `innerHighlight`, `surface`, `rgbOf`, `rgbaOf`)
 * - 6-tile cached SVG film `<Grain />`
 * - Dual-ellipse `<Vignette />`
 * - Velocity-driven directional `<SpeedBlur />`
 * - Single-pass clipped `<Sheen />` (Rule Q4)
 * - Deterministic bokeh `<Dust />` and perspective `<GridFloor />`
 *
 * Strictly consumes `src/lib/design/tokens.ts` with zero raw hex literals.
 */

import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  brand,
  neutral,
  radius as tokenRadius,
  sceneThemes,
  typography,
} from '../../src/lib/design/tokens';

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/**
 * Newton-Raphson + bisection solver for CSS cubic-bezier(x1, y1, x2, y2).
 * Pure, deterministic function of `t` in [0, 1].
 */
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  if (x1 === y1 && x2 === y2) return (t: number) => clamp01(t);
  const ax = 1 - 3 * x2 + 3 * x1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  const solve = (x: number) => {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(u) - x;
      if (Math.abs(err) < 1e-7) return u;
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= err / d;
    }
    let lo = 0;
    let hi = 1;
    u = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(u);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return u;
  };
  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : sy(solve(t)));
};

export const EASE = {
  snappy: bezier(0.16, 1, 0.3, 1),
  out: bezier(0.22, 1, 0.36, 1),
  smooth: bezier(0.65, 0, 0.35, 1),
  swift: bezier(0.4, 0, 0.2, 1),
  exit: bezier(0.7, 0, 0.84, 0),
  anticip: bezier(0.5, -0.32, 0.25, 1),
  overshoot: bezier(0.34, 1.45, 0.64, 1),
  linear: (t: number) => clamp01(t),
} as const;

export const ramp = (
  frame: number,
  start: number,
  dur: number,
  ease: (t: number) => number = EASE.snappy
): number => ease(clamp01((frame - start) / Math.max(1e-6, dur)));

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

export const velocity = (f: (frame: number) => number, frame: number): number =>
  f(frame + 0.5) - f(frame - 0.5);

export const FONT = {
  sans: typography.fontFamily,
  mono: typography.monoFamily,
} as const;

export const tracking = (size: number, caps = false): string => {
  const base =
    size >= 96
      ? -0.04
      : size >= 56
        ? -0.03
        : size >= 28
          ? -0.02
          : size >= 16
            ? -0.008
            : 0.01;
  return `${(base + (caps ? 0.03 : 0)).toFixed(3)}em`;
};

/**
 * Converts a token color string (hex or rgb) into `"r,g,b"`.
 */
export const rgbOf = (colorToken: string): string => {
  const trimmed = colorToken.trim();
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return `${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]}`;
  }
  const clean = trimmed.startsWith(String.fromCharCode(35))
    ? trimmed.slice(1)
    : trimmed;
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return '13,13,16';
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const rgbaOf = (colorToken: string, alphaVal: number): string =>
  `rgba(${rgbOf(colorToken)},${Math.max(0, Math.min(1, alphaVal)).toFixed(3)})`;

const r1 = (x: number): number => Math.round(x * 10) / 10;

/**
 * Two-layer studio shadow: tight contact shadow + wide ambient elevation shadow.
 */
export const softShadow = (
  elevation: number,
  opts: { color?: string; strength?: number } = {}
): string => {
  const e = Math.max(0, elevation);
  const c = rgbOf(opts.color ?? brand.obsidian);
  const s = opts.strength ?? 1;
  const contactA = (0.12 * s) / (1 + e / 24);
  const ambientA = (0.08 + (Math.min(e, 64) / 64) * 0.22) * s;
  return (
    `0 ${r1(0.5 + e * 0.06)}px ${r1(1 + e * 0.18)}px rgba(${c},${contactA.toFixed(3)}), ` +
    `0 ${r1(e * 0.55)}px ${r1(e * 1.3)}px ${r1(-e * 0.22)}px rgba(${c},${ambientA.toFixed(3)})`
  );
};

export const hairline = (alphaVal = 0.08, tone: 'light' | 'dark' = 'light'): string =>
  `1px solid ${
    tone === 'light'
      ? `rgba(${rgbOf(neutral.ink)},${alphaVal})`
      : `rgba(${rgbOf(neutral.white)},${alphaVal})`
  }`;

export const innerHighlight = (alphaVal = 0.8): string =>
  `inset 0 1px 0 rgba(${rgbOf(neutral.white)},${alphaVal})`;

export const surface = (
  opts: {
    tone?: 'light' | 'dark';
    elevation?: number;
    radius?: number;
    background?: string;
  } = {}
): React.CSSProperties => {
  const tone = opts.tone ?? 'light';
  const dark = tone === 'dark';
  return {
    background:
      opts.background ??
      (dark ? sceneThemes.obsidian.surfaceRaised : sceneThemes.studioLight.surface),
    border: hairline(0.08, tone),
    borderRadius: opts.radius ?? tokenRadius.lg,
    boxShadow: `${innerHighlight(dark ? 0.08 : 0.85)}, ${softShadow(
      opts.elevation ?? 4,
      {
        strength: dark ? 2.4 : 1,
        color: dark ? brand.obsidian : neutral.void,
      }
    )}`,
  };
};

/**
 * Deterministic sine hash in [0, 1) — never uses Math.random().
 */
export const deterministicHash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * 6-tile cached SVG feTurbulence film grain data-URI map.
 * Chromium rasterizes only 6 small seamless tiles across the entire video.
 */
const grainCache = new Map<string, string>();

export const getGrainTileDataUri = (
  variant: number,
  tile: number = 256,
  freq: number = 0.65
): string => {
  const safeVariant = ((Math.floor(variant) % 6) + 6) % 6;
  const key = `${safeVariant}|${tile}|${freq}`;
  const hit = grainCache.get(key);
  if (hit) return hit;

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>` +
    `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' seed='${safeVariant * 17 + 3}' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/>` +
    `<feComponentTransfer><feFuncR type='linear' slope='1.5' intercept='-0.25'/><feFuncG type='linear' slope='1.5' intercept='-0.25'/>` +
    `<feFuncB type='linear' slope='1.5' intercept='-0.25'/></feComponentTransfer></filter>` +
    `<rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  grainCache.set(key, url);
  return url;
};

export const Grain: React.FC<{
  opacity?: number;
  step?: number;
  frameHold?: number;
  scale?: number;
  freq?: number;
  blend?: React.CSSProperties['mixBlendMode'];
  style?: React.CSSProperties;
}> = ({
  opacity = 0.032,
  step = 10,
  frameHold,
  scale = 1,
  freq = 0.65,
  blend = 'overlay',
  style,
}) => {
  const frame = useCurrentFrame();
  const effectiveStep = frameHold ?? step;
  const k = Math.floor(frame / Math.max(1, effectiveStep));
  const tile = 256;
  const ox = Math.floor(deterministicHash(k * 3 + 1) * tile);
  const oy = Math.floor(deterministicHash(k * 7 + 2) * tile);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blend,
        backgroundImage: getGrainTileDataUri(k % 6, tile, freq),
        backgroundSize: `${tile * scale}px ${tile * scale}px`,
        backgroundPosition: `${ox}px ${oy}px`,
        ...style,
      }}
    />
  );
};

export const Vignette: React.FC<{
  strength?: number;
  inner?: number;
  color?: string;
  cx?: number;
  cy?: number;
  style?: React.CSSProperties;
}> = ({
  strength = 0.35,
  inner = 0.5,
  color = brand.obsidian,
  cx = 0.5,
  cy = 0.46,
  style,
}) => {
  const c = rgbOf(color);
  const mid = inner + (1 - inner) * 0.55;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          `radial-gradient(ellipse 72% 72% at ${cx * 100}% ${cy * 100}%, rgba(${c},0) ${inner * 100}%, ` +
          `rgba(${c},${(strength * 0.32).toFixed(3)}) ${(mid * 100).toFixed(1)}%, rgba(${c},${strength.toFixed(3)}) 100%), ` +
          `radial-gradient(ellipse 100% 100% at ${cx * 100}% ${cy * 100}%, rgba(${c},0) 60%, rgba(${c},${(strength * 0.6).toFixed(3)}) 100%)`,
        ...style,
      }}
    />
  );
};

export const SpeedBlur: React.FC<{
  vx: number;
  vy?: number;
  amount?: number;
  max?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ vx, vy = 0, amount = 0.45, max = 36, children, style }) => {
  const rid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const speed = Math.hypot(vx, vy);
  const sd = Math.min(max, speed * amount);
  const fill: React.CSSProperties = { position: 'absolute', inset: 0 };
  if (sd < 0.35) return <div style={{ ...fill, ...style }}>{children}</div>;
  const deg = (Math.atan2(vy, vx) * 180) / Math.PI;
  const id = `speedblur-${rid}`;
  return (
    <div style={{ ...fill, ...style }}>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
        <filter
          id={id}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={`${sd.toFixed(2)} 0`} edgeMode="none" />
        </filter>
      </svg>
      <div style={{ ...fill, transform: `rotate(${deg}deg)`, filter: `url(#${id})` }}>
        <div style={{ ...fill, transform: `rotate(${-deg}deg)` }}>{children}</div>
      </div>
    </div>
  );
};

/**
 * Shotcraft Rule Q4: Single-pass angled specular highlight sweep.
 * Parent container must have `overflow: 'hidden'` and `borderRadius` so the glint is clipped cleanly.
 */
export const Sheen: React.FC<{
  progress: number;
  color?: string;
  width?: number;
  angle?: number;
  strength?: number;
}> = ({
  progress,
  color = neutral.white,
  width = 0.22,
  angle = 18,
  strength = 0.35,
}) => {
  if (progress <= 0 || progress >= 1) return null;
  const p = -width + (1 + 2 * width) * progress;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        background: `linear-gradient(${90 + angle}deg, transparent ${(p - width) * 100}%, ${rgbaOf(
          color,
          strength
        )} ${p * 100}%, transparent ${(p + width) * 100}%)`,
      }}
    />
  );
};

/**
 * Deterministic floating bokeh / dust particles for dark studio stages.
 */
export const Dust: React.FC<{
  count?: number;
  seed?: number;
  drift?: number;
  opacity?: number;
  color?: string;
}> = ({
  count = 36,
  seed = 1,
  drift = 0.25,
  opacity = 0.65,
  color = brand.purpleGlow,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const z = deterministicHash(seed * 31 + i * 7.1);
        const size = 2 + z * z * 14;
        const x =
          ((((deterministicHash(seed * 13 + i * 3.7) * 2120 +
            frame * drift * (0.4 + z)) %
            2120) +
            2120) %
            2120) -
          100;
        const y =
          deterministicHash(seed * 17 + i * 5.3) * 1080 -
          frame * drift * 0.3 * (0.5 + z);
        const tw = 0.5 + 0.5 * Math.sin(frame / (14 + z * 20) + i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: (((y % 1180) + 1180) % 1180) - 50,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${rgbaOf(color, 0.85)} 0%, ${rgbaOf(
                color,
                0
              )} 70%)`,
              opacity: (0.25 + 0.75 * tw) * (0.3 + z * 0.7),
              filter:
                z > 0.7 ? `blur(${((z - 0.7) * 10).toFixed(1)}px)` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Perspective horizon SVG grid floor with constant stroke width and forward camera scroll.
 */
export const GridFloor: React.FC<{
  horizon?: number;
  cell?: number;
  scroll?: number;
  opacity?: number;
  color?: string;
  dark?: boolean;
}> = ({
  horizon = 0.62,
  cell = 1,
  scroll = 0,
  opacity = 0.45,
  color = brand.purpleGlow,
  dark = true,
}) => {
  const W = 1920;
  const H = 1080;
  const hy = horizon * H;
  const cam = (H - hy) * 1.1;
  const focal = 1;
  const rows: number[] = [];
  const off = ((scroll % 1) + 1) % 1;
  for (let i = 0; i < 40; i++) {
    const z = (0.9 + i - off) * cell;
    if (z > 0.2) rows.push(hy + (cam * focal) / z);
  }
  const cols = Array.from({ length: 41 }, (_, i) => (i - 20) * cell);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient
          id={`gf${id}`}
          x1="0"
          y1={hy}
          x2="0"
          y2={H}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={color} stopOpacity={0} />
          <stop offset="0.35" stopColor={color} stopOpacity={dark ? 0.42 : 0.2} />
          <stop offset="1" stopColor={color} stopOpacity={dark ? 0.78 : 0.35} />
        </linearGradient>
      </defs>
      <g stroke={`url(#gf${id})`} strokeWidth={1.5} fill="none">
        {rows
          .filter((y) => y <= H + 2)
          .map((y, i) => (
            <line key={`r${i}`} x1={0} y1={y} x2={W} y2={y} />
          ))}
        {cols.map((xw, i) => {
          const zNear = 0.25;
          return (
            <line
              key={`c${i}`}
              x1={W / 2 + (xw * W * 0.18) / zNear}
              y1={hy + cam / zNear}
              x2={W / 2}
              y2={hy}
            />
          );
        })}
      </g>
    </svg>
  );
};

