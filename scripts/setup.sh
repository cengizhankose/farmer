#!/bin/bash

# Setup script for Stacks Yield Aggregator
set -e

echo "🚀 Setting up Stacks Yield Aggregator..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"
echo "✅ pnpm version: $(pnpm --version)"

# Create .env files from examples
echo "📝 Creating environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
fi

if [ ! -f apps/web/.env ]; then
    cp apps/web/.env.example apps/web/.env 2>/dev/null || true
    echo "✅ Created apps/web/.env"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build packages
echo "🔨 Building packages..."
pnpm build

# Run type checking
echo "🔍 Running type checks..."
pnpm typecheck

# Install Clarinet for contract development
echo "🔧 Checking for Clarinet..."
if ! command -v clarinet &> /dev/null; then
    echo "⚠️  Clarinet not found. Install it from: https://github.com/hirosystems/clarinet"
    echo "   Or run: curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-macos-x64.tar.gz | tar xz"
else
    echo "✅ Clarinet version: $(clarinet --version)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Quick start commands:"
echo "  pnpm dev           # Start web development server"
echo "  pnpm dev:mobile    # Start mobile development"
echo "  pnpm test          # Run all tests"
echo "  pnpm lint          # Run linting"
echo ""
echo "Contract development:"
echo "  cd packages/contracts"
echo "  clarinet console   # Start Clarinet REPL"
echo "  clarinet test      # Run contract tests"
echo ""
echo "📚 Check the README.md for more detailed instructions."