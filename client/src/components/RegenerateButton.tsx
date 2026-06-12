/**
 * DYOR2 — RegenerateButton Component
 * Design: DYOR design system — secondary action, ink/paper, hairline border
 */

import React from "react";
import { RefreshCw } from "lucide-react";

interface RegenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  size?: "sm" | "md";
}

export function RegenerateButton({ onClick, loading = false, label = "Regenerate", size = "sm" }: RegenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="btn-outline"
      style={{
        padding: size === "sm" ? "0.375rem 0.75rem" : "0.5rem 1rem",
        fontSize: size === "sm" ? "0.75rem" : "0.875rem",
        gap: "0.375rem",
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}
      aria-label={label}
    >
      <RefreshCw
        size={size === "sm" ? 11 : 14}
        style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
      />
      {label}
    </button>
  );
}
