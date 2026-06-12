/**
 * DYOR2 — App.tsx
 * Design: Precision Instrument — warm white, deep ink, blue primary
 * Routes: stage-based pipeline navigation managed by AppContext
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
import "./styles/print.css";

function PipelineRouter() {
  const { state, dispatch } = useApp();
  function handleStageNav(stage: number) {
    // Only allow navigating to completed stages
    if (stage < state.currentStage) {
      dispatch({ type: "ADVANCE_STAGE", stage: stage as 1 | 2 | 3 | 4 | 5 });
    }
  }

  const renderStage = () => {
    switch (state.currentStage) {
      case 1:
        return <IntakePage />;
      case 2:
        return <ResearchPage />;
      case 3:
        return <CheckpointPage />;
      case 4:
        return <SynthesisPage />;
      case 5:
        return state.problemSet ? <ExportPage /> : <ProblemsPage />;
      default:
        return <IntakePage />;
    }
  };

  // Determine which "visual" stage to show in nav
  // Stage 5 covers both ProblemsPage and ExportPage
  const navStage = state.currentStage === 5 && state.problemSet ? 5 : state.currentStage;

  // make sure to consider if you need authentication for certain routes
  return (
    <div className="min-h-screen bg-background">
      {/* Stage navigation */}
      <StageNav
        currentStage={navStage}
        onStageClick={handleStageNav}
        className="no-print"
      />

      {/* Page header with company name */}
      {state.companyName && (
        <div className="no-print border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">Analysing</span>
              <span className="text-sm font-semibold text-foreground">{state.companyName}</span>
            </div>
            <button
              onClick={() => dispatch({ type: "RESET" })}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container py-2">
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
