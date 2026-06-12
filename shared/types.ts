/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─── DYOR2 Pipeline Types ─────────────────────────────────────────────────────

export interface IntakeBrief {
  companyName: string;
  industry: string;
  headquartersCountry: string;
  estimatedSize: "startup" | "scaleup" | "enterprise";
  knownTechStack: string[];
  publicCxSignals: string[];
  analystRoleSummary: string;
  confidence: "high" | "medium" | "low";
}

export interface ExaPrompt {
  id: string;
  label: string;
  query: string;
  rationale: string;
}

export interface ExaPromptSet {
  prompts: ExaPrompt[];
}

export interface SourceObject {
  id: string;
  title: string;
  url: string;
  snippet: string;
  date: string | null;
  credibility: "high" | "medium" | "low";
  approved: boolean;
}

/** Signal (also exported as SignalItem for backwards compat) */
export interface Signal {
  theme: string;
  status: "green" | "amber" | "red";
  summary: string;
  sourceIds: string[];
}

/** @deprecated Use Signal */
export type SignalItem = Signal;

export interface AnalystAction {
  priority: number;
  action: string;
  rationale: string;
}

export interface SynthesisReport {
  signals: Signal[];
  keyTensions: string[];
  analystActions: AnalystAction[];
}

export interface JourneyStep {
  label: string;
  status: "ok" | "partial" | "failure";
}

export interface Solution {
  title: string;
  description: string;
  stack: string[];
}

export type ProblemTag = "ML" | "API" | "UX" | "systems" | "data-pipeline";

export interface Problem {
  id: string;
  title: string;
  tags: ProblemTag[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  journeySteps: JourneyStep[];
  evidenceSummary: string;
  sourceIds: string[];
  solutions: Solution[];
}

export interface ProblemSet {
  problems: Problem[];
}
