/**
 * DYOR2 — App.tsx
 * Design: DYOR design system — ink/paper, Poppins, flat hairline borders
 * Routes: 6-stage pipeline managed by AppContext
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./store/AppContext";
import { StageNav } from "./components/StageNav";
import IntakePage from "./pages/IntakePage";
import ResearchPage from "./pages/ResearchPage";
import CheckpointPage from "./pages/CheckpointPage";
import SynthesisPage from "./pages/SynthesisPage";
import ProblemsPage from "./pages/ProblemsPage";
import ExportPage from "./pages/ExportPage";
import ErrorBoundary from "./components/ErrorBoundary";

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

        {/* Company context strip */}
        {state.companyName && (
          <div style={{
            borderBottom: "0.5px solid var(--border-color)",
            background: "color-mix(in srgb, var(--paper) 85%, var(--surface))",
          }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0.5rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 600, color: "var(--muted-color)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Analysing
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)" }}>
                  {state.companyName}
                </span>
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
                Start Over
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppProvider>
            <PipelineRouter />
            <Toaster />
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
