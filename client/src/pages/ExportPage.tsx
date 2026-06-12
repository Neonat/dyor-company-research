/**
 * DYOR2 — ExportPage
 * Stage 6: PDF (print CSS), Gamma API deck, Canva deck
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders
 */

import React, { useState } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { SignalCard } from "@/components/SignalCard";
import { JourneyMap } from "@/components/JourneyMap";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText, Presentation, Layers, ExternalLink,
  AlertCircle, CheckCircle2, Loader2, RotateCcw,
} from "lucide-react";

export default function ExportPage() {
  const { state, dispatch } = useApp();
  const [gammaUrl, setGammaUrl] = useState<string | null>(null);
  const [gammaError, setGammaError] = useState<string | null>(null);
  const [gammaApiKey, setGammaApiKey] = useState("");
  const [gammaKeyModalOpen, setGammaKeyModalOpen] = useState(false);
  const [canvaModalOpen, setCanvaModalOpen] = useState(false);
  const [canvaOutline, setCanvaOutline] = useState("");

  const { intakeBrief, synthesisReport, problemSet, shortlist, researchSources } = state;

  const shortlistedProblems = problemSet?.problems.filter((p) => shortlist.includes(p.id)) || [];
  const topProblems = shortlistedProblems.length > 0
    ? shortlistedProblems.slice(0, 3)
    : problemSet?.problems.slice(0, 3) || [];

  const generateGammaMutation = trpc.dyor.generateGammaDeck.useMutation({
    onSuccess: (data) => {
      setGammaUrl(data.url);
      window.open(data.url, "_blank");
      setGammaKeyModalOpen(false);
    },
    onError: (err) => { setGammaError(err.message); },
  });

  function buildGammaMarkdown() {
    if (!intakeBrief || !synthesisReport) return "";
    return `# ${intakeBrief.companyName} Due Diligence Brief\n\n## Company Overview\n- Industry: ${intakeBrief.industry}\n- HQ: ${intakeBrief.headquartersCountry}\n- Size: ${intakeBrief.estimatedSize}\n\n## Signal Scorecard\n${synthesisReport.signals.map((s) => `- **${s.theme}** [${s.status.toUpperCase()}]: ${s.summary}`).join("\n")}\n\n## Key Tensions\n${synthesisReport.keyTensions.map((t) => `- ${t}`).join("\n")}\n\n## Top Problems\n${topProblems.map((p, i) => `### ${i + 1}. ${p.title}\n${p.evidenceSummary}`).join("\n\n")}\n\n## Analyst Actions\n${synthesisReport.analystActions.slice(0, 3).map((a) => `${a.priority}. **${a.action}**: ${a.rationale}`).join("\n")}`;
  }

  function handleCanvaOpen() {
    if (!intakeBrief || !synthesisReport) return;
    const outline = `# ${intakeBrief.companyName} Due Diligence Deck\n\n## Slide 1: Company Overview\n- Industry: ${intakeBrief.industry}\n- HQ: ${intakeBrief.headquartersCountry}\n- Size: ${intakeBrief.estimatedSize}\n\n## Slide 2: Signal Scorecard\n${synthesisReport.signals.map((s) => `- ${s.theme}: ${s.status.toUpperCase()}`).join("\n")}\n\n## Slide 3: Key Tensions\n${synthesisReport.keyTensions.map((t) => `- ${t}`).join("\n")}\n\n## Slides 4–6: Top Problems\n${topProblems.map((p, i) => `### Problem ${i + 1}: ${p.title}\n${p.evidenceSummary}`).join("\n\n")}\n\n## Slide 7: Recommendations\n${synthesisReport.analystActions.slice(0, 3).map((a) => `- ${a.action}`).join("\n")}`;
    setCanvaOutline(outline);
    setCanvaModalOpen(true);
  }

  const exportCards = [
    {
      icon: <FileText size={20} style={{ color: "var(--ink)" }} />,
      iconBg: "color-mix(in srgb, var(--ink) 8%, var(--paper))",
      title: "PDF Brief",
      desc: "Analyst-grade print layout. Signal scorecard, top 3 problems, sources list.",
      action: (
        <button
          onClick={() => window.print()}
          className="btn-outline"
          style={{ width: "100%", justifyContent: "center", padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
        >
          Download PDF
        </button>
      ),
    },
    {
      icon: <Presentation size={20} style={{ color: "#7c3aed" }} />,
      iconBg: "color-mix(in srgb, #7c3aed 10%, var(--paper))",
      title: "Gamma Deck",
      desc: "AI-generated presentation deck. Requires a Gamma API key.",
      action: gammaUrl ? (
        <a
          href={gammaUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "#7c3aed", textDecoration: "none" }}
        >
          <CheckCircle2 size={14} /> Open Deck <ExternalLink size={11} />
        </a>
      ) : (
        <button
          onClick={() => { setGammaError(null); setGammaKeyModalOpen(true); }}
          disabled={generateGammaMutation.isPending || !intakeBrief || !synthesisReport || !problemSet}
          className="btn-outline"
          style={{ width: "100%", justifyContent: "center", padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
        >
          {generateGammaMutation.isPending
            ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Generating…</>
            : "Generate Gamma Deck"}
        </button>
      ),
      error: gammaError,
    },
    {
      icon: <Layers size={20} style={{ color: "#0891b2" }} />,
      iconBg: "color-mix(in srgb, #0891b2 10%, var(--paper))",
      title: "Canva Deck",
      desc: "Review outline, then generate a Canva presentation. Requires Canva API key.",
      action: (
        <button
          onClick={handleCanvaOpen}
          disabled={!intakeBrief || !synthesisReport}
          className="btn-outline"
          style={{ width: "100%", justifyContent: "center", padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
        >
          Generate Canva Deck
        </button>
      ),
    },
  ];

  return (
    <>
      {/* ── Screen view ── */}
      <div className="stage-enter no-print" style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div className="stage-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 20, height: 1, background: "var(--muted-color)", display: "inline-block" }} />
            Stage 06 — Export
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
                Export
              </h1>
              <p style={{ color: "var(--muted-color)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Export your due diligence brief for{" "}
                <strong style={{ color: "var(--ink)" }}>{intakeBrief?.companyName}</strong> as a PDF, Gamma presentation, or Canva deck.
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: "RESET" })}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 600,
                color: "var(--muted-color)", background: "none", border: "0.5px solid var(--border-color)",
                borderRadius: "var(--radius)", padding: "0.5rem 0.875rem", cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.05em",
                transition: "color 150ms ease-out, border-color 150ms ease-out",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-color)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-color)"; }}
            >
              <RotateCcw size={12} /> New Analysis
            </button>
          </div>
        </div>

        {/* Export option cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {exportCards.map((card) => (
            <div
              key={card.title}
              className="dyor-card"
              style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {card.icon}
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--ink)", marginBottom: "0.25rem" }}>{card.title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", lineHeight: 1.5 }}>{card.desc}</p>
              </div>
              <div style={{ marginTop: "auto" }}>
                {card.action}
                {card.error && (
                  <p style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--signal-red)", marginTop: "0.5rem" }}>
                    <AlertCircle size={11} /> {card.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Brief preview */}
        {intakeBrief && synthesisReport && (
          <div style={{ border: "0.5px solid var(--border-color)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <div style={{ background: "color-mix(in srgb, var(--ink) 4%, var(--paper))", padding: "0.75rem 1.25rem", borderBottom: "0.5px solid var(--border-color)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)" }}>Brief Preview</h2>
            </div>
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Signals */}
              <div>
                <h3 className="stage-label" style={{ marginBottom: "0.75rem" }}>Signal Scorecard</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {synthesisReport.signals.map((s, i) => <SignalCard key={i} signal={s} />)}
                </div>
              </div>
              {/* Top problems */}
              {topProblems.length > 0 && (
                <div>
                  <h3 className="stage-label" style={{ marginBottom: "0.75rem" }}>Top Problems</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {topProblems.map((p) => (
                      <div key={p.id} className="dyor-card" style={{ padding: "1rem" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)", marginBottom: "0.5rem" }}>{p.title}</p>
                        <JourneyMap steps={p.journeySteps} />
                        <p style={{ fontSize: "0.8125rem", color: "var(--muted-color)", marginTop: "0.5rem", lineHeight: 1.5 }}>{p.evidenceSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Gamma API Key Modal ── */}
      <Dialog open={gammaKeyModalOpen} onOpenChange={setGammaKeyModalOpen}>
        <DialogContent style={{ maxWidth: 440 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Gamma API Key</DialogTitle>
            <DialogDescription>
              Enter your Gamma API key to generate a presentation deck. Find it at gamma.app → Settings → API.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--muted-color)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.375rem" }}>
                API Key
              </label>
              <input
                type="password"
                placeholder="gamma_api_..."
                value={gammaApiKey}
                onChange={(e) => setGammaApiKey(e.target.value)}
                style={{
                  width: "100%", padding: "0.625rem 0.875rem",
                  border: "0.5px solid var(--border-color)", borderRadius: "var(--radius)",
                  fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--ink)",
                  background: "var(--paper)", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {gammaError && (
              <p style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--signal-red)" }}>
                <AlertCircle size={11} /> {gammaError}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setGammaKeyModalOpen(false)} className="btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!gammaApiKey.trim()) { setGammaError("Gamma API key is required"); return; }
                  generateGammaMutation.mutate({ markdown: buildGammaMarkdown(), gammaApiKey: gammaApiKey.trim() });
                }}
                disabled={generateGammaMutation.isPending || !gammaApiKey.trim()}
                className="btn-primary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                {generateGammaMutation.isPending
                  ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Generating…</>
                  : "Generate Deck"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Canva Outline Modal ── */}
      <Dialog open={canvaModalOpen} onOpenChange={setCanvaModalOpen}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Canva Deck Outline</DialogTitle>
            <DialogDescription>
              Review and edit the slide outline, then copy it to Canva's AI presentation builder.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
            <textarea
              value={canvaOutline}
              onChange={(e) => setCanvaOutline(e.target.value)}
              rows={12}
              style={{
                width: "100%", padding: "0.75rem",
                border: "0.5px solid var(--border-color)", borderRadius: "var(--radius)",
                fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--ink)",
                background: "var(--paper)", resize: "vertical", outline: "none",
                lineHeight: 1.6, boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setCanvaModalOpen(false)} className="btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                Close
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(canvaOutline); }}
                className="btn-primary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                Copy Outline
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Print view ── */}
      <div className="print-only" id="print-brief">
        {intakeBrief && (
          <>
            <div className="print-header">
              <div>
                <h1 className="print-company">{intakeBrief.companyName}</h1>
                <p className="print-subtitle">
                  {intakeBrief.industry} · {intakeBrief.headquartersCountry} · {intakeBrief.estimatedSize}
                </p>
              </div>
              <div className="print-meta">
                <p>Due Diligence Brief</p>
                <p>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>

            {synthesisReport && (
              <>
                <h2 className="print-section-title">Signal Scorecard</h2>
                {synthesisReport.signals.map((s, i) => (
                  <div key={i} className={`print-signal print-signal-${s.status}`}>
                    <strong>{s.theme}</strong> [{s.status.toUpperCase()}]: {s.summary}
                  </div>
                ))}
                {synthesisReport.keyTensions.length > 0 && (
                  <>
                    <h2 className="print-section-title">Key Tensions</h2>
                    <ul className="print-list">
                      {synthesisReport.keyTensions.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </>
                )}
              </>
            )}

            {topProblems.length > 0 && (
              <>
                <h2 className="print-section-title">Top Problem Statements</h2>
                {topProblems.map((p, i) => (
                  <div key={p.id} className="print-problem">
                    <h3 className="print-problem-title">{i + 1}. {p.title}</h3>
                    <p className="print-evidence">{p.evidenceSummary}</p>
                    {p.solutions.slice(0, 2).map((s, j) => (
                      <div key={j} className="print-solution">
                        <strong>{s.title}:</strong> {s.description}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            <h2 className="print-section-title">Sources</h2>
            <div className="print-sources">
              {researchSources.filter((s) => s.approved).map((s, i) => (
                <div key={s.id} className="print-source">
                  <span className="print-source-num">{i + 1}</span>
                  <div>
                    <p className="print-source-title">{s.title}</p>
                    <p className="print-source-url">{s.url}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
