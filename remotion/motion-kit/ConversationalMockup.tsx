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
import { rgbaOf, softShadow } from './Polish';

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time?: string;
}

export interface ConversationalMockupProps {
  headline?: string;
  assistantName?: string;
  statusText?: string;
  messages: ChatMessage[];
  accentColor?: string;
  isDark?: boolean;
  frame?: number;
}

/**
 * Detects whether the conversation copy is predominantly Spanish so default labels
 * match the language of the messages when explicit `assistantName` / `statusText` are omitted.
 */
function isSpanishCopy(headline?: string, messages?: ChatMessage[]): boolean {
  const sample = `${headline ?? ''} ${(messages ?? []).map((m) => m.text).join(' ')}`;
  return /[áéíóúñ¿¡]/i.test(sample) || /\b(hola|disponibilidad|gracias|cómo|para)\b/i.test(sample);
}

/**
 * ConversationalMockup:
 * Atomic Remotion component rendering desktop/mobile AI Copilot & conversational threads
 * with studio-scale proportions, sequential speech bubbles, and language-consistent chrome.
 */
export const ConversationalMockup: React.FC<ConversationalMockupProps> = ({
  headline,
  assistantName,
  statusText,
  messages,
  accentColor = signal.green,
  isDark = true,
  frame: frameProp,
}) => {
  const currentFrame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = frameProp ?? currentFrame;
  const isVertical = width < height;

  const headerSpring = spring({
    frame: f,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const chatMessages: ChatMessage[] =
    messages.length > 0
      ? messages.slice(0, 3)
      : [
          {
            sender: 'user',
            text: 'Generate a responsive 3-column pricing grid with dark mode tokens.',
            time: '10:42',
          },
          {
            sender: 'assistant',
            text: 'Synthesized 3-column CSS Grid component with semantic design tokens and keyboard accessibility.',
            time: '10:42',
          },
          {
            sender: 'user',
            text: 'Ship it to the staging preview branch.',
            time: '10:43',
          },
        ];

  const spanish = isSpanishCopy(headline, chatMessages);
  const resolvedHeadline =
    headline ?? (spanish ? 'Asistente IA en Tiempo Real' : 'AI Copilot Workflow');
  const resolvedAssistant =
    assistantName ?? (spanish ? 'Asistente Inteligente' : 'AI Systems Copilot');
  const resolvedStatus =
    statusText ??
    (spanish
      ? '● Activo • Síntesis en tiempo real'
      : '● Online • Real-time synthesis');

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
        gap: space.xl,
        fontFamily: typography.fontFamily,
      }}
    >
      {/* Title */}
      {resolvedHeadline && (
        <h2
          style={{
            fontSize: isVertical ? 42 : 48,
            fontWeight: typography.weight.black,
            color: isDark ? neutral.white : neutral.ink,
            letterSpacing: '-0.025em',
            margin: 0,
            textAlign: 'center',
            opacity: headerSpring,
            transform: `translateY(${interpolate(headerSpring, [0, 1], [-20, 0])}px)`,
          }}
        >
          {resolvedHeadline}
        </h2>
      )}

      {/* Studio-Scale Chat Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: isVertical ? 880 : 940,
          borderRadius: tokenRadius.xl,
          backgroundColor: isDark ? neutral.nightRaised : neutral.white,
          border: isDark
            ? `1.5px solid ${alpha.white12}`
            : `1.5px solid ${neutral.border}`,
          boxShadow: `${softShadow(28, {
            color: neutral.void,
            strength: isDark ? 2.2 : 1.0,
          })}, 0 0 42px ${rgbaOf(accentColor, isDark ? 0.16 : 0.08)}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: '20px 28px',
            backgroundColor: isDark ? neutral.night : neutral.well,
            borderBottom: isDark
              ? `1px solid ${alpha.white08}`
              : `1px solid ${neutral.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: space.md,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: tokenRadius.pill,
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: neutral.white,
              fontWeight: typography.weight.bold,
              fontSize: 20,
            }}
          >
            ✦
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: typography.weight.bold,
                color: isDark ? neutral.white : neutral.ink,
              }}
            >
              {resolvedAssistant}
            </span>
            <span
              style={{
                fontSize: 16,
                color: signal.green,
                fontWeight: typography.weight.bold,
              }}
            >
              {resolvedStatus}
            </span>
          </div>
        </div>

        {/* Message Bubbles Area */}
        <div
          style={{
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            minHeight: 300,
            backgroundColor: isDark ? neutral.void : neutral.shell,
          }}
        >
          {chatMessages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const msgSpring = spring({
              frame: Math.max(0, f - (6 + idx * 14)),
              fps,
              config: { damping: 14, stiffness: 120 },
            });

            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '84%',
                  padding: '16px 24px',
                  borderRadius: isUser
                    ? '22px 22px 6px 22px'
                    : '22px 22px 22px 6px',
                  backgroundColor: isUser
                    ? accentColor
                    : isDark
                      ? neutral.aubergine
                      : neutral.white,
                  border: isUser
                    ? 'none'
                    : isDark
                      ? `1px solid ${alpha.white08}`
                      : `1px solid ${neutral.border}`,
                  color: isUser
                    ? neutral.white
                    : isDark
                      ? neutral.paper
                      : neutral.ink,
                  fontSize: 22,
                  lineHeight: 1.4,
                  fontWeight: typography.weight.medium,
                  boxShadow: softShadow(8, {
                    color: neutral.void,
                    strength: isDark ? 1.4 : 0.6,
                  }),
                  opacity: msgSpring,
                  transform: `scale(${interpolate(
                    msgSpring,
                    [0, 1],
                    [0.88, 1]
                  )}) translateY(${interpolate(msgSpring, [0, 1], [20, 0])}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span>{msg.text}</span>
                {msg.time && (
                  <span
                    style={{
                      fontSize: 15,
                      color: isUser ? neutral.white : neutral.textSubtle,
                      alignSelf: 'flex-end',
                      fontFamily: typography.monoFamily,
                    }}
                  >
                    {msg.time} {isUser && '✓✓'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
