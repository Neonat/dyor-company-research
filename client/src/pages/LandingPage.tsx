/**
 * DYOR2 — Landing Page (concise version)
 * Hero → Quick use cases → Demo CTA
 */

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { ArrowRight, Key } from "lucide-react";

const DYOR_LOGO = "/manus-storage/dyor-logo_57f1e2fd.jpg";

export default function LandingPage() {
  const { dispatch } = useApp();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [exaKey, setExaKey] = useState(() => {
    try { return localStorage.getItem("dyor2_exa_key") || ""; } catch { return ""; }
  });
  const [keyError, setKeyError] = useState("");

  function handleLaunch() {
    if (!exaKey.trim()) {
      setKeyError("Please enter your Exa API key to continue");
      return;
    }
    dispatch({ type: "LAUNCH_DEMO", exaApiKey: exaKey.trim() });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
      {/* ─── Hero ─── */}
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <img
            src={DYOR_LOGO}
            alt="DYOR Detective Duck"
            style={{ width: 140, height: 140, margin: "0 auto 1.5rem", objectFit: "contain", borderRadius: "var(--radius-lg)" }}
          />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.15, marginBottom: "0.75rem" }}>
            Do Your Own Research
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--muted-color)", maxWidth: 420, margin: "0 auto 2rem", lineHeight: 1.6 }}>
            Company name in, structured problem brief out. AI-powered due diligence with evidence, signal scores, and journey maps.
          </p>
          <button
            onClick={() => setShowKeyModal(true)}
            className="btn-primary"
            style={{ fontSize: "0.95rem", padding: "0.8rem 1.75rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            Try the Demo <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ─── How it works (compact) ─── */}
      <section style={{ padding: "2.5rem 1.5rem 3rem", background: "var(--paper)", borderTop: "0.5px solid var(--border-color)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)", textAlign: "center", marginBottom: "1.5rem" }}>
            How it works
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
            {[
              { step: "1", label: "Enter company name" },
              { step: "2", label: "AI searches the web" },
              { step: "3", label: "Review & approve sources" },
              { step: "4", label: "Get signal scorecard" },
              { step: "5", label: "Scoped problem cards" },
              { step: "6", label: "Export your brief" },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", border: "0.5px solid var(--border-color)", borderRadius: "var(--radius)", background: "var(--surface)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700, color: "var(--research-blue)", background: "rgba(55,138,221,0.08)", borderRadius: 4, padding: "2px 6px" }}>{s.step}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--ink)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Origin (one sentence) ─── */}
      <section style={{ padding: "2rem 1.5rem 3rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--muted-color)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6, fontStyle: "italic" }}>
          Built for analysts tired of opening 15 tabs to piece together what's going wrong for a company's customers. DYOR does the initial sweep so you can focus on the questions that need human judgment.
        </p>
      </section>

      {/* ─── API Key Modal ─── */}
      {showKeyModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(26,26,26,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
            animation: "fadeIn 200ms ease-out",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowKeyModal(false); }}
        >
          <div
            style={{
              background: "var(--paper)", borderRadius: "var(--radius-lg)",
              padding: "2rem", maxWidth: 400, width: "100%",
              boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
              animation: "scaleIn 200ms cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Key size={18} style={{ color: "var(--research-blue)" }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
                  Exa API Key
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--muted-color)" }}>
                  Powers web research in Stage 2
                </p>
              </div>
            </div>

            <input
              type="password"
              value={exaKey}
              onChange={(e) => { setExaKey(e.target.value); setKeyError(""); }}
              placeholder="exa-xxxxxxxxxxxxxxxx"
              style={{
                width: "100%", padding: "0.7rem 0.875rem",
                fontFamily: "var(--font-mono)", fontSize: "0.8rem",
                border: keyError ? "1.5px solid var(--signal-red)" : "0.5px solid var(--border-color)",
                borderRadius: "var(--radius)", background: "var(--surface)",
                color: "var(--ink)", outline: "none",
                transition: "border-color 150ms ease-out",
              }}
              onFocus={(e) => { if (!keyError) e.currentTarget.style.borderColor = "var(--research-blue)"; }}
              onBlur={(e) => { if (!keyError) e.currentTarget.style.borderColor = "var(--border-color)"; }}
              onKeyDown={(e) => { if (e.key === "Enter") handleLaunch(); }}
              autoFocus
            />
            {keyError && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--signal-red)", marginTop: "0.4rem" }}>
                {keyError}
              </p>
            )}

            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.675rem", color: "var(--muted-color)", marginTop: "0.6rem", lineHeight: 1.5 }}>
              Free key at{" "}
              <a href="https://exa.ai" target="_blank" rel="noopener noreferrer" style={{ color: "var(--research-blue)", textDecoration: "underline" }}>exa.ai</a>
              . Stored locally, only sent when running searches.
            </p>

            <button
              onClick={handleLaunch}
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}
            >
              Start Research <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
