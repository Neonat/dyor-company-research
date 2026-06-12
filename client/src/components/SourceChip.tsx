/**
 * DYOR2 — SourceChip Component
 * Design: Precision Instrument — compact source card
 * Credibility badge (high/medium/low) + approve/reject toggle
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { SourceObject } from "@/store/reducer";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

const CREDIBILITY_CONFIG = {
  high: {
    label: "High",
    class: "bg-[var(--color-signal-green-bg)] text-[var(--color-signal-green)] border-[var(--color-signal-green)]",
  },
  medium: {
    label: "Med",
    class: "bg-blue-50 text-blue-600 border-blue-200",
  },
  low: {
    label: "Low",
    class: "bg-[var(--color-signal-amber-bg)] text-[var(--color-signal-amber)] border-[var(--color-signal-amber)]",
  },
};

interface SourceChipProps {
  source: SourceObject;
  onToggle: (id: string) => void;
  className?: string;
}

export function SourceChip({ source, onToggle, className }: SourceChipProps) {
  const credConfig = CREDIBILITY_CONFIG[source.credibility];
  const hostname = (() => {
    try {
      return new URL(source.url).hostname.replace("www.", "");
    } catch {
      return source.url;
    }
  })();

  return (
    <div
      className={cn(
        "border rounded-lg p-3 transition-all duration-150 card-enter",
        source.approved
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/30 opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-2">
        {/* Approve toggle */}
        <button
          onClick={() => onToggle(source.id)}
          className={cn(
            "flex-shrink-0 mt-0.5 transition-all duration-150 hover:scale-110",
            source.approved ? "text-primary" : "text-muted-foreground"
          )}
          aria-label={source.approved ? "Reject source" : "Approve source"}
          title={source.approved ? "Click to reject" : "Click to approve"}
        >
          {source.approved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title + credibility */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
              {source.title}
            </p>
            <span
              className={cn(
                "flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                credConfig.class
              )}
            >
              {credConfig.label}
            </span>
          </div>

          {/* Domain + date */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs text-muted-foreground truncate">{hostname}</span>
            {source.date && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(source.date).getFullYear()}
              </span>
            )}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Snippet */}
          {source.snippet && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {source.snippet}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
