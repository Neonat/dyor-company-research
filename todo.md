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

## Pending / Future

- [ ] Exa API key: consider storing server-side per session instead of client localStorage
- [ ] Canva API integration (requires Canva API key + OAuth flow)
- [ ] Session history / saved analyses (requires DB schema extension)
- [ ] Share/export link for briefs
