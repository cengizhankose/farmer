#!/bin/bash

# Deployment script for Stacks Yield Aggregator
set -e

NETWORK=${1:-testnet}
DEPLOY_WEB=${2:-false}

echo "🚀 Deploying Stacks Yield Aggregator to $NETWORK..."

if [ "$NETWORK" != "testnet" ] && [ "$NETWORK" != "mainnet" ]; then
    echo "❌ Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

# Validate environment
if [ "$NETWORK" = "mainnet" ]; then
    echo "⚠️  MAINNET DEPLOYMENT - Are you sure? (y/N)"
    read -r confirmation
    if [ "$confirmation" != "y" ] && [ "$confirmation" != "Y" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Build everything
echo "🔨 Building all packages..."
pnpm build

# Run tests
echo "🧪 Running tests..."
pnpm test

# Deploy contracts
echo "📝 Deploying smart contracts to $NETWORK..."
if [ "$NETWORK" = "testnet" ]; then
    pnpm deploy:contracts:testnet
else
    pnpm deploy:contracts:mainnet
fi

# Deploy web app (optional)
if [ "$DEPLOY_WEB" = "true" ]; then
    echo "🌐 Deploying web application..."

    # Build for production
    pnpm --filter @apps/web build

    # Deploy to hosting service (customize based on your provider)
    # Example for Vercel:
    # npx vercel deploy --prod apps/web

    # Example for Netlify:
    # npx netlify deploy --prod --dir apps/web/build

    echo "✅ Web application deployed!"
fi

echo ""
echo "🎉 Deployment to $NETWORK completed!"
echo ""
echo "Next steps:"
echo "1. Update contract addresses in environment files"
echo "2. Test the deployed contracts"
echo "3. Update documentation with new addresses"

if [ "$NETWORK" = "testnet" ]; then
    echo "4. Consider mainnet deployment when ready"
fi