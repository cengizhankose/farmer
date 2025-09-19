Real Data Migration: apps/web2 → apps/web

Overview

This document captures how to migrate and wire all real‑data flows from apps/web2 into the Next.js frontend at apps/web. It replaces earlier mixed‑language notes with a precise, repo‑aligned English guide.

Architecture

- Data sources: DefiLlama (cross‑chain yields), Arkadiko (Stacks AMM), ALEX (Stacks DeFi)
- Adapters package: packages/adapters (source TypeScript, compiled to dist)
- Web bridge: apps/web/lib/adapters/real.ts (loads AdapterManager dynamically and normalizes data for UI)
- Next.js API: apps/web/pages/api/opportunities/\* (server endpoints consumed by the UI)
- Frontend pages: apps/web/pages/{index, opportunities, opportunities/[id], portfolio}

Current Data Flow (live)

packages/adapters (AdapterManager) → apps/web/lib/adapters/real.ts → apps/web/pages/api/opportunities/\* → React pages/components

Key Files

- apps/web/lib/adapters/real.ts:223
  RealDataAdapter bridge. Dynamic import of AdapterManager, caching, retries, and transforms for UI.
- apps/web/pages/api/opportunities/index.ts:1
  Lists normalized opportunities for the UI, powered by realDataAdapter.fetchOpportunities().
- apps/web/pages/api/opportunities/[id].ts:1
  Returns one normalized opportunity by id via realDataAdapter.fetchOpportunityById().
- apps/web/pages/api/opportunities/[id]/chart.ts:1
  Returns normalized chart series via realDataAdapter.fetchChartSeries(id, days).
- apps/web/pages/opportunities/index.tsx:1
  Client page fetching /api/opportunities and rendering cards with filters and sort.
- apps/web/pages/opportunities/[id].tsx:1
  Client detail page fetching /api/opportunities/:id; uses Overview + Risk components.
- apps/web/components/opportunity/OpportunityOverviewCard.tsx:1
  Loads /api/opportunities/:id/chart?days=7|30|90 and renders TVL/APR/Volume with Recharts.
- apps/web/components/Cards.tsx:1
  Landing marquee cards. Now wired to live data (top by TVL/APR) with graceful fallback.

AdapterManager Capabilities (packages/adapters/src/adapter-manager.ts:1)

- getAllOpportunities(): Aggregates, deduplicates and sorts by TVL, then APY.
- getOpportunityDetail(id): Resolves one opportunity (alias: getOpportunityById).
- getChartData(poolId): Returns provider‑specific series (DefiLlama/Arkadiko), later normalized by real.ts.
- getAdapterStats(): Totals, averages and by‑source breakdown; cached server‑side.

Bridge Layer (apps/web/lib/adapters/real.ts)

- Transform: Converts Opportunity into the UI shape (pair, risk labels, percentage scaling, lastUpdated label).
- Cache: In‑memory cache with TTL; helpers to clear and inspect stats.
- Resilience: Error boundaries and retry with exponential backoff.
- Chart normalization: Produces { timestamp, tvlUsd, apy?, apr?, volume24h? } with time filtering by days.

Pages: Required Real Data Status

- Landing page yield cards: Live. apps/web/components/Cards.tsx fetches /api/opportunities, selects top 12 (Stacks only), and renders. Falls back to deterministic demo data if the API is unavailable.
- Opportunity page: Live. apps/web/pages/opportunities/index.tsx consumes /api/opportunities with filters/sorting and real‑data badges.
- Opportunity details: Live. apps/web/pages/opportunities/[id].tsx consumes /api/opportunities/:id; charts render from /api/opportunities/:id/chart with 7D/30D/90D switching.

API Contracts (UI‑facing)

- GET /api/opportunities → { items: Array<{ id, protocol, pair, chain, apr, apy, risk, tvlUsd, rewardToken, lastUpdated, originalUrl, summary, logoUrl? }> }
- GET /api/opportunities/:id → { item: { …same fields as above } }
- GET /api/opportunities/:id/chart?days=7|30|90 → { series: Array<{ timestamp, tvlUsd, apy?, apr?, volume24h? }> }

Caching & Performance

- Adapters (packages/adapters): 5 min cache for opportunities, 10 min for stats; periodic cleanup.
- Bridge (real.ts): Additional in‑app caching and failure fallbacks.
- UI: Charts fetch only on timeframe change; landing marquee limits to top 12 results.

Error Handling

- Server: Try/catch in API routes; adapter/transform errors return 5xx JSON with error message.
- Client: Landing cards fall back to static set; pages display explicit error banners when real data fails.

Environment & Build Notes

- Build adapters before running apps/web locally if using the dynamic import path:
  - From repo root: `pnpm -w -r build` (or `cd packages/adapters && pnpm build`)
- apps/web can run without extra env by default; external APIs used by packages/adapters rely on public endpoints. Add keys only if providers require them later.

Open Enhancements (Optional, Phase B)

- Enhanced risk modules from apps/web2 (e.g., EnhancedRiskBreakdown, projections) can be ported into apps/web/components/enhanced/\* with server APIs added when real enhanced data is available.
- Add an API for adapter stats if a top‑level dashboard is introduced (e.g., /api/opportunities/stats).

Validation Checklist

- Landing marquee shows live data (opportunities page live badge confirms flow).
- Details page renders charts for selected periods (7/30/90 days).
- All content and comments are English‑only per repository guidelines.

Status

- Live wiring complete for landing, list, and detail pages.
- Documentation translated and aligned with the current codebase.
