/**
 * DYOR2 — App Reducer
 * Full pipeline state shape per spec §Frontend architecture
 */

// ─── Schema Types ────────────────────────────────────────────────────────────

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

export interface Signal {
  theme: string;
  status: "green" | "amber" | "red";
  summary: string;
  sourceIds: string[];
}

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

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  // Landing / demo gate
  showLanding: boolean;
  exaApiKey: string;
  // Pipeline
  companyName: string;
  companyLogoUrl: string | null;
  role: string;
  currentStage: 1 | 2 | 3 | 4 | 5 | 6;
  intakeBrief: IntakeBrief | null;
  exaPrompts: ExaPromptSet | null;
  researchSources: SourceObject[];
  synthesisReport: SynthesisReport | null;
  problemSet: ProblemSet | null;
  shortlist: string[]; // problem IDs
  loadingSection: string | null;
  errorSection: string | null;
  errorMessage: string | null;
}

export const initialState: AppState = {
  showLanding: true,
  exaApiKey: "",
  companyName: "",
  companyLogoUrl: null,
  role: "",
  currentStage: 1,
  intakeBrief: null,
  exaPrompts: null,
  researchSources: [],
  synthesisReport: null,
  problemSet: null,
  shortlist: [],
  loadingSection: null,
  errorSection: null,
  errorMessage: null,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: "LAUNCH_DEMO"; exaApiKey: string }
  | { type: "SET_INTAKE"; companyName: string; role: string }
  | { type: "SET_COMPANY_LOGO"; url: string | null }
  | { type: "SET_INTAKE_BRIEF"; brief: IntakeBrief }
  | { type: "SET_EXA_PROMPTS"; prompts: ExaPromptSet }
  | { type: "UPDATE_EXA_PROMPT"; id: string; query: string }
  | { type: "SET_RESEARCH_SOURCES"; sources: SourceObject[] }
  | { type: "APPEND_RESEARCH_SOURCES"; sources: SourceObject[] }
  | { type: "TOGGLE_SOURCE_APPROVAL"; id: string }
  | { type: "REMOVE_SOURCE"; id: string }
  | { type: "SET_SYNTHESIS_REPORT"; report: SynthesisReport }
  | { type: "SET_PROBLEM_SET"; problemSet: ProblemSet }
  | { type: "TOGGLE_SHORTLIST"; problemId: string }
  | { type: "SET_LOADING"; section: string | null }
  | { type: "SET_ERROR"; section: string | null; message?: string | null }
  | { type: "ADVANCE_STAGE"; stage: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: "RESET" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LAUNCH_DEMO":
      return { ...state, showLanding: false, exaApiKey: action.exaApiKey };

    case "SET_INTAKE":
      return { ...state, companyName: action.companyName, role: action.role };

    case "SET_COMPANY_LOGO":
      return { ...state, companyLogoUrl: action.url };

    case "SET_INTAKE_BRIEF":
      return { ...state, intakeBrief: action.brief, loadingSection: null, errorSection: null };

    case "SET_EXA_PROMPTS":
      return { ...state, exaPrompts: action.prompts, loadingSection: null };

    case "UPDATE_EXA_PROMPT":
      if (!state.exaPrompts) return state;
      return {
        ...state,
        exaPrompts: {
          prompts: state.exaPrompts.prompts.map((p) =>
            p.id === action.id ? { ...p, query: action.query } : p
          ),
        },
      };

    case "SET_RESEARCH_SOURCES":
      // Auto-approve all sources on first load — user can reject on Checkpoint page
      return { ...state, researchSources: action.sources.map((s) => ({ ...s, approved: true })), loadingSection: null };

    case "APPEND_RESEARCH_SOURCES": {
      const existingUrls = new Set(state.researchSources.map((s) => s.url));
      const newSources = action.sources.filter((s) => !existingUrls.has(s.url));
      return { ...state, researchSources: [...state.researchSources, ...newSources] };
    }

    case "TOGGLE_SOURCE_APPROVAL":
      return {
        ...state,
        researchSources: state.researchSources.map((s) =>
          s.id === action.id ? { ...s, approved: !s.approved } : s
        ),
      };

    case "REMOVE_SOURCE":
      return {
        ...state,
        researchSources: state.researchSources.filter((s) => s.id !== action.id),
      };

    case "SET_SYNTHESIS_REPORT":
      return { ...state, synthesisReport: action.report, loadingSection: null, errorSection: null };

    case "SET_PROBLEM_SET":
      return { ...state, problemSet: action.problemSet, loadingSection: null, errorSection: null };

    case "TOGGLE_SHORTLIST": {
      const inList = state.shortlist.includes(action.problemId);
      const shortlist = inList
        ? state.shortlist.filter((id) => id !== action.problemId)
        : [...state.shortlist, action.problemId];
      try { localStorage.setItem("dyor2_shortlist", JSON.stringify(shortlist)); } catch {}
      return { ...state, shortlist };
    }

    case "SET_LOADING":
      return { ...state, loadingSection: action.section, errorSection: null, errorMessage: null };

    case "SET_ERROR":
      return {
        ...state,
        loadingSection: null,
        errorSection: action.section,
        errorMessage: action.message ?? null,
      };

    case "ADVANCE_STAGE":
      return { ...state, currentStage: action.stage };

    case "RESET":
      return { ...initialState, showLanding: false, exaApiKey: state.exaApiKey };

    default:
      return state;
  }
}
