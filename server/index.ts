import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  const server = createServer(app);

  // ─── API Proxy ────────────────────────────────────────────────────────────
  const ANTHROPIC_BASE = "https://api.anthropic.com/v1";
  const EXA_BASE = "https://api.exa.ai";
  const GAMMA_BASE = "https://public-api.gamma.app/v1.0";

  app.post("/api/proxy", async (req, res) => {
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
          if (!key) return res.status(500).json({ error: "Anthropic API key not configured. Please add ANTHROPIC_API_KEY in Settings → Secrets." });

          const upstreamRes = await fetch(`${ANTHROPIC_BASE}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": key,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify(payload),
          });

          const data = await upstreamRes.json() as Record<string, unknown>;
          if (!upstreamRes.ok) {
            const errData = data.error as Record<string, unknown> | undefined;
            return res.status(upstreamRes.status).json({ error: errData?.message || "Anthropic error" });
          }
          return res.json(data);
        }

        case "exa": {
          const key = process.env.EXA_API_KEY;
          if (!key) return res.status(500).json({ error: "Exa API key not configured. Please add EXA_API_KEY in Settings → Secrets." });

          const upstreamRes = await fetch(`${EXA_BASE}/search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": key,
            },
            body: JSON.stringify(payload),
          });

          const data = await upstreamRes.json() as Record<string, unknown>;
          if (!upstreamRes.ok) {
            return res.status(upstreamRes.status).json({ error: (data.error as string) || "Exa error" });
          }
          return res.json(data);
        }

        case "gamma": {
          const key = process.env.GAMMA_API_KEY;
          if (!key) return res.status(500).json({ error: "Gamma API key not configured. Please add GAMMA_API_KEY in Settings → Secrets." });

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

          const data = await upstreamRes.json() as Record<string, unknown>;
          if (!upstreamRes.ok) {
            return res.status(upstreamRes.status).json({ error: (data.error as string) || "Gamma error" });
          }
          return res.json(data);
        }

        case "canva": {
          const key = process.env.CANVA_API_KEY;
          if (!key) return res.status(500).json({ error: "Canva API key not configured. Please add CANVA_API_KEY in Settings → Secrets." });

          const { endpoint, ...rest } = payload as { endpoint: string; [k: string]: unknown };

          const upstreamRes = await fetch(`https://api.canva.com/rest/v1/${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify(rest),
          });

          const data = await upstreamRes.json() as Record<string, unknown>;
          if (!upstreamRes.ok) {
            return res.status(upstreamRes.status).json({ error: (data.error as string) || "Canva error" });
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
  });

  // ─── Static files ─────────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`DYOR2 server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
