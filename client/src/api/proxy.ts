/**
 * DYOR2 — Client-side proxy caller
 * All API calls go through /api/proxy to keep keys server-side.
 * Never import API keys in this file or any client file.
 */

export type ProxyService = "anthropic" | "exa" | "gamma" | "canva";

export interface ProxyRequest {
  service: ProxyService;
  payload: Record<string, unknown>;
}

export async function callProxy<T = unknown>(
  service: ProxyService,
  payload: Record<string, unknown>
): Promise<T> {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, payload }),
  });

  if (!res.ok) {
    let errMsg = `Proxy error ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body.error || body.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}
