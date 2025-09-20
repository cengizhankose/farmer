# sBTC Integration Implementation Plan

## Current State Snapshot
- `packages/contracts/yield-router/contracts/router.clar` implements pause, per-tx-cap, and protocol allowlisting but only prints deposit attempts; no token transfers or adapter trait exist yet.
- `packages/contracts/yield-router/tests/router.test.ts` covers ownership, pause, cap, and allowlisting, without exercising SIP-010 flows or downstream adapters.
- `apps/web` already hosts a rich Next.js experience with a wallet context (`apps/web/contexts/WalletContext.tsx`) and a disabled router toggle in `components/opportunity/DepositCalculator.tsx`, but there is no contract call plumbing.
- Shared types (`packages/shared/src/types.ts`) and adapter scaffolding (`apps/web/lib/adapters`) target multi-chain data, yet protocol-specific router bindings and sBTC awareness are missing.

## Hackathon Objectives
1. Ship a Clarinet-backed router that can safely forward sBTC (SIP-010) deposits to protocol adapters via a common trait.
2. Provide a working mock adapter plus unit tests that prove `pause`, `allowlist`, `perTxCap`, `min-out`, and event emissions.
3. Wire a Next.js flow using Stacks.js/Hiro that lets testnet users connect, craft `route-deposit` calls with post-conditions, and surface transaction state.
4. Prep deployment/testnet demo scripts and UX guardrails (NFA banner, data provenance, wrong-chain handling).

## Phase Checklist
- [x] **Phase 1 – Environment & Tooling**
  - Ensure Clarinet is available (e.g., `brew install clarinet && clarinet --version`) and add installation steps to `README.md` if gaps remain.
  - Standardise workspace scripts:
    - Contracts: `pnpm --filter @contracts/yield-router clarinet:test` wrapping `clarinet test`.
    - Frontend: `pnpm --filter @apps/web dev`, `pnpm --filter @apps/web lint`, and a new `pnpm --filter @apps/web stacks:prepare` script to install Hiro SDKs when needed.
  - Capture environment templates:
    - Create `packages/contracts/yield-router/.env.example` if adapters require configuration.
    - Update `apps/web/.env.local.example` with placeholders for router/sBTC contract IDs and network (e.g., `NEXT_PUBLIC_ROUTER_ADDRESS`).

- [x] **Phase 2 – Router Contract Upgrade**
  - Expand `allowed-protocols` in `router.clar` to persist `{ target: principal, adapter: principal, token: principal }`, exposing read-only helpers for UI introspection.
  - Introduce traits for adapters and SIP-010 tokens and require downstream contracts to implement `deposit` returning `(response (tuple (out uint)) uint)`.
  - Implement SIP-010 transfer flow:
    - Accept trait references and move funds via `(contract-call? token transfer amount tx-sender adapter-principal none)`; bubble explicit error codes (`u300`, `u301`).
    - Invoke `(contract-call? adapter deposit amount tx-sender)` and `asserts!` the returned `out` satisfies `min-out`.
  - Emit structured events (`protocol-registered`, `route-deposit`, `adapter-error`) including sender, adapter, target, token, amount, and slippage context for downstream analytics.
  - Add owner-only setters for `per-tx-cap` (now `set-tx-cap`).
  - Document contract invariants in `docs/router-contract.md` and keep comments concise per repository style.

- [x] **Phase 3 – Adapter & sBTC Integration**
  - Scaffolded `packages/contracts/yield-router/contracts/adapters/mock-stacking.clar` implementing the shared `yield-adapter` trait with deterministic fee logic.
  - Captured the SIP-010 asset alongside each protocol in `allowed-protocols`, enabling `get-protocol-token` for frontend discovery.
  - Extended Clarinet configuration (`Clarinet.toml`) and the default deployment plan to load the mock stacking adapter and mock sBTC token for simnet.
  - Kept the mock token contract as the default sBTC reference; README/plan updates will guide real sBTC integration when available.

