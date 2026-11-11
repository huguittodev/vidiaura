import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  alpha,
  neutral,
  radius as tokenRadius,
  signal,
  space,
  typography,
} from '../../src/lib/design/tokens';
import type { MetricProvenance } from '../../src/lib/scene-graph/types';
import { hairline, innerHighlight, rgbaOf, softShadow } from './Polish';
import { DigitRoll } from './SpotlightSweep';

export interface MetricCardItem {
  value: string;
  label: string;
  trend?: string;
  badge?: string;
  provenance?: MetricProvenance;
  sourceRef?: string;
}

export interface MetricCardsShowcaseProps {
  headline?: string;
  subheadline?: string;
  metrics: MetricCardItem[];
  accentColor?: string;
  isDark?: boolean;
  frame?: number;
}

/**
 * MetricCardsShowcase:
 * Atomic Remotion component rendering SaaS KPI / specification cards
 * with staggered spring entrance physics, rolling `<DigitRoll />` counters,
 * provenance badges (`DEMO SAMPLE` vs verified specs), and dual-aspect (16:9 & 9:16) layout.
 */
export const MetricCardsShowcase: React.FC<MetricCardsShowcaseProps> = ({
  headline = 'Verified System Specifications',
  subheadline,
  metrics,
  accentColor = signal.orange,
  isDark = true,
  frame: frameProp,
}) => {
  const currentFrame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = frameProp ?? currentFrame;
  const isVertical = width < height;
  const tone = isDark ? 'dark' : 'light';

  const headerSpring = spring({
    frame: f,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const cardItems: MetricCardItem[] =
    metrics.length > 0
      ? metrics.slice(0, 3)
      : [
          {
            value: '60fps',
            label: 'Deterministic Render Engine',
            trend: 'Frame-accurate timeline',
            provenance: 'product-spec',
          },
          {
            value: '100%',
            label: 'Strict TypeScript & Zod',
            trend: 'Zero untrusted code execution',
            provenance: 'product-spec',
          },
          {
            value: '16:9',
            label: 'Multi-Format Canvas',
            trend: 'Landscape & Vertical 9:16',
            provenance: 'product-spec',
          },
        ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isVertical ? `${space.xl}px ${space.lg}px` : `${space.xxl}px`,
        boxSizing: 'border-box',
        gap: isVertical ? space.lg : space.xl,
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: space.sm,
          opacity: headerSpring,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-24, 0])}px)`,
          maxWidth: isVertical ? 880 : 1280,
        }}
      >
        <h2
          style={{
            fontSize: isVertical ? 42 : 48,
            fontWeight: typography.weight.black,
            color: isDark ? neutral.white : neutral.ink,
            letterSpacing: '-0.03em',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.15,
          }}
        >
          {headline}
        </h2>
        {subheadline && (
          <span
            style={{
              fontSize: 22,
              color: isDark ? neutral.stone : neutral.textSecondary,
              fontWeight: typography.weight.medium,
              textAlign: 'center',
              lineHeight: 1.35,
            }}
          >
            {subheadline}
          </span>
        )}
      </div>

      {/* Responsive Grid of Metric Cards (Row in 16:9, Stacked in 9:16) */}
      <div
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          gap: space.lg,
          width: '100%',
          maxWidth: isVertical ? 840 : 1320,
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {cardItems.map((item, idx) => {
          const enterAt = 6 + idx * 7;
          const cardSpring = spring({
            frame: Math.max(0, f - enterAt),
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          const isDemoSample = item.provenance === 'demo-sample';
          const badgeLabel = isDemoSample
            ? 'DEMO SAMPLE'
            : item.badge ??
              (item.provenance === 'user-verified'
                ? 'VERIFIED'
                : item.provenance === 'product-spec'
                  ? 'SPEC'
                  : undefined);
          const badgeColor = isDemoSample ? signal.trafficAmber : accentColor;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                padding: isVertical ? '24px 28px' : '32px 28px',
                borderRadius: tokenRadius.xl,
                backgroundColor: isDark ? neutral.aubergine : neutral.white,
                border: isDark
                  ? `1.5px solid ${alpha.white12}`
                  : `1.5px solid ${neutral.border}`,
                boxShadow: `${innerHighlight(isDark ? 0.12 : 0.85)}, ${softShadow(
                  20,
                  {
                    color: neutral.void,
                    strength: isDark ? 2.0 : 0.8,
                  }
                )}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: space.sm,
                opacity: cardSpring,
                transform: `scale(${interpolate(
                  cardSpring,
                  [0, 1],
                  [0.88, 1]
                )}) translateY(${interpolate(cardSpring, [0, 1], [28, 0])}px)`,
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              {/* Top Row: Accent Bar + Optional Provenance / Category Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: space.sm,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 5,
                    borderRadius: tokenRadius.pill,
                    backgroundColor: accentColor,
                  }}
                />
                {badgeLabel ? (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: tokenRadius.pill,
                      backgroundColor: rgbaOf(badgeColor, 0.16),
                      border: hairline(0.18, tone),
                      color: badgeColor,
                      fontSize: 13,
                      fontWeight: typography.weight.bold,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontFamily: typography.monoFamily,
                    }}
                  >
                    {badgeLabel}
                  </span>
                ) : null}
              </div>

              {/* Rolling Metric Value */}
              <div style={{ marginTop: 4 }}>
                <DigitRoll
                  value={item.value}
                  delay={enterAt + 2}
                  fontSize={isVertical ? 54 : 60}
                  color={isDark ? neutral.white : neutral.ink}
                  frame={f}
                />
              </div>

              {/* Metric Label */}
              <div
                style={{
                  fontSize: 22,
                  fontWeight: typography.weight.bold,
                  color: isDark ? neutral.paper : neutral.ink,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.25,
                }}
              >
                {item.label}
              </div>

              {/* Trend / Subtext */}
              {item.trend && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 17,
                    color: isDemoSample ? signal.trafficAmber : signal.green,
                    fontWeight: typography.weight.bold,
                    marginTop: 'auto',
                    paddingTop: 6,
                  }}
                >
                  <span>{isDemoSample ? '◈' : '▲'}</span>
                  <span>{item.trend}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
