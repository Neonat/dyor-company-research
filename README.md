# DYOR — company research to problem briefs

DYOR is a private prototype that turns a company name and analyst role into a
research brief: public sources, customer-experience signals, scoped problem
statements, and exportable recommendations. It combines a React interface with
Claude-backed generation through Manus/Forge, Exa search, and a source-review
checkpoint.

**Project context:** built for a past **Build Club hackathon**. This repository
preserves the hackathon prototype and subsequent development iterations.

## Engineering decisions

The hackathon prototype was built with **Manus-assisted implementation**. Its
history preserves both implementation checkpoints and subsequent fixes to
structured problem generation and model-response handling.

The prototype explores three practical design decisions:

- **A source-review checkpoint:** analysts can inspect and choose sources before
  synthesis. Initial results arrive approved, so the review step still requires
  deliberate analyst judgement.
- **Structured problem cards:** model output is parsed into a consistent UI
  contract for filtering and shortlisting. The documented `[Test]` fallback makes
  the distinction between sample output and research evidence important.
- **A brief that can be shared:** PDF printing, Gamma deck generation and an
  editable Canva outline support different presentation workflows.

The [prototype limits](#prototype-limits) record the current storage, source
credibility and integration boundaries.

## Workflow

The interface has six screens, including the review checkpoint:

| Screen            | Implemented behaviour                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Intake**        | Enter a company and analyst role; generate a baseline company brief from model knowledge.                                                         |
| **Research**      | Generate 4–6 editable search queries, run them through Exa, and deduplicate source URLs.                                                          |
| **Source review** | Keep, reject or remove sources before synthesis; at least three approved sources are required by the UI. Results initially arrive approved.       |
| **Synthesis**     | Turn approved sources into a green/amber/red CX signal scorecard, key tensions and prioritised analyst actions.                                   |
| **Problems**      | Generate 3–7 problem cards with source references, journey steps, difficulty, tags and solution directions; filter by tag and shortlist problems. |
| **Export**        | Print a brief to PDF, request a Gamma deck, or copy an editable presentation outline for Canva.                                                   |

PDF export uses the browser print dialog and includes the scorecard, up to three
shortlisted problems (or the first three), and approved sources. Gamma generation
has a server route and requires a key entered in the export dialog. The Canva
option currently copies an outline; it does not create a Canva deck through OAuth
or the Canva API.

## Runtime and setup

Use **Node.js 22.13+** and the repository's pinned **pnpm 10.4.1**. The pnpm
configuration includes a Wouter patch and a dependency override, so retain
`pnpm-lock.yaml` and `patches/` when installing.

```bash
git clone https://github.com/Neonat/dyor-company-research.git
cd dyor-company-research
pnpm install --frozen-lockfile --ignore-scripts
# Configure a git-ignored .env at the repository root; see below.
pnpm dev
```

The development command starts `server/_core/index.ts`, which serves the Vite
client and `/api/trpc` from one Express process. The default port is **3000**;
if busy, the server tries the next 19 ports and prints the selected URL.

The landing screen asks for an Exa key before opening the workflow. Model-backed
stages need the Manus/Forge configuration below. This is a connected prototype;
there is no complete offline research mode.

| Configuration                                                            | Used by the active application                                                                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BUILT_IN_FORGE_API_KEY`                                                 | Server-side Manus/Forge credential for model calls and stored artwork.                                                                           |
| `BUILT_IN_FORGE_API_URL`                                                 | Forge base URL. Model calls default to `https://forge.manus.im` when omitted; `/manus-storage/*` artwork also requires this variable explicitly. |
| Exa key entered in the UI                                                | Sent to `dyor.runExaSearch` per request; also retained in browser local storage.                                                                 |
| Gamma key entered in the export dialog                                   | Optional, sent to `dyor.generateGammaDeck` per request.                                                                                          |
| `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, `JWT_SECRET` | Manus OAuth/session scaffolding, when using authentication.                                                                                      |
| `DATABASE_URL`, `OWNER_OPEN_ID`                                          | Optional MySQL/Drizzle user and owner-role scaffolding; analysis sessions currently live in browser storage.                                     |
| `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`                   | Optional inherited analytics script configuration.                                                                                               |
| `PORT`                                                                   | Optional preferred server port, default `3000`.                                                                                                  |

The current screens call the tRPC procedures in
[`server/routers.ts`](server/routers.ts). The alternate proxy implementations in
[`api/proxy.ts`](api/proxy.ts), [`server/index.ts`](server/index.ts), and
[`client/src/api/`](client/src/api/) are retained development code; they are not
the entry point selected by the package scripts. Their `ANTHROPIC_API_KEY`,
`EXA_API_KEY`, `GAMMA_API_KEY` and `CANVA_API_KEY` environment variables should not
be confused with the active configuration above. The model helper reads
`BUILT_IN_FORGE_API_KEY`, despite an inherited missing-key error mentioning
`OPENAI_API_KEY`.

## Checks and production build

```bash
pnpm check                  # TypeScript, no output files
pnpm test                   # Eight existing offline Vitest checks
pnpm build                  # Vite client + Express bundle in dist/
pnpm start                  # Serve the built application
```

The eight existing checks cover procedure/schema behaviour and logout. They mock
LLM responses and do not validate live Exa/Gamma requests,
provider compatibility, or a complete browser journey. `pnpm format` rewrites
repository formatting. `pnpm db:push` generates and applies MySQL migrations for
the inherited user database; it is separate from the browser-based analysis
workflow.

## Prototype limits

- Analysis state and the Exa key persist in browser `localStorage`; there is no
  server-side project library or cross-device analysis sync.
- Source credibility labels are domain-list heuristics. The intake brief is
  model-generated; source review and generated citations still need analyst
  judgement.
- The problem parser can return an explicitly labelled `[Test]` fallback when
  model output cannot be parsed. The Problems screen also contains a debug
  shortcut that loads sample problems, so sample output is not research evidence.
- The DYOR procedures are public tRPC procedures. The inherited OAuth scaffolding
  does not restrict access to these pipeline operations.
- PDF, Gamma and Canva-outline paths exist in code; live provider generation and
  deployment behaviour need separate integration validation.

## Repository guide

| Location                                                                                                    | Purpose                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [`client/src/App.tsx`](client/src/App.tsx) and [`pages/`](client/src/pages/)                                | Landing screen and six-screen workflow.                                                                                                       |
| [`client/src/store/`](client/src/store/)                                                                    | Reducer contracts, source approvals, shortlist and local persistence.                                                                         |
| [`server/routers.ts`](server/routers.ts)                                                                    | Intake, search, synthesis, problems, logo lookup and Gamma procedures.                                                                        |
| [`server/_core/`](server/_core/)                                                                            | Express/Vite host, LLM transport, storage proxy and Manus OAuth scaffolding.                                                                  |
| [`shared/types.ts`](shared/types.ts)                                                                        | Shared research and report types.                                                                                                             |
| [`server/dyor.test.ts`](server/dyor.test.ts) and [`server/auth.logout.test.ts`](server/auth.logout.test.ts) | Existing offline tests.                                                                                                                       |
| [`docs/manus-template.md`](docs/manus-template.md)                                                          | Original Manus starter README, preserved unchanged as historical developer reference; its generic guidance is not a feature-status checklist. |
| [`todo.md`](todo.md)                                                                                        | Development notes and recorded implementation checklist.                                                                                      |
