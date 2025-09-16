# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Stacks-focused Yield Farming Aggregator** being developed for a 5-day hackathon, with plans to expand to multichain support (Ethereum, Solana) in later phases. The project aims to aggregate DeFi yield farming opportunities, provide normalized APR/APY data with risk scoring, and enable single-click deposits through a non-custodial router contract.

## Architecture & Components

### Current Directory Structure
```
/contracts
  Router.clar (or equivalent smart contract)
  /test (unit tests)
/apps/web (React with CRACO)
  src/
    pages: Landing.jsx, Opportunities.jsx, OpportunityDetail.jsx, Portfolio.jsx
    components/: CardFlow, Layout, LiveFeed, ThreadScroller
    components/ui/: Complete shadcn/ui component library
    contexts/: WalletContext
    hooks/: use-toast
    lib/: utils
  package.json with optimized dependencies
  tailwind.config.js, tsconfig.json, craco.config.js
/packages/shared
  types/, utils/
```

### Key Data Types
```typescript
type Opportunity = {
  id: string;
  chain: "stacks" | "ethereum" | "solana";
  protocol: string;
  pool: string;
  tokens: string[];
  apr: number;
  apy: number;
  rewardToken?: string;
  tvlUsd?: number;
  risk: "low" | "med" | "high";
  source: "api" | "indexer";
  lastUpdated: number;
  disabled?: boolean;
};

interface Adapter {
  list(): Promise<Opportunity[]>;
  detail(id: string): Promise<Opportunity>;
}
```

## Development Phases

### Phase A (Current MVP - Hackathon)
- Stacks-only opportunities (ALEX, Arkadiko protocols)
- Router contract with security features (allowlist, pausable, reentrancy guard, per-tx cap)
- Basic deposit flow with redirect to original protocols
- Portfolio dashboard showing user investments
- Multichain preview (disabled cards for Ethereum/Solana)

### Phase B (Post-hackathon)
- Single-click deposits through router contract
- Hybrid data strategy (API + lightweight indexer)
- Enhanced UX with gas estimates and net yield calculations

### Phase C (Long-term)
- Vault structures with auto-compounding
- Performance fees and advanced monetization
- Pro features (alerts, rebalancing, advanced risk scoring)
- Full multichain support

## Security Requirements

### Smart Contract Level
- **Allowlist**: Only approved protocol addresses
- **Pausable**: Emergency stop functionality
- **ReentrancyGuard**: Prevent reentrancy attacks
- **Per-tx cap**: Maximum transaction limits
- **MinOut/SlippageGuard**: Slippage protection
- **Event logging**: Comprehensive event emissions

### Frontend Level
- **ChainId validation**: Ensure correct network
- **Read-only fallback**: Graceful degradation when wallet unavailable
- **Data transparency**: Source and lastUpdated timestamps
- **Risk labeling**: Clear risk indicators with "BETA - not financial advice" disclaimers

## Core Features

1. **Wallet Integration**: Leather/Hiro wallet support for Stacks
2. **Opportunity Discovery**: Normalized APR/APY with risk scoring
3. **Single-Click Deposits**: Router contract for streamlined UX
4. **Portfolio Management**: Track investments and estimated returns
5. **Multichain Preview**: Preview upcoming chain support (disabled)

## Data Strategy

- **Current**: Direct protocol API/SDK integration (ALEX, Arkadiko)
- **Future**: Hybrid model with lightweight indexer for sanity checks
- **Risk Scoring**: Simple rule-based system (stablecoin = Low, new pools = High)

## Monetization Strategy

- **Router fees**: 0.5-1% on deposits
- **Performance fees**: 10-15% on vault strategies (Phase C)
- **Pro subscription**: Advanced features and alerts (Phase C)

## Testing Requirements

### Smart Contract Tests
- Allowlist enforcement (reject non-approved protocols)
- Pause functionality during emergencies
- MinOut validation and slippage protection
- Per-transaction cap enforcement
- Event emission verification
- Reentrancy protection

### Frontend Tests
- Wallet connection flows
- Opportunity data normalization
- Portfolio calculations
- Error handling for failed transactions

## Demo Flow

1. Connect wallet (Stacks: Leather/Hiro)
2. Browse opportunities with normalized APR/APY and risk labels
3. View opportunity details with breakdown and projections
4. Execute deposit through router contract (testnet)
5. View transaction in portfolio dashboard
6. Preview disabled multichain opportunities
7. Present roadmap for vault and indexer features

## Development Environment

### Frontend Setup Status
- ✅ React application with CRACO configuration
- ✅ Complete shadcn/ui component library installed
- ✅ Stacks wallet integration dependencies (@stacks/connect, @stacks/transactions)
- ✅ Tailwind CSS with custom configuration
- ✅ TypeScript support configured
- ✅ Build process verified and optimized
- ✅ Development server tested
- ✅ Linting and type checking configured

### Build Commands
```bash
cd apps/web
npm start        # Start development server
npm run build    # Production build
npm run test     # Run tests
npm run lint     # Lint code
npm run type-check # TypeScript type checking
```

## Important Notes

- Project is in MVP/hackathon stage - expect rapid iteration
- Focus on Stacks ecosystem initially (ALEX, Arkadiko protocols)
- Security is paramount - implement all safety measures before mainnet
- UI should emphasize transparency (data sources, last updated times)
- Always include appropriate risk disclaimers and beta labels
- Router contract must be thoroughly tested before deployment