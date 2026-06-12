/**
 * DYOR2 — SignalCard Component
 * Design: Precision Instrument — left-border color coding for signal status
 * green/amber/red pill + summary + source attribution
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { Signal } from "@/store/reducer";

const STATUS_CONFIG = {
  green: {
    label: "Strength",
    borderClass: "border-l-[var(--color-signal-green)]",
    pillClass: "signal-green",
    bgClass: "bg-[var(--color-signal-green-bg)]",
    dotClass: "bg-[var(--color-signal-green)]",
  },
  amber: {
    label: "Mixed",
    borderClass: "border-l-[var(--color-signal-amber)]",
    pillClass: "signal-amber",
    bgClass: "bg-[var(--color-signal-amber-bg)]",
    dotClass: "bg-[var(--color-signal-amber)]",
  },
  red: {
    label: "Risk",
    borderClass: "border-l-[var(--color-signal-red)]",
    pillClass: "signal-red",
    bgClass: "bg-[var(--color-signal-red-bg)]",
    dotClass: "bg-[var(--color-signal-red)]",
  },
};

interface SignalCardProps {
  signal: Signal;
  className?: string;
}

export function SignalCard({ signal, className }: SignalCardProps) {
  const config = STATUS_CONFIG[signal.status];

  return (
    <div
      className={cn(
        "border border-border rounded-lg border-l-4 p-4 card-enter",
        config.borderClass,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border",
                config.pillClass
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
              {config.label}
            </span>
            <h3 className="text-sm font-semibold text-foreground truncate">{signal.theme}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{signal.summary}</p>
        </div>
      </div>
      {signal.sourceIds && signal.sourceIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {signal.sourceIds.map((id) => (
            <span
              key={id}
              className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
            >
              {id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
