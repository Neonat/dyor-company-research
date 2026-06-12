/**
 * DYOR2 — RegenerateButton Component
 * Re-runs a specific Claude call without restarting the pipeline.
 * Design: Precision Instrument — secondary action, always visible
 */

import React from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface RegenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function RegenerateButton({
  onClick,
  loading = false,
  label = "Regenerate",
  className,
  size = "sm",
}: RegenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md border border-border",
        "text-muted-foreground hover:text-foreground hover:border-foreground/30",
        "transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "bg-background hover:bg-muted/50",
        size === "sm" && "text-xs px-2.5 py-1.5",
        size === "md" && "text-sm px-3 py-2",
        className
      )}
      aria-label={label}
    >
      <RefreshCw
        className={cn(
          size === "sm" ? "w-3 h-3" : "w-4 h-4",
          loading && "animate-spin"
        )}
      />
      {label}
    </button>
  );
}
