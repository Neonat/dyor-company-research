/**
 * DYOR2 — Server-side tRPC procedure tests
 * Tests the router shape, Zod validation, and LLM response parsing
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock invokeLLM ───────────────────────────────────────────────────────────

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
  listLLMModels: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";

const mockInvokeLLM = vi.mocked(invokeLLM);

// ─── Test context ─────────────────────────────────────────────────────────────

function createCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeLLMToolCallResponse(args: unknown) {
  return {
    choices: [
      {
        message: {
          tool_calls: [
            {
              function: {
                arguments: JSON.stringify(args),
              },
            },
          ],
        },
      },
    ],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("dyor.getIntakeBrief", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a valid IntakeBrief when LLM returns correct structure", async () => {
    const mockBrief = {
      companyName: "Shopify",
      industry: "E-commerce SaaS",
      headquartersCountry: "Canada",
      estimatedSize: "enterprise",
      knownTechStack: ["Ruby on Rails", "React", "Kubernetes"],
      publicCxSignals: ["High merchant satisfaction", "Strong App Store ecosystem"],
      analystRoleSummary: "CX analyst focusing on merchant experience",
      confidence: "high",
    };

    mockInvokeLLM.mockResolvedValueOnce(makeLLMToolCallResponse(mockBrief) as any);

    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dyor.getIntakeBrief({
      companyName: "Shopify",
      role: "CX Analyst",
    });

    expect(result.companyName).toBe("Shopify");
    expect(result.industry).toBe("E-commerce SaaS");
    expect(result.estimatedSize).toBe("enterprise");
    expect(result.confidence).toBe("high");
    expect(Array.isArray(result.knownTechStack)).toBe(true);
  });

  it("throws when LLM returns invalid structure", async () => {
    mockInvokeLLM.mockResolvedValueOnce(
      makeLLMToolCallResponse({ companyName: "Bad", estimatedSize: "invalid_size" }) as any
    );

    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.dyor.getIntakeBrief({ companyName: "Bad", role: "Analyst" })
    ).rejects.toThrow();
  });
});

describe("dyor.getExaPrompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 4-6 prompts with required fields", async () => {
    const mockPrompts = {
      prompts: [
        { id: "p1", label: "Customer Complaints", query: "Shopify merchant complaints 2024", rationale: "Surface CX issues" },
        { id: "p2", label: "Outages", query: "Shopify outage downtime 2024", rationale: "Reliability signals" },
        { id: "p3", label: "Competitive", query: "Shopify vs WooCommerce 2024", rationale: "Competitive pressure" },
        { id: "p4", label: "Regulatory", query: "Shopify regulatory issues 2024", rationale: "Compliance risk" },
      ],
    };

    mockInvokeLLM.mockResolvedValueOnce(makeLLMToolCallResponse(mockPrompts) as any);

    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dyor.getExaPrompts({
      companyName: "Shopify",
      industry: "E-commerce SaaS",
      role: "CX Analyst",
      publicCxSignals: ["High merchant satisfaction"],
    });

    expect(result.prompts).toHaveLength(4);
    expect(result.prompts[0]).toHaveProperty("id");
    expect(result.prompts[0]).toHaveProperty("label");
    expect(result.prompts[0]).toHaveProperty("query");
    expect(result.prompts[0]).toHaveProperty("rationale");
  });

  it("rejects when fewer than 4 prompts are returned", async () => {
    mockInvokeLLM.mockResolvedValueOnce(
      makeLLMToolCallResponse({
        prompts: [
          { id: "p1", label: "A", query: "q1", rationale: "r1" },
          { id: "p2", label: "B", query: "q2", rationale: "r2" },
        ],
      }) as any
    );

    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.dyor.getExaPrompts({
        companyName: "Shopify",
        industry: "E-commerce SaaS",
        role: "CX Analyst",
        publicCxSignals: [],
      })
    ).rejects.toThrow();
  });
});

describe("dyor.getSynthesis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a valid SynthesisReport", async () => {
    const mockReport = {
      signals: [
        { theme: "Customer Support", status: "amber", summary: "Long wait times reported", sourceIds: ["src_1"] },
        { theme: "Platform Reliability", status: "green", summary: "99.9% uptime maintained", sourceIds: ["src_2"] },
        { theme: "Pricing", status: "red", summary: "Merchant complaints about fee increases", sourceIds: ["src_3"] },
      ],
      keyTensions: [
        "Growth vs. merchant cost concerns",
        "Feature velocity vs. platform stability",
      ],
      analystActions: [
        { priority: 1, action: "Interview 5 enterprise merchants", rationale: "Validate pricing concerns" },
        { priority: 2, action: "Review SLA commitments", rationale: "Reliability signal needs verification" },
      ],
    };

    mockInvokeLLM.mockResolvedValueOnce(makeLLMToolCallResponse(mockReport) as any);

    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dyor.getSynthesis({
      companyName: "Shopify",
      role: "CX Analyst",
      approvedSources: [
        { id: "src_1", title: "Shopify support review", url: "https://g2.com/shopify", snippet: "Long wait times", credibility: "medium" },
      ],
    });

    expect(result.signals).toHaveLength(3);
    expect(["green", "amber", "red"]).toContain(result.signals[0].status);
    expect(result.keyTensions.length).toBeGreaterThan(0);
    expect(result.analystActions.length).toBeGreaterThan(0);
    expect(result.analystActions[0]).toHaveProperty("priority");
    expect(result.analystActions[0]).toHaveProperty("action");
    expect(result.analystActions[0]).toHaveProperty("rationale");
  });
});

describe("dyor.getProblems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 3-7 problems with journey steps and solutions", async () => {
    const mockProblemSet = {
      problems: [
        {
          id: "prob_1",
          title: "Merchants struggle to resolve billing disputes",
          tags: ["UX"],
          difficulty: 3,
          journeySteps: [
            { label: "Raise ticket", status: "ok" },
            { label: "Wait for response", status: "failure" },
            { label: "Escalate", status: "partial" },
            { label: "Resolution", status: "failure" },
          ],
          evidenceSummary: "Multiple G2 reviews cite 3-5 day resolution times for billing issues.",
          sourceIds: ["src_1"],
          solutions: [
            { title: "Self-serve billing portal", description: "Allow merchants to resolve common billing issues without support", stack: ["React", "Stripe API"] },
            { title: "AI-assisted triage", description: "Route billing tickets to specialists automatically", stack: ["ML", "Zendesk API"] },
          ],
        },
        {
          id: "prob_2",
          title: "App Store discovery is poor for niche merchants",
          tags: ["UX", "ML"],
          difficulty: 2,
          journeySteps: [
            { label: "Search App Store", status: "partial" },
            { label: "Evaluate apps", status: "ok" },
            { label: "Install", status: "ok" },
          ],
          evidenceSummary: "Merchants report difficulty finding relevant apps for niche verticals.",
          sourceIds: ["src_2"],
          solutions: [
            { title: "Semantic search", description: "Replace keyword search with semantic matching", stack: ["OpenAI Embeddings", "Pinecone"] },
          ],
        },
        {
          id: "prob_3",
          title: "International payment failures frustrate global merchants",
          tags: ["API", "systems"],
          difficulty: 4,
          journeySteps: [
            { label: "Customer checkout", status: "ok" },
            { label: "Payment processing", status: "failure" },
            { label: "Error handling", status: "partial" },
          ],
          evidenceSummary: "High failure rates for non-USD transactions reported in forums.",
          sourceIds: ["src_3"],
          solutions: [
            { title: "Multi-gateway routing", description: "Route payments through regional gateways", stack: ["Stripe", "Adyen", "Braintree"] },
          ],
        },
      ],
    };

    mockInvokeLLM.mockResolvedValueOnce(makeLLMToolCallResponse(mockProblemSet) as any);

    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dyor.getProblems({
      companyName: "Shopify",
      role: "CX Analyst",
      signals: [
        { theme: "Customer Support", status: "amber", summary: "Long wait times", sourceIds: ["src_1"] },
      ],
      keyTensions: ["Growth vs. merchant cost concerns"],
      approvedSources: [
        { id: "src_1", title: "G2 review", snippet: "Long wait times for billing" },
      ],
    });

    expect(result.problems.length).toBeGreaterThanOrEqual(3);
    expect(result.problems.length).toBeLessThanOrEqual(7);

    const firstProblem = result.problems[0];
    expect(firstProblem).toHaveProperty("id");
    expect(firstProblem).toHaveProperty("title");
    expect(firstProblem).toHaveProperty("journeySteps");
    expect(firstProblem).toHaveProperty("solutions");
    expect(firstProblem.journeySteps.length).toBeGreaterThan(0);
    expect(firstProblem.solutions.length).toBeGreaterThan(0);
    expect([1, 2, 3, 4, 5]).toContain(firstProblem.difficulty);
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});
