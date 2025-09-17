# Real Data Integration Implementation Plan

## Overview

This document outlines the implementation plan for integrating real-time data from DefiLlama and Arkadiko APIs into the Stacks Yield Aggregator monorepo. The plan leverages the existing adapter architecture and extends it with real data sources while maintaining backward compatibility.

## Current Architecture Analysis

### Existing Structure
```
packages/
├── shared/core/           # Types, utilities (Opportunity, Adapter interfaces)
├── adapters/core/         # Mock data + adapter implementations
├── contracts/yield-router/ # Smart contracts (Clarinet 3.x)
apps/
├── web/                   # Next.js 14 app (currently uses mockAdapter)
├── mobile/                # Expo React Native (basic structure)
```

### Current Data Flow
1. `@shared/core` exports `Opportunity` type and `Adapter` interface
2. `@adapters/core` implements `mockAdapter` with static data
3. `apps/web` imports and uses `mockAdapter.list()` for rendering opportunities
4. Existing `AlexAdapter` and `ArkadikoAdapter` classes exist but use placeholder/mock APIs

## Integration Strategy

### Phase 1: API Service Layer (Week 1)

#### 1.1 Create External API Services
**Location**: `packages/adapters/src/services/`

Create dedicated API service classes for each data source:

```typescript
// packages/adapters/src/services/defillama.ts
export class DefiLlamaService {
  private readonly baseUrl = 'https://yields.llama.fi/pools';

  async getPools(): Promise<LlamaPool[]>
  async getPoolChart(poolId: string): Promise<LlamaChartData[]>
  async getProtocol(slug: string): Promise<LlamaProtocol>
}

// packages/adapters/src/services/arkadiko.ts
export class ArkadikoService {
  private readonly baseUrl = 'https://arkadiko-api.herokuapp.com/api/v1';

  async getTickers(): Promise<ArkadikoTicker[]>
  async getPool(id: string): Promise<ArkadikoPool>
  async getPoolPrices(id: string): Promise<ArkadikoPrice[]>
}
```

#### 1.2 Add API Response Types
**Location**: `packages/adapters/src/types/`

```typescript
// packages/adapters/src/types/defillama.ts
export interface LlamaPool {
  pool: string;           // UUID for charts
  project: string;        // Protocol name
  chain: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  rewardTokens: string[];
  underlyingTokens: string[];
  poolMeta?: any;
}

export interface LlamaProtocol {
  name: string;
  logo: string;
  url: string;
  description: string;
}

// packages/adapters/src/types/arkadiko.ts
export interface ArkadikoTicker {
  pool_id: string;
  base_currency: string;
  target_currency: string;
  liquidity_in_usd: string;
  last_price: string;
  volume_24h?: string;
}

export interface ArkadikoPool {
  id: string;
  token_x_name: string;
  token_y_name: string;
  token_x_address: string;
  token_y_address: string;
  balance_x: string;
  balance_y: string;
}
```

#### 1.3 Update Shared Types
**Location**: `packages/shared/src/types.ts`

Extend existing `Opportunity` interface to support new data fields:

```typescript
export interface Opportunity {
  id: string;
  chain: Chain;
  protocol: string;
  pool: string;
  tokens: string[];
  apr: number;
  apy: number;
  apyBase?: number;        // NEW: Base APY from trading fees
  apyReward?: number;      // NEW: Reward APY from incentives
  rewardToken: string | string[]; // Support multiple reward tokens
  tvlUsd: number;
  risk: "low" | "med" | "high";
  source: "api" | "mock";
  lastUpdated: number;
  disabled?: boolean;

  // NEW: Extended metadata
  poolId?: string;         // For DefiLlama chart integration
  underlyingTokens?: string[];
  volume24h?: number;
  fees24h?: number;
  logoUrl?: string;        // Protocol logo from API
}

export interface ProtocolInfo {
  name: string;
  chain: Chain;
  baseUrl: string;
  description?: string;
  website?: string;
  logo?: string;
  supportedTokens?: string[];

  // NEW: API-specific config
  apiKey?: string;
  rateLimit?: number;
  retryAttempts?: number;
}
```

