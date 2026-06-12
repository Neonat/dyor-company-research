/**
 * DYOR2 — SynthesisPage
 * Stage 4: Approved sources → Claude returns signal scorecard + tensions + analyst actions
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders, mascot states
 */

import React, { useEffect } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { SignalCard } from "@/components/SignalCard";
import { RegenerateButton } from "@/components/RegenerateButton";
import Mascot from "@/components/Mascot";
import { ArrowRight, AlertCircle, Zap, TrendingUp, ListChecks } from "lucide-react";

export default function SynthesisPage() {
  const { state, dispatch } = useApp();

  const isLoading     = state.loadingSection === "synthesis";
  const hasError      = state.errorSection   === "synthesis";
  const hasSynthesis  = !!state.synthesisReport;
  const approvedSources = state.researchSources.filter((s) => s.approved);

  const getSynthesisMutation = trpc.dyor.getSynthesis.useMutation({
    onSuccess: (report) => { dispatch({ type: "SET_SYNTHESIS_REPORT", report }); },
    onError:   (err)    => { dispatch({ type: "SET_ERROR", section: "synthesis", message: err.message }); },
  });

  function runSynthesis() {
    if (!state.intakeBrief || approvedSources.length < 3) return;
    dispatch({ type: "SET_LOADING", section: "synthesis" });
    getSynthesisMutation.mutate({
      companyName: state.intakeBrief.companyName,
      role: state.role,
      approvedSources: approvedSources.map((s) => ({
        id: s.id, title: s.title, url: s.url, snippet: s.snippet, credibility: s.credibility,
      })),
    });
  }

  useEffect(() => {
    if (!state.synthesisReport && !isLoading && state.intakeBrief && approvedSources.length >= 3) {
      runSynthesis();
    }
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="stage-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 20, height: 1, background: "var(--muted-color)", display: "inline-block" }} />
          Stage 04
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
          Synthesis
        </h1>
        <p style={{ color: "var(--muted-color)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Claude is synthesising {approvedSources.length} approved sources into a structured signal
          scorecard for <strong style={{ color: "var(--ink)" }}>{state.companyName}</strong>.
        </p>
      </div>

      {/* Error */}
      {hasError && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "0.625rem",
          padding: "0.875rem 1rem",
          background: "color-mix(in srgb, var(--signal-red) 8%, var(--paper))",
          border: "0.5px solid color-mix(in srgb, var(--signal-red) 30%, transparent)",
          borderRadius: "var(--radius)", marginBottom: "1.5rem",
        }}>
          <AlertCircle size={16} style={{ color: "var(--signal-red)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--signal-red)" }}>Synthesis failed</p>
            {state.errorMessage && <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>{state.errorMessage}</p>}
            <button onClick={runSynthesis} style={{ fontSize: "0.75rem", color: "var(--research-blue)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "0.25rem" }}>
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading mascot */}
      {isLoading && (
        <Mascot state="loading" caption="Synthesising sources into a signal scorecard… this may take 20 seconds." />
      )}

      {/* Synthesis report */}
      {hasSynthesis && !isLoading && state.synthesisReport && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* Signal Scorecard */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--ink)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Zap size={15} style={{ color: "var(--research-blue)" }} />
                Signal Scorecard
              </h2>
              <RegenerateButton onClick={runSynthesis} loading={isLoading} label="Regenerate" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {state.synthesisReport.signals.map((signal, idx) => (
                <SignalCard key={idx} signal={signal} />
              ))}
            </div>
          </section>

          {/* Key Tensions */}
          {state.synthesisReport.keyTensions.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--ink)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <TrendingUp size={15} style={{ color: "var(--research-blue)" }} />
                Key Tensions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {state.synthesisReport.keyTensions.map((tension, idx) => (
                  <div
                    key={idx}
                    className="dyor-card"
                    style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.875rem 1rem", animationDelay: `${idx * 50}ms` }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 600, color: "var(--muted-color)", flexShrink: 0, marginTop: "0.2rem" }}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p style={{ fontSize: "0.875rem", color: "var(--ink)", lineHeight: 1.6 }}>{tension}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Analyst Actions */}
          {state.synthesisReport.analystActions.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--ink)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <ListChecks size={15} style={{ color: "var(--research-blue)" }} />
                Analyst Actions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {state.synthesisReport.analystActions
                  .sort((a, b) => a.priority - b.priority)
                  .map((action, idx) => (
                    <div
                      key={idx}
                      className="dyor-card"
                      style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.875rem 1rem", animationDelay: `${idx * 50}ms` }}
                    >
                      <span style={{
                        flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                        background: "color-mix(in srgb, var(--research-blue) 12%, transparent)",
                        color: "var(--research-blue)",
                        fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {action.priority}
                      </span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)" }}>{action.action}</p>
                        <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                          {action.rationale}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Proceed */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
            <button
              onClick={() => dispatch({ type: "ADVANCE_STAGE", stage: 5 })}
              className="btn-primary"
              style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
            >
              Generate Problem Statements
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
