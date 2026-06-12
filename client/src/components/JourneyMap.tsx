/**
 * DYOR2 — JourneyMap Component
 * Design: Precision Instrument — horizontal step renderer
 * ok=neutral/green, partial=amber, failure=red
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { JourneyStep } from "@/store/reducer";

const STEP_CONFIG = {
  ok: {
    nodeClass: "bg-[var(--color-signal-green)] border-[var(--color-signal-green)]",
    labelClass: "text-[var(--color-signal-green)]",
    lineClass: "bg-[var(--color-signal-green)]",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M2 5L4 7L8 3"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  partial: {
    nodeClass: "bg-[var(--color-signal-amber)] border-[var(--color-signal-amber)]",
    labelClass: "text-[var(--color-signal-amber)]",
    lineClass: "bg-[var(--color-signal-amber)]",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 2V5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5" cy="7.5" r="0.75" fill="white" />
      </svg>
    ),
  },
  failure: {
    nodeClass: "bg-[var(--color-signal-red)] border-[var(--color-signal-red)]",
    labelClass: "text-[var(--color-signal-red)]",
    lineClass: "bg-[var(--color-signal-red)]",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M3 3L7 7M7 3L3 7"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};

interface JourneyMapProps {
  steps: JourneyStep[];
  className?: string;
}

export function JourneyMap({ steps, className }: JourneyMapProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex items-start min-w-max py-2">
        {steps.map((step, idx) => {
          const config = STEP_CONFIG[step.status];
          const isLast = idx === steps.length - 1;

          return (
            <div key={idx} className="flex items-start">
              {/* Step node + label */}
              <div className="flex flex-col items-center gap-1.5 min-w-[72px] max-w-[96px]">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    config.nodeClass
                  )}
                >
                  {config.icon}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight px-1",
                    config.labelClass
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex items-center mt-3.5 mx-0.5">
                  <div className={cn("h-0.5 w-6 opacity-40", config.lineClass)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
