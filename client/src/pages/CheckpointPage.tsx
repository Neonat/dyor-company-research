/**
 * DYOR2 — CheckpointPage
 * Design: Precision Instrument
 * Checkpoint: User reviews sources, min 3 approved to unlock synthesis
 */

import React from "react";
import { useApp } from "@/store/AppContext";
import { SourceChip } from "@/components/SourceChip";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_APPROVED = 3;

export default function CheckpointPage() {
  const { state, dispatch } = useApp();

  const approvedSources = state.researchSources.filter((s) => s.approved);
  const rejectedSources = state.researchSources.filter((s) => !s.approved);
  const approvedCount = approvedSources.length;
  const canProceed = approvedCount >= MIN_APPROVED;

  function handleProceed() {
    dispatch({ type: "ADVANCE_STAGE", stage: 4 });
  }

  return (
    <div className="stage-enter max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
          <span className="w-5 h-px bg-muted-foreground" />
          Checkpoint
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Source Review</h1>
        <p className="text-muted-foreground">
          Weak sources poison synthesis. Review each source and approve at least{" "}
          <strong>{MIN_APPROVED}</strong> before running the synthesis analysis.
        </p>
      </div>

      {/* Status bar */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl border mb-8",
          canProceed
            ? "bg-[var(--color-signal-green-bg)] border-[var(--color-signal-green)]/30"
            : "bg-[var(--color-signal-amber-bg)] border-[var(--color-signal-amber)]/30"
        )}
      >
        {canProceed ? (
          <ShieldCheck className="w-5 h-5 text-[var(--color-signal-green)] flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-[var(--color-signal-amber)] flex-shrink-0" />
        )}
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-semibold",
              canProceed
                ? "text-[var(--color-signal-green)]"
                : "text-[var(--color-signal-amber)]"
            )}
          >
            {canProceed
              ? `${approvedCount} sources approved — ready for synthesis`
              : `${approvedCount} of ${MIN_APPROVED} required sources approved`}
          </p>
          {!canProceed && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Approve {MIN_APPROVED - approvedCount} more source
              {MIN_APPROVED - approvedCount !== 1 ? "s" : ""} to continue
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-24 h-2 bg-border rounded-full overflow-hidden flex-shrink-0">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              canProceed ? "bg-[var(--color-signal-green)]" : "bg-[var(--color-signal-amber)]"
            )}
            style={{
              width: `${Math.min(100, (approvedCount / Math.max(state.researchSources.length, 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Approved sources */}
      {approvedSources.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-signal-green)]" />
            Approved ({approvedSources.length})
          </h2>
          <div className="space-y-2">
            {approvedSources.map((source) => (
              <SourceChip
                key={source.id}
                source={source}
                onToggle={(id) => dispatch({ type: "TOGGLE_SOURCE_APPROVAL", id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected sources */}
      {rejectedSources.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-border" />
            Rejected ({rejectedSources.length})
          </h2>
          <div className="space-y-2">
            {rejectedSources.map((source) => (
              <SourceChip
                key={source.id}
                source={source}
                onToggle={(id) => dispatch({ type: "TOGGLE_SOURCE_APPROVAL", id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Proceed */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleProceed}
          disabled={!canProceed}
          size="lg"
          className={cn(!canProceed && "opacity-50 cursor-not-allowed")}
        >
          Run Synthesis
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
