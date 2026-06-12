/**
 * DYOR2 — Mascot Loading Component
 * Shows the detective duck inspecting the company logo during all loading states.
 * Falls back to inspecting a generic sparkle if no logo is available.
 */

import { useApp } from "@/store/AppContext";

const DUCK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663450574649/4YK7LGL6oVWoKYiCvXEgQs/duck-loading-YHN9yVZ8Uz8orGSVb7GnER.webp";

// Keep old mascot URLs for non-loading states
const MASCOT_URLS = {
  loading: DUCK_IMG,
  empty: "/manus-storage/mascot-empty_a9e5291d.png",
  success: "/manus-storage/mascot-success_c580e87e.png",
  error: "/manus-storage/mascot-error_ec243ec0.png",
} as const;

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

  // For loading state, show duck + company logo composition
  if (state === "loading") {
    return (
      <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "1.5rem 0" }}>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          {/* Duck detective */}
          <img
            src={DUCK_IMG}
            alt="Detective duck investigating"
            style={{
              width: size,
              height: size,
              animation: "duckBob 1.5s ease-in-out infinite",
            }}
          />
          {/* Inspected target: company logo or fallback document */}
          <div
            style={{
              marginLeft: size * 0.1,
              width: size * 0.45,
              height: size * 0.45,
              borderRadius: "var(--radius)",
              border: "0.5px solid var(--border-color)",
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
              /* Fallback: a cute document/brief icon */
              <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="var(--muted-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
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

  // For non-loading states, show the appropriate mascot
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "1.5rem 0" }}>
      <img
        src={MASCOT_URLS[state]}
        alt={`DYOR mascot — ${state}`}
        width={size}
        height={size}
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
