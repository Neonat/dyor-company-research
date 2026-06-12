/**
 * DYOR2 — IntakePage
 * Stage 1: Company name + analyst role → tRPC → Claude IntakeBrief
 */

import React, { useState } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegenerateButton } from "@/components/RegenerateButton";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, AlertCircle, CheckCircle2 } from "lucide-react";

const ANALYST_ROLES = [
  { value: "product-manager", label: "Product Manager" },
  { value: "ux-researcher", label: "UX Researcher" },
  { value: "business-analyst", label: "Business Analyst" },
  { value: "strategy-consultant", label: "Strategy Consultant" },
  { value: "software-engineer", label: "Software Engineer" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "venture-analyst", label: "Venture Analyst" },
  { value: "cx-specialist", label: "CX Specialist" },
];

const SIZE_LABELS: Record<string, string> = {
  startup: "Startup",
  scaleup: "Scale-up",
  enterprise: "Enterprise",
};

const CONFIDENCE_CONFIG: Record<string, { label: string; class: string }> = {
  high: { label: "High confidence", class: "text-emerald-600" },
  medium: { label: "Medium confidence", class: "text-amber-600" },
  low: { label: "Low confidence", class: "text-red-600" },
};

export default function IntakePage() {
  const { state, dispatch } = useApp();
  const [companyName, setCompanyName] = useState(state.companyName || "");
  const [role, setRole] = useState(state.role || "");

  const isLoading = state.loadingSection === "intake";
  const hasError = state.errorSection === "intake";
  const hasBrief = !!state.intakeBrief;

  const getIntakeBriefMutation = trpc.dyor.getIntakeBrief.useMutation({
    onSuccess: (brief) => {
      dispatch({ type: "SET_INTAKE_BRIEF", brief });
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", section: "intake", message: err.message });
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !role) return;
    dispatch({ type: "SET_INTAKE", companyName: companyName.trim(), role });
    dispatch({ type: "SET_LOADING", section: "intake" });
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
    <div className="stage-enter max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
          <span className="w-5 h-px bg-muted-foreground" />
          Stage 01
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Company Intake</h1>
        <p className="text-muted-foreground">
          Enter the company you want to analyse and your analyst role. Claude will generate a
          baseline brief to anchor the research pipeline.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 mb-8">
        <div className="space-y-1.5">
          <Label htmlFor="company" className="text-sm font-medium">
            Company Name
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Star Alliance, Shopify, Lufthansa"
              className="pl-9 font-medium"
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-sm font-medium">
            Your Analyst Role
          </Label>
          <Select value={role} onValueChange={setRole} disabled={isLoading}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {ANALYST_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={!companyName.trim() || !role || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Generating brief…
            </>
          ) : (
            <>
              Generate Baseline Brief
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Error */}
      {hasError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Failed to generate brief</p>
            {state.errorMessage && (
              <p className="text-xs mt-0.5 opacity-80">{state.errorMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
        </div>
      )}

      {/* IntakeBrief result */}
      {hasBrief && !isLoading && state.intakeBrief && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-semibold">Baseline Brief</h2>
            </div>
            <RegenerateButton onClick={handleRegenerate} loading={isLoading} />
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            {/* Company header */}
            <div className="bg-muted/40 px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{state.intakeBrief.companyName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {state.intakeBrief.industry} · {state.intakeBrief.headquartersCountry}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                    {SIZE_LABELS[state.intakeBrief.estimatedSize] || state.intakeBrief.estimatedSize}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      CONFIDENCE_CONFIG[state.intakeBrief.confidence]?.class
                    )}
                  >
                    {CONFIDENCE_CONFIG[state.intakeBrief.confidence]?.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Analyst role summary */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Analyst Context
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {state.intakeBrief.analystRoleSummary}
                </p>
              </div>

              {/* Tech stack */}
              {state.intakeBrief.knownTechStack.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Known Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {state.intakeBrief.knownTechStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-xs px-2 py-0.5 bg-muted border border-border rounded text-foreground"
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Public CX Signals
                  </p>
                  <ul className="space-y-1">
                    {state.intakeBrief.publicCxSignals.map((signal, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0 mt-2" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Proceed button */}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleProceed} size="lg">
              Proceed to Research
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