- [x] **Phase 4 – Automated Testing & QA**
  - Expanded `tests/router.test.ts` to cover: happy path SIP-010 transfers, paused/allowlist/cap/amount failures, adapter and token mismatches, bubbled adapter errors, `min-out` enforcement, and protocol metadata helpers.
  - Added Clarinet scripts under `tests/contracts/` to sanity check rejection scenarios when extending coverage with Clarinet CLI.
  - Routinely run `pnpm contracts:clarinet:check` and `pnpm --filter @contracts/core test` to keep the suite green; integrate into CI once available.

- [ ] **Phase 5 – Frontend Integration (Next.js + Stacks.js)**
  - Install `@stacks/connect`, `@stacks/transactions`, and `@stacks/network` inside `apps/web`.
  - Extend `WalletContext` to expose `openContractCall` helpers or a transaction service module under `apps/web/lib/stacks/`.
  - Create `apps/web/lib/stacks/router.ts` exporting `buildRouteDepositTx` that maps opportunity data to contract arguments, attaches fungible post-conditions via `createFungiblePostCondition`, and references env-driven contract IDs.
  - Update `DepositCalculator` (router mode) to:
    - Require wallet connection; reuse `useWallet` for address gating and wrong-chain messaging.
    - Validate against `get-tx-cap` and show warnings when `paused` or protocol not allowlisted (fetch via a lightweight API route calling contract read-only endpoints).
    - Call `openContractCall` with `functionArgs: [standardPrincipalCV(token), uintCV(amount), uintCV(protocolId), uintCV(minOut)]` and display the resulting txid in the toast/success UI.
  - Add UI cues per repository guidelines: NFA/BETA banner, data source/last-updated tags, and read-only fallback when on the wrong chain.
  - Consider adding a portfolio poller that listens for completed router events (mock via API until indexer integration is ready).

- [ ] **Phase 6 – Deployment & Demo Readiness**
  - Scripts:
    - `packages/contracts/yield-router/scripts/deploy-testnet.sh` that runs `clarinet check`, prompts for private key, and broadcasts to testnet.
    - `apps/web/scripts/seed-demo.ts` seeding mock positions for the portfolio view unless router events are available.
  - Create a `docs/demo-runbook.md` explaining how to mint/get testnet sBTC, connect wallet, run the deposit flow, and showcase explorer links.
  - Capture explorer URLs and screenshots for the eventual PR checklist (`docs/demo-assets/`).
  - Ensure `.env.production` secrets remain excluded; update `.gitignore` if new files are introduced.

## Milestones & Timeline (3–4 Day Hackathon Sprint)
- **Day 0–1:** Tooling confirmation, contract refactor, mock adapter scaffolding, baseline tests green.
- **Day 2:** sBTC wiring, advanced test coverage, Clarinet console manual QA.
- **Day 3:** Next.js transaction flow, wallet UX polish, testnet deploy dry run.
- **Day 4 (buffer):** Bug fixes, demo rehearsal, documentation consolidation.

## Risks & Mitigations
- **SIP-010 incompatibility:** Validate token interface early on devnet; maintain a mock contract fallback for demos.
- **Wallet provider variance:** Leather/Hiro may return different address shapes; keep defensive parsing in `WalletContext` and log analytics for failures.
- **Post-condition mismatches:** Surface human-readable errors when transfer amounts deviate; add unit tests for post-condition assembly.
- **Time constraints:** Focus on a single adapter + sBTC path first; document extension points for additional protocols after the hackathon.

---
Referenced Docs: [Clarinet](https://docs.hiro.so/tools/clarinet), [sBTC token spec](https://docs.stacks.co/concepts/sbtc/clarity-contracts/sbtc-token), [Stacks.js SDK](https://www.hiro.so/stacks-js), [Stacks Post-conditions explainer](https://dev.to/stacks/understanding-stacks-post-conditions-e65).
