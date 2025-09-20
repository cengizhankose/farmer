# Router Contract and Mock Environment Guide

This document explains how the Clarity contracts under `packages/contracts/yield-router` work, how the mock environment is wired together, and how to run the available test suites. It also highlights the steps required to migrate from mock values to production deployments.

## Contract Overview

### `router.clar`
- **Location:** `packages/contracts/yield-router/contracts/router.clar`
- **Purpose:** Routes SIP-010 assets (e.g., sBTC) to allowlisted protocol adapters with configurable safety checks.
- **Key state:**
  - `owner`, `paused`, and `per-tx-cap` control governance and safety switches.
  - `allowed-protocols` maps numeric protocol IDs to `{ target, adapter, token }` principals so that each deposit validates the expected adapter contract and token contract.
- **Public entrypoints:**
  - `set-paused`, `set-tx-cap`, and `allow-protocol` are owner-only configuration methods that emit `protocol-registered` events.
  - `route-deposit` verifies the protocol configuration, moves SIP-010 tokens via `transfer`, calls `adapter.deposit`, asserts the returned `out` value meets `min-out`, and emits either `route-deposit` (success) or `adapter-error` (failure).
- **Traits:**
  - `yield-adapter` trait standardises the downstream adapter interface.
  - `sip10-token` trait defines the subset of SIP-010 functions the router requires.

### `mock-adapter.clar`
- **Location:** `packages/contracts/yield-router/contracts/mock-adapter.clar`
- **Purpose:** Implements `yield-adapter` for tests. Exposes `set-failure` and `set-skim-ratio` so tests can simulate adapter errors and slippage.
- **Behaviour:** Returns `{out: adjusted}` where `adjusted = amount - (amount * skim-ratio / 100)`. When `should-fail` is `true` it returns `(err u900)` to force the router into the adapter-error path.

### `mock-token.clar`
- **Location:** `packages/contracts/yield-router/contracts/mock-token.clar`
- **Purpose:** Implements the `sip10-token` trait with a minimal `mint` and `transfer` surface to mimic an sBTC-like token. Balances are stored in a simple map keyed by principal.
- **Usage:** Tests mint balances for simnet accounts before calling `route-deposit`.

### `adapters/mock-stacking.clar`
- **Location:** `packages/contracts/yield-router/contracts/adapters/mock-stacking.clar`
- **Purpose:** Example adapter that charges a fixed 5% fee. Used to validate adapter identity checks and as a template for building real adapters.

## Simnet Deployment Plan

The Clarinet deployment plan (`packages/contracts/yield-router/deployments/default.simnet-plan.yaml`) publishes the router, mock adapter, mock stacking adapter, and mock token into simnet so the console, tests, and Vitest environment share identical assumptions. If you add or rename contracts update this plan to match.

## Testing Options

### TypeScript / Vitest Suite
- **Command:** `pnpm --filter @contracts/core test`
- **Coverage:** The suite in `packages/contracts/yield-router/tests/router.test.ts` exercises:
  - Happy path routing with SIP-010 transfers.
  - Owner-only guardrails (`set-paused`, `allow-protocol`).
  - Failure cases for paused state, missing allowlist, zero amount, and per-call cap.
  - Adapter/token mismatches, bubbled adapter errors (err u301), and `min-out` enforcement (err u302).
  - Helper views (`get-protocol-config`, `get-protocol-token`).
- **Mocks:** Uses `mock-token` to mint balances and toggles `mock-adapter` flags to simulate downstream behaviour.

### Clarinet Check
- **Command:** `pnpm contracts:clarinet:check`
- **Purpose:** Verifies all Clarity contracts compile and the deployment plan is consistent.

### Clarinet Console / Manual Scripts
- **Console:** `cd packages/contracts/yield-router && clarinet console`
  - Register a protocol: `(contract-call? .router allow-protocol u1 'ST...TARGET 'ST...mock-adapter 'ST...mock-token)`
  - Mint tokens: `(contract-call? .mock-token mint 'ST...wallet u1000)`
  - Trigger adapter failure: `(contract-call? .mock-adapter set-failure true)`
  - Route deposit: `(contract-call? .router route-deposit 'ST...mock-token u1000 u1 u0 'ST...mock-adapter)`
  - Reset state: set failure to false, skim ratio to `u0`.
- **Read-only tests:** Additional scripts under `packages/contracts/yield-router/tests/contracts/` (e.g., `allowlist_tests.clar`) provide quick assertions when you want to use Clarinet CLI directly.

## Mock Values and Migration

| Item | Current Mock | Replace When Shipping |
| --- | --- | --- |
| SIP-010 token | `contracts/mock-token.clar` deployed as `<deployer>.mock-token` | Update `allowed-protocols` entries to reference the real sBTC token principal (e.g., `SP...::sbtc-token`). Remove or archive the mock token contract from the deployment plan. |
| Adapter | `contracts/mock-adapter.clar` and `contracts/adapters/mock-stacking.clar` | Replace with protocol-specific adapters implementing the `yield-adapter` trait. Update deployment plan and tests to target the real adapter principal(s). |
| Protocol targets | Simnet deployer principal (`ST1PQ...`) | Register the real protocol target principals through `allow-protocol` after deployment or via migration scripts. |
| Test data | `set-skim-ratio`, `set-failure`, minted balances | In production these setters should be removed or restricted. Minting moves to the upstream SIP-010 contract (e.g., sBTC mint/bridge flow). |

**Migration Steps**
1. Deploy production adapters and confirm they implement the `yield-adapter` trait.
2. Deploy or reference the real SIP-010 token (sBTC). Ensure transfer semantics align with expectations.
3. Update the router deployment (or run `allow-protocol` transactions) with real `{target, adapter, token}` principals.
4. Remove or disable `mock-adapter` and `mock-token` from the deployment plan. Tests should be updated to use contract interfaces or integration fixtures that match production behaviour.
5. Regenerate documentation and `.env` placeholders (see `apps/web/.env.local.example`) with actual contract IDs.

## Continuous Integration Tips
- Incorporate `pnpm contracts:clarinet:check` and `pnpm --filter @contracts/core test` into your CI pipeline to catch regressions.
- Consider adding `clarinet clarify` or `clarinet eval` scripts once you write additional `.clar` tests in `tests/contracts/`.

Keeping this mock stack healthy ensures the Next.js frontend can iterate quickly while the production adapters and sBTC integration are being finalised.
