/**
 * DYOR2 — Claude API module
 * Model: claude-sonnet-4-6, max_tokens: 4000
 * All calls use tool/function calling to enforce schema output.
 * All calls go through /api/proxy — keys NEVER in this bundle.
 */

import { callProxy } from "./proxy";
import type {
  IntakeBrief,
  ExaPromptSet,
  SourceObject,
  SynthesisReport,
  ProblemSet,
} from "../store/reducer";

const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 4000;

// ─── Schema Validators ────────────────────────────────────────────────────────

export function validateIntakeBrief(obj: unknown): obj is IntakeBrief {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.companyName === "string" &&
    typeof o.industry === "string" &&
    typeof o.headquartersCountry === "string" &&
    ["startup", "scaleup", "enterprise"].includes(o.estimatedSize as string) &&
    Array.isArray(o.knownTechStack) &&
    Array.isArray(o.publicCxSignals) &&
    typeof o.analystRoleSummary === "string" &&
    ["high", "medium", "low"].includes(o.confidence as string)
  );
}

export function validateExaPromptSet(obj: unknown): obj is ExaPromptSet {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (!Array.isArray(o.prompts)) return false;
  if (o.prompts.length < 4 || o.prompts.length > 6) return false;
  return o.prompts.every(
    (p: unknown) =>
      p &&
      typeof p === "object" &&
      typeof (p as Record<string, unknown>).id === "string" &&
      typeof (p as Record<string, unknown>).label === "string" &&
      typeof (p as Record<string, unknown>).query === "string" &&
      typeof (p as Record<string, unknown>).rationale === "string"
  );
}

export function validateSynthesisReport(obj: unknown): obj is SynthesisReport {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (!Array.isArray(o.signals)) return false;
  if (!Array.isArray(o.keyTensions)) return false;
  if (!Array.isArray(o.analystActions)) return false;
  return o.signals.every(
    (s: unknown) =>
      s &&
      typeof s === "object" &&
      ["green", "amber", "red"].includes((s as Record<string, unknown>).status as string)
  );
}

export function validateProblemSet(obj: unknown): obj is ProblemSet {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (!Array.isArray(o.problems)) return false;
  if (o.problems.length < 3 || o.problems.length > 7) return false;
  return o.problems.every(
    (p: unknown) =>
      p &&
      typeof p === "object" &&
      typeof (p as Record<string, unknown>).id === "string" &&
      typeof (p as Record<string, unknown>).title === "string" &&
      Array.isArray((p as Record<string, unknown>).journeySteps) &&
      Array.isArray((p as Record<string, unknown>).solutions)
  );
}

// ─── Helper: extract tool result ─────────────────────────────────────────────

