/**
 * DYOR2 — AppContext + useReducer state management
 * Uses the reducer.ts contract so all pages compile without changes.
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { appReducer, initialState } from "./reducer";
import type { AppState, AppAction } from "./reducer";

const STORAGE_KEY = "dyor2_session";

function loadFromStorage(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function buildInitialState(): AppState {
  const saved = loadFromStorage();
  return {
    ...initialState,
    companyName: saved.companyName ?? initialState.companyName,
    role: saved.role ?? initialState.role,
    currentStage: saved.currentStage ?? initialState.currentStage,
    intakeBrief: saved.intakeBrief ?? null,
    exaPrompts: saved.exaPrompts ?? null,
    researchSources: saved.researchSources ?? [],
    synthesisReport: saved.synthesisReport ?? null,
    problemSet: saved.problemSet ?? null,
    shortlist: saved.shortlist ?? [],
    // Never restore transient fields
    loadingSection: null,
    errorSection: null,
    errorMessage: null,
  };
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);

  // Persist non-transient state to localStorage
  useEffect(() => {
    const { loadingSection: _l, errorSection: _e, errorMessage: _m, ...persistable } = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      // Quota exceeded — ignore
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
