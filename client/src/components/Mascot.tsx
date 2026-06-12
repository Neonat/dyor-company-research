import React from "react";

const MASCOT_URLS = {
  loading: "/manus-storage/mascot-loading_9894d5a8.png",
  empty:   "/manus-storage/mascot-empty_a9e5291d.png",
  success: "/manus-storage/mascot-success_c580e87e.png",
  error:   "/manus-storage/mascot-error_ec243ec0.png",
} as const;

const DEFAULT_CAPTIONS: Record<keyof typeof MASCOT_URLS, string> = {
  loading: "Digging through the data…",
  empty:   "Nothing here yet. Let's start researching.",
  success: "Research complete!",
  error:   "Something went wrong. Let's try again.",
};

interface MascotProps {
  state: keyof typeof MASCOT_URLS;
  caption?: string;
  size?: number;
  className?: string;
}

export default function Mascot({ state, caption, size = 120, className = "" }: MascotProps) {
  return (
    <div className={`mascot-container ${className}`}>
      <img
        src={MASCOT_URLS[state]}
        alt={`DYOR mascot — ${state}`}
        width={size}
        height={size}
        className={state === "loading" ? "mascot-loading" : ""}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      <p className="mascot-caption">{caption ?? DEFAULT_CAPTIONS[state]}</p>
    </div>
  );
}
