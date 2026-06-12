/**
 * DYOR2 — ProblemsPage
 * Stage 5a: Claude returns 3–7 problem cards with journey maps, evidence, solutions
 */

import React, { useEffect, useState } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { ProblemCard } from "@/components/ProblemCard";
import { RegenerateButton } from "@/components/RegenerateButton";
import { Button } from "@/components/ui/button";
import type { ProblemTag } from "@/store/reducer";
import { ArrowRight, AlertCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_TAGS: ProblemTag[] = ["ML", "API", "UX", "systems", "data-pipeline"];

export default function ProblemsPage() {
  const { state, dispatch } = useApp();
  const [activeTag, setActiveTag] = useState<ProblemTag | "all">("all");

  const isLoading = state.loadingSection === "problems";
  const hasError = state.errorSection === "problems";
  const hasProblemSet = !!state.problemSet;

  const getProblemsMutation = trpc.dyor.getProblems.useMutation({
    onSuccess: (data) => {
      dispatch({ type: "SET_PROBLEM_SET", problemSet: data });
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", section: "problems", message: err.message });
    },
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
      approvedSources: approvedSources.map((s) => ({
        id: s.id,
        title: s.title,
        snippet: s.snippet,
      })),
    });
  }

  // Auto-run on page load if no problems yet
  useEffect(() => {
    if (!state.problemSet && !isLoading && state.synthesisReport && state.intakeBrief) {
      runProblems();
    }
  }, []);

  function handleProceed() {
    dispatch({ type: "ADVANCE_STAGE", stage: 5 });
  }

  const filteredProblems =
    state.problemSet?.problems.filter(
      (p) => activeTag === "all" || p.tags.includes(activeTag)
    ) || [];

  const shortlistCount = state.shortlist.length;

  return (
    <div className="stage-enter max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
          <span className="w-5 h-px bg-muted-foreground" />
          Stage 05
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Problem Statements</h1>
            <p className="text-muted-foreground">
              Evidence-backed problems for <strong>{state.companyName}</strong>. Shortlist
              the ones most relevant to your analysis.
            </p>
          </div>
          {hasProblemSet && (
            <RegenerateButton
              onClick={runProblems}
              loading={isLoading}
              label="Regenerate all"
              size="md"
            />
          )}
        </div>
      </div>

      {/* Error */}
      {hasError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Failed to generate problems</p>
            {state.errorMessage && (
              <p className="text-xs mt-0.5 opacity-80">{state.errorMessage}</p>
            )}
            <button onClick={runProblems} className="text-xs underline mt-1 hover:no-underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {/* Filter bar + problems */}
      {hasProblemSet && !isLoading && state.problemSet && (
        <div>
          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTag("all")}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150",
                activeTag === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              )}
            >
              All ({state.problemSet.problems.length})
            </button>
            {ALL_TAGS.filter((tag) =>
              state.problemSet!.problems.some((p) => p.tags.includes(tag))
            ).map((tag) => {
              const count = state.problemSet!.problems.filter((p) =>
                p.tags.includes(tag)
              ).length;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150",
                    activeTag === tag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {tag} ({count})
                </button>
              );
            })}

            {shortlistCount > 0 && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-primary font-medium">
                <Bookmark className="w-3 h-3" />
                {shortlistCount} shortlisted
              </span>
            )}
          </div>

          {/* Problem cards */}
          <div className="space-y-4">
            {filteredProblems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No problems match the selected filter.
              </p>
            ) : (
              filteredProblems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  isShortlisted={state.shortlist.includes(problem.id)}
                  onToggleShortlist={(id) =>
                    dispatch({ type: "TOGGLE_SHORTLIST", problemId: id })
                  }
                />
              ))
            )}
          </div>

          {/* Proceed */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {shortlistCount > 0
                ? `${shortlistCount} problem${shortlistCount !== 1 ? "s" : ""} shortlisted for export`
                : "Shortlist problems to include in your export"}
            </p>
            <Button onClick={handleProceed} size="lg">
              Export Brief
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
