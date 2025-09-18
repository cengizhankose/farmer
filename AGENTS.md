# Repository Guidelines

> Repository scan: 2025-09-18. This document now reflects both the target guidelines and the current state of the repo, highlighting gaps and next actions.

## Project Structure & Module Organization
- apps/web: Next.js (15.x) + TypeScript app using Pages Router
  - Pages: `/` (landing), `/opportunities`, `/opportunities/[id]`, `/portfolio` (present)
  - Contexts: `contexts/WalletContext.tsx` (Leather wallet, network guard) (present)
  - UI: `components/Layout.tsx`, lightweight primitives under `components/ui/primitives.tsx` (present)
  - Components: rich set under `components/*` including opportunities, portfolio, hero, charts (present)
  - Lib: `lib/mock.ts` (typed demo data), `lib/adapters/{alex,arkadiko}.ts`, `lib/normalize/{apr,risk}.ts`, plus `lib/{utils,format,ui,colors,logos,csv}.ts` (present)
  - Hooks: `hooks/useSlowScroll.ts` (present)
  - Styles: `styles/globals.css` (Tailwind with design tokens), `tailwind.config.js` (present)
  - Config: `next.config.js` (Unsplash remote patterns), `.eslintrc.json`, `tsconfig.json` (present)
- scripts: Operational helpers (`setup_hackathon.sh`, `create_issues.sh`) (present)
- contracts: Router contract (Stacks-first; e.g., `Router.clar`) and unit tests. (not present yet)
- packages/shared: Shared `types/` and `utils/`. (not present yet)

## Build, Test, and Development Commands
- Frontend: `cd apps/web && npm i && npm run dev` (local dev), `npm run build` (production).
  - Lint: `npm run lint` (ESLint, Next 15). ESLint config is at `apps/web/.eslintrc.json`.
  - Test: `npm run test` currently points to `jest` but Jest/RTL are not installed; see Testing section for setup TODOs.
- Contracts (Stacks/Clarity): planned at `contracts/` — not present yet. Target commands: `clarinet check`, `clarinet test`. If EVM later, prefer Foundry (`forge build`, `forge test`).
- Scripts: `./scripts/setup_hackathon.sh` (labels/milestones), `./scripts/create_issues.sh` (issue seeds). Requires `gh` and `jq`.

## Coding Style & Naming Conventions
- TypeScript/React: 2-space indent, Prettier + ESLint (recommended rules). Components `PascalCase`, hooks `useCamelCase`, files `kebab-case.ts(x)`. Routes follow Next.js file routing.
- Modules: Adapters in `lib/adapters/*`, normalization helpers in `lib/normalize/*` (present). Shared domain types in `packages/shared` (planned).
- Clarity: small, single-purpose public functions; event names `PascalCase` and parameters `camelCase`. (planned with contracts)

## Frontend Stack Notes
- Next.js 15 with TypeScript. Pages Router in use (matches guidelines).
- TailwindCSS with design tokens (CSS variables) mapped in `tailwind.config.js`.
- Leather wallet integration; network mismatch banner shown in `Layout.tsx` via `ChainGuardBanner`. Default UX is read-only on mismatch.
- Next/Image configured for Unsplash in `next.config.js` (remotePatterns).
- Data cards display `source` and `lastUpdated` (see `OpportunityCard.tsx`).
- Env vars: use `NEXT_PUBLIC_*` for client-side. (no env file committed, as expected)

## Testing
- Current state: No test files detected under `apps/web`. `npm run test` references `jest` but Jest/RTL are not installed in `devDependencies`.
- Frontend plan: Add Jest or Vitest + React Testing Library. Place tests as `*.test.ts(x)` near source or under `__tests__/`.
  - Suggested first tests: `lib/normalize/{apr,risk}.test.ts`, adapters `lib/adapters/*.test.ts`, and core flows (connect wallet, opportunities list/detail render, portfolio state rendering).
- Contracts plan: When `contracts/` is added, cover `pause`, `allowlist`, `minOut`, `perTxCap`, and event emissions with Clarinet tests.

## Commit & Pull Request Guidelines
- Commits: Imperative mood, concise scope prefix mirroring issues: `[FE]`, `[BE]`, `[DATA]`, `[DOCS]` (e.g., `[FE] Add portfolio table`). Reference issues with `#123` when applicable.
- PRs: Clear description, linked issues, screenshots for UI changes, and testnet explorer links for contract flows. Include checklist: build passes, tests updated, security notes (if router/tx paths touched).

## Security & Configuration Tips
- Contracts: Follow CEI pattern, keep `pausable`, `reentrancy` protections, and `perTxCap`. Log events for deposits. (planned)
- Frontend: Show data `source` and `lastUpdated` (present); display NFA/BETA banners (present on Opportunities page). Default to read-only on wrong chain (present via network guard).
- Secrets: Use env files per app; never commit private keys or API tokens.

## Housekeeping
- `.gitignore` at repo root ignores `node_modules/`, `.next/`, builds, env files, and logs.
- Old CRA `frontend/` app was removed in favor of `apps/web`.

---

## Repo Scan Summary (current)
- Present: `apps/web` (Next 15 Pages Router), `scripts/` utilities, rich UI and mock data plumbing, Leather wallet with network guard, Unsplash image config, Tailwind tokens, ESLint config.
- Missing (planned): `contracts/` (Clarity router + tests), `packages/shared/` for shared types/utils, automated test setup in `apps/web`.
- Notable files: `CLAUDE.md`, `PRD.md`, `FE_Plan.md`, `FE_examples.md` (product and planning context).

## Action Items
- [FE][tests] Add Jest or Vitest + RTL; wire `npm run test` and create initial unit/component tests.
- [Contracts] Scaffold `contracts/` with Clarinet; add router and unit tests per Testing section.
- [Packages] Add `packages/shared` with shared domain types and helpers when contracts or multi-app needs arise.
