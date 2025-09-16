# Repository Guidelines

## Project Structure & Module Organization
- apps/web: Next.js (15.x) + TypeScript app using Pages Router
  - Pages: `/` (landing), `/opportunities`, `/opportunities/[id]`, `/portfolio`
  - Contexts: `contexts/WalletContext.tsx` (Leather wallet, network guard)
  - UI: `components/Layout.tsx`, lightweight shadcn-like primitives under `components/ui/primitives.tsx`
  - Lib: `lib/mock.ts` (typed demo data), `lib/adapters/{alex,arkadiko}.ts`, `lib/normalize/{apr,risk}.ts`, `lib/utils.ts`
  - Styles: `styles/globals.css` (Tailwind with design tokens), `tailwind.config.js`
- contracts: Router contract (Stacks-first; e.g., `Router.clar`) and unit tests.
- packages/shared: Shared `types/` and `utils/`.
- scripts: Operational helpers (`setup_hackathon.sh`, `create_issues.sh`).

## Build, Test, and Development Commands
- Frontend: `cd apps/web && npm i && npm run dev` (local dev), `npm run build` (production).
  - Lint: `npm run lint` (ESLint, Next 15). ESLint config is at `apps/web/.eslintrc.json`.
- Contracts (Stacks/Clarity): `cd contracts && clarinet check` (lint/compile), `clarinet test` (unit tests). If EVM is introduced later, prefer Foundry (`forge build`, `forge test`).
- Scripts: `./scripts/setup_hackathon.sh` (labels/milestones), `./scripts/create_issues.sh` (issue seeds). Requires `gh` and `jq`.

## Coding Style & Naming Conventions
- TypeScript/React: 2-space indent, Prettier + ESLint (recommended rules). Components `PascalCase`, hooks `useCamelCase`, files `kebab-case.ts(x)`. Routes follow Next.js file routing.
- Modules: Adapters in `lib/adapters/*`, normalization helpers in `lib/normalize/*`, shared domain types in `packages/shared`.
- Clarity: small, single-purpose public functions; event names `PascalCase` and parameters `camelCase`.

## Frontend Stack Notes
- Next.js 15 with TypeScript. Pages Router (not App Router) to match guidelines.
- TailwindCSS with design tokens (CSS variables) mapped in `tailwind.config.js`.
- Leather wallet integration; shows network mismatch banner, read-only by default.
- Analytics badge removed; Next/Image configured for Unsplash in `next.config.js`.
- Env vars: use `NEXT_PUBLIC_*` for client-side.

## Testing Guidelines
- Contracts: Unit tests cover `pause`, `allowlist`, `minOut`, `perTxCap`, and event emissions. Aim for green tests before integration. Name tests by feature (e.g., `allowlist_test.ts` or Clarinet conventions).
- Frontend: Jest/Vitest + React Testing Library. Place tests as `*.test.ts(x)` near source or under `__tests__/`. Include adapters/normalizers and critical flows (connect wallet, list/detail, deposit CTA, portfolio state).

## Commit & Pull Request Guidelines
- Commits: Imperative mood, concise scope prefix mirroring issues: `[FE]`, `[BE]`, `[DATA]`, `[DOCS]` (e.g., `[FE] Add portfolio table`). Reference issues with `#123` when applicable.
- PRs: Clear description, linked issues, screenshots for UI changes, and testnet explorer links for contract flows. Include checklist: build passes, tests updated, security notes (if router/tx paths touched).

## Security & Configuration Tips
- Contracts: Follow CEI pattern, keep `pausable`, `reentrancy` protections, and `perTxCap`. Log events for deposits.
- Frontend: Show data `source` and `lastUpdated`; display NFA/BETA banners. Default to read-only on wrong chain.
- Secrets: Use env files per app; never commit private keys or API tokens.

## Housekeeping
- `.gitignore` at repo root ignores `node_modules/`, `.next/`, builds, env files, and logs.
- Old CRA `frontend/` app was removed in favor of `apps/web`.
