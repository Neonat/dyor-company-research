import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import type {
  IntakeBrief,
  ExaPromptSet,
  SourceObject,
  SynthesisReport,
  ProblemSet,
} from "@shared/types";

// ─── Zod schemas for validation ───────────────────────────────────────────────

const IntakeBriefSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  headquartersCountry: z.string(),
  estimatedSize: z.enum(["startup", "scaleup", "enterprise"]),
  knownTechStack: z.array(z.string()),
  publicCxSignals: z.array(z.string()),
  analystRoleSummary: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

const ExaPromptSetSchema = z.object({
  prompts: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        query: z.string(),
        rationale: z.string(),
      })
    )
    .min(4)
    .max(6),
});

const SynthesisReportSchema = z.object({
  signals: z.array(
    z.object({
      theme: z.string(),
      status: z.enum(["green", "amber", "red"]),
      summary: z.string(),
      sourceIds: z.array(z.string()),
    })
  ),
  keyTensions: z.array(z.string()),
  analystActions: z.array(
    z.object({
      priority: z.number(),
      action: z.string(),
      rationale: z.string(),
    })
  ),
});

const ProblemSetSchema = z.object({
  problems: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        tags: z.array(z.enum(["ML", "API", "UX", "systems", "data-pipeline"])),
        difficulty: z.union([
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
        ]),
        journeySteps: z.array(
          z.object({
            label: z.string(),
            status: z.enum(["ok", "partial", "failure"]),
          })
        ),
        evidenceSummary: z.string(),
        sourceIds: z.array(z.string()),
        solutions: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            stack: z.array(z.string()),
          })
        ),
      })
    )
    .min(3)
    .max(7),
});


async function callLLMStructured<T>(
  systemPrompt: string,
  userPrompt: string,
  toolName: string,
  toolSchema: Record<string, unknown>
): Promise<T> {
  const response = await invokeLLM({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: toolName, schema: toolSchema, strict: false },
    },
  });

  const msg = response.choices?.[0]?.message;
  const rawContent =
    typeof msg?.content === "string"
      ? msg.content
      : Array.isArray(msg?.content)
        ? ((msg.content as any[]).find((b: any) => b.type === "text")?.text ?? "")
        : "";

  if (!rawContent.trim()) {
    console.error("[DYOR] Empty LLM response for", toolName, JSON.stringify(response).slice(0, 500));
    throw new Error(`Empty response from LLM (tool: ${toolName})`);
  }

  try {
    return JSON.parse(rawContent) as T;
  } catch {
    console.error("[DYOR] Failed to parse LLM response for", toolName, rawContent.slice(0, 500));
    throw new Error(`Invalid JSON in LLM response (tool: ${toolName})`);
  }
}

// ─── Exa search helper ────────────────────────────────────────────────────────

const HIGH_CREDIBILITY_DOMAINS = [
  "techcrunch.com", "reuters.com", "bloomberg.com", "ft.com", "wsj.com",
  "economist.com", "hbr.org", "mckinsey.com", "gartner.com", "forrester.com",
  "wired.com", "theverge.com", "arstechnica.com", "venturebeat.com",
  "businessinsider.com", "cnbc.com", "bbc.com", "nytimes.com",
];

const LOW_CREDIBILITY_DOMAINS = [
  "reddit.com", "quora.com", "medium.com", "substack.com",
  "wordpress.com", "blogspot.com", "tumblr.com",
];

function assignCredibility(url: string): "high" | "medium" | "low" {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (HIGH_CREDIBILITY_DOMAINS.some((d) => hostname.includes(d))) return "high";
    if (LOW_CREDIBILITY_DOMAINS.some((d) => hostname.includes(d))) return "low";
    return "medium";
  } catch {
    return "medium";
  }
}

