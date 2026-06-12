/**
 * DYOR2 — SourceChip Component
 * Design: DYOR design system — compact source card, ink/paper, hairline borders
 */

import React from "react";
import type { SourceObject } from "@/store/reducer";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

const CREDIBILITY_CONFIG = {
  high:   { label: "High", color: "var(--signal-green)" },
  medium: { label: "Med",  color: "var(--research-blue)" },
  low:    { label: "Low",  color: "var(--signal-amber)" },
};

interface SourceChipProps {
  source: SourceObject;
  onToggle: (id: string) => void;
}

export function SourceChip({ source, onToggle }: SourceChipProps) {
  const credConfig = CREDIBILITY_CONFIG[source.credibility];
  const hostname = (() => {
    try { return new URL(source.url).hostname.replace("www.", ""); }
    catch { return source.url; }
  })();

  return (
    <div
      className="card-enter"
      style={{
        border: source.approved
          ? "0.5px solid color-mix(in srgb, var(--research-blue) 40%, transparent)"
          : "0.5px solid var(--border-color)",
        borderRadius: "var(--radius)",
        padding: "0.75rem 1rem",
        background: source.approved
          ? "color-mix(in srgb, var(--research-blue) 4%, var(--paper))"
          : "color-mix(in srgb, var(--ink) 2%, var(--paper))",
        opacity: source.approved ? 1 : 0.65,
        transition: "all 150ms ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        {/* Approve toggle */}
        <button
          onClick={() => onToggle(source.id)}
          aria-label={source.approved ? "Reject source" : "Approve source"}
          style={{
            flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0,
            color: source.approved ? "var(--research-blue)" : "var(--muted-color)",
            marginTop: 2, transition: "color 150ms ease-out, transform 100ms ease-out",
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}
        >
          {source.approved
            ? <CheckCircle2 size={16} />
            : <XCircle size={16} />
          }
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + credibility */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)", lineHeight: 1.4 }}>
              {source.title}
            </p>
            <span style={{
              flexShrink: 0,
              fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 700,
              padding: "0.15rem 0.4rem",
              borderRadius: 4,
              background: `color-mix(in srgb, ${credConfig.color} 12%, var(--paper))`,
              border: `0.5px solid color-mix(in srgb, ${credConfig.color} 30%, transparent)`,
              color: credConfig.color, textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              {credConfig.label}
            </span>
          </div>

          {/* Domain + date + link */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted-color)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {hostname}
            </span>
            {source.date && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted-color)", flexShrink: 0 }}>
                {new Date(source.date).getFullYear()}
              </span>
            )}
            <a
              href={source.url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ flexShrink: 0, color: "var(--muted-color)", display: "flex", alignItems: "center", transition: "color 150ms ease-out" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "var(--research-blue)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted-color)"}
            >
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Snippet */}
          {source.snippet && (
            <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {source.snippet}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