### Phase 2: Enhanced Adapter Implementation (Week 1-2)

#### 2.1 DefiLlama Adapter
**Location**: `packages/adapters/src/protocols/defillama.ts`

```typescript
import { BaseAdapter } from './base-adapter';
import { DefiLlamaService } from '../services/defillama';

export class DefiLlamaAdapter extends BaseAdapter {
  private service: DefiLlamaService;
  private protocolFilter: string[]; // ['alex', 'arkadiko', 'bitflow']

  constructor(protocolFilter: string[] = []) {
    super({
      name: 'DefiLlama',
      chain: 'stacks',
      baseUrl: 'https://yields.llama.fi',
      description: 'Cross-chain yield aggregator data',
    });
    this.service = new DefiLlamaService();
    this.protocolFilter = protocolFilter;
  }

  async list(): Promise<Opportunity[]> {
    const pools = await this.service.getPools();

    // Filter for Stacks ecosystem protocols
    const stacksPools = pools.filter(pool =>
      pool.chain === 'Stacks' ||
      this.protocolFilter.includes(pool.project.toLowerCase())
    );

    const opportunities = await Promise.all(
      stacksPools.map(pool => this.mapPoolToOpportunity(pool))
    );

    return opportunities.filter(Boolean);
  }

  private async mapPoolToOpportunity(pool: LlamaPool): Promise<Opportunity> {
    // Fetch protocol logo
    const protocol = await this.service.getProtocol(pool.project);

    return {
      id: `defillama-${pool.project}-${pool.symbol}`.toLowerCase(),
      chain: 'stacks',
      protocol: pool.project.toUpperCase(),
      pool: pool.symbol,
      tokens: pool.underlyingTokens || [pool.symbol],
      apr: pool.apyBase || 0,
      apy: pool.apy || 0,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      rewardToken: pool.rewardTokens || [],
      tvlUsd: pool.tvlUsd,
      risk: this.calculateRisk(pool.apy, pool.tvlUsd),
      source: 'api',
      lastUpdated: Date.now(),
      poolId: pool.pool, // For chart integration
      logoUrl: protocol.logo,
      underlyingTokens: pool.underlyingTokens,
    };
  }
}
```

#### 2.2 Enhanced Arkadiko Adapter
**Location**: Update `packages/adapters/src/protocols/arkadiko.ts`

```typescript
export class ArkadikoAdapter extends BaseAdapter {
  private service: ArkadikoService;

  async list(): Promise<Opportunity[]> {
    try {
      // Use real Arkadiko API
      const tickers = await this.service.getTickers();

      const opportunities = await Promise.all(
        tickers.map(ticker => this.mapTickerToOpportunity(ticker))
      );

      return opportunities;
    } catch (error) {
      console.warn('Arkadiko API unavailable, falling back to mock data');
      return this.getMockOpportunities();
    }
  }

  private async mapTickerToOpportunity(ticker: ArkadikoTicker): Promise<Opportunity> {
    // Fetch detailed pool info
    const poolDetail = await this.service.getPool(ticker.pool_id);

    const tokens = [ticker.base_currency, ticker.target_currency];
    const poolName = `${ticker.base_currency}/${ticker.target_currency}`;
    const tvlUsd = parseFloat(ticker.liquidity_in_usd);

    // Estimate APR from volume (simplified calculation)
    const estimatedApr = this.estimateAprFromVolume(
      parseFloat(ticker.volume_24h || '0'),
      tvlUsd
    );

    return {
      id: this.createOpportunityId('arkadiko', poolName),
      chain: 'stacks',
      protocol: 'Arkadiko',
      pool: poolName,
      tokens,
      apr: estimatedApr,
      apy: this.aprToApy(estimatedApr),
      rewardToken: 'DIKO',
      tvlUsd,
      risk: this.calculateRisk(estimatedApr, tvlUsd),
      source: 'api',
      lastUpdated: Date.now(),
      poolId: ticker.pool_id,
      logoUrl: '/logos/arkadiko.svg',
      volume24h: parseFloat(ticker.volume_24h || '0'),
    };
  }

  private estimateAprFromVolume(volume24h: number, tvlUsd: number): number {
    if (tvlUsd === 0) return 0;

    // Assume 0.3% trading fee, annualized
    const dailyFeeRevenue = volume24h * 0.003;
    const annualFeeRevenue = dailyFeeRevenue * 365;
    return annualFeeRevenue / tvlUsd;
  }
}
```

