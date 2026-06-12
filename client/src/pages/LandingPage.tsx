/**
 * DYOR2 — Landing Page
 * Hero → Use Cases → Origin Story → Demo CTA
 */

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { Search, FileText, Lightbulb, Target, ArrowRight, Key } from "lucide-react";

const DUCK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663450574649/4YK7LGL6oVWoKYiCvXEgQs/duck-loading-YHN9yVZ8Uz8orGSVb7GnER.webp";

const USE_CASES = [
  {
    icon: Search,
    title: "Due Diligence Research",
    description: "Rapidly surface customer complaints, technical outages, and competitive weaknesses from across the web.",
  },
  {
    icon: FileText,
    title: "Problem Statement Generation",
    description: "Transform raw research into scoped, actionable problem cards with journey maps and solution proposals.",
  },
  {
    icon: Target,
    title: "Investment Thesis Validation",
    description: "Stress-test your assumptions with evidence-backed signal scorecards and tension analysis.",
  },
  {
    icon: Lightbulb,
    title: "Product Strategy Briefs",
    description: "Generate analyst-grade briefs that identify where the real opportunities are hiding.",
  },
];

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
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      {/* ─── Hero ─── */}
      <section style={{ padding: "6rem 1.5rem 4rem", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <img
            src={DUCK_IMG}
            alt="DYOR Detective Duck"
            style={{ width: 120, height: 120, margin: "0 auto 1.5rem", borderRadius: "50%", background: "var(--paper)", padding: 8, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: "1rem" }}>
            Do Your Own Research
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "1.125rem", color: "var(--muted-color)", maxWidth: 540, margin: "0 auto 2rem", lineHeight: 1.6 }}>
            AI-powered due diligence that transforms a company name into a structured problem brief — complete with evidence, journey maps, and actionable next steps.
          </p>
          <button
            onClick={() => setShowKeyModal(true)}
            style={{
              fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600,
              background: "var(--ink)", color: "var(--paper)", border: "none",
              padding: "0.875rem 2rem", borderRadius: "var(--radius-md)",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem",
              transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms ease-out",
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            Try the Demo <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section style={{ padding: "3rem 1.5rem 4rem", background: "var(--paper)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600, color: "var(--ink)", textAlign: "center", marginBottom: "2.5rem" }}>
            What you can do with DYOR
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                style={{
                  padding: "1.5rem",
                  border: "0.5px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface)",
                  transition: "transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms ease-out",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <uc.icon size={24} style={{ color: "var(--research-blue)", marginBottom: "0.75rem" }} />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.5rem" }}>
                  {uc.title}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--muted-color)", lineHeight: 1.5 }}>
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Origin Story ─── */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--surface)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600, color: "var(--ink)", marginBottom: "1.5rem" }}>
            Where this came from
          </h2>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--muted-color)", lineHeight: 1.8, textAlign: "left" }}>
            <p style={{ marginBottom: "1rem" }}>
              Every analyst knows the drill: you get a company name, open 15 tabs, skim G2 reviews, scan TechCrunch for outages, dig through Reddit threads, and try to piece together what's actually going wrong for their customers.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              DYOR was born from the frustration of doing this manually for the hundredth time. What if an AI could do the initial sweep — surface the complaints, score the signals, and draft the problem statements — so you could spend your time on the parts that actually need human judgment?
            </p>
            <p>
              That's what this tool does. It's not a replacement for thinking — it's a research accelerator that gets you to the "interesting questions" faster.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section style={{ padding: "4rem 1.5rem 6rem", textAlign: "center", background: "var(--paper)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, color: "var(--ink)", marginBottom: "1rem" }}>
          Ready to try it?
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--muted-color)", marginBottom: "1.5rem" }}>
          You'll need an Exa API key to power the web research. It takes 30 seconds to get one.
        </p>
        <button
          onClick={() => setShowKeyModal(true)}
          style={{
            fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600,
            background: "var(--research-blue)", color: "#fff", border: "none",
            padding: "0.875rem 2rem", borderRadius: "var(--radius-md)",
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem",
            transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)",
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          Launch Demo <ArrowRight size={16} />
        </button>
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
              padding: "2rem", maxWidth: 420, width: "100%",
              boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
              animation: "scaleIn 200ms cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Key size={20} style={{ color: "var(--research-blue)" }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
                  Enter your Exa API key
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--muted-color)" }}>
                  Powers the web research in Stage 2
                </p>
              </div>
            </div>

            <input
              type="password"
              value={exaKey}
              onChange={(e) => { setExaKey(e.target.value); setKeyError(""); }}
              placeholder="exa-xxxxxxxxxxxxxxxx"
              style={{
                width: "100%", padding: "0.75rem 1rem",
                fontFamily: "var(--font-mono)", fontSize: "0.825rem",
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
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--signal-red)", marginTop: "0.5rem" }}>
                {keyError}
              </p>
            )}

            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--muted-color)", marginTop: "0.75rem", lineHeight: 1.5 }}>
              Get a free key at{" "}
              <a href="https://exa.ai" target="_blank" rel="noopener noreferrer" style={{ color: "var(--research-blue)", textDecoration: "underline" }}>
                exa.ai
              </a>
              . Your key is stored locally and only sent when running searches.
            </p>

            <button
              onClick={handleLaunch}
              style={{
                width: "100%", marginTop: "1.25rem",
                fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600,
                background: "var(--ink)", color: "var(--paper)", border: "none",
                padding: "0.75rem", borderRadius: "var(--radius)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              Start Research <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
