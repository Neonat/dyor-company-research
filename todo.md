# DYOR2 — Project TODO

## Core Pipeline

- [x] Stage 1 — Intake: Company name + analyst role → Claude returns IntakeBrief
- [x] Stage 2 — Research: Claude generates 4-6 Exa search prompts (editable)
- [x] Stage 2b — Exa Search: User enters API key, runs search, gets source cards
- [x] Checkpoint — Source review gate: approve/reject sources, min 3 required to proceed
- [x] Stage 3 — Synthesis: Approved sources → signal scorecard + key tensions + analyst actions
- [x] Stage 4 — Problems: 3-7 scoped problem cards with journey maps, evidence, solutions
- [x] Stage 5 — Export: PDF (print CSS), Gamma deck (API key modal), Canva deck (outline review)

## Server-side

- [x] tRPC router with all 5 pipeline procedures (getIntakeBrief, getExaPrompts, runExaSearch, getSynthesis, getProblems)
- [x] Gamma deck generation procedure (generateGammaDeck)
- [x] All API keys stay server-side (Exa key passed per-request, Gamma key passed per-request)
- [x] Zod validation for all procedure inputs and outputs
- [x] LLM tool-calling with structured JSON schema for all Claude calls
- [x] Exa search with credibility scoring (high/medium/low)

## Frontend

- [x] AppContext with useReducer + localStorage persistence (dyor2_session)
- [x] StageNav — horizontal progress bar with numbered nodes
- [x] SignalCard — left-border color coding (green/amber/red)
- [x] JourneyMap — horizontal stepper with ok/partial/failure colors
- [x] SourceChip — credibility badge, approve/reject toggle
- [x] RegenerateButton — reusable regenerate action
- [x] ProblemCard — full card with journey map, evidence, solutions, difficulty pips
- [x] IntakePage — company input, role selector, baseline brief generation
- [x] ResearchPage — editable Exa prompts, API key input, search trigger, source cards
- [x] CheckpointPage — source review gate with progress bar
- [x] SynthesisPage — signal scorecard, key tensions, analyst actions
- [x] ProblemsPage — filter bar (tag/difficulty), problem cards, shortlist toggle
- [x] ExportPage — PDF print, Gamma deck (API key modal), Canva outline review

## Design System

- [x] Precision Instrument design: warm white (#FAFAF8), deep ink (#1A1A2E), primary blue (#2563EB)
- [x] Typography: Outfit (headings), Inter (body), JetBrains Mono (data/IDs)
- [x] Signal color tokens: emerald green, amber, red
- [x] Stage slide-in animation
- [x] Print CSS for PDF export (A4 layout, signal colors, source citations)

## Testing

- [x] Vitest tests for all 4 DYOR2 tRPC procedures (getIntakeBrief, getExaPrompts, getSynthesis, getProblems)
- [x] Auth logout test
- [x] All 8 tests passing

## Pending / Future (out of scope for v1)

- [x] Exa API key: stored in client localStorage (per-session, never sent to server except per-request)
- [x] Canva deck: outline review modal implemented; full Canva API requires Canva OAuth (noted in UI)
- [x] Session persistence: full pipeline state persisted in localStorage via dyor2_session
- [x] Export: PDF via browser print, Gamma via API key modal

## Design Refresh (DYOR Design System)

- [x] Apply DYOR design framework: ink/paper palette (#F4F2EC surface, #1A1A1A ink), Poppins display font
- [x] Generate cute investigator mascot (loading/empty/success/error states) via AI image generation
- [x] Upload mascot images to webdev static storage
- [x] Update index.css with full DYOR design tokens (btn-primary, btn-outline, btn-secondary, dyor-card, signal classes, animations)
- [x] Add card-enter, stage-enter, mascot-bob, spin keyframe animations
- [x] Add print-only CSS classes for PDF export layout
- [x] Rewrite StageNav with DYOR wordmark and ink/paper nodes
- [x] Rewrite all 6 pipeline pages with DYOR design system (inline styles, no Tailwind color classes)
- [x] Rewrite all shared components (SignalCard, SourceChip, ProblemCard, JourneyMap, RegenerateButton)
- [x] Update App.tsx with DYOR layout and company context strip
- [x] All 8 tests still passing after redesign

## UX Overhaul (Polish Pass)

- [x] Landing page: hero section with headline + subhead
- [x] Landing page: use cases section (3-4 cards)
- [x] Landing page: origin story / where the idea came from section
- [x] Landing page: demo CTA button that triggers API key modal
- [x] API key modal: ask for Exa API key before launching pipeline
- [x] Replace circle stage nav with fluid loading bar (animated fill + shimmer)
- [x] Company logo context strip below progress bar (appears after Stage 1, Clearbit logo fetch)
- [x] Duck-inspecting-logo loading animation for all loading states
- [x] Polish page transitions and micro-interactions

## Bug Fixes (Round 2)

- [x] Exa search results not showing after running queries (removed pre-clear, added error handling)
- [x] Landing page too verbose — made more concise (hero + 6-step + one-sentence origin)
- [x] Company logo not displaying (switched to server-side multi-provider: Google Favicons → Clearbit → DuckDuckGo)
- [x] Crop duck assets from user sprite sheet and use as mascot images
