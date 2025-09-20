# Makefile for Stacks Yield Aggregator

.PHONY: help setup install build dev test lint format clean reset

# Default target
help:
	@echo "Stacks Yield Aggregator - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup       - Initial project setup"
	@echo "  make install     - Install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Start web development server"
	@echo "  make dev-mobile  - Start mobile development"
	@echo "  make build       - Build all packages"
	@echo ""
	@echo "Testing:"
	@echo "  make test        - Run all tests"
	@echo "  make test-contracts - Test smart contracts"
	@echo "  make test-adapters  - Test protocol adapters"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint        - Run linting"
	@echo "  make lint-fix    - Fix linting issues"
	@echo "  make format      - Format code"
	@echo "  make typecheck   - Run TypeScript checks"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-testnet  - Deploy to testnet"
	@echo "  make deploy-mainnet  - Deploy to mainnet"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make reset       - Clean and reinstall"

# Setup and Installation
setup:
	@./scripts/setup.sh

install:
	@pnpm install

# Development
dev:
	@pnpm dev

dev-mobile:
	@pnpm dev:mobile

dev-contracts:
	@pnpm dev:contracts

build:
	@pnpm build

# Testing
test:
	@./scripts/test-all.sh

test-contracts:
	@pnpm test:contracts

test-adapters:
	@pnpm test:adapters

# Code Quality
lint:
	@pnpm lint

lint-fix:
	@pnpm lint:fix

format:
	@pnpm format

format-check:
	@pnpm format:check

typecheck:
	@pnpm typecheck

# Deployment
deploy-testnet:
	@./scripts/deploy.sh testnet

deploy-mainnet:
	@./scripts/deploy.sh mainnet

deploy-web-testnet:
	@./scripts/deploy.sh testnet true

deploy-web-mainnet:
	@./scripts/deploy.sh mainnet true

# Maintenance
clean:
	@pnpm clean

reset:
	@pnpm reset

# Contract specific commands
contracts-console:
	@cd packages/contracts && clarinet console

contracts-check:
	@cd packages/contracts && clarinet check

# Docker commands
docker-up:
	@docker-compose up -d

docker-down:
	@docker-compose down

docker-logs:
	@docker-compose logs -f

# Git hooks
pre-commit: lint-fix format typecheck test

# Health check
health:
	@echo "Checking system health..."
	@node --version
	@pnpm --version
	@echo "✅ System ready"