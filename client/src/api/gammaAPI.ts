/**
 * DYOR2 — Gamma API module
 * Serializes brief to markdown → POST to Gamma → poll for deck URL.
 * All calls through /api/proxy — key NEVER in bundle.
 */

import { callProxy } from "./proxy";
import type { IntakeBrief, SynthesisReport, ProblemSet } from "../store/reducer";

function buildMarkdown(
  brief: IntakeBrief,
  synthesis: SynthesisReport,
  problemSet: ProblemSet
): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const signals = synthesis.signals
    .map((s) => `- **${s.theme}** [${s.status.toUpperCase()}]: ${s.summary}`)
    .join("\n");

  const tensions = synthesis.keyTensions.map((t) => `- ${t}`).join("\n");

  const problems = problemSet.problems
    .slice(0, 5)
    .map(
      (p, i) =>
        `### Problem ${i + 1}: ${p.title}\n**Difficulty:** ${"●".repeat(p.difficulty)}${"○".repeat(5 - p.difficulty)}\n\n${p.evidenceSummary}\n\n**Solutions:**\n${p.solutions.map((s) => `- ${s.title}: ${s.description}`).join("\n")}`
    )
    .join("\n\n");

  return `# ${brief.companyName} — Due Diligence Brief
*Generated ${date}*

## Company Overview
- **Industry:** ${brief.industry}
- **Headquarters:** ${brief.headquartersCountry}
- **Size:** ${brief.estimatedSize}
- **Tech Stack:** ${brief.knownTechStack.join(", ")}
- **Confidence:** ${brief.confidence}

## Signal Scorecard
${signals}

## Key Tensions
${tensions}

## Problem Statements
${problems}
`;
}

interface GammaGenerateResponse {
  id?: string;
  deckId?: string;
  status?: string;
  url?: string;
}

export async function generateGammaDeck(
  brief: IntakeBrief,
  synthesis: SynthesisReport,
  problemSet: ProblemSet
): Promise<string> {
  const markdown = buildMarkdown(brief, synthesis, problemSet);

  // POST to Gamma generate endpoint
  const generateResponse = await callProxy<GammaGenerateResponse>("gamma", {
    endpoint: "generate",
    markdown,
    theme: "professional",
  });

  const deckId = generateResponse.id || generateResponse.deckId;
  if (!deckId) {
    throw new Error("Gamma did not return a deck ID");
  }

  // Poll for completion (max 30 attempts, 2s apart)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusResponse = await callProxy<GammaGenerateResponse>("gamma", {
      endpoint: "status",
      deckId,
    });

    if (statusResponse.status === "complete" || statusResponse.url) {
      return statusResponse.url || `https://gamma.app/deck/${deckId}`;
    }
    if (statusResponse.status === "error") {
      throw new Error("Gamma deck generation failed");
    }
  }

  throw new Error("Gamma deck generation timed out");
}
