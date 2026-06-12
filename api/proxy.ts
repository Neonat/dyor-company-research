/**
 * DYOR2 — Server-side API proxy
 * Handles: anthropic | exa | gamma | canva
 * Keys injected from environment variables — NEVER logged or returned to client.
 *
 * This runs as a Vite server middleware / Vercel edge function.
 * Route: POST /api/proxy
 * Body: { service: string, payload: object }
 */

import type { Request, Response } from "express";

const ANTHROPIC_BASE = "https://api.anthropic.com/v1";
const EXA_BASE = "https://api.exa.ai";
const GAMMA_BASE = "https://public-api.gamma.app/v1.0";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { service, payload } = req.body as {
    service: string;
    payload: Record<string, unknown>;
  };

  if (!service || !payload) {
    return res.status(400).json({ error: "Missing service or payload" });
  }

  try {
    switch (service) {
      case "anthropic": {
        const key = process.env.ANTHROPIC_API_KEY;
        if (!key) return res.status(500).json({ error: "Anthropic API key not configured" });

        const upstreamRes = await fetch(`${ANTHROPIC_BASE}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(payload),
        });

        const data = await upstreamRes.json();
        if (!upstreamRes.ok) {
          return res.status(upstreamRes.status).json({ error: data.error?.message || "Anthropic error" });
        }
        return res.json(data);
      }

      case "exa": {
        const key = process.env.EXA_API_KEY;
        if (!key) return res.status(500).json({ error: "Exa API key not configured" });

        const upstreamRes = await fetch(`${EXA_BASE}/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
          },
          body: JSON.stringify(payload),
        });

        const data = await upstreamRes.json();
        if (!upstreamRes.ok) {
          return res.status(upstreamRes.status).json({ error: data.error || "Exa error" });
        }
        return res.json(data);
      }

      case "gamma": {
        const key = process.env.GAMMA_API_KEY;
        if (!key) return res.status(500).json({ error: "Gamma API key not configured" });

        const { endpoint, ...rest } = payload as { endpoint: string; [k: string]: unknown };

        let url = `${GAMMA_BASE}/generate`;
        if (endpoint === "status") {
          url = `${GAMMA_BASE}/decks/${rest.deckId}`;
        }

        const upstreamRes = await fetch(url, {
          method: endpoint === "status" ? "GET" : "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": key,
          },
          ...(endpoint !== "status" && { body: JSON.stringify(rest) }),
        });

        const data = await upstreamRes.json();
        if (!upstreamRes.ok) {
          return res.status(upstreamRes.status).json({ error: data.error || "Gamma error" });
        }
        return res.json(data);
      }

      case "canva": {
        const key = process.env.CANVA_API_KEY;
        if (!key) return res.status(500).json({ error: "Canva API key not configured" });

        const { endpoint, ...rest } = payload as { endpoint: string; [k: string]: unknown };

        const upstreamRes = await fetch(`https://api.canva.com/rest/v1/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify(rest),
        });

        const data = await upstreamRes.json();
        if (!upstreamRes.ok) {
          return res.status(upstreamRes.status).json({ error: data.error || "Canva error" });
        }
        return res.json(data);
      }

      default:
        return res.status(400).json({ error: `Unknown service: ${service}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal proxy error";
    return res.status(500).json({ error: message });
  }
}
