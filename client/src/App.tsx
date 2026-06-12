/**
 * DYOR2 — App.tsx
 * Landing page → API key gate → 6-stage pipeline
 * Design: DYOR design system — ink/paper, Poppins, fluid progress bar
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./store/AppContext";
import { StageNav } from "./components/StageNav";
import LandingPage from "./pages/LandingPage";
import IntakePage from "./pages/IntakePage";
import ResearchPage from "./pages/ResearchPage";
import CheckpointPage from "./pages/CheckpointPage";
import SynthesisPage from "./pages/SynthesisPage";
import ProblemsPage from "./pages/ProblemsPage";
import ExportPage from "./pages/ExportPage";
import ErrorBoundary from "./components/ErrorBoundary";

const DUCK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663450574649/4YK7LGL6oVWoKYiCvXEgQs/duck-loading-YHN9yVZ8Uz8orGSVb7GnER.webp";

// Stage routing: 1=Intake, 2=Research, 3=Checkpoint, 4=Synthesis, 5=Problems, 6=Export
function PipelineRouter() {
  const { state, dispatch } = useApp();

  function handleStageNav(stage: number) {
    // Only allow navigating back to already-visited stages
    if (stage < state.currentStage) {
      dispatch({ type: "ADVANCE_STAGE", stage: stage as 1 | 2 | 3 | 4 | 5 | 6 });
    }
  }

  const renderStage = () => {
    switch (state.currentStage) {
      case 1: return <IntakePage />;
      case 2: return <ResearchPage />;
      case 3: return <CheckpointPage />;
      case 4: return <SynthesisPage />;
      case 5: return <ProblemsPage />;
      case 6: return <ExportPage />;
      default: return <IntakePage />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      {/* Top nav — hidden on print */}
      <div className="no-print">
        <StageNav
          currentStage={state.currentStage}
          onStageClick={handleStageNav}
        />

        {/* Company logo context strip — appears after Stage 1 intake */}
        {state.companyName && (
          <div style={{
            borderBottom: "0.5px solid var(--border-color)",
            background: "var(--paper)",
          }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Company logo from Clearbit */}
                {state.companyLogoUrl ? (
                  <img
                    src={state.companyLogoUrl}
                    alt={`${state.companyName} logo`}
                    style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", border: "0.5px solid var(--border-color)", objectFit: "contain", background: "#fff" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", background: "var(--surface)", border: "0.5px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", fontWeight: 700, color: "var(--muted-color)" }}>
                      {state.companyName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600, color: "var(--muted-color)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>
                    Analysing
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)" }}>
                    {state.companyName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: "RESET" })}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 600,
                  color: "var(--muted-color)", background: "none", border: "none", cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  transition: "color 150ms ease-out",
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--signal-red)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-color)"}
              >
                New Analysis
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        {renderStage()}
      </main>
    </div>
  );
}

function AppShell() {
  const { state } = useApp();

  if (state.showLanding) {
    return <LandingPage />;
  }

  return <PipelineRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppProvider>
            <AppShell />
            <Toaster />
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
