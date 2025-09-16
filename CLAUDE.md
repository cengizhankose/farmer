# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Stacks-focused Yield Farming Aggregator** being developed for a 5-day hackathon, with plans to expand to multichain support (Ethereum, Solana) in later phases. The project aims to aggregate DeFi yield farming opportunities, provide normalized APR/APY data with risk scoring, and enable single-click deposits through a non-custodial router contract.

## Architecture & Components

### Current Directory Structure
```
/apps/web (Next.js with TypeScript)
  /pages
    _app.tsx
    index.tsx
    opportunities/
      index.tsx
      [id].tsx
    portfolio.tsx
  /lib
    /adapters
      alex.ts
      arkadiko.ts
    /normalize
      apr.ts
      risk.ts
    mock.ts
    utils.ts
  /components
    Layout.tsx
    /ui
      primitives.tsx
  /contexts
    WalletContext.tsx
  /styles
    globals.css
  package.json
  tsconfig.json
  next.config.js
  tailwind.config.js
/contracts (planned)
  Router.clar (or equivalent smart contract)
  /test (unit tests)
/packages/shared (planned)
  types/, utils/
```

### Key Data Types (Current Implementation)
```typescript
export type ChainId = "stacks" | "ethereum" | "solana";

export type Opportunity = {
  id: string;
  protocol: string;
  pair: string; // e.g., "STX/USDA"
  chain: ChainId;
  apr: number;
  apy: number;
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string; // e.g., "5m", "1h"
  originalUrl: string;
  summary: string;
};

// Adapter interface (implemented in lib/adapters/)
interface Adapter {
  fetchOpportunities(): Promise<Opportunity[]>;
}
```

## Development Phases

### Phase A (Current MVP - Hackathon) ✅ IN PROGRESS
- ✅ Next.js app with TypeScript setup
- ✅ Stacks-focused opportunity discovery UI
- ✅ ALEX and Arkadiko protocol adapters (mock implementation)
- ✅ Multichain preview with disabled Ethereum/Solana cards
- ✅ Basic routing: home, opportunities list, individual opportunity details, portfolio
- ✅ Responsive UI with Tailwind CSS
- ✅ Wallet context setup (for future integration)
- 🚧 Router contract with security features (allowlist, pausable, reentrancy guard, per-tx cap)
- 🚧 Live wallet integration (Leather/Hiro)
- 🚧 Portfolio dashboard with real transaction tracking

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

1. **Next.js + TypeScript**: Modern React framework with full type safety
2. **Opportunity Discovery**: Normalized APR/APY display with risk scoring
3. **Protocol Adapters**: Modular adapter system for ALEX, Arkadiko (extensible)
4. **Responsive UI**: Tailwind CSS with custom components and mobile-first design
5. **Wallet Integration**: Context setup for Leather/Hiro wallet support (Stacks)
6. **Single-Click Deposits**: Router contract for streamlined UX (planned)
7. **Portfolio Management**: Track investments and estimated returns (in progress)
8. **Multichain Preview**: Preview cards for Ethereum/Solana (disabled)

## Data Strategy

- **Current**: Mock data with realistic Stacks opportunities (ALEX, Arkadiko) + preview data for multichain
- **Near-term**: Direct protocol API/SDK integration for real-time data
- **Future**: Hybrid model with lightweight indexer for sanity checks
- **Risk Scoring**: Simple rule-based system (stablecoin pairs = Low, new/volatile pools = High)

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
- Next.js page routing and navigation
- TypeScript type safety and compilation
- Opportunity data display and filtering
- Responsive component behavior
- Mock data integration
- Wallet connection flows (when implemented)
- Portfolio calculations (when implemented)
- Error handling for failed transactions

## Demo Flow (Current Implementation)

1. **Home Page**: Overview with stats and quick navigation
2. **Browse Opportunities**: View Stacks opportunities (ALEX, Arkadiko) with normalized APR/APY and risk labels
3. **Opportunity Details**: Click individual opportunities to see detailed breakdown and summary
4. **Multichain Preview**: View disabled Ethereum and Solana cards showcasing future support
5. **Portfolio Page**: Mock portfolio dashboard layout (ready for wallet integration)
6. **Responsive Design**: Test mobile and desktop layouts

### Planned Demo Flow (Next Steps)
7. **Connect Wallet**: Leather/Hiro wallet integration
8. **Execute Deposits**: Through router contract (testnet)
9. **Live Portfolio**: Real transaction tracking and returns calculation

## Important Notes

- **Current Status**: Next.js + TypeScript MVP with mock data and responsive UI
- **Hackathon Focus**: Rapid iteration and feature development for demo
- **Stacks Ecosystem**: Initially targeting ALEX, Arkadiko protocols
- **Security Priority**: Implement all safety measures before mainnet deployment
- **Type Safety**: Full TypeScript implementation for robust development
- **UI Transparency**: Emphasize data sources, last updated times, and risk disclaimers
- **Mobile-First**: Responsive design with Tailwind CSS
- **Extensible Architecture**: Modular adapter system for easy protocol integration

## Technical Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript 5.5
- **Styling**: Tailwind CSS with custom components
- **State**: React Context (Wallet) + local component state
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **HTTP**: Axios for future API calls

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode (currently disabled for rapid development)
- **Build**: Next.js built-in bundling
- **Package Manager**: npm

### Planned Integrations
- **Wallet**: Leather/Hiro wallet for Stacks
- **Smart Contracts**: Clarity for router contract
- **APIs**: ALEX and Arkadiko protocol APIs