function extractToolResult(response: unknown): unknown {
  const r = response as Record<string, unknown>;
  const content = r.content as Array<Record<string, unknown>>;
  if (!Array.isArray(content)) throw new Error("Unexpected Claude response shape");
  const toolUse = content.find((c) => c.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return a tool_use block");
  return toolUse.input;
}

// ─── Call #1 — getIntakeBrief ─────────────────────────────────────────────────

export async function getIntakeBrief(
  companyName: string,
  role: string
): Promise<IntakeBrief> {
  const payload = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    tools: [
      {
        name: "return_intake_brief",
        description: "Return a structured IntakeBrief for the given company",
        input_schema: {
          type: "object",
          properties: {
            companyName: { type: "string" },
            industry: { type: "string" },
            headquartersCountry: { type: "string" },
            estimatedSize: { type: "string", enum: ["startup", "scaleup", "enterprise"] },
            knownTechStack: { type: "array", items: { type: "string" } },
            publicCxSignals: {
              type: "array",
              items: { type: "string" },
              description: "Known public customer experience signals, complaints, or praises",
            },
            analystRoleSummary: {
              type: "string",
              description: "How the analyst role relates to this company's challenges",
            },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: [
            "companyName",
            "industry",
            "headquartersCountry",
            "estimatedSize",
            "knownTechStack",
            "publicCxSignals",
            "analystRoleSummary",
            "confidence",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "return_intake_brief" },
    messages: [
      {
        role: "user",
        content: `You are a business analyst assistant. Provide a structured baseline brief for the company "${companyName}" from the perspective of a "${role}" analyst. Use your knowledge of the company's public profile, industry, technology, and known customer experience signals.`,
      },
    ],
  };

  const response = await callProxy("anthropic", payload);
  const result = extractToolResult(response);
  if (!validateIntakeBrief(result)) {
    throw new Error("Claude returned an invalid IntakeBrief schema");
  }
  return result;
}

// ─── Call #2 — getExaPrompts ──────────────────────────────────────────────────

export async function getExaPrompts(brief: IntakeBrief): Promise<ExaPromptSet> {
  const payload = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    tools: [
      {
        name: "return_exa_prompts",
        description: "Return 4–6 targeted Exa search prompts for researching this company",
        input_schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              minItems: 4,
              maxItems: 6,
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  label: { type: "string", description: "Short human-readable label" },
                  query: { type: "string", description: "The actual Exa search query" },
                  rationale: {
                    type: "string",
                    description: "Why this search is useful for due diligence",
                  },
                },
                required: ["id", "label", "query", "rationale"],
              },
            },
          },
          required: ["prompts"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "return_exa_prompts" },
    messages: [
      {
        role: "user",
        content: `You are a research analyst. Based on this company brief, generate 4–6 targeted web search queries to gather evidence for a due diligence report. Focus on: customer experience issues, technical architecture, competitive positioning, recent news, and analyst commentary.

Company Brief:
${JSON.stringify(brief, null, 2)}

Generate diverse queries that will surface high-quality, evidence-rich sources. Each query should target a different angle.`,
      },
    ],
  };

  const response = await callProxy("anthropic", payload);
  const result = extractToolResult(response);
  if (!validateExaPromptSet(result)) {
    throw new Error("Claude returned an invalid ExaPromptSet schema");
  }
  return result;
}

// ─── Call #3 — getSynthesis ───────────────────────────────────────────────────

export async function getSynthesis(
  approvedSources: SourceObject[],
  brief: IntakeBrief
): Promise<SynthesisReport> {
  const sourcesText = approvedSources
    .map(
      (s) =>
        `[${s.id}] ${s.title}\nURL: ${s.url}\nDate: ${s.date || "unknown"}\nCredibility: ${s.credibility}\n${s.snippet}`
    )
    .join("\n\n---\n\n");

  const payload = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    tools: [
      {
        name: "return_synthesis_report",
        description: "Return a structured synthesis report from the approved research sources",
        input_schema: {
          type: "object",
          properties: {
            signals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  status: { type: "string", enum: ["green", "amber", "red"] },
                  summary: { type: "string" },
                  sourceIds: { type: "array", items: { type: "string" } },
                },
                required: ["theme", "status", "summary", "sourceIds"],
              },
            },
            keyTensions: {
              type: "array",
              items: { type: "string" },
              description: "Key strategic tensions or contradictions surfaced by the research",
            },
            analystActions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  action: { type: "string" },
                  rationale: { type: "string" },
                },
                required: ["priority", "action", "rationale"],
              },
            },
          },
          required: ["signals", "keyTensions", "analystActions"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "return_synthesis_report" },
    messages: [
      {
        role: "user",
        content: `You are a senior business analyst. Synthesize the following research sources into a structured signal scorecard for ${brief.companyName}.

For each signal theme, assign a status:
- green: strength or positive signal
- amber: mixed or uncertain signal  
- red: weakness, risk, or negative signal

Identify key tensions (contradictions or strategic dilemmas) and prioritized analyst actions.

Company: ${brief.companyName} (${brief.industry})
Analyst context: ${brief.analystRoleSummary}

Research Sources:
${sourcesText}`,
      },
    ],
  };

  const response = await callProxy("anthropic", payload);
  const result = extractToolResult(response);
  if (!validateSynthesisReport(result)) {
    throw new Error("Claude returned an invalid SynthesisReport schema");
  }
  return result;
}

// ─── Call #4 — getProblems ────────────────────────────────────────────────────

export async function getProblems(
  synthesis: SynthesisReport,
  brief: IntakeBrief,
  role: string
): Promise<ProblemSet> {
  const payload = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    tools: [
      {
        name: "return_problem_set",
        description: "Return 3–7 scoped, evidence-backed problem statements",
        input_schema: {
          type: "object",
          properties: {
            problems: {
              type: "array",
              minItems: 3,
              maxItems: 7,
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  tags: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["ML", "API", "UX", "systems", "data-pipeline"],
                    },
                  },
                  difficulty: { type: "number", minimum: 1, maximum: 5 },
                  journeySteps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        status: { type: "string", enum: ["ok", "partial", "failure"] },
                      },
                      required: ["label", "status"],
                    },
                  },
                  evidenceSummary: { type: "string" },
                  sourceIds: { type: "array", items: { type: "string" } },
                  solutions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        stack: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "description", "stack"],
                    },
                  },
                },
                required: [
                  "id",
                  "title",
                  "tags",
                  "difficulty",
                  "journeySteps",
                  "evidenceSummary",
                  "sourceIds",
                  "solutions",
                ],
              },
            },
          },
          required: ["problems"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "return_problem_set" },
    messages: [
      {
        role: "user",
        content: `You are a ${role} analyst. Based on the synthesis report below, generate 3–7 scoped, evidence-backed problem statements for ${brief.companyName}.

For each problem:
- Map the customer/user journey with step-by-step status (ok/partial/failure)
- Cite specific evidence from the synthesis signals
- Propose 2–3 concrete solutions with technology stack
- Assign difficulty (1=easy, 5=very hard)
- Tag with relevant categories: ML, API, UX, systems, data-pipeline

Synthesis Report:
${JSON.stringify(synthesis, null, 2)}

Company: ${brief.companyName} (${brief.industry})`,
      },
    ],
  };

  const response = await callProxy("anthropic", payload);
  const result = extractToolResult(response);
  if (!validateProblemSet(result)) {
    throw new Error("Claude returned an invalid ProblemSet schema");
  }
  return result;
}
