/**
 * DYOR2 — StageNav Component
 * Design: Precision Instrument — horizontal stage progress bar pinned to top
 * Shows 5 numbered nodes connected by lines, current stage highlighted
 */

import React from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: 1, label: "Intake", short: "01" },
  { id: 2, label: "Research", short: "02" },
  { id: 3, label: "Checkpoint", short: "03" },
  { id: 4, label: "Synthesis", short: "04" },
  { id: 5, label: "Problems", short: "05" },
];

interface StageNavProps {
  currentStage: number;
  onStageClick?: (stage: number) => void;
  className?: string;
}

export function StageNav({ currentStage, onStageClick, className }: StageNavProps) {
  return (
    <nav
      className={cn(
        "no-print sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border",
        className
      )}
      aria-label="Pipeline stages"
    >
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-border mx-8"
            aria-hidden="true"
          />

          {STAGES.map((stage, idx) => {
            const isCompleted = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const isLocked = stage.id > currentStage;
            const isClickable = onStageClick && !isLocked;

            return (
              <div
                key={stage.id}
                className="relative flex flex-col items-center gap-1.5 z-10"
              >
                <button
                  onClick={() => isClickable && onStageClick(stage.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-mono font-medium transition-all duration-200",
                    isCompleted && "bg-primary border-primary text-primary-foreground shadow-sm",
                    isCurrent &&
                      "bg-primary border-primary text-primary-foreground shadow-md scale-110 ring-4 ring-primary/20",
                    isLocked && "bg-background border-border text-muted-foreground cursor-not-allowed",
                    isClickable && isCompleted && "hover:scale-105 cursor-pointer"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Stage ${stage.id}: ${stage.label}`}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    stage.short
                  )}
                </button>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap hidden sm:block",
                    isCurrent && "text-primary font-semibold",
                    isCompleted && "text-primary",
                    isLocked && "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
