/**
 * DYOR2 — ProblemsPage
 * Stage 5: Claude returns 3–7 problem cards with journey maps, evidence, solutions
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders, mascot states
 */

import React, { useEffect, useState } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { ProblemCard } from "@/components/ProblemCard";
import { RegenerateButton } from "@/components/RegenerateButton";
import Mascot from "@/components/Mascot";
import type { ProblemTag } from "@/store/reducer";
import { ArrowRight, AlertCircle, Bookmark } from "lucide-react";

const ALL_TAGS: ProblemTag[] = ["ML", "API", "UX", "systems", "data-pipeline"];

export default function ProblemsPage() {
  const { state, dispatch } = useApp();
  const [activeTag, setActiveTag] = useState<ProblemTag | "all">("all");

  const isLoading    = state.loadingSection === "problems";
  const hasError     = state.errorSection   === "problems";
  const hasProblemSet = !!state.problemSet;
  const shortlistCount = state.shortlist.length;

  const getProblemsMutation = trpc.dyor.getProblems.useMutation({
    onSuccess: (data) => { dispatch({ type: "SET_PROBLEM_SET", problemSet: data }); },
    onError:   (err)  => { dispatch({ type: "SET_ERROR", section: "problems", message: err.message }); },
  });

  function runProblems() {
    if (!state.synthesisReport || !state.intakeBrief) return;
    dispatch({ type: "SET_LOADING", section: "problems" });
    const approvedSources = state.researchSources.filter((s) => s.approved);
    getProblemsMutation.mutate({
      companyName: state.intakeBrief.companyName,
      role: state.role,
      signals: state.synthesisReport.signals,
      keyTensions: state.synthesisReport.keyTensions,
      approvedSources: approvedSources.map((s) => ({ id: s.id, title: s.title, snippet: s.snippet })),
    });
  }

  useEffect(() => {
    if (!state.problemSet && !isLoading && state.synthesisReport && state.intakeBrief) {
      runProblems();
    }
  }, []);

  const filteredProblems =
    state.problemSet?.problems.filter((p) => activeTag === "all" || p.tags.includes(activeTag)) || [];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="stage-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 20, height: 1, background: "var(--muted-color)", display: "inline-block" }} />
          Stage 05
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
              Problem Statements
            </h1>
            <p style={{ color: "var(--muted-color)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              Evidence-backed problems for <strong style={{ color: "var(--ink)" }}>{state.companyName}</strong>.
              Shortlist the ones most relevant to your analysis.
            </p>
          </div>
          {hasProblemSet && (
            <RegenerateButton onClick={runProblems} loading={isLoading} label="Regenerate all" size="md" />
          )}
        </div>
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
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--signal-red)" }}>Failed to generate problems</p>
            {state.errorMessage && <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>{state.errorMessage}</p>}
            <button onClick={runProblems} style={{ fontSize: "0.75rem", color: "var(--research-blue)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "0.25rem" }}>
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading mascot */}
      {isLoading && (
        <Mascot state="loading" caption="Generating evidence-backed problem statements… this may take 30 seconds." />
      )}

      {/* Filter bar + problems */}
      {hasProblemSet && !isLoading && state.problemSet && (
        <div>
          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {(["all", ...ALL_TAGS.filter((tag) => state.problemSet!.problems.some((p) => p.tags.includes(tag)))] as const).map((tag) => {
              const count = tag === "all"
                ? state.problemSet!.problems.length
                : state.problemSet!.problems.filter((p) => p.tags.includes(tag as ProblemTag)).length;
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag as ProblemTag | "all")}
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 600,
                    padding: "0.3rem 0.75rem",
                    borderRadius: 99,
                    border: isActive ? "1.5px solid var(--ink)" : "0.5px solid var(--border-color)",
                    background: isActive ? "var(--ink)" : "var(--paper)",
                    color: isActive ? "var(--paper)" : "var(--muted-color)",
                    cursor: "pointer",
                    transition: "all 150ms ease-out",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {tag === "all" ? `All (${count})` : `${tag} (${count})`}
                </button>
              );
            })}

            {shortlistCount > 0 && (
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--research-blue)", fontWeight: 600 }}>
                <Bookmark size={12} />
                {shortlistCount} shortlisted
              </span>
            )}
          </div>

          {/* Problem cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredProblems.length === 0 ? (
              <Mascot state="empty" caption="No problems match the selected filter." />
            ) : (
              filteredProblems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  isShortlisted={state.shortlist.includes(problem.id)}
                  onToggleShortlist={(id) => dispatch({ type: "TOGGLE_SHORTLIST", problemId: id })}
                />
              ))
            )}
          </div>

          {/* Proceed */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: "2rem", paddingTop: "1.25rem",
            borderTop: "0.5px solid var(--border-color)",
          }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-color)" }}>
              {shortlistCount > 0
                ? `${shortlistCount} problem${shortlistCount !== 1 ? "s" : ""} shortlisted for export`
                : "Shortlist problems to include in your export"}
            </p>
            <button
              onClick={() => dispatch({ type: "ADVANCE_STAGE", stage: 6 })}
              className="btn-primary"
              style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
            >
              Export Brief
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
