# DYOR

DYOR turns a company name and analyst role into a research brief with public sources, customer-experience signals, problem statements, and presentation material. It was a solo project for the Build Club hackathon in June 2026, built as an exploration with Manus-assisted implementation.

The name means "Do Your Own Research" and plays on Dior and luxury branding. The workflow puts source review between search and synthesis, then gives the analyst structured problem cards to inspect and shortlist.

[Workflow](#workflow) · [Stack and architecture](#stack-and-architecture) · [Run locally](#run-locally) · [Prototype limits](#prototype-limits)

## Workflow

| Screen | Implemented behaviour |
| --- | --- |
| Intake | Enter a company and analyst role. Generate a baseline company brief from model knowledge. |
| Research | Generate four to six editable queries, search with Exa, and deduplicate source URLs. |
| Source review | Keep, reject, or remove sources before synthesis. The UI requires at least three approved sources. |
| Synthesis | Generate a green, amber, and red CX scorecard, key tensions, and prioritised analyst actions. |
| Problems | Generate three to seven problem cards with evidence references, journey steps, difficulty, tags, and solution directions. Filter and shortlist them. |
| Export | Print a PDF brief, request a Gamma deck, or copy an editable outline for Canva. |

New research results arrive approved. The checkpoint therefore depends on the analyst reviewing them, rather than treating the default state as verification.

PDF export uses the browser's print dialog. It includes the scorecard, up to three shortlisted problems or the first three problems, and approved sources. Gamma has a server integration. The Canva option copies an outline for use in Canva's presentation builder; it does not create a deck through Canva OAuth or its API.

## Stack and architecture

The project explores a full-stack TypeScript workflow on the Manus starter. Its technologies have distinct roles:

| Technology | Role in DYOR |
| --- | --- |
| React 19, Wouter, Tailwind, and Radix UI | Build the staged interface, source cards, dialogs, filters, and export screens. |
| React context and a reducer | Keep source approvals, generated reports, and the shortlist in one browser state model. Persist analysis state in `localStorage`. |
| tRPC, Zod, and shared TypeScript types | Connect the page mutations to validated server procedures and typed research structures. |
| Express and Vite | Serve `/api/trpc` and the client from one development process. The production build bundles the server with esbuild. |
| Claude through Manus/Forge | Generate briefs, queries, synthesis, and structured problem output. The active helper requests `claude-haiku-4-5`. |
| Exa and Gamma | Retrieve public research sources and request presentation output. |
| Drizzle and MySQL | Support the inherited user database. They do not store the browser's research sessions. |

[server/routers.ts](server/routers.ts) contains the active research procedures. The model-response parser accepts several response shapes and has an explicitly labelled sample fallback. The original [Manus template guide](docs/manus-template.md) remains available as historical developer reference.

## Run locally

Use Node.js 22.13 or later and the pinned pnpm 10.4.1. Retain the lockfile and `patches/`; installation uses a Wouter patch and a dependency override.

```sh
git clone https://github.com/Neonat/dyor-company-research.git
cd dyor-company-research
pnpm install --frozen-lockfile --ignore-scripts
```

Create a git-ignored `.env` file at the repository root and set the server values below. Then start the app:

```sh
pnpm dev
```

Express starts at [localhost:3000](http://localhost:3000). If that port is occupied, it tries the next 19 ports and prints the selected URL. Enter an Exa key on the landing screen to open the workflow. Model-backed stages also require the Forge credential. There is no complete offline research mode.

## Configuration

| Value | Use |
| --- | --- |
| `BUILT_IN_FORGE_API_KEY` | Server credential for model calls and stored artwork. |
| `BUILT_IN_FORGE_API_URL` | Forge base URL. Model calls default to `https://forge.manus.im`; the `/manus-storage/*` artwork proxy requires an explicit URL. |
| Exa key entered in the UI | Sent with search requests and retained in browser `localStorage`. |
| Gamma key entered in the export dialog | Optional credential sent with deck requests. |
| `PORT` | Preferred server port, default `3000`. |
| `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, `JWT_SECRET` | Inherited Manus OAuth and session configuration. |
| `DATABASE_URL`, `OWNER_OPEN_ID` | Optional inherited MySQL user and owner-role configuration. |
| `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID` | Optional inherited analytics configuration. |

The separate [api/proxy.ts](api/proxy.ts) reads `ANTHROPIC_API_KEY`, `EXA_API_KEY`, `GAMMA_API_KEY`, and `CANVA_API_KEY`. Those variables do not configure the active tRPC workflow. The active model helper reads `BUILT_IN_FORGE_API_KEY`.

## Checks and production build

```sh
pnpm check
pnpm test
pnpm build
pnpm start
```

The commands run TypeScript checks, offline Vitest tests, a client and server build into `dist/`, and the built server. Tests cover procedure contracts, logout, and missing model credentials with mocked provider responses. They do not validate live Exa or Gamma requests or the full browser journey.

`pnpm format` rewrites repository formatting. `pnpm db:push` generates and applies MySQL migrations for the inherited user database. It is separate from browser analysis storage.

## Repository guide

| Location | Responsibility |
| --- | --- |
| [client/src/pages/](client/src/pages/) | Landing page and research workflow |
| [client/src/store/](client/src/store/) | State contracts, source approval, shortlist, and local persistence |
| [server/routers.ts](server/routers.ts) | Research, logo lookup, and Gamma procedures |
| [server/_core/](server/_core/) | Express host, model transport, storage proxy, and Manus OAuth |
| [shared/types.ts](shared/types.ts) | Shared research and report types |
| [server/dyor.test.ts](server/dyor.test.ts) and [server/_core/llm.test.ts](server/_core/llm.test.ts) | Research and credential regression tests |
| [todo.md](todo.md) | Recorded development checklist |

When changing generated output, check the parser, shared types, and consuming screen together. Preserve evidence references and the distinction between sample output and research.

## Prototype limits

- Analysis and the Exa key stay in browser `localStorage`. The app has no server-side research library or cross-device sync.
- Source credibility labels use domain-list heuristics. The intake brief comes from model knowledge, and generated citations require analyst judgement.
- Unparseable problem output can produce a labelled `[Test]` fallback. A Problems-screen shortcut also loads sample problems. Neither is research evidence.
- Research procedures use public tRPC procedures. Inherited OAuth does not restrict access to those operations.
- Live provider compatibility and deployment behaviour need separate integration validation. The build retains analytics-placeholder and bundle-size warnings.

## License

[package.json](package.json) declares MIT. A standalone project `LICENSE` file is not included. The Manus starter and third-party packages retain their respective notices.
