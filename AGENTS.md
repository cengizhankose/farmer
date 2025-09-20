# Repository Guidelines

## Project Structure & Module Organization
Keep user-facing code inside `apps/web`. Pages live under `pages/` (e.g., `opportunities`, `opportunities/[id]`, `portfolio`), shared UI sits in `components/`, and data transforms remain in `lib/adapters/` and `lib/normalize/`. Smart contracts and Clarinet tests reside in `contracts/`. Reusable domain types and utilities belong in `packages/shared`. Operational scripts, including `setup_hackathon.sh` and `create_issues.sh`, are in `scripts/`. Store any new test fixtures alongside the feature they exercise.

## Build, Test, and Development Commands
Run `cd apps/web && npm install` once, then `npm run dev` for local development and `npm run build` to produce a production bundle. Execute UI and adapter tests with `npm test`. For Clarity contracts, use `cd contracts && clarinet check` before committing and `clarinet test` for unit coverage. Script helpers run via `./scripts/<name>.sh`; most require `gh` and `jq` in your PATH.

## Coding Style & Naming Conventions
TypeScript follows a 2-space indent with Prettier (`npm run lint` / `npm run format`) enforcing the rule set shared through `eslint.config.mjs` and `prettier.config.cjs`. Components use `PascalCase`, hooks use `useCamelCase`, and files prefer `kebab-case.ts(x)`. Clarinet contracts favour single-purpose public entry points, `PascalCase` events, and `camelCase` parameters. Keep all persisted language (code, comments, docs) in English.

## Testing Guidelines
Mirror existing patterns by naming files `*.test.ts(x)` or using Clarinet conventions such as `allowlist_test.ts`. Focus frontend coverage on wallet connection, listing/detail flows, deposit CTAs, and portfolio state. Contract suites must assert `pause`, `allowlist`, `minOut`, `perTxCap`, and event emissions before merge.

## Commit & Pull Request Guidelines
Write commits in imperative mood with scope prefixes like `[FE]`, `[BE]`, `[DATA]`, or `[DOCS]` (e.g., `[FE] Add portfolio table`) and reference issues using `#123` when relevant. PRs need a concise summary, links to tickets, screenshots for UI updates, and explorer URLs for contract work. Confirm builds and tests pass, flag security-sensitive changes, and translate any non-English discussion into an English note.

## Security & Configuration Tips
Adhere to CEI patterns, retain `pausable` and reentrancy guards, and log deposit events in router logic. Frontend surfaces must show data sources and last-updated timestamps, default to read-only if the wallet sits on the wrong chain, and avoid committing secrets—use environment-specific `.env` files instead.
