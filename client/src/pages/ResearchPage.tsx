/**
 * DYOR2 — ResearchPage
 * Stage 2: Claude generates Exa prompts → user edits → runs search → source cards
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders, mascot states
 */

import React, { useState, useEffect } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { SourceChip } from "@/components/SourceChip";
import { RegenerateButton } from "@/components/RegenerateButton";
import Mascot from "@/components/Mascot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Search, Edit3, AlertCircle, CheckCircle2, Key, X } from "lucide-react";

export default function ResearchPage() {
  const { state, dispatch } = useApp();
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  // Use exaApiKey from global state (set during landing page API key modal)
  const exaApiKey = state.exaApiKey || (() => { try { return localStorage.getItem("dyor2_exa_key") || ""; } catch { return ""; } })();
  const [showKeyInput, setShowKeyInput] = useState(false);
  // Local setter for inline key editing (fallback if user wants to change key)
  const [localExaKey, setLocalExaKey] = useState(exaApiKey);

  const hasPrompts      = !!state.exaPrompts && state.exaPrompts.prompts.length > 0;
  const hasSources      = state.researchSources.length > 0;
  const approvedCount   = state.researchSources.filter((s) => s.approved).length;
  const isPromptsLoading = state.loadingSection === "research-prompts";
  const isSearchLoading  = state.loadingSection === "research-search";
  const hasError         = state.errorSection === "research-prompts" || state.errorSection === "research-search";

  const getExaPromptsMutation = trpc.dyor.getExaPrompts.useMutation({
    onSuccess: (data) => { dispatch({ type: "SET_EXA_PROMPTS", prompts: data }); },
    onError: (err)  => { dispatch({ type: "SET_ERROR", section: "research-prompts", message: err.message }); },
  });

  const runExaSearchMutation = trpc.dyor.runExaSearch.useMutation({
    onSuccess: (data) => { dispatch({ type: "SET_RESEARCH_SOURCES", sources: data.sources }); },
    onError: (err)   => { dispatch({ type: "SET_ERROR", section: "research-search", message: err.message }); },
  });

  useEffect(() => {
    if (state.intakeBrief && !hasPrompts && !isPromptsLoading) generatePrompts();
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

  function saveEditPrompt(id: string) {
    dispatch({ type: "UPDATE_EXA_PROMPT", id, query: editValue });
    setEditingPromptId(null);
  }

  function runSearch() {
    const key = localExaKey || exaApiKey;
    if (!state.exaPrompts || !key.trim()) return;
    try { localStorage.setItem("dyor2_exa_key", key); } catch {}
    dispatch({ type: "SET_RESEARCH_SOURCES", sources: [] });
    dispatch({ type: "SET_LOADING", section: "research-search" });
    runExaSearchMutation.mutate({
      prompts: state.exaPrompts.prompts.map((p) => ({ id: p.id, query: p.query })),
      exaApiKey: key.trim(),
    });
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="stage-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 20, height: 1, background: "var(--muted-color)", display: "inline-block" }} />
          Stage 02
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
          Research
        </h1>
        <p style={{ color: "var(--muted-color)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Claude has generated targeted search queries for <strong style={{ color: "var(--ink)" }}>{state.companyName}</strong>.
          Edit any query, then run the search to gather sources.
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
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--signal-red)" }}>Error</p>
            {state.errorMessage && <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>{state.errorMessage}</p>}
            <button
              onClick={state.errorSection === "research-prompts" ? generatePrompts : runSearch}
              style={{ fontSize: "0.75rem", color: "var(--research-blue)", textDecoration: "underline", marginTop: "0.25rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Prompts section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--ink)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Search size={15} style={{ color: "var(--research-blue)" }} />
            Search Queries
          </h2>
          <RegenerateButton onClick={generatePrompts} loading={isPromptsLoading} label="Regenerate queries" />
        </div>

        {isPromptsLoading && (
          <Mascot state="loading" caption="Generating targeted search queries…" />
        )}

        {hasPrompts && !isPromptsLoading && state.exaPrompts && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {state.exaPrompts.prompts.map((prompt, idx) => (
              <div
                key={prompt.id}
                className="dyor-card"
                style={{ padding: "0.875rem 1rem", animationDelay: `${idx * 50}ms` }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.375rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--research-blue)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {prompt.label}
                  </span>
                  <button
                    onClick={() =>
                      editingPromptId === prompt.id
                        ? saveEditPrompt(prompt.id)
                        : (setEditingPromptId(prompt.id), setEditValue(prompt.query))
                    }
                    style={{
                      display: "flex", alignItems: "center", gap: "0.25rem",
                      fontSize: "0.75rem", color: "var(--muted-color)",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <Edit3 size={11} />
                    {editingPromptId === prompt.id ? "Save" : "Edit"}
                  </button>
                </div>

                {editingPromptId === prompt.id ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) saveEditPrompt(prompt.id);
                      if (e.key === "Escape") setEditingPromptId(null);
                    }}
                    autoFocus
                    style={{
                      width: "100%", minHeight: 60, resize: "vertical",
                      fontFamily: "var(--font-mono)", fontSize: "0.8125rem",
                      color: "var(--ink)", background: "var(--surface)",
                      border: "0.5px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                      padding: "0.5rem 0.625rem", outline: "none",
                    }}
                  />
                ) : (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--ink)", lineHeight: 1.5 }}>
                    {prompt.query}
                  </p>
                )}

                <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.375rem", fontStyle: "italic" }}>
                  {prompt.rationale}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exa API Key + Run Search */}
      {hasPrompts && (
        <div className="dyor-card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Key size={14} style={{ color: "var(--muted-color)" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)" }}>
                Exa API Key
              </h3>
            </div>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              style={{ fontSize: "0.75rem", color: "var(--muted-color)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              {showKeyInput ? "Hide" : exaApiKey ? "Change" : "Enter key"}
            </button>
          </div>

          {(showKeyInput || !exaApiKey) && (
            <div style={{ marginBottom: "0.75rem" }}>
              <input
                type="password"
                value={localExaKey}
                onChange={(e) => setLocalExaKey(e.target.value)}
                placeholder="exa_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="dyor-input"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--muted-color)", marginTop: "0.375rem" }}>
                Get your key at{" "}
                <a href="https://exa.ai" target="_blank" rel="noopener noreferrer" style={{ color: "var(--research-blue)", textDecoration: "underline" }}>
                  exa.ai
                </a>
                . Stored locally in your browser only.
              </p>
            </div>
          )}

          {exaApiKey && !showKeyInput && (
            <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginBottom: "0.75rem" }}>
              Key saved: <span style={{ fontFamily: "var(--font-mono)" }}>••••••••{exaApiKey.slice(-4)}</span>
            </p>
          )}

          <button
            onClick={runSearch}
            disabled={!exaApiKey.trim() || isSearchLoading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.625rem 1rem" }}
          >
            {isSearchLoading ? (
              <>
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  animation: "spin 0.7s linear infinite", display: "inline-block",
                }} />
                Searching…
              </>
            ) : (
              <>
                <Search size={14} />
                Run Exa Search ({state.exaPrompts?.prompts.length ?? 0} queries)
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading search mascot */}
      {isSearchLoading && state.researchSources.length === 0 && (
        <Mascot state="loading" caption="Searching the web for relevant sources…" />
      )}

      {/* Source cards */}
      {hasSources && !isSearchLoading && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--ink)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={15} style={{ color: "var(--signal-green)" }} />
              Sources Found
              <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--muted-color)" }}>
                ({state.researchSources.length} total, {approvedCount} approved)
              </span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {state.researchSources.map((source) => (
              <SourceChip
                key={source.id}
                source={source}
                onToggle={(id) => dispatch({ type: "TOGGLE_SOURCE_APPROVAL", id })}
              />
            ))}
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-color)" }}>
              {approvedCount} of {state.researchSources.length} sources approved
            </p>
            <button
              onClick={() => dispatch({ type: "ADVANCE_STAGE", stage: 3 })}
              className="btn-primary"
              style={{ padding: "0.625rem 1.25rem" }}
            >
              Review Sources
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
