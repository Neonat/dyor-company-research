# DYOR2 — Design Brainstorm

## Context
A professional analyst tool for due diligence research. Users are business students, consultants, and analysts. The output is a structured brief that could be shown to enterprise clients like Star Alliance. The interface must feel serious, credible, and tool-like — not a marketing site.

---

<response>
<probability>0.07</probability>
<text>
## Idea A — Bloomberg Terminal Reborn

**Design Movement:** Financial data terminal meets modern SaaS. Think Bloomberg Terminal but with the harshness removed.

**Core Principles:**
1. Information density is a feature, not a bug — pack data tightly but with clear visual hierarchy
2. Monochromatic base with single accent color for status signals
3. Every element earns its place — no decorative chrome
4. Structured grids that mirror analyst spreadsheets

**Color Philosophy:** Near-black background (#0A0C10), off-white text (#E8EAF0), electric amber (#F5A623) as the single accent. Green/amber/red only for signal status. The darkness communicates seriousness; amber references financial terminals.

**Layout Paradigm:** Left-rail stage navigator (fixed, always visible). Main content area uses a two-column split: primary content left, metadata/sources right. No centered hero sections.

**Signature Elements:**
- Monospace font for data values, IDs, and schema fields
- Thin horizontal rules as section separators (no cards with rounded corners)
- Status pills that look like exchange tickers

**Interaction Philosophy:** Every action has an immediate visual response. Loading states use skeleton bars, not spinners. Errors surface inline, not in modals.

**Animation:** Minimal — 150ms fade-ins only. Data should feel like it "loads in" from top to bottom, not "pops in."

**Typography System:** IBM Plex Mono for data/labels, IBM Plex Sans for body. No display font needed — the data IS the display.
</text>
</response>

<response>
<probability>0.06</probability>
<text>
## Idea B — Brutalist Research Workbench

**Design Movement:** Swiss International Typographic Style meets brutalist web. Inspired by academic journals and research tools like Notion + Are.na.

**Core Principles:**
1. Typography as structure — font size and weight carry all hierarchy
2. Raw, honest UI — borders are visible, grids are explicit
3. Asymmetric layouts that feel like a working document
4. Contrast through scale, not color

**Color Philosophy:** Pure white (#FFFFFF) background, near-black (#111111) text, one accent — a deep cobalt (#1B3A8C). Signal colors are the only other hues. The restraint communicates intellectual rigor.

**Layout Paradigm:** Top progress rail + full-width content sections stacked vertically. Stage content fills the viewport width with generous left margin for stage labels. No sidebar.

**Signature Elements:**
- Large stage numbers (01, 02, 03) in light gray as section anchors
- Thick left border on active/focus sections
- Tables with visible grid lines for structured data

**Interaction Philosophy:** Keyboard-first. Tab through fields, Enter to submit. Visual feedback through border color changes, not animations.

**Animation:** Essentially none — content slides in from bottom by 8px on load. Transitions are 100ms max.

**Typography System:** Syne for headings (geometric, distinctive), Inter for body. Stage numbers in Syne Extra Bold at 120px opacity-10 as background texture.
</text>
</response>

<response>
<probability>0.08</probability>
<text>
## Idea C — Precision Instrument (CHOSEN)

**Design Movement:** Scientific instrument UI meets premium B2B SaaS. Think Figma's interface language applied to an analyst tool.

**Core Principles:**
1. Light, airy base with deep ink text — readable for long sessions
2. Structured pipeline visualization — the 5 stages are always visible and oriented
3. Color is functional: green/amber/red for signals, blue for actions, gray for inactive
4. Cards as the primary container unit — each data object lives in its own bounded space

**Color Philosophy:** Warm white background (#FAFAF8), near-black ink (#1A1A2E), primary blue (#2563EB), signal colors (emerald/amber/red). The warmth prevents eye strain; the blue anchors trust and professionalism.

**Layout Paradigm:** Horizontal stage progress bar pinned to top. Full-width content below with max-width constraint (1100px). Two-column layout on synthesis/problems pages (main content + sidebar metadata). Single column on intake/export.

**Signature Elements:**
- Stage progress bar with numbered nodes connected by lines
- Signal cards with left-border color coding (not just a pill)
- Journey map as a horizontal stepper with status-colored nodes

**Interaction Philosophy:** Progressive disclosure — each stage unlocks the next. Disabled states are clearly communicated. Regenerate buttons are always visible but secondary.

**Animation:** Entrance animations on card groups (stagger 40ms, translateY 12px → 0, 200ms ease-out). Loading skeletons pulse. Stage transitions slide content in from right.

**Typography System:** Outfit for headings (modern, clean, slightly geometric), Inter for body text. Monospace (JetBrains Mono) for IDs, JSON snippets, and source URLs.
</text>
</response>

---

## Selected: Idea C — Precision Instrument

Warm white (#FAFAF8) background, deep ink (#1A1A2E), primary blue (#2563EB), signal colors. Outfit + Inter + JetBrains Mono typography. Horizontal stage progress bar. Card-based data display with left-border signal coding.