async function runExaSearchHelper(
  prompts: Array<{ id: string; query: string }>,
  exaApiKey: string
): Promise<SourceObject[]> {
  const allResults: SourceObject[] = [];
  const seenUrls = new Set<string>();

  for (const prompt of prompts) {
    try {
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": exaApiKey,
        },
        body: JSON.stringify({
          query: prompt.query,
          numResults: 5,
          useAutoprompt: true,
          contents: { text: { maxCharacters: 500 } },
        }),
      });

      if (!res.ok) {
        console.warn(`Exa search failed for prompt ${prompt.id}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const results = data.results ?? [];

      for (const r of results) {
        if (!r.url || seenUrls.has(r.url)) continue;
        seenUrls.add(r.url);
        allResults.push({
          id: `src_${allResults.length + 1}`,
          title: r.title ?? "Untitled",
          url: r.url,
          snippet: r.text ?? r.summary ?? "",
          date: r.publishedDate ?? null,
          credibility: assignCredibility(r.url),
          approved: false,
        });
      }
    } catch (err) {
      console.warn(`Exa search error for prompt ${prompt.id}:`, err);
    }
  }

  return allResults;
}

// ─── Gamma API helper ─────────────────────────────────────────────────────────

async function generateGammaDeckHelper(
  markdown: string,
  gammaApiKey: string
): Promise<string> {
  const createRes = await fetch("https://public-api.gamma.app/v1.0/generate/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": gammaApiKey,
    },
    body: JSON.stringify({
      markdown,
      mode: "presentation",
      title: "Due Diligence Brief",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Gamma API error: ${createRes.status} — ${err}`);
  }

  const createData = await createRes.json();
  const deckId = createData.id ?? createData.deckId;
  if (!deckId) throw new Error("Gamma did not return a deck ID");

  // Poll for completion (max 60s)
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const pollRes = await fetch(`https://public-api.gamma.app/v1.0/decks/${deckId}`, {
        headers: { "X-API-KEY": gammaApiKey },
      });
      if (!pollRes.ok) continue;
      const pollData = await pollRes.json();
      if (pollData.status === "complete" || pollData.url) {
        return pollData.url ?? `https://gamma.app/deck/${deckId}`;
      }
    } catch {
      // continue polling
    }
  }

  return `https://gamma.app/deck/${deckId}`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dyor: router({
    // Stage 1: Intake
    getIntakeBrief: publicProcedure
      .input(z.object({ companyName: z.string(), role: z.string() }))
      .mutation(async ({ input }) => {
        const raw = await callLLMStructured<IntakeBrief>(
          `You are an expert business analyst. Given a company name and analyst role, return a structured baseline brief about the company using publicly known information only.`,
          `Company: ${input.companyName}\nAnalyst role: ${input.role}\n\nReturn a structured IntakeBrief.`,
          "return_intake_brief",
          {
            type: "object",
            properties: {
              companyName: { type: "string" },
              industry: { type: "string" },
              headquartersCountry: { type: "string" },
              estimatedSize: { type: "string", enum: ["startup", "scaleup", "enterprise"] },
              knownTechStack: { type: "array", items: { type: "string" } },
              publicCxSignals: { type: "array", items: { type: "string" }, description: "Known customer experience signals from public sources" },
              analystRoleSummary: { type: "string" },
              confidence: { type: "string", enum: ["high", "medium", "low"] },
            },
            required: ["companyName", "industry", "headquartersCountry", "estimatedSize", "knownTechStack", "publicCxSignals", "analystRoleSummary", "confidence"],
            additionalProperties: false,
          }
        );
        return IntakeBriefSchema.parse(raw);
      }),

    // Stage 2: Generate Exa prompts
    getExaPrompts: publicProcedure
      .input(
        z.object({
          companyName: z.string(),
          industry: z.string(),
          role: z.string(),
          publicCxSignals: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        const raw = await callLLMStructured<ExaPromptSet>(
          `You are a research strategist. Generate 4-5 targeted web search queries to find evidence about a company's customer experience problems, technical challenges, and strategic issues.`,
          `Company: ${input.companyName}
Industry: ${input.industry}
Analyst focus: ${input.role}
Known CX signals: ${input.publicCxSignals.join("; ")}

Generate 4-5 Exa search queries surfacing evidence of real problems: customer complaints, technical outages, competitive weaknesses, regulatory issues, operational failures.`,
          "return_exa_prompts",
          {
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
                    label: { type: "string" },
                    query: { type: "string" },
                    rationale: { type: "string" },
                  },
                  required: ["id", "label", "query", "rationale"],
                  additionalProperties: false,
                },
              },
            },
            required: ["prompts"],
            additionalProperties: false,
          }
        );
        return ExaPromptSetSchema.parse(raw);
      }),

    // Stage 2b: Run Exa searches
    runExaSearch: publicProcedure
      .input(
        z.object({
          prompts: z.array(z.object({ id: z.string(), query: z.string() })),
          exaApiKey: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const sources = await runExaSearchHelper(input.prompts, input.exaApiKey);
        return { sources };
      }),

    // Stage 3: Synthesis
    getSynthesis: publicProcedure
      .input(
        z.object({
          companyName: z.string(),
          role: z.string(),
          approvedSources: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              url: z.string(),
              snippet: z.string(),
              credibility: z.enum(["high", "medium", "low"]),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const sourcesText = input.approvedSources
          .map((s) => `[${s.id}] ${s.title} (${s.credibility} credibility)\n${s.snippet}`)
          .join("\n\n");

        const raw = await callLLMStructured<SynthesisReport>(
          `You are a senior business analyst. Synthesize research sources into a structured signal scorecard. Be specific and evidence-based. Cite source IDs.`,
          `Company: ${input.companyName}
Analyst role: ${input.role}

Research sources:
${sourcesText}

Synthesize into a SynthesisReport with:
- signals: 4-8 themed signals with green/amber/red status
- keyTensions: 3-5 strategic tensions
- analystActions: 3-5 prioritized actions`,
          "return_synthesis_report",
          {
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
                  additionalProperties: false,
                },
              },
              keyTensions: { type: "array", items: { type: "string" } },
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
                  additionalProperties: false,
                },
              },
            },
            required: ["signals", "keyTensions", "analystActions"],
            additionalProperties: false,
          }
        );
        return SynthesisReportSchema.parse(raw);
      }),

    // Stage 4: Problem statements
    getProblems: publicProcedure
      .input(
        z.object({
          companyName: z.string(),
          role: z.string(),
          signals: z.array(
            z.object({
              theme: z.string(),
              status: z.enum(["green", "amber", "red"]),
              summary: z.string(),
              sourceIds: z.array(z.string()),
            })
          ),
          keyTensions: z.array(z.string()),
          approvedSources: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              snippet: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const signalsText = input.signals
          .map((s) => `[${s.status.toUpperCase()}] ${s.theme}: ${s.summary}`)
          .join("\n");

        const raw = await callLLMStructured<ProblemSet>(
          `You are a product strategist and CX analyst. You MUST call the return_problem_set tool with a JSON object that has a "problems" array containing 3-7 problem objects. Never return a bare array — always wrap in {"problems": [...]}. Each problem must have: id, title, tags, difficulty (1-5), journeySteps (4-6 steps with ok/partial/failure status), evidenceSummary, sourceIds, and solutions (2-3 items with title, description, stack).`,
          `Company: ${input.companyName}
Analyst role: ${input.role}

Signals:
${signalsText}

Key tensions:
${input.keyTensions.join("\n")}

Call return_problem_set with 3-5 scoped problem statements. Each must have journey maps (4-6 steps), evidence summaries, and 2-3 solution directions. Use tags from: ML, API, UX, systems, data-pipeline.`,
          "return_problem_set",
          {
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
                    tags: { type: "array", items: { type: "string", enum: ["ML", "API", "UX", "systems", "data-pipeline"] } },
                    difficulty: { type: "number", enum: [1, 2, 3, 4, 5] },
                    journeySteps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          status: { type: "string", enum: ["ok", "partial", "failure"] },
                        },
                        required: ["label", "status"],
                        additionalProperties: false,
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
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["id", "title", "tags", "difficulty", "journeySteps", "evidenceSummary", "sourceIds", "solutions"],
                  additionalProperties: false,
                },
              },
            },
            required: ["problems"],
            additionalProperties: false,
          }
        );
        // If the model returned a bare array, wrap it
        const normalized = Array.isArray(raw) ? { problems: raw } : raw;
        return ProblemSetSchema.parse(normalized);
      }),

    // Logo fetch — tries multiple providers server-side to avoid CORS
    fetchLogo: publicProcedure
      .input(z.object({ companyName: z.string() }))
      .mutation(async ({ input }) => {
        const clean = input.companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const variants = [
          `${clean}.com`,
          `${clean}.io`,
          `${clean}.co`,
          `${clean}.org`,
          `${input.companyName.toLowerCase().replace(/\s+/g, "")}.com`,
        ];

        // Try Google's high-res favicon service first
        for (const domain of variants) {
          try {
            const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            const res = await fetch(url, { method: "HEAD" });
            if (res.ok) {
              // Verify it's not the default globe icon (check content-length)
              const contentLength = parseInt(res.headers.get("content-length") || "0");
              if (contentLength > 1000) {
                return { url };
              }
            }
          } catch {}
        }

        // Fallback: Clearbit
        for (const domain of variants) {
          try {
            const url = `https://logo.clearbit.com/${domain}`;
            const res = await fetch(url, { method: "HEAD" });
            if (res.ok) return { url };
          } catch {}
        }

        // Fallback: DuckDuckGo icons
        for (const domain of variants) {
          try {
            const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
            const res = await fetch(url, { method: "HEAD" });
            if (res.ok) {
              const contentLength = parseInt(res.headers.get("content-length") || "0");
              if (contentLength > 100) return { url };
            }
          } catch {}
        }

        return { url: null };
      }),

    // Export: Generate Gamma deck
    generateGammaDeck: publicProcedure
      .input(z.object({ markdown: z.string(), gammaApiKey: z.string() }))
      .mutation(async ({ input }) => {
        const url = await generateGammaDeckHelper(input.markdown, input.gammaApiKey);
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
