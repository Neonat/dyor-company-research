/**
 * DYOR2 — ProblemCard Component
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders
 */

import React, { useState } from "react";
import type { Problem } from "@/store/reducer";
import { JourneyMap } from "./JourneyMap";
import { RegenerateButton } from "./RegenerateButton";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp } from "lucide-react";

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  ML:              { bg: "color-mix(in srgb, #7c3aed 10%, var(--paper))", color: "#7c3aed" },
  API:             { bg: "color-mix(in srgb, var(--research-blue) 10%, var(--paper))", color: "var(--research-blue)" },
  UX:              { bg: "color-mix(in srgb, #db2777 10%, var(--paper))", color: "#db2777" },
  systems:         { bg: "color-mix(in srgb, #d97706 10%, var(--paper))", color: "#d97706" },
  "data-pipeline": { bg: "color-mix(in srgb, #0891b2 10%, var(--paper))", color: "#0891b2" },
};

function difficultyColor(d: number) {
  if (d >= 4) return "var(--signal-red)";
  if (d >= 3) return "var(--signal-amber)";
  return "var(--signal-green)";
}

interface ProblemCardProps {
  problem: Problem;
  isShortlisted: boolean;
  onToggleShortlist: (id: string) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export function ProblemCard({ problem, isShortlisted, onToggleShortlist, onRegenerate, regenerating = false }: ProblemCardProps) {
  const [expanded, setExpanded] = useState(true);
  const pipColor = difficultyColor(problem.difficulty);

  return (
    <div
      className="card-enter"
      style={{
        border: isShortlisted
          ? `1.5px solid color-mix(in srgb, var(--research-blue) 50%, transparent)`
          : "0.5px solid var(--border-color)",
        borderRadius: "var(--radius)",
        background: isShortlisted
          ? "color-mix(in srgb, var(--research-blue) 3%, var(--paper))"
          : "var(--paper)",
        overflow: "hidden",
        transition: "border-color 150ms ease-out, background 150ms ease-out",
      }}
    >
      {/* Header */}
      <div style={{ padding: "1rem 1.125rem 0.875rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.5rem" }}>
              {problem.tags.map((tag) => {
                const tc = TAG_COLORS[tag] || { bg: "color-mix(in srgb, var(--ink) 6%, var(--paper))", color: "var(--muted-color)" };
                return (
                  <span key={tag} style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 700,
                    padding: "0.15rem 0.5rem", borderRadius: 4,
                    background: tc.bg,
                    border: `0.5px solid color-mix(in srgb, ${tc.color} 25%, transparent)`,
                    color: tc.color, textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {tag}
                  </span>
                );
              })}
            </div>
            {/* Title */}
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", lineHeight: 1.35 }}>
              {problem.title}
            </h3>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
            {/* Difficulty pips */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginRight: "0.25rem" }} title={`Difficulty: ${problem.difficulty}/5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: i < problem.difficulty ? pipColor : "var(--border-color)",
                  transition: "background 150ms ease-out",
                }} />
              ))}
            </div>

            {/* Shortlist toggle */}
            <button
              onClick={() => onToggleShortlist(problem.id)}
              aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
              style={{
                padding: "0.3rem", borderRadius: "var(--radius)", border: "none", cursor: "pointer",
                color: isShortlisted ? "var(--research-blue)" : "var(--muted-color)",
                background: isShortlisted ? "color-mix(in srgb, var(--research-blue) 10%, transparent)" : "transparent",
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { if (!isShortlisted) (e.currentTarget as HTMLButtonElement).style.color = "var(--research-blue)"; }}
              onMouseLeave={(e) => { if (!isShortlisted) (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-color)"; }}
            >
              {isShortlisted ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>

            {/* Expand/collapse */}
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                padding: "0.3rem", borderRadius: "var(--radius)", background: "none", border: "none", cursor: "pointer",
                color: "var(--muted-color)", transition: "color 150ms ease-out",
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-color)"}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div style={{ borderTop: "0.5px solid var(--border-color)", padding: "1rem 1.125rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Journey Map */}
          <div>
            <h4 className="stage-label" style={{ marginBottom: "0.5rem" }}>Customer Journey</h4>
            <JourneyMap steps={problem.journeySteps} />
          </div>

          {/* Evidence */}
          <div>
            <h4 className="stage-label" style={{ marginBottom: "0.375rem" }}>Evidence</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--ink)", lineHeight: 1.6 }}>{problem.evidenceSummary}</p>
            {problem.sourceIds && problem.sourceIds.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                {problem.sourceIds.map((id) => (
                  <span key={id} style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 600,
                    padding: "0.15rem 0.4rem",
                    background: "color-mix(in srgb, var(--ink) 6%, var(--paper))",
                    border: "0.5px solid var(--border-color)",
                    borderRadius: 4, color: "var(--muted-color)",
                  }}>
                    {id}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Solutions */}
          {problem.solutions && problem.solutions.length > 0 && (
            <div>
              <h4 className="stage-label" style={{ marginBottom: "0.5rem" }}>Proposed Solutions</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {problem.solutions.map((sol, idx) => (
                  <div key={idx} style={{
                    border: "0.5px solid var(--border-color)", borderRadius: "var(--radius)",
                    padding: "0.75rem 0.875rem",
                    background: "color-mix(in srgb, var(--ink) 2%, var(--paper))",
                  }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)", marginBottom: "0.25rem" }}>{sol.title}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", lineHeight: 1.5, marginBottom: sol.stack?.length ? "0.5rem" : 0 }}>
                      {sol.description}
                    </p>
                    {sol.stack && sol.stack.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                        {sol.stack.map((tech) => (
                          <span key={tech} style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.5625rem", fontWeight: 600,
                            padding: "0.15rem 0.4rem",
                            background: "var(--paper)",
                            border: "0.5px solid var(--border-color)",
                            borderRadius: 4, color: "var(--muted-color)",
                          }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate */}
          {onRegenerate && (
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.25rem" }}>
              <RegenerateButton onClick={onRegenerate} loading={regenerating} label="Regenerate this problem" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
