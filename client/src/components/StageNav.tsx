import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STAGES = [
  { id: 1, label: "Intake",      short: "01" },
  { id: 2, label: "Research",    short: "02" },
  { id: 3, label: "Checkpoint",  short: "03" },
  { id: 4, label: "Synthesis",   short: "04" },
  { id: 5, label: "Problems",    short: "05" },
  { id: 6, label: "Export",      short: "06" },
];

interface StageNavProps {
  currentStage: number;
  onStageClick?: (stage: number) => void;
  className?: string;
}

export function StageNav({ currentStage, onStageClick, className }: StageNavProps) {
  return (
    <nav
      className={cn("no-print sticky top-0 z-40", className)}
      aria-label="Pipeline stages"
      style={{
        background: "var(--paper)",
        borderBottom: "0.5px solid var(--border-color)",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0.75rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {/* Wordmark */}
          <span
            className="dyor-wordmark"
            style={{ fontSize: "1rem", letterSpacing: "0.1em", flexShrink: 0 }}
          >
            DYOR
          </span>

          {/* Stages */}
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {STAGES.map((stage, idx) => {
              const isCompleted = stage.id < currentStage;
              const isCurrent   = stage.id === currentStage;
              const isLocked    = stage.id > currentStage;
              const isClickable = onStageClick && (isCompleted || isCurrent);
              const isLast      = idx === STAGES.length - 1;

              return (
                <React.Fragment key={stage.id}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                    <button
                      onClick={() => isClickable && onStageClick!(stage.id)}
                      disabled={isLocked}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Stage ${stage.id}: ${stage.label}`}
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        border: isCompleted || isCurrent
                          ? "1.5px solid var(--ink)"
                          : "1.5px solid var(--border-color)",
                        background: isCompleted || isCurrent ? "var(--ink)" : "var(--paper)",
                        color: isCompleted || isCurrent ? "var(--paper)" : "var(--muted-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isLocked ? "default" : "pointer",
                        transition: "all 200ms cubic-bezier(0.23,1,0.32,1)",
                        transform: isCurrent ? "scale(1.1)" : "scale(1)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted ? <Check size={11} strokeWidth={2.5} /> : stage.short}
                    </button>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.625rem",
                        fontWeight: isCurrent ? 600 : 400,
                        color: isCurrent
                          ? "var(--ink)"
                          : isCompleted
                          ? "var(--ink)"
                          : "var(--muted-color)",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.01em",
                      }}
                      className="hidden sm:block"
                    >
                      {stage.label}
                    </span>
                  </div>

                  {/* Connector */}
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: "0.5px",
                        background: isCompleted ? "var(--ink)" : "var(--border-color)",
                        marginBottom: "1rem",
                        minWidth: "0.5rem",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
