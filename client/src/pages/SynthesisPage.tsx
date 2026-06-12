/**
 * DYOR2 — SynthesisPage
 * Stage 4: Approved sources → Claude returns signal scorecard + tensions + analyst actions
 */

import React, { useEffect } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { SignalCard } from "@/components/SignalCard";
import { RegenerateButton } from "@/components/RegenerateButton";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Zap, TrendingUp, ListChecks } from "lucide-react";

export default function SynthesisPage() {
  const { state, dispatch } = useApp();

  const isLoading = state.loadingSection === "synthesis";
  const hasError = state.errorSection === "synthesis";
  const hasSynthesis = !!state.synthesisReport;
  const approvedSources = state.researchSources.filter((s) => s.approved);

  const getSynthesisMutation = trpc.dyor.getSynthesis.useMutation({
    onSuccess: (report) => {
      dispatch({ type: "SET_SYNTHESIS_REPORT", report });
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", section: "synthesis", message: err.message });
    },
  });

  function runSynthesis() {
    if (!state.intakeBrief || approvedSources.length < 3) return;
    dispatch({ type: "SET_LOADING", section: "synthesis" });
    getSynthesisMutation.mutate({
      companyName: state.intakeBrief.companyName,
      role: state.role,
      approvedSources: approvedSources.map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        snippet: s.snippet,
        credibility: s.credibility,
      })),
    });
  }

  // Auto-run synthesis when page loads if no report yet
  useEffect(() => {
    if (!state.synthesisReport && !isLoading && state.intakeBrief && approvedSources.length >= 3) {
      runSynthesis();
    }
  }, []);

  function handleProceed() {
    dispatch({ type: "ADVANCE_STAGE", stage: 5 });
  }

  return (
    <div className="stage-enter max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
          <span className="w-5 h-px bg-muted-foreground" />
          Stage 04
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Synthesis</h1>
        <p className="text-muted-foreground">
          Claude is synthesising {approvedSources.length} approved sources into a structured
          signal scorecard for <strong>{state.companyName}</strong>.
        </p>
      </div>

      {/* Error */}
      {hasError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Synthesis failed</p>
            {state.errorMessage && <p className="text-xs mt-0.5 opacity-80">{state.errorMessage}</p>}
            <button onClick={runSynthesis} className="text-xs underline mt-1 hover:no-underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-5 w-40 rounded bg-muted mb-6" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {/* Synthesis report */}
      {hasSynthesis && !isLoading && state.synthesisReport && (
        <div className="space-y-8">
          {/* Signal Scorecard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Signal Scorecard
              </h2>
              <RegenerateButton
                onClick={runSynthesis}
                loading={isLoading}
                label="Regenerate"
              />
            </div>
            <div className="space-y-2">
              {state.synthesisReport.signals.map((signal, idx) => (
                <SignalCard key={idx} signal={signal} />
              ))}
            </div>
          </section>

          {/* Key Tensions */}
          {state.synthesisReport.keyTensions.length > 0 && (
            <section>
              <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                Key Tensions
              </h2>
              <div className="space-y-2">
                {state.synthesisReport.keyTensions.map((tension, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <span className="font-mono text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{tension}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Analyst Actions */}
          {state.synthesisReport.analystActions.length > 0 && (
            <section>
              <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                <ListChecks className="w-4 h-4 text-primary" />
                Analyst Actions
              </h2>
              <div className="space-y-2">
                {state.synthesisReport.analystActions
                  .sort((a, b) => a.priority - b.priority)
                  .map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {action.priority}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{action.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {action.rationale}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Proceed */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleProceed} size="lg">
              Generate Problem Statements
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
