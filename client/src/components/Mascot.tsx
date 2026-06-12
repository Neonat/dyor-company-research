/**
 * DYOR2 — Mascot Component
 * Uses cropped duck sprites from the user's sprite sheet.
 * Loading: duck with magnifying glass inspecting company logo
 * Empty: duck looking up
 * Success: front-facing duck with mustache
 * Error: duck looking sideways
 */

import { useApp } from "@/store/AppContext";

const DUCK_LOADING = "/manus-storage/duck_9_8ae18175.png";  // magnifying glass
const DUCK_EMPTY   = "/manus-storage/duck_7_5121c766.png";  // looking up
const DUCK_SUCCESS = "/manus-storage/duck_3_14fbf162.png";  // front-facing
const DUCK_ERROR   = "/manus-storage/duck_8_b98740f5.png";  // looking sideways

const DEFAULT_CAPTIONS: Record<string, string> = {
  loading: "Investigating...",
  empty: "Nothing here yet. Let's start researching.",
  success: "Research complete!",
  error: "Something went wrong. Let's try again.",
};

interface MascotProps {
  state: "loading" | "empty" | "success" | "error";
  caption?: string;
  size?: number;
  className?: string;
}

export default function Mascot({ state, caption, size = 96, className = "" }: MascotProps) {
  const { state: appState } = useApp();
  const companyLogo = appState.companyLogoUrl;

  const imgSrc = state === "loading" ? DUCK_LOADING
    : state === "empty" ? DUCK_EMPTY
    : state === "success" ? DUCK_SUCCESS
    : DUCK_ERROR;

  // For loading state, show duck + company logo composition
  if (state === "loading") {
    return (
      <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "1.5rem 0" }}>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          {/* Duck detective with magnifying glass */}
          <img
            src={DUCK_LOADING}
            alt="Detective duck investigating"
            style={{
              width: size,
              height: size,
              objectFit: "contain",
              animation: "duckBob 1.5s ease-in-out infinite",
            }}
          />
          {/* Company logo being inspected */}
          <div
            style={{
              marginLeft: size * 0.08,
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: 8,
              border: "1.5px solid var(--border-color)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              animation: "logoPulse 2s ease-in-out infinite",
            }}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Company logo"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="var(--muted-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )}
          </div>
        </div>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.8rem",
          color: "var(--muted-color)",
          fontWeight: 500,
        }}>
          {caption ?? DEFAULT_CAPTIONS[state]}
        </p>
        <style>{`
          @keyframes duckBob {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-3px) rotate(-1deg); }
            75% { transform: translateY(2px) rotate(1deg); }
          }
          @keyframes logoPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // For non-loading states
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "1.5rem 0" }}>
      <img
        src={imgSrc}
        alt={`DYOR duck — ${state}`}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.8rem",
        color: state === "error" ? "var(--signal-red)" : "var(--muted-color)",
        fontWeight: 500,
      }}>
        {caption ?? DEFAULT_CAPTIONS[state]}
      </p>
    </div>
  );
}