### Phase 3: Adapter Manager & Data Aggregation (Week 2)

#### 3.1 Enhanced Adapter Manager
**Location**: Update `packages/adapters/src/adapter-manager.ts`

```typescript
export class AdapterManager {
  private adapters: Map<string, Adapter> = new Map();
  private cache: Map<string, { data: Opportunity[]; expiry: number }> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.registerAdapters();
  }

  private registerAdapters() {
    // Register real adapters
    this.adapters.set('defillama', new DefiLlamaAdapter(['alex', 'arkadiko']));
    this.adapters.set('arkadiko', new ArkadikoAdapter());

    // Keep mock for fallback
    this.adapters.set('mock', mockAdapter);
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    const cacheKey = 'all-opportunities';
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      // Fetch from all adapters in parallel
      const results = await Promise.allSettled([
        this.adapters.get('defillama')?.list() || [],
        this.adapters.get('arkadiko')?.list() || [],
      ]);

      const opportunities = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<Opportunity[]>).value);

      // Deduplicate by pool name and protocol
      const deduped = this.deduplicateOpportunities(opportunities);

      // Cache results
      this.cache.set(cacheKey, {
        data: deduped,
        expiry: Date.now() + this.cacheTimeout
      });

      return deduped;
    } catch (error) {
      console.error('Failed to fetch opportunities, using mock data:', error);
      return this.adapters.get('mock')?.list() || [];
    }
  }

  private deduplicateOpportunities(opportunities: Opportunity[]): Opportunity[] {
    const seen = new Set<string>();
    return opportunities.filter(opp => {
      const key = `${opp.protocol}-${opp.pool}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async getChartData(poolId: string): Promise<any[]> {
    // Implement chart data fetching for DefiLlama pools
    const defiLlamaService = new DefiLlamaService();
    return defiLlamaService.getPoolChart(poolId);
  }
}

// Export singleton instance
export const adapterManager = new AdapterManager();
```

#### 3.2 Update Main Export
**Location**: Update `packages/adapters/src/index.ts`

```typescript
export * from "@shared/core";
export * from "./mock";
export { adapterManager } from "./adapter-manager";
export { DefiLlamaAdapter } from "./protocols/defillama";
export { ArkadikoAdapter } from "./protocols/arkadiko";

// Backward compatibility
export const mockAdapter = {
  list: () => adapterManager.getAllOpportunities(),
  detail: (id: string) => adapterManager.getOpportunityDetail(id),
};
```

### Phase 4: Frontend Integration (Week 2-3)

#### 4.1 Update Web App Data Fetching
**Location**: Update `apps/web/app/opportunities/page.tsx`

```typescript
import { adapterManager } from "@adapters/core";

