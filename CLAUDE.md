# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Stacks-focused Yield Farming Aggregator** built as a pnpm monorepo. The project aggregates DeFi yield farming opportunities, provides normalized APR/APY data with risk scoring, and enables deposits through a secure router contract. Currently focused on Stacks ecosystem (ALEX, Arkadiko) with plans to expand to Ethereum and Solana.

## Architecture & Workspace Structure

This is a **pnpm monorepo** with workspace-based packages:

- `@shared/core` - Shared types and utilities (pure TypeScript)
- `@adapters/core` - Protocol adapters with mock implementations
- `@contracts/core` - Clarity smart contracts using Clarinet 3.x
- `@apps/web` - Next.js 14 web application (App Router)
- `@apps/mobile` - Expo React Native app (basic structure)

### Key Architecture Patterns

**Workspace Dependencies**: All packages use `workspace:*` references. The build order is critical: packages must be built before apps.

**Data Flow**: `@adapters/core` exports mock data conforming to types from `@shared/core`. The web app (`@apps/web`) imports from `@adapters/core` to display opportunities.

**Contract Testing**: Uses Clarinet 3.x with Vitest + Vite for testing Clarity contracts. Tests use `Cl.` helpers for proper Clarity value serialization.

## Essential Commands

### Development Workflow
```bash
# Initial setup
pnpm i
pnpm -r --filter "./packages/*" run build

# Development servers
pnpm dev:web              # Next.js web app
pnpm dev:mobile           # Expo mobile app

# Testing
pnpm test                 # All tests
pnpm test:contracts       # Smart contract tests only
pnpm test:adapters        # Adapter tests only

# Code quality
pnpm typecheck           # TypeScript checks across all packages
pnpm lint                # ESLint across all packages
pnpm format              # Prettier formatting

# Contract development
pnpm contracts:check     # Clarity syntax checking
pnpm contracts:console   # Clarinet REPL
```

### Single Package Development
```bash
# Work on specific packages
pnpm --filter @shared/core build
pnpm --filter @apps/web dev
pnpm --filter @contracts/core test
```

## Smart Contract Development

**Location**: `packages/contracts/yield-router/` (Clarinet 3.x project)

**Key Contract**: `contracts/router.clar` - Router with security features:
- Owner-only functions (pause, protocol allowlist)
- Per-transaction caps
- Event logging for deposits

**Testing**: Uses Vitest with `@hirosystems/clarinet-sdk`. Tests require `Cl.` helpers:
```typescript
// Correct: Use Cl helpers for all values
simnet.callPublicFn("router", "set-paused", [Cl.bool(true)], deployer);

// Read-only functions return raw values, not Response types
expect(result).toBeBool(true); // Not .toBeOk(Cl.bool(true))
```

## Data Types & Interfaces

**Core Type**: `Opportunity` from `@shared/core` defines yield farming opportunities with:
- Chain support (`"stacks" | "ethereum" | "solana"`)
- Risk levels (`"low" | "med" | "high"`)
- APR/APY calculations via `aprToApy()` utility

**Adapter Pattern**: All protocol integrations implement `Adapter` interface:
```typescript
interface Adapter {
  list(): Promise<Opportunity[]>;
  detail(id: string): Promise<Opportunity>;
}
```

**Current Implementation**: `mockAdapter` in `@adapters/core` provides static test data for ALEX and Arkadiko protocols.

## Web Application Architecture

**Framework**: Next.js 14 with App Router
**Pages**:
- `/` - Landing page with quick stats
- `/opportunities` - Grid of yield opportunities with risk indicators
- `/opportunities/[id]` - Individual opportunity details with deposit UI (disabled)
- `/portfolio` - Coming soon placeholder

**Data Fetching**: Server-side rendering with `mockAdapter.list()` in page components.

**Styling**: Comprehensive CSS system with custom components and gradients:
- **Color System**: Brand orange (#FF6A00), warm gold (#E2C872), burnt orange (#C6561A), bronze (#8C5A3A)
- **Gradient Hierarchy**: Hero (orange-focused) → Why Us (gold-focused) → Marketing (orange-to-bronze)
- **Card Components**: `card-why` (gold theme for trust), `card-market` (orange theme for action)
- **UI Components**: HeroRightChart (animated metrics), ErrorBoundary (graceful fallback), SoftParticles (background effects)

## Package Build Dependencies

**Critical Build Order**:
1. `@shared/core` must build first (exports types)
2. `@adapters/core` depends on `@shared/core`
3. Apps depend on both packages

**Workspace References**: Use `workspace:*` in package.json dependencies, never relative paths or file: URLs.

## Environment & Configuration

**Node.js**: >= 18.0.0 required
**Package Manager**: pnpm >= 8.0.0 with workspace support
**Monorepo Config**: `.npmrc` with `node-linker=isolated` for React Native compatibility

**Environment Files**:
- `.env.example` - Root environment template
- `apps/web/.env.local.example` - Next.js specific environment

## UI/UX Architecture

**Component System**: Custom React components with Framer Motion animations:
- **HeroRightChart**: Animated metrics dashboard with real-time data visualization
- **ErrorBoundary**: Graceful error handling with auto-retry and fallback UI
- **SoftParticles**: Dynamic background particle effects for visual enhancement

**Styling Architecture**: CSS-based design system with:
- **Color Palette**: Brand orange (#FF6A00), warm gold (#E2C872), burnt orange (#C6561A), bronze (#8C5A3A)
- **Gradient System**: Section-specific gradients for visual hierarchy
- **Card Components**: Themed cards with hover effects and glass-morphism
- **Typography**: Consistent typography system with proper hierarchy

**Animation System**: Framer Motion-based animations with:
- Staggered reveals for content sections
- Smooth hover transitions with transform effects
- Reduced motion support for accessibility
- Performance-optimized animations

## Testing Strategy

**Contract Tests**: 11 comprehensive tests covering security features, ownership, and error conditions. All tests currently passing.

**Package Tests**: Most packages have placeholder test scripts. Focus testing efforts on contract layer for security validation.

**Type Safety**: Strict TypeScript across all packages with shared `tsconfig.base.json`.

## Security Considerations

**Smart Contract**: Router implements allowlist-only protocol access, emergency pause functionality, and transaction caps. All security features have test coverage.

**Frontend**: Risk labeling on opportunities, BETA disclaimers, read-only fallbacks when wallet unavailable, and enhanced error boundaries with auto-retry functionality.

## Development Status

**Current Phase**: Enhanced MVP with improved UI/UX, real data integration infrastructure, and comprehensive error handling.
- **UI Improvements**: Animated HeroRightChart, color-coded card system, particle effects
- **Data Infrastructure**: RealDataBridge service, API endpoints, comprehensive error handling
- **Styling System**: Professional gradient hierarchy and glass-morphism effects

**Next Phase**: Connect real ALEX/Arkadiko APIs and implement actual deposit flow.
**Future**: Multi-chain expansion and vault strategies.