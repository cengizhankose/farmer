# Router Contract Guide

## Overview

The `router.clar` contract under `packages/contracts/yield-router/contracts/` implements a minimal yield-routing primitive for Stacks. It lets an owner-managed account register downstream protocol adapters, enforce transaction-level risk controls, and pause routing in emergencies. Successful deposit attempts are logged via events for off-chain execution or monitoring; the contract currently does not move tokens itself, keeping the routing logic composable and upgrade-friendly.

## State Model

- **owner** – Principal initialized to the deployer; only this account can mutate configuration.
- **paused** – Boolean guard (default `false`) allowing the owner to halt `route-deposit` during incidents.
- **per-tx-cap** – Unsigned integer set to `u100000000` (1e8 microSTX) that limits the maximum amount per routed call.
- **allowed-protocols** – Map of numeric protocol identifiers to adapter principals; existence in the map authorizes routing.
- **Error constants** – `u100` (not auth), `u101` (protocol not allowed), `u200` (paused), `u201` (invalid amount), `u202` (cap exceeded) provide consistent failure signals for integrators.

## Read-Only Views

| Function | Description |
| --- | --- |
| `is-owner(who)` | Returns `true` when `who` matches the stored owner principal. |
| `is-paused()` | Exposes the pause flag so frontends can disable routing UI when halted. |
| `get-tx-cap()` | Reveals the cap to align client-side input validation. |
| `is-protocol-allowed(protocol-id)` | Checks the allowlist membership for a protocol identifier. |

## Public Entry Points

| Function | Access | Behavior |
| --- | --- | --- |
| `set-paused(p)` | Owner only | Toggles the pause flag; non-owners receive `err u100`. |
| `allow-protocol(id, target)` | Owner only | Registers or overwrites the protocol mapping `id → target`. |
| `route-deposit(token, amount, protocol-id, min-out)` | Any caller | Validates pause state, amount bounds, cap, and allowlist membership before emitting a `"route-deposit"` event with `{token, amount, protocol-id, min-out, sender}`. Returns `(ok true)` when policy checks pass. |

## Event & Error Handling

- **Event** – `route-deposit` event is printed with full context; indexer services can act on it to forward funds to the target adapter.
- **Errors** – Clients should map the unsigned error codes to user-friendly messages and retry/offboard logic.

## Operational Flow

1. Deploy contract (deployer becomes owner automatically).
2. Owner registers protocol adapters via `allow-protocol` with distinct numeric IDs.
3. Owner may pause (`set-paused true`) for maintenance or emergency response, unpausing once resolved.
4. Users call `route-deposit` with:
   - `token` principal representing the asset to route.
   - `amount` of the asset (must be `> u0` and `≤ per-tx-cap`).
   - `protocol-id` matching an allowlisted adapter.
   - `min-out` (slippage guard for downstream execution).
5. Off-chain automation listens to the event log and executes the actual deposit logic using the registered adapter.

## Using with Clarinet

```sh
cd packages/contracts/yield-router
clarinet console
```

Inside the console:

```clojure
(contract-call? .router allow-protocol u1 'SP123...TARGET)
(contract-call? .router route-deposit 'SP123...TOKEN u100000 u1 u95000)
```

Run `clarinet check` for linting/compilation and `pnpm test` to execute Vitest-based integration tests (see `tests/router.test.ts`).

## Security Considerations

- **Pause control** – Central emergency brake; secure owner keys or migrate to a multisig to reduce key risk.
- **Transaction caps** – Mitigate single-call exposure; consider additional daily or per-protocol caps in future iterations.
- **Allowlist overwrite** – `allow-protocol` replaces existing entries; maintain off-chain governance records to avoid accidental reassignment.
- **min-out semantics** – The contract only logs `min-out`; enforcing slippage protections is the responsibility of downstream execution code.

## Extensibility Ideas

- Add owner-level setters for `per-tx-cap`, protocol-specific limits, or daily quotas.
- Emit dedicated events for pause toggles and protocol registry updates to improve observability.
- Integrate direct token transfers or adapter invocations once protocol interfaces stabilize.
- Introduce role delegation (e.g., separate pauser role) for operational flexibility.

