/**
 * DYOR2 — IntakePage
 * Stage 1: Company name + analyst role → tRPC → Claude IntakeBrief
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders, mascot states
 */

import React, { useState } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegenerateButton } from "@/components/RegenerateButton";
import Mascot from "@/components/Mascot";
import { ArrowRight, Building2, AlertCircle, CheckCircle2 } from "lucide-react";

const ANALYST_ROLES = [
  { value: "product-manager",      label: "Product Manager" },
  { value: "ux-researcher",        label: "UX Researcher" },
  { value: "business-analyst",     label: "Business Analyst" },
  { value: "strategy-consultant",  label: "Strategy Consultant" },
  { value: "software-engineer",    label: "Software Engineer" },
  { value: "data-scientist",       label: "Data Scientist" },
  { value: "venture-analyst",      label: "Venture Analyst" },
  { value: "cx-specialist",        label: "CX Specialist" },
];

const SIZE_LABELS: Record<string, string> = {
  startup:    "Startup",
  scaleup:    "Scale-up",
  enterprise: "Enterprise",
};

export default function IntakePage() {
  const { state, dispatch } = useApp();
  const [companyName, setCompanyName] = useState(state.companyName || "");
  const [role, setRole] = useState(state.role || "");

  const isLoading = state.loadingSection === "intake";
  const hasError  = state.errorSection  === "intake";
  const hasBrief  = !!state.intakeBrief;

  const getIntakeBriefMutation = trpc.dyor.getIntakeBrief.useMutation({
    onSuccess: (brief) => {
      dispatch({ type: "SET_INTAKE_BRIEF", brief });
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", section: "intake", message: err.message });
    },
  });

  const fetchLogoMutation = trpc.dyor.fetchLogo.useMutation({
    onSuccess: (data) => {
      dispatch({ type: "SET_COMPANY_LOGO", url: data.url });
    },
    onError: () => {
      dispatch({ type: "SET_COMPANY_LOGO", url: null });
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !role) return;
    dispatch({ type: "SET_INTAKE", companyName: companyName.trim(), role });
    dispatch({ type: "SET_LOADING", section: "intake" });
    // Fetch logo server-side so the duck can inspect it during loading
    fetchLogoMutation.mutate({ companyName: companyName.trim() });
    getIntakeBriefMutation.mutate({ companyName: companyName.trim(), role });
  }

  async function handleRegenerate() {
    if (!state.companyName || !state.role) return;
    dispatch({ type: "SET_LOADING", section: "intake" });
    getIntakeBriefMutation.mutate({ companyName: state.companyName, role: state.role });
  }

  function handleProceed() {
    dispatch({ type: "ADVANCE_STAGE", stage: 2 });
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="stage-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 20, height: 1, background: "var(--muted-color)", display: "inline-block" }} />
          Stage 01
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
          Company Intake
        </h1>
        <p style={{ color: "var(--muted-color)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Enter the company you want to analyse and your analyst role. Claude will generate a
          baseline brief to anchor the research pipeline.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Company name */}
        <div>
          <label htmlFor="company" className="dyor-label">Company Name</label>
          <div style={{ position: "relative" }}>
            <Building2
              size={15}
              style={{
                position: "absolute", left: "0.75rem", top: "50%",
                transform: "translateY(-50%)", color: "var(--muted-color)",
                pointerEvents: "none",
              }}
            />
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Star Alliance, Shopify, Lufthansa"
              disabled={isLoading}
              autoFocus
              className="dyor-input"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="dyor-label">Your Analyst Role</label>
          <Select value={role} onValueChange={setRole} disabled={isLoading}>
            <SelectTrigger
              id="role"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: role ? "var(--ink)" : "var(--muted-color)",
              }}
            >
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {ANALYST_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!companyName.trim() || !role || isLoading}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
        >
          {isLoading ? (
            <>
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }} />
              Generating brief…
            </>
          ) : (
            <>
              Generate Baseline Brief
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {hasError && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "0.625rem",
          padding: "0.875rem 1rem",
          background: "color-mix(in srgb, var(--signal-red) 8%, var(--paper))",
          border: "0.5px solid color-mix(in srgb, var(--signal-red) 30%, transparent)",
          borderRadius: "var(--radius)",
          marginBottom: "1.5rem",
        }}>
          <AlertCircle size={16} style={{ color: "var(--signal-red)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--signal-red)" }}>Failed to generate brief</p>
            {state.errorMessage && (
              <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginTop: "0.25rem" }}>{state.errorMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Loading mascot */}
      {isLoading && (
        <Mascot state="loading" caption="Researching the company… this takes about 10 seconds." />
      )}

      {/* IntakeBrief result */}
      {hasBrief && !isLoading && state.intakeBrief && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} style={{ color: "var(--signal-green)" }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--ink)" }}>
                Baseline Brief
              </h2>
            </div>
            <RegenerateButton onClick={handleRegenerate} loading={isLoading} />
          </div>

          {/* Brief card */}
          <div className="dyor-card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Company header */}
            <div style={{
              background: "var(--surface)",
              borderBottom: "0.5px solid var(--border-color)",
              padding: "0.875rem 1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.125rem", color: "var(--ink)" }}>
                    {state.intakeBrief.companyName}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginTop: "0.125rem" }}>
                    {state.intakeBrief.industry} · {state.intakeBrief.headquartersCountry}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 600,
                    padding: "0.2rem 0.5rem",
                    background: "color-mix(in srgb, var(--research-blue) 10%, transparent)",
                    color: "var(--research-blue)",
                    border: "0.5px solid color-mix(in srgb, var(--research-blue) 30%, transparent)",
                    borderRadius: "var(--radius-sm)",
                  }}>
                    {SIZE_LABELS[state.intakeBrief.estimatedSize] || state.intakeBrief.estimatedSize}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 600,
                    color: state.intakeBrief.confidence === "high"
                      ? "var(--signal-green)"
                      : state.intakeBrief.confidence === "medium"
                      ? "var(--signal-amber)"
                      : "var(--signal-red)",
                  }}>
                    {state.intakeBrief.confidence} confidence
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Analyst context */}
              <div>
                <p className="stage-label" style={{ marginBottom: "0.375rem" }}>Analyst Context</p>
                <p style={{ fontSize: "0.875rem", color: "var(--ink)", lineHeight: 1.6 }}>
                  {state.intakeBrief.analystRoleSummary}
                </p>
              </div>

              {/* Tech stack */}
              {state.intakeBrief.knownTechStack.length > 0 && (
                <div>
                  <p className="stage-label" style={{ marginBottom: "0.5rem" }}>Known Tech Stack</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {state.intakeBrief.knownTechStack.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 400,
                          padding: "0.2rem 0.5rem",
                          background: "var(--surface)",
                          border: "0.5px solid var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--ink)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CX signals */}
              {state.intakeBrief.publicCxSignals.length > 0 && (
                <div>
                  <p className="stage-label" style={{ marginBottom: "0.5rem" }}>Public CX Signals</p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "0.375rem", listStyle: "none", padding: 0, margin: 0 }}>
                    {state.intakeBrief.publicCxSignals.map((signal, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "var(--ink)" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--muted-color)", flexShrink: 0, marginTop: "0.45rem" }} />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Proceed */}
          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleProceed} className="btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}>
              Proceed to Research
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
