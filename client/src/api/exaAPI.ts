/**
 * DYOR2 — Exa API module
 * Calls Exa search through /api/proxy — key NEVER in bundle.
 * Deduplicates by URL, assigns credibility heuristic, normalises to SourceObject.
 */

import { callProxy } from "./proxy";
import type { ExaPrompt, SourceObject } from "../store/reducer";

// ─── Credibility Heuristic ────────────────────────────────────────────────────

const HIGH_CREDIBILITY_DOMAINS = [
  "reuters.com",
  "bloomberg.com",
  "ft.com",
  "wsj.com",
  "economist.com",
  "harvard.edu",
  "mckinsey.com",
  "gartner.com",
  "forrester.com",
  "techcrunch.com",
  "wired.com",
  "theverge.com",
  "arstechnica.com",
  "hbr.org",
  "bcg.com",
  "deloitte.com",
  "pwc.com",
  "kpmg.com",
  "accenture.com",
  "statista.com",
  "iata.org",
  "skift.com",
  "aviationweek.com",
  "flightglobal.com",
];

const LOW_CREDIBILITY_DOMAINS = [
  "medium.com",
  "substack.com",
  "wordpress.com",
  "blogspot.com",
  "tumblr.com",
  "reddit.com",
  "quora.com",
];

function assignCredibility(url: string): "high" | "medium" | "low" {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (HIGH_CREDIBILITY_DOMAINS.some((d) => hostname.endsWith(d))) return "high";
    if (LOW_CREDIBILITY_DOMAINS.some((d) => hostname.endsWith(d))) return "low";
    return "medium";
  } catch {
    return "medium";
  }
}

// ─── Exa Result Types ─────────────────────────────────────────────────────────

interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
  author?: string;
}

interface ExaSearchResponse {
  results: ExaSearchResult[];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runExaSearch(
  prompts: ExaPrompt[],
  onProgress?: (source: SourceObject) => void
): Promise<SourceObject[]> {
  const allSources: SourceObject[] = [];
  const seenUrls = new Set<string>();

  for (const prompt of prompts) {
    try {
      const response = await callProxy<ExaSearchResponse>("exa", {
        query: prompt.query,
        numResults: 5,
        type: "auto",
        contents: {
          text: { maxCharacters: 800 },
          highlights: { numSentences: 3, highlightsPerUrl: 2 },
          summary: { query: prompt.query },
        },
        useAutoprompt: true,
      });

      const results = response.results || [];

      for (const result of results) {
        if (!result.url || seenUrls.has(result.url)) continue;
        seenUrls.add(result.url);

        const snippet =
          result.summary ||
          (result.highlights && result.highlights.join(" ")) ||
          result.text?.slice(0, 400) ||
          "";

        const source: SourceObject = {
          id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: result.title || result.url,
          url: result.url,
          snippet,
          date: result.publishedDate || null,
          credibility: assignCredibility(result.url),
          approved: true, // default approved, user can reject
        };

        allSources.push(source);
        onProgress?.(source);
      }
    } catch (err) {
      console.warn(`Exa search failed for prompt "${prompt.label}":`, err);
      // Continue with other prompts — partial results are better than none
    }
  }

  return allSources;
}