## Web Application Integration

### Tech Stack Snapshot

- **Framework** – Next.js 14 App Router (`apps/web/app`) with React 18 server components.
- **Shared packages** – Imports `mockAdapter` from the workspace package `@adapters/core` for opportunity data and `@shared/core` utilities (e.g., APR→APY conversion).
- **Routing** – File-based routes for `/`, `/opportunities`, `/opportunities/[id]`, and `/portfolio`, each implemented as async server components that can await data before rendering.

### Data Flow & Adapters

1. `app/opportunities/page.tsx` fetches opportunity listings via `mockAdapter.list()`. The adapter currently returns hard-coded sample data (see `packages/adapters/src/mock.ts`), but the interface mirrors real adapter implementations so the UI can switch to live data without refactoring.
2. `app/opportunities/[id]/page.tsx` calls `mockAdapter.detail(id)` to resolve a single opportunity. Both list/detail return the same backing object, ensuring consistent formatting for APR/APY, risk labels, and metadata like `lastUpdated`.
3. The `mockAdapter` in turn uses `aprToApy` from `@shared/core` (placeholder package) to compute APY, demonstrating the intended normalization pipeline once real protocol adapters (e.g., `lib/adapters/alex.ts`, `lib/adapters/arkadiko.ts`) are wired in.
4. No direct on-chain calls occur in the web layer yet; all contract interactions are deferred to future integrations with a wallet provider and transaction service located in a forthcoming `lib` directory.

### UI Surfaces

- **Home (`app/page.tsx`)** – Landing CTA linking to Opportunities and Portfolio.
- **Opportunities List (`app/opportunities/page.tsx`)** – Displays protocol name, pool pair, APR→APY, risk badge, optional TVL, and detail link using basic inline styles. Designed to evolve into `OpportunityCard` components once the design system solidifies.
- **Opportunity Detail (`app/opportunities/[id]/page.tsx`)** – Presents returns, risk level, pool metadata, and a disabled “Deposit (Router Coming Soon)” button. The disabled state references the router rollout and provides a beta disclaimer banner.
- **Portfolio (`app/portfolio/page.tsx`)** – Placeholder messaging that reiterates routing dependency: portfolio insights unlock post-router deployment.

### Router Contract Touchpoints

- The disabled deposit CTA acknowledges the router contract (`router.clar`) as the eventual execution layer. Once enabled, the button is expected to:
  1. Trigger wallet connection (Leather/Hiro) and gather the user principal.
  2. Call a client-side helper that crafts a Clarity transaction invoking `route-deposit` with token principal, amount, protocol id, and min-out derived from the selected opportunity.
  3. Surface router event confirmations and transaction hashes back into the UI and portfolio view.
- Current implementation only surfaces messaging; no contract state (pause flag, cap, allowlist) is yet reflected in the UI. Future enhancements should fetch these read-only values via a lightweight API or direct `clarity-bitcore` call and adjust the UI (e.g., disable deposit when paused or display cap thresholds).

### Integration Gaps & Next Steps

1. **Wallet & Transaction Flow** – Implement a client-side action that handles user input for deposit amount, validates against `per-tx-cap`, and submits `route-deposit`. Consider using Stacks.js or @stacks/connect for transaction scaffolding.
2. **Dynamic Protocol Metadata** – Replace `mockAdapter` with the real adapter manager (`packages/adapters/src/adapter-manager.ts`) once ready, wiring API-derived opportunities into the list/detail pages.
3. **Router State Awareness** – Add hooks to read `is-paused`, `get-tx-cap`, and protocol allowlist so the UI reflects real contract configuration (e.g., disable deposit for disallowed protocols).
4. **Event-Driven Updates** – Subscribe to the `route-deposit` event (via indexer or ReST API) to update the portfolio view and confirmation modals in near real time.
5. **Error Handling** – Map router error codes (u100–u202) to user-friendly messages within the deposit flow to mirror on-chain validation failures in the client.
