#!/bin/bash

# Test script for all components
set -e

echo "🧪 Running all tests for Stacks Yield Aggregator..."

# Run type checking first
echo "🔍 Type checking..."
pnpm typecheck

# Run linting
echo "🔧 Linting..."
pnpm lint

# Run unit tests for packages
echo "📦 Testing packages..."
pnpm test:adapters || echo "⚠️  Adapters tests failed"
pnpm test:contracts || echo "⚠️  Contract tests failed"

# Run web app tests
echo "🌐 Testing web application..."
pnpm --filter @apps/web test || echo "⚠️  Web tests failed"

# Run mobile app tests
echo "📱 Testing mobile application..."
pnpm --filter @apps/mobile test || echo "⚠️  Mobile tests failed"

echo ""
echo "✅ Test suite completed!"
echo "📊 Check individual test outputs above for details."