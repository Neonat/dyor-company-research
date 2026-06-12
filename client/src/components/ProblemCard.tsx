/**
 * DYOR2 — ProblemCard Component
 * Design: Precision Instrument — full problem card
 * Includes: title, tags, difficulty pips, JourneyMap, evidence, solutions, shortlist toggle
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { Problem } from "@/store/reducer";
import { JourneyMap } from "./JourneyMap";
import { RegenerateButton } from "./RegenerateButton";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp } from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  ML: "bg-purple-50 text-purple-700 border-purple-200",
  API: "bg-blue-50 text-blue-700 border-blue-200",
  UX: "bg-pink-50 text-pink-700 border-pink-200",
  systems: "bg-orange-50 text-orange-700 border-orange-200",
  "data-pipeline": "bg-teal-50 text-teal-700 border-teal-200",
};

interface ProblemCardProps {
  problem: Problem;
  isShortlisted: boolean;
  onToggleShortlist: (id: string) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
  className?: string;
}

export function ProblemCard({
  problem,
  isShortlisted,
  onToggleShortlist,
  onRegenerate,
  regenerating = false,
  className,
}: ProblemCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={cn(
        "border border-border rounded-xl bg-card shadow-sm card-enter",
        isShortlisted && "ring-2 ring-primary/30 border-primary/40",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide",
                    TAG_COLORS[tag] || "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-foreground leading-snug">
              {problem.title}
            </h3>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Difficulty pips */}
            <div className="flex items-center gap-0.5 mr-1" title={`Difficulty: ${problem.difficulty}/5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i < problem.difficulty
                      ? problem.difficulty >= 4
                        ? "bg-[var(--color-signal-red)]"
                        : problem.difficulty >= 3
                        ? "bg-[var(--color-signal-amber)]"
                        : "bg-[var(--color-signal-green)]"
                      : "bg-border"
                  )}
                />
              ))}
            </div>

            {/* Shortlist toggle */}
            <button
              onClick={() => onToggleShortlist(problem.id)}
              className={cn(
                "p-1.5 rounded-md transition-all duration-150 hover:scale-110",
                isShortlisted
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
              aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
              title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
            >
              {isShortlisted ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Expand/collapse */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-3">
          {/* Journey Map */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Customer Journey
            </h4>
            <JourneyMap steps={problem.journeySteps} />
          </div>

          {/* Evidence */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Evidence
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{problem.evidenceSummary}</p>
            {problem.sourceIds && problem.sourceIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {problem.sourceIds.map((id) => (
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

          {/* Solutions */}
          {problem.solutions && problem.solutions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Proposed Solutions
              </h4>
              <div className="space-y-2">
                {problem.solutions.map((sol, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-lg p-3 bg-muted/20"
                  >
                    <p className="text-sm font-semibold text-foreground mb-1">{sol.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {sol.description}
                    </p>
                    {sol.stack && sol.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {sol.stack.map((tech) => (
                          <span
                            key={tech}
                            className="font-mono text-[10px] px-1.5 py-0.5 bg-background border border-border rounded text-muted-foreground"
                          >
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
            <div className="flex justify-end pt-1">
              <RegenerateButton
                onClick={onRegenerate}
                loading={regenerating}
                label="Regenerate this problem"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
