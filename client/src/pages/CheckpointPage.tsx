/**
 * DYOR2 — CheckpointPage
 * Checkpoint: User reviews sources, min 3 approved to unlock synthesis
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders
 */

import React from "react";
import { useApp } from "@/store/AppContext";
import { SourceChip } from "@/components/SourceChip";
import { ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

const MIN_APPROVED = 3;

export default function CheckpointPage() {
  const { state, dispatch } = useApp();

  const approvedSources = state.researchSources.filter((s) => s.approved);
  const rejectedSources = state.researchSources.filter((s) => !s.approved);
  const approvedCount   = approvedSources.length;
  const canProceed      = approvedCount >= MIN_APPROVED;
  const progressPct     = Math.min(100, (approvedCount / Math.max(state.researchSources.length, 1)) * 100);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="stage-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 20, height: 1, background: "var(--muted-color)", display: "inline-block" }} />
          Checkpoint
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
          Source Review
        </h1>
        <p style={{ color: "var(--muted-color)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Weak sources poison synthesis. Review each source and approve at least{" "}
          <strong style={{ color: "var(--ink)" }}>{MIN_APPROVED}</strong> before running the synthesis analysis.
        </p>
      </div>

      {/* Status bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        padding: "1rem 1.25rem",
        background: canProceed
          ? "color-mix(in srgb, var(--signal-green) 8%, var(--paper))"
          : "color-mix(in srgb, var(--signal-amber) 8%, var(--paper))",
        border: `0.5px solid ${canProceed
          ? "color-mix(in srgb, var(--signal-green) 30%, transparent)"
          : "color-mix(in srgb, var(--signal-amber) 30%, transparent)"}`,
        borderRadius: "var(--radius)",
        marginBottom: "2rem",
      }}>
        {canProceed
          ? <ShieldCheck size={18} style={{ color: "var(--signal-green)", flexShrink: 0 }} />
          : <AlertTriangle size={18} style={{ color: "var(--signal-amber)", flexShrink: 0 }} />
        }
        <div style={{ flex: 1 }}>
          <p style={{
            fontWeight: 600, fontSize: "0.875rem",
            color: canProceed ? "var(--signal-green)" : "var(--signal-amber)",
          }}>
            {canProceed
              ? `${approvedCount} sources approved — ready for synthesis`
              : `${approvedCount} of ${MIN_APPROVED} required sources approved`}
          </p>
          {!canProceed && (
            <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.2rem" }}>
              Approve {MIN_APPROVED - approvedCount} more source{MIN_APPROVED - approvedCount !== 1 ? "s" : ""} to continue
            </p>
          )}
        </div>
        {/* Progress bar */}
        <div style={{ width: 80, height: 4, background: "var(--border-color)", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: canProceed ? "var(--signal-green)" : "var(--signal-amber)",
            width: `${progressPct}%`,
            transition: "width 300ms cubic-bezier(0.23,1,0.32,1)",
          }} />
        </div>
      </div>

      {/* Approved sources */}
      {approvedSources.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)", marginBottom: "0.75rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--signal-green)", display: "inline-block" }} />
            Approved ({approvedSources.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {approvedSources.map((source) => (
              <SourceChip
                key={source.id}
                source={source}
                onToggle={(id) => dispatch({ type: "TOGGLE_SOURCE_APPROVAL", id })}
                onRemove={(id) => dispatch({ type: "REMOVE_SOURCE", id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected sources */}
      {rejectedSources.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", color: "var(--muted-color)", marginBottom: "0.75rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-color)", display: "inline-block" }} />
            Rejected ({rejectedSources.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {rejectedSources.map((source) => (
              <SourceChip
                key={source.id}
                source={source}
                onToggle={(id) => dispatch({ type: "TOGGLE_SOURCE_APPROVAL", id })}
                onRemove={(id) => dispatch({ type: "REMOVE_SOURCE", id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Proceed */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        <button
          onClick={() => dispatch({ type: "ADVANCE_STAGE", stage: 4 })}
          disabled={!canProceed}
          className="btn-primary"
          style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
        >
          Run Synthesis
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
