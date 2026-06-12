/**
 * DYOR2 — StageNav
 * Fluid loading bar with animated fill, replacing the old circle nodes.
 * Shows stage labels below the bar with the current stage highlighted.
 */

import { cn } from "@/lib/utils";

const STAGES = [
  { id: 1, label: "Intake" },
  { id: 2, label: "Research" },
  { id: 3, label: "Checkpoint" },
  { id: 4, label: "Synthesis" },
  { id: 5, label: "Problems" },
  { id: 6, label: "Export" },
];

interface StageNavProps {
  currentStage: number;
  onStageClick?: (stage: number) => void;
  className?: string;
}

export function StageNav({ currentStage, onStageClick, className }: StageNavProps) {
  // Progress: each stage fills 1/6 of the bar. Current stage fills halfway.
  const progressPercent = ((currentStage - 1) / 6) * 100 + (1 / 6) * 50;

  return (
    <nav
      className={cn("no-print sticky top-0 z-40", className)}
      aria-label="Pipeline stages"
      style={{
        background: "var(--paper)",
        borderBottom: "0.5px solid var(--border-color)",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1rem 1.5rem 0.75rem" }}>
        {/* Wordmark + progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "0.6rem" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--ink)",
              flexShrink: 0,
            }}
          >
            DYOR
          </span>

          {/* Fluid progress bar */}
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: "var(--border-color)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                background: "linear-gradient(90deg, var(--research-blue), var(--ink))",
                width: `${progressPercent}%`,
                transition: "width 600ms cubic-bezier(0.23, 1, 0.32, 1)",
                position: "relative",
              }}
            >
              {/* Shimmer animation overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 3,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>

          {/* Stage fraction */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--muted-color)", flexShrink: 0 }}>
            {currentStage}/6
          </span>
        </div>

        {/* Stage labels */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: "3.5rem" }}>
          {STAGES.map((stage) => {
            const isCompleted = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const isClickable = onStageClick && isCompleted;

            return (
              <button
                key={stage.id}
                onClick={() => isClickable && onStageClick!(stage.id)}
                disabled={!isClickable}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? "var(--ink)" : isCompleted ? "var(--research-blue)" : "var(--muted-color)",
                  background: "none",
                  border: "none",
                  cursor: isClickable ? "pointer" : "default",
                  padding: "0.15rem 0.25rem",
                  borderRadius: "var(--radius-sm)",
                  transition: "color 150ms ease-out",
                  textDecoration: isClickable ? "none" : "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (isClickable) (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; }}
                onMouseLeave={(e) => { if (isClickable) (e.currentTarget as HTMLButtonElement).style.color = "var(--research-blue)"; }}
              >
                {stage.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </nav>
  );
}
