/**
 * DYOR2 — SignalCard Component
 * Design: DYOR design system — left-border color coding, ink/paper, Poppins
 */

import React from "react";
import type { Signal } from "@/store/reducer";

const STATUS_CONFIG = {
  green: { label: "Strength", color: "var(--signal-green)" },
  amber: { label: "Mixed",    color: "var(--signal-amber)" },
  red:   { label: "Risk",     color: "var(--signal-red)"   },
};

interface SignalCardProps {
  signal: Signal;
  className?: string;
}

export function SignalCard({ signal }: SignalCardProps) {
  const config = STATUS_CONFIG[signal.status];

  return (
    <div
      className="card-enter"
      style={{
        display: "flex", alignItems: "flex-start", gap: "1rem",
        padding: "0.875rem 1rem",
        background: "var(--paper)",
        border: "0.5px solid var(--border-color)",
        borderLeft: `3px solid ${config.color}`,
        borderRadius: "var(--radius)",
      }}
    >
      {/* Status pill */}
      <span style={{
        flexShrink: 0,
        display: "inline-flex", alignItems: "center", gap: "0.3rem",
        padding: "0.2rem 0.625rem",
        borderRadius: 99,
        background: `color-mix(in srgb, ${config.color} 12%, var(--paper))`,
        border: `0.5px solid color-mix(in srgb, ${config.color} 30%, transparent)`,
        fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 700,
        color: config.color, textTransform: "uppercase", letterSpacing: "0.06em",
        marginTop: "0.125rem",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: config.color, display: "inline-block" }} />
        {config.label}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)", marginBottom: "0.25rem" }}>
          {signal.theme}
        </h3>
        <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", lineHeight: 1.55 }}>
          {signal.summary}
        </p>
        {signal.sourceIds && signal.sourceIds.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
            {signal.sourceIds.map((id) => (
              <span
                key={id}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 600,
                  padding: "0.15rem 0.4rem",
                  background: "color-mix(in srgb, var(--ink) 6%, var(--paper))",
                  border: "0.5px solid var(--border-color)",
                  borderRadius: 4, color: "var(--muted-color)",
                }}
              >
                {id}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
