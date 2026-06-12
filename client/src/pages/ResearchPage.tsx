/**
 * DYOR2 — ResearchPage
 * Stage 2: Claude generates Exa prompts → user edits → runs search → source cards
 */

import React, { useState, useEffect } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { SourceChip } from "@/components/SourceChip";
import { RegenerateButton } from "@/components/RegenerateButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Search, Edit3, AlertCircle, CheckCircle2, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResearchPage() {
  const { state, dispatch } = useApp();
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [exaApiKey, setExaApiKey] = useState(() => {
    try { return localStorage.getItem("dyor2_exa_key") || ""; } catch { return ""; }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  const hasPrompts = !!state.exaPrompts && state.exaPrompts.prompts.length > 0;
  const hasSources = state.researchSources.length > 0;
  const approvedCount = state.researchSources.filter((s) => s.approved).length;
  const isPromptsLoading = state.loadingSection === "research-prompts";
  const isSearchLoading = state.loadingSection === "research-search";
  const hasError = state.errorSection === "research-prompts" || state.errorSection === "research-search";

  const getExaPromptsMutation = trpc.dyor.getExaPrompts.useMutation({
    onSuccess: (data) => {
      dispatch({ type: "SET_EXA_PROMPTS", prompts: data });
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", section: "research-prompts", message: err.message });
    },
  });

  const runExaSearchMutation = trpc.dyor.runExaSearch.useMutation({
    onSuccess: (data) => {
      dispatch({ type: "SET_RESEARCH_SOURCES", sources: data.sources });
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", section: "research-search", message: err.message });
    },
  });

  // Auto-generate prompts when page loads if we have a brief but no prompts
  useEffect(() => {
    if (state.intakeBrief && !hasPrompts && !isPromptsLoading) {
      generatePrompts();
    }
  }, []);

  function generatePrompts() {
    if (!state.intakeBrief) return;
    dispatch({ type: "SET_LOADING", section: "research-prompts" });
    getExaPromptsMutation.mutate({
      companyName: state.intakeBrief.companyName,
      industry: state.intakeBrief.industry,
      role: state.role,
      publicCxSignals: state.intakeBrief.publicCxSignals,
    });
  }

  function startEditPrompt(id: string, currentQuery: string) {
    setEditingPromptId(id);
    setEditValue(currentQuery);
  }

  function saveEditPrompt(id: string) {
    dispatch({ type: "UPDATE_EXA_PROMPT", id, query: editValue });
    setEditingPromptId(null);
  }

  function runSearch() {
    if (!state.exaPrompts || !exaApiKey.trim()) return;
    try { localStorage.setItem("dyor2_exa_key", exaApiKey); } catch {}
    dispatch({ type: "SET_RESEARCH_SOURCES", sources: [] });
    dispatch({ type: "SET_LOADING", section: "research-search" });
    runExaSearchMutation.mutate({
      prompts: state.exaPrompts.prompts.map((p) => ({ id: p.id, query: p.query })),
      exaApiKey: exaApiKey.trim(),
    });
  }

  function handleProceed() {
    dispatch({ type: "ADVANCE_STAGE", stage: 3 });
  }

  return (
    <div className="stage-enter max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
          <span className="w-5 h-px bg-muted-foreground" />
          Stage 02
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Research</h1>
        <p className="text-muted-foreground">
          Claude has generated targeted search queries for{" "}
          <strong>{state.companyName}</strong>. Edit any query, then run the search to gather
          sources.
        </p>
      </div>

      {/* Error */}
      {hasError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            {state.errorMessage && <p className="text-xs mt-0.5 opacity-80">{state.errorMessage}</p>}
            <button
              onClick={state.errorSection === "research-prompts" ? generatePrompts : runSearch}
              className="text-xs underline mt-1 hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Prompts section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Search Queries
          </h2>
          <RegenerateButton
            onClick={generatePrompts}
            loading={isPromptsLoading}
            label="Regenerate queries"
          />
        </div>

        {isPromptsLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {hasPrompts && !isPromptsLoading && state.exaPrompts && (
          <div className="space-y-2">
            {state.exaPrompts.prompts.map((prompt, idx) => (
              <div
                key={prompt.id}
                className="border border-border rounded-lg p-3 bg-card"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary">{prompt.label}</span>
                  <button
                    onClick={() =>
                      editingPromptId === prompt.id
                        ? saveEditPrompt(prompt.id)
                        : startEditPrompt(prompt.id, prompt.query)
                    }
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    {editingPromptId === prompt.id ? "Save" : "Edit"}
                  </button>
                </div>

                {editingPromptId === prompt.id ? (
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-sm font-mono min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) saveEditPrompt(prompt.id);
                      if (e.key === "Escape") setEditingPromptId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm font-mono text-foreground">{prompt.query}</p>
                )}

                <p className="text-xs text-muted-foreground mt-1.5 italic">{prompt.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exa API Key + Run Search */}
      {hasPrompts && (
        <div className="mb-8 p-4 border border-border rounded-xl bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Exa API Key</h3>
            </div>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {showKeyInput ? "Hide" : exaApiKey ? "Change" : "Enter key"}
            </button>
          </div>

          {(showKeyInput || !exaApiKey) && (
            <div className="mb-3">
              <Input
                type="password"
                value={exaApiKey}
                onChange={(e) => setExaApiKey(e.target.value)}
                placeholder="exa_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your key at{" "}
                <a href="https://exa.ai" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                  exa.ai
                </a>
                . Stored locally only.
              </p>
            </div>
          )}

          {exaApiKey && !showKeyInput && (
            <p className="text-xs text-muted-foreground mb-3">
              Key saved: <span className="font-mono">••••••••{exaApiKey.slice(-4)}</span>
            </p>
          )}

          <Button
            onClick={runSearch}
            disabled={!exaApiKey.trim() || isSearchLoading}
            className="w-full"
          >
            {isSearchLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Searching…
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Run Exa Search ({state.exaPrompts?.prompts.length ?? 0} queries)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading search skeleton */}
      {isSearchLoading && state.researchSources.length === 0 && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-1/4 rounded bg-muted" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {/* Source cards */}
      {hasSources && !isSearchLoading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sources Found
              <span className="text-xs font-normal text-muted-foreground">
                ({state.researchSources.length} total, {approvedCount} approved)
              </span>
            </h2>
          </div>

          <div className="space-y-2">
            {state.researchSources.map((source) => (
              <SourceChip
                key={source.id}
                source={source}
                onToggle={(id) => dispatch({ type: "TOGGLE_SOURCE_APPROVAL", id })}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {approvedCount} of {state.researchSources.length} sources approved
            </p>
            <Button onClick={handleProceed} disabled={approvedCount < 1}>
              Review Sources
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
