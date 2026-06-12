/**
 * DYOR2 — ExportPage
 * Stage 5b: PDF (print CSS), Gamma API deck, Canva API deck
 */

import React, { useState } from "react";
import { useApp } from "@/store/AppContext";
import { trpc } from "@/lib/trpc";
import { SignalCard } from "@/components/SignalCard";
import { JourneyMap } from "@/components/JourneyMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Presentation,
  Layers,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function ExportPage() {
  const { state } = useApp();
  const [gammaUrl, setGammaUrl] = useState<string | null>(null);
  const [gammaError, setGammaError] = useState<string | null>(null);
  const [gammaApiKey, setGammaApiKey] = useState("");
  const [gammaKeyModalOpen, setGammaKeyModalOpen] = useState(false);
  const [canvaModalOpen, setCanvaModalOpen] = useState(false);
  const [canvaOutline, setCanvaOutline] = useState("");
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [canvaError, setCanvaError] = useState<string | null>(null);

  const { intakeBrief, synthesisReport, problemSet, shortlist, researchSources } = state;

  const shortlistedProblems =
    problemSet?.problems.filter((p) => shortlist.includes(p.id)) || [];
  const topProblems =
    shortlistedProblems.length > 0
      ? shortlistedProblems.slice(0, 3)
      : problemSet?.problems.slice(0, 3) || [];

  const generateGammaMutation = trpc.dyor.generateGammaDeck.useMutation({
    onSuccess: (data) => {
      setGammaUrl(data.url);
      window.open(data.url, "_blank");
      setGammaKeyModalOpen(false);
    },
    onError: (err) => {
      setGammaError(err.message);
    },
  });

  function handlePrintPDF() {
    window.print();
  }

  function buildGammaMarkdown() {
    if (!intakeBrief || !synthesisReport) return "";
    return `# ${intakeBrief.companyName} Due Diligence Brief\n\n## Company Overview\n- Industry: ${intakeBrief.industry}\n- HQ: ${intakeBrief.headquartersCountry}\n- Size: ${intakeBrief.estimatedSize}\n\n## Signal Scorecard\n${synthesisReport.signals.map((s) => `- **${s.theme}** [${s.status.toUpperCase()}]: ${s.summary}`).join("\n")}\n\n## Key Tensions\n${synthesisReport.keyTensions.map((t) => `- ${t}`).join("\n")}\n\n## Top Problems\n${topProblems.map((p, i) => `### ${i + 1}. ${p.title}\n${p.evidenceSummary}`).join("\n\n")}\n\n## Analyst Actions\n${synthesisReport.analystActions.slice(0, 3).map((a) => `${a.priority}. **${a.action}**: ${a.rationale}`).join("\n")}`;
  }

  function handleGamma() {
    if (!intakeBrief || !synthesisReport || !problemSet) return;
    setGammaError(null);
    setGammaKeyModalOpen(true);
  }

  function handleGammaGenerate() {
    if (!gammaApiKey.trim()) {
      setGammaError("Gamma API key is required");
      return;
    }
    generateGammaMutation.mutate({
      markdown: buildGammaMarkdown(),
      gammaApiKey: gammaApiKey.trim(),
    });
  }

  function handleCanvaOpen() {
    if (!intakeBrief || !synthesisReport) return;
    const outline = `# ${intakeBrief.companyName} Due Diligence Deck

## Slide 1: Company Overview
- Industry: ${intakeBrief.industry}
- HQ: ${intakeBrief.headquartersCountry}
- Size: ${intakeBrief.estimatedSize}

## Slide 2: Signal Scorecard
${synthesisReport.signals.map((s) => `- ${s.theme}: ${s.status.toUpperCase()}`).join("\n")}

## Slide 3: Key Tensions
${synthesisReport.keyTensions.map((t) => `- ${t}`).join("\n")}

## Slides 4–6: Top Problems
${topProblems.map((p, i) => `### Problem ${i + 1}: ${p.title}\n${p.evidenceSummary}`).join("\n\n")}

## Slide 7: Recommendations
${synthesisReport.analystActions.slice(0, 3).map((a) => `- ${a.action}`).join("\n")}
`;
    setCanvaOutline(outline);
    setCanvaModalOpen(true);
  }

  return (
    <>
      {/* ── Screen view ── */}
      <div className="stage-enter max-w-4xl mx-auto px-4 py-10 no-print">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
            <span className="w-5 h-px bg-muted-foreground" />
            Stage 05 — Export
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Export</h1>
          <p className="text-muted-foreground">
            Export your due diligence brief for{" "}
            <strong>{intakeBrief?.companyName}</strong> as a PDF, Gamma presentation, or
            Canva deck.
          </p>
        </div>

        {/* Export options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* PDF */}
          <div className="border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">PDF Brief</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Analyst-grade print layout. Signal scorecard, top 3 problems, sources list.
            </p>
            <Button onClick={handlePrintPDF} variant="outline" className="w-full" size="sm">
              Download PDF
            </Button>
          </div>

          {/* Gamma */}
          <div className="border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
              <Presentation className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Gamma Deck</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              AI-generated presentation deck. Requires a Gamma API key in Settings → Secrets.
            </p>
            {gammaUrl ? (
              <a
                href={gammaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full text-sm font-medium text-primary hover:underline"
              >
                <CheckCircle2 className="w-4 h-4" />
                Open Deck
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <Button
                onClick={handleGamma}
                disabled={
                  generateGammaMutation.isPending ||
                  !intakeBrief ||
                  !synthesisReport ||
                  !problemSet
                }
                variant="outline"
                className="w-full"
                size="sm"
              >
                {generateGammaMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Gamma Deck"
                )}
              </Button>
            )}
            {gammaError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {gammaError}
              </p>
            )}
          </div>

          {/* Gamma API Key Modal */}
          <Dialog open={gammaKeyModalOpen} onOpenChange={setGammaKeyModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gamma API Key</DialogTitle>
                <DialogDescription>
                  Enter your Gamma API key to generate a presentation deck. You can find it at
                  gamma.app → Settings → API.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="gamma-key">API Key</Label>
                  <Input
                    id="gamma-key"
                    type="password"
                    placeholder="gamma_api_..."
                    value={gammaApiKey}
                    onChange={(e) => setGammaApiKey(e.target.value)}
                  />
                </div>
                {gammaError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {gammaError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setGammaKeyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGammaGenerate}
                    disabled={generateGammaMutation.isPending || !gammaApiKey.trim()}
                  >
                    {generateGammaMutation.isPending ? (
                      <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Generating…</>
                    ) : (
                      "Generate Deck"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Canva */}
          <div className="border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Canva Deck</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Two-step flow: review outline, then generate Canva presentation. Requires Canva
              API key.
            </p>
            <Button
              onClick={handleCanvaOpen}
              disabled={!intakeBrief || !synthesisReport}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Generate Canva Deck
            </Button>
          </div>
        </div>

        {/* Brief preview */}
        {intakeBrief && synthesisReport && (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/40 px-5 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">Brief Preview</h2>
            </div>
            <div className="p-5 space-y-6">
              {/* Signals */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Signal Scorecard
                </h3>
                <div className="space-y-2">
                  {synthesisReport.signals.map((s, i) => (
                    <SignalCard key={i} signal={s} />
                  ))}
                </div>
              </div>

              {/* Top problems */}
              {topProblems.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Top Problems
                  </h3>
                  <div className="space-y-3">
                    {topProblems.map((p) => (
                      <div key={p.id} className="border border-border rounded-lg p-3">
                        <p className="text-sm font-semibold mb-2">{p.title}</p>
                        <JourneyMap steps={p.journeySteps} />
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {p.evidenceSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Print view ── */}
      <div className="print-only" id="print-brief">
        {intakeBrief && (
          <>
            <div className="print-header">
              <div>
                <h1 className="print-company">{intakeBrief.companyName}</h1>
                <p className="print-subtitle">
                  {intakeBrief.industry} · {intakeBrief.headquartersCountry} ·{" "}
                  {intakeBrief.estimatedSize}
                </p>
              </div>
              <div className="print-meta">
                <p>Due Diligence Brief</p>
                <p>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
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
                      {synthesisReport.keyTensions.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
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
                    <h3 className="print-problem-title">
                      {i + 1}. {p.title}
                    </h3>
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

            {/* Sources */}
            <h2 className="print-section-title">Sources</h2>
            <div className="print-sources">
              {researchSources
                .filter((s) => s.approved)
                .map((s) => (
                  <div key={s.id} className="print-source">
                    <span className="print-source-id">[{s.id.slice(-6)}]</span>{" "}
                    <strong>{s.title}</strong> — {s.url}
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Canva Review Modal */}
      <Dialog open={canvaModalOpen} onOpenChange={setCanvaModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Canva Deck Outline</DialogTitle>
            <DialogDescription>
              Edit the outline below before generating your Canva presentation. The Canva API
              requires a valid API key configured in Settings → Secrets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea
              value={canvaOutline}
              onChange={(e) => setCanvaOutline(e.target.value)}
              className="font-mono text-xs min-h-[300px] resize-none"
            />
            {canvaError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {canvaError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCanvaModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={canvaLoading}
                onClick={async () => {
                  setCanvaLoading(true);
                  setCanvaError(
                    "Canva API key required. Add CANVA_API_KEY in Settings → Secrets."
                  );
                  setCanvaLoading(false);
                }}
              >
                {canvaLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Canva Deck"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
