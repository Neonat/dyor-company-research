/**
 * DYOR2 — JourneyMap Component
 * Design: DYOR design system — horizontal step renderer
 * ok=green, partial=amber, failure=red
 */

import React from "react";
import type { JourneyStep } from "@/store/reducer";

const STEP_CONFIG = {
  ok: {
    color: "var(--signal-green)",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  partial: {
    color: "var(--signal-amber)",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 2V5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5" cy="7.5" r="0.75" fill="white" />
      </svg>
    ),
  },
  failure: {
    color: "var(--signal-red)",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M3 3L7 7M7 3L3 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

interface JourneyMapProps {
  steps: JourneyStep[];
}

export function JourneyMap({ steps }: JourneyMapProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", minWidth: "max-content", padding: "0.5rem 0" }}>
        {steps.map((step, idx) => {
          const config = STEP_CONFIG[step.status];
          const isLast = idx === steps.length - 1;

          return (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start" }}>
              {/* Step node + label */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", minWidth: 72, maxWidth: 96 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: config.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {config.icon}
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 600,
                  color: config.color, textAlign: "center", lineHeight: 1.3, padding: "0 0.25rem",
                }}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div style={{ display: "flex", alignItems: "center", marginTop: 13, marginLeft: 2, marginRight: 2 }}>
                  <div style={{ height: 1.5, width: 24, background: config.color, opacity: 0.35 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