export default async function OpportunitiesPage() {
  // Now fetches real data from multiple sources
  const items = await adapterManager.getAllOpportunities();

  return (
    <div>
      <h1>Yield Opportunities</h1>
      <p>Live data from DefiLlama and Arkadiko</p>

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        {items.map(item => (
          <OpportunityCard key={item.id} opportunity={item} />
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '1rem',
      borderRadius: '8px',
      position: 'relative'
    }}>
      {/* Protocol logo */}
      {opportunity.logoUrl && (
        <img
          src={opportunity.logoUrl}
          alt={opportunity.protocol}
          style={{ width: '24px', height: '24px', position: 'absolute', top: '1rem', right: '1rem' }}
        />
      )}

      <h3>{opportunity.protocol} - {opportunity.pool}</h3>

      {/* Enhanced APR/APY display */}
      <div>
        <p>APR: {(opportunity.apr * 100).toFixed(2)}% → APY: {(opportunity.apy * 100).toFixed(2)}%</p>
        {opportunity.apyBase && opportunity.apyReward && (
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Base: {(opportunity.apyBase * 100).toFixed(2)}% + Rewards: {(opportunity.apyReward * 100).toFixed(2)}%
          </p>
        )}
      </div>

      {/* Risk and TVL */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <p>Risk: <span style={{
          color: opportunity.risk === 'low' ? 'green' : opportunity.risk === 'med' ? 'orange' : 'red'
        }}>{opportunity.risk}</span></p>

        {opportunity.tvlUsd && <p>TVL: ${opportunity.tvlUsd.toLocaleString()}</p>}
      </div>

      {/* Reward tokens */}
      {Array.isArray(opportunity.rewardToken) && opportunity.rewardToken.length > 0 && (
        <p>Rewards: {opportunity.rewardToken.join(', ')}</p>
      )}

      {/* Source indicator */}
      <p style={{ fontSize: '0.75rem', color: '#888' }}>
        Source: {opportunity.source} • Updated: {new Date(opportunity.lastUpdated).toLocaleTimeString()}
      </p>

      <a href={`/opportunities/${opportunity.id}`} style={{
        display: 'inline-block',
        marginTop: '0.5rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: '#0070f3',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        View Details
      </a>
    </div>
  );
}
```

#### 4.2 Chart Integration for Opportunity Details
**Location**: `apps/web/app/opportunities/[id]/page.tsx`

```typescript
import { adapterManager } from "@adapters/core";
import { ChartComponent } from "../../../components/Chart";

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const opportunity = await adapterManager.getOpportunityDetail(params.id);

  // Fetch chart data if poolId available (DefiLlama)
  let chartData = null;
  if (opportunity.poolId) {
    try {
      chartData = await adapterManager.getChartData(opportunity.poolId);
    } catch (error) {
      console.warn('Chart data unavailable:', error);
    }
  }

  return (
    <div>
      <h1>{opportunity.protocol} - {opportunity.pool}</h1>

      {/* Opportunity details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3>Pool Information</h3>
          <p>Tokens: {opportunity.tokens.join(' / ')}</p>
          <p>APR: {(opportunity.apr * 100).toFixed(2)}%</p>
          <p>APY: {(opportunity.apy * 100).toFixed(2)}%</p>
          <p>TVL: ${opportunity.tvlUsd.toLocaleString()}</p>
          <p>Risk Level: {opportunity.risk}</p>
        </div>

        <div>
          <h3>Rewards</h3>
          <p>Reward Token: {Array.isArray(opportunity.rewardToken) ? opportunity.rewardToken.join(', ') : opportunity.rewardToken}</p>
          {opportunity.apyBase && <p>Base APY: {(opportunity.apyBase * 100).toFixed(2)}%</p>}
          {opportunity.apyReward && <p>Reward APY: {(opportunity.apyReward * 100).toFixed(2)}%</p>}
        </div>
      </div>

      {/* Chart */}
      {chartData && (
        <div>
          <h3>Historical Performance</h3>
          <ChartComponent data={chartData} />
        </div>
      )}

      {/* Deposit UI (existing disabled state) */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Deposit (Coming Soon)</h3>
        <p>Connect your wallet to deposit into this opportunity.</p>
        <button disabled style={{ padding: '0.5rem 1rem', backgroundColor: '#ccc' }}>
          Deposit (BETA)
        </button>
      </div>
    </div>
  );
}
```

### Phase 5: Portfolio Integration (Week 3)

#### 5.1 Portfolio Data Service
**Location**: `packages/adapters/src/services/portfolio.ts`

```typescript
export class PortfolioService {
  async getUserPositions(userAddress: string): Promise<UserPosition[]> {
    // Read router contract events for user deposits
    // This would integrate with Clarinet SDK to read blockchain data
    return [];
  }

  async calculateYieldEstimates(positions: UserPosition[]): Promise<YieldEstimate[]> {
    // Calculate potential yields based on current APY rates
    const opportunities = await adapterManager.getAllOpportunities();

    return positions.map(position => {
      const opportunity = opportunities.find(op => op.id === position.opportunityId);
      if (!opportunity) return null;

      const estimatedYield = position.amount * opportunity.apy * (position.daysHeld / 365);

      return {
        opportunityId: position.opportunityId,
        currentValue: position.amount,
        estimatedYield,
        apr: opportunity.apr,
        apy: opportunity.apy,
      };
    }).filter(Boolean);
  }
}

interface UserPosition {
  opportunityId: string;
  amount: number;
  depositDate: number;
  daysHeld: number;
  txHash: string;
}

interface YieldEstimate {
  opportunityId: string;
  currentValue: number;
  estimatedYield: number;
  apr: number;
  apy: number;
}
```

### Phase 6: Error Handling & Monitoring (Week 3-4)

#### 6.1 Enhanced Error Handling
**Location**: `packages/adapters/src/utils/error-handler.ts`

```typescript
export class ApiErrorHandler {
  static async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      console.warn(`${context} primary source failed, using fallback:`, error);
      return await fallback();
    }
  }

  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }
}
```

#### 6.2 Health Check Endpoints
**Location**: `apps/web/app/api/health/route.ts`

```typescript
import { adapterManager } from "@adapters/core";

export async function GET() {
  const health = {
    timestamp: new Date().toISOString(),
    adapters: {} as Record<string, any>
  };

  // Test each adapter
  try {
    const opportunities = await adapterManager.getAllOpportunities();
    health.adapters.total_opportunities = opportunities.length;
    health.adapters.by_source = opportunities.reduce((acc, opp) => {
      acc[opp.source] = (acc[opp.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    health.adapters.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return Response.json(health);
}
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Create API service classes (DefiLlama, Arkadiko)
- [ ] Add API response type definitions
- [ ] Extend shared types for new data fields
- [ ] Update existing adapter classes

### Week 2: Integration & Aggregation
- [ ] Implement enhanced AdapterManager with caching
- [ ] Update frontend to use real data
- [ ] Add chart integration for DefiLlama pools
- [ ] Implement opportunity detail pages with enhanced data

### Week 3: Portfolio & Polish
- [ ] Create portfolio service for user positions
- [ ] Add error handling and fallback mechanisms
- [ ] Implement health check endpoints
- [ ] Add data source indicators in UI

### Week 4: Testing & Optimization
- [ ] Add comprehensive tests for new adapters
- [ ] Performance optimization and caching tuning
- [ ] Documentation updates
- [ ] Deployment preparation

## Environment Configuration

### Required Environment Variables
```bash
# .env.example
DEFILLAMA_API_URL=https://yields.llama.fi
ARKADIKO_API_URL=https://arkadiko-api.herokuapp.com/api/v1

# Optional: API keys for rate limit increases
DEFILLAMA_API_KEY=
ARKADIKO_API_KEY=

# Cache configuration
ADAPTER_CACHE_TTL=300000  # 5 minutes
OPPORTUNITY_REFRESH_INTERVAL=60000  # 1 minute
```

## Risk Mitigation

1. **API Reliability**: All adapters implement fallback to mock data when APIs are unavailable
2. **Rate Limiting**: Implement caching and request throttling to avoid API limits
3. **Data Quality**: Add validation for API responses and reasonable defaults
4. **Backward Compatibility**: Existing mockAdapter interface is preserved
5. **Graceful Degradation**: UI shows data source and freshness indicators

## Success Metrics

1. **Data Freshness**: Opportunities updated within 5 minutes of API changes
2. **API Coverage**: Support for 10+ pools from DefiLlama and 5+ from Arkadiko
3. **Uptime**: 99%+ availability with fallback to mock data
4. **Performance**: Page load times under 2 seconds with caching
5. **Accuracy**: APR/APY data within 0.1% of source APIs

## Future Enhancements

1. **Multi-chain Support**: Extend to Ethereum and Solana via DefiLlama
2. **Real-time Updates**: WebSocket connections for live data updates
3. **Advanced Analytics**: Historical performance tracking and yield predictions
4. **Smart Routing**: Automatic opportunity comparison and recommendations
5. **Portfolio Analytics**: Detailed performance tracking and tax reporting

This plan provides a comprehensive path to integrate real data while maintaining the existing architecture and ensuring robust fallback mechanisms.