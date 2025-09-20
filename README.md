# Stacks Yield Aggregator

A monorepo for DeFi yield aggregation on Stacks blockchain, with plans to expand to Ethereum and Solana.

## Project Structure

```
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── shared/       # Shared types and utilities
│   ├── adapters/     # Protocol adapters
│   └── contracts/    # Clarity smart contracts
└── scripts/          # Development scripts
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Clarinet 3.6+ (required for contract development)

    # macOS (Homebrew)
    brew install clarinet

    # verify installation
    clarinet --version

### Installation

```bash
# Clone and install
git clone <repo-url>
cd stacks-yield-agg
pnpm i
```

### Development

```bash
# Build packages first
pnpm -r --filter "./packages/*" run build

# Start web app
pnpm dev:web

# Start mobile app
pnpm dev:mobile

# Run tests
pnpm -r test

# Type checking
pnpm -r typecheck

# Linting
pnpm -r lint
```

### Smart Contracts

```bash
# Go to contracts directory
cd packages/contracts/yield-router

# Run tests
clarinet test

# Check contracts
clarinet check

# Start REPL
clarinet console
```

## Workspace Structure

This is a pnpm monorepo with the following packages:

- `@shared/core` - Shared types and utilities
- `@adapters/core` - Protocol adapters (ALEX, Arkadiko)
- `@contracts/core` - Smart contracts
- `@apps/web` - Next.js web application
- `@apps/mobile` - Expo React Native app

## Development Scripts

- `pnpm dev:web` - Start web development server
- `pnpm dev:mobile` - Start mobile development
- `pnpm test` - Run all tests
- `pnpm typecheck` - Run TypeScript checks
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code

## Environment Setup

Copy environment files:
```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
```

## Contributing

1. Install dependencies: `pnpm i`
2. Build packages: `pnpm -r --filter "./packages/*" run build`
3. Run tests: `pnpm -r test`
4. Check types: `pnpm -r typecheck`
5. Run linting: `pnpm -r lint`

## License

MIT
