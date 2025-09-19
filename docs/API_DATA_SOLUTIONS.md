# API Data Solutions for Stacks Yield Aggregator

## Overview

This document outlines comprehensive API data solutions for collecting, processing, and enriching yield farming data for the Stacks ecosystem. The solution addresses the core data requirements for 24h volume, participant estimation, detailed risk analysis, chart data, and value projections.

## Current Data Analysis

### Existing Implementation
The current system integrates with:
- **ALEX Protocol**: Direct API integration for pool data, TVL, APR, and 24h volume
- **Arkadiko Protocol**: API integration for tickers, pools, and vaults data
- **DefiLlama**: Cross-chain yield aggregator for comprehensive pool coverage

### Data Gaps Identified
1. **Participant Estimation**: Currently estimated using TVL/volume heuristics
2. **Historical Data**: Limited 7-90 day historical data for risk calculations
3. **Real-time Volume**: 24h volume available but participant count estimated
4. **Chart Data**: Basic historical data, needs enhancement for visualization
5. **Risk Analysis**: 5-component risk model needs more accurate data inputs

## Required Data Points & Solutions

### 1. 24h Volume & Participants Data

#### Current Sources
```typescript
// ALEX API provides direct volume data
interface AlexPoolData {
  volume_24h: number;
  fees_24h: number;
  total_liquidity: number;
}

// Arkadiko API provides volume through tickers
interface ArkadikoTicker {
  base_volume: number;
  target_volume: number;
  base_price: number;
  target_price: number;
  liquidity_in_usd: number;
}
```

#### Enhanced Solutions

**A. Blockchain Transaction Analysis**
```typescript
interface TransactionData {
  block_height: number;
  tx_id: string;
  sender_address: string;
  contract_call: {
    contract_id: string;
    function_name: string;
    arguments: any[];
  };
  fee_rate: number;
  timestamp: number;
}

// Analyze pool transactions to count unique participants
async function calculateRealParticipants(poolId: string, timeframe: '24h' | '7d' | '30d'): Promise<{
  uniqueParticipants: number;
  transactionCount: number;
  avgTransactionSize: number;
}> {
  // Query Hiro or Stacks API for pool transactions
  const transactions = await stacksApi.getContractTransactions(
    poolContractId,
    timeframe
  );

  const uniqueSenders = new Set(transactions.map(tx => tx.sender_address));
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.fee_rate, 0);

  return {
    uniqueParticipants: uniqueSenders.size,
    transactionCount: transactions.length,
    avgTransactionSize: totalVolume / transactions.length
  };
}
```

**B. LP Token Holder Analysis**
```typescript
// Query STX-20 token holders for LP tokens
async function getLPHolderCount(poolAddress: string): Promise<number> {
  const holders = await stacksApi.getTokenHolders(poolAddress);
  return holders.filter(holder => holder.balance > 0).length;
}
```

### 2. Detailed 5-Part Risk Analysis

#### Enhanced Data Sources for Risk Components

**A. Liquidity Risk (30% weight)**
```typescript
interface LiquidityData {
  // Current metrics
  tvlUsd: number;
  volume24h: number;
  fees24h: number;

  // Participant metrics (enhanced)
  uniqueParticipants24h: number;
  uniqueParticipants7d: number;
  whaleTransactionCount: number;

  // Depth analysis
  orderBookDepth?: number;
  slippage1Percent?: number;
  slippage5Percent?: number;

  // Time-based analysis
  avgVolume7d: number;
  volumeTrend: 'increasing' | 'stable' | 'decreasing';
}

// Enhanced liquidity calculation
function calculateEnhancedLiquidityRisk(data: LiquidityData): ComponentScore {
  // TVL Depth (20%)
  const depthScore = calculateTvlDepthScore(data.tvlUsd);

  // Volume Consistency (25%)
  const volumeScore = calculateVolumeConsistencyScore(data.volume24h, data.avgVolume7d);

  // Participant Distribution (30%)
  const participantScore = calculateParticipantDistributionScore(
    data.uniqueParticipants24h,
    data.uniqueParticipants7d,
    data.whaleTransactionCount
  );

  // Fee Health (15%)
  const feeScore = calculateFeeHealthScore(data.fees24h, data.tvlUsd);

  // Market Depth (10%)
  const depthScore = calculateMarketDepthScore(data.slippage1Percent);

  return weightedAverage([depthScore, volumeScore, participantScore, feeScore, depthScore]);
}
```

**B. Stability Risk (25% weight)**
```typescript
interface StabilityData {
  // TVL stability
  tvlHistory90d: number[];
  tvlVolatility30d: number;
  maxDrawdown30d: number;
  tvlTrend7d: number;

  // Price stability
  tokenPrices: {
    [token: string]: {
      price24h: number;
      volatility7d: number;
      volatility30d: number;
      correlationWithBTC: number;
    };
  };

  // Protocol stability
  contractUpgrades90d: number;
  securityIncidents: number;
  auditScore: number;
}

function calculateEnhancedStabilityRisk(data: StabilityData): ComponentScore {
  // TVL Volatility (30%)
  const tvlVolScore = calculateTvlVolatilityScore(data.tvlVolatility30d);

  // Maximum Drawdown (25%)
  const drawdownScore = calculateDrawdownScore(data.maxDrawdown30d);

  // Price Correlation (20%)
  const correlationScore = calculatePriceCorrelationScore(data.tokenPrices);

  // Protocol Health (15%)
  const protocolScore = calculateProtocolHealthScore(
    data.contractUpgrades90d,
    data.securityIncidents,
    data.auditScore
  );

  // Trend Analysis (10%)
  const trendScore = calculateTrendScore(data.tvlTrend7d);

  return weightedAverage([tvlVolScore, drawdownScore, correlationScore, protocolScore, trendScore]);
}
```

**C. Yield Sustainability Risk (20% weight)**
```typescript
interface YieldData {
  // Current yields
  apr: number;
  apy: number;
  apyBase: number;
  apyReward: number;

  // Yield components
  tradingFeeApr: number;
  rewardTokenApr: number;
  rewardTokenPrice: number;
  rewardTokenVolatility30d: number;

  // Historical yields
  aprHistory30d: number[];
  aprHistory90d: number[];
  yieldVolatility30d: number;

  // Sustainability metrics
  rewardEmissionSchedule: {
    dailyEmission: number;
    remainingDays: number;
    emissionDecayRate: number;
  };
}

function calculateEnhancedYieldRisk(data: YieldData): ComponentScore {
  // APR Level (25%)
  const aprLevelScore = calculateAprLevelScore(data.apr);

  // Yield Volatility (30%)
  const volatilityScore = calculateYieldVolatilityScore(data.yieldVolatility30d);

  // Reward Sustainability (25%)
  const rewardScore = calculateRewardSustainabilityScore(data.rewardEmissionSchedule);

  // Base vs Reward Ratio (20%)
  const ratioScore = calculateBaseRewardRatioScore(data.apyBase, data.apyReward);

  return weightedAverage([aprLevelScore, volatilityScore, rewardScore, ratioScore]);
}
```

**D. Concentration Risk (15% weight)**
```typescript
interface ConcentrationData {
  // Holder concentration
  top10HolderPercentage: number;
  top50HolderPercentage: number;
  giniCoefficient: number;

  // Transaction concentration
  whaleTransactionValue24h: number;
  whaleTransactionCount24h: number;
  avgTransactionSize24h: number;

  // Pool concentration
  singleTokenDominance: number;
  stablecoinRatio: number;
}

function calculateEnhancedConcentrationRisk(data: ConcentrationData): ComponentScore {
  // Holder Concentration (40%)
  const holderScore = calculateHolderConcentrationScore(data.giniCoefficient);

  // Whale Activity (35%)
  const whaleScore = calculateWhaleActivityScore(
    data.whaleTransactionValue24h,
    data.avgTransactionSize24h
  );

  // Pool Composition (25%)
  const compositionScore = calculatePoolCompositionScore(data.singleTokenDominance);

  return weightedAverage([holderScore, whaleScore, compositionScore]);
}
```

**E. Momentum Risk (10% weight)**
```typescript
interface MomentumData {
  // Flow metrics
  inflow24h: number;
  outflow24h: number;
  netFlow24h: number;
  flowTrend7d: number;

  // Growth metrics
  tvlGrowth7d: number;
  tvlGrowth30d: number;
  userGrowth7d: number;

  // Sentiment metrics
  socialMentions24h: number;
  sentimentScore: number;
  developerActivity: number;
}

function calculateEnhancedMomentumRisk(data: MomentumData): ComponentScore {
  // Flow Analysis (40%)
  const flowScore = calculateFlowScore(data.netFlow24h, data.flowTrend7d);

  // Growth Rate (35%)
  const growthScore = calculateGrowthScore(data.tvlGrowth7d, data.userGrowth7d);

  // Market Sentiment (25%)
  const sentimentScore = calculateSentimentScore(data.socialMentions24h, data.sentimentScore);

  return weightedAverage([flowScore, growthScore, sentimentScore]);
}
```

### 3. Chart Data Solutions

#### Enhanced Chart Data Structure
```typescript
interface ChartData {
  timestamps: string[];
  tvlUsd: number[];
  apy: number[];
  volumeUsd: number[];
  participants: number[];
  priceData: {
    [token: string]: number[];
  };
  feesUsd: number[];
}

// Multi-timeframe chart data provider
class ChartDataProvider {
  async getPoolChartData(
    poolId: string,
    timeframes: ('7D' | '30D' | '90D')[] = ['7D', '30D', '90D']
  ): Promise<{ [timeframe: string]: ChartData }> {
    const results: { [timeframe: string]: ChartData } = {};

    for (const timeframe of timeframes) {
      results[timeframe] = await this.getTimeframeData(poolId, timeframe);
    }

    return results;
  }

  private async getTimeframeData(poolId: string, timeframe: string): Promise<ChartData> {
    const days = timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : 90;

    // Combine multiple data sources
    const [defiLlamaData, chainData, protocolData] = await Promise.all([
      this.defiLlamaService.getPoolChart(poolId, days),
      this.stacksApi.getPoolTransactions(poolId, days),
      this.protocolService.getPoolMetrics(poolId, days)
    ]);

    return this.mergeDataSources(defiLlamaData, chainData, protocolData);
  }
}
```

### 4. Value Projection Solutions

#### Advanced Projection Models
```typescript
interface ValueProjection {
  timeframe: '1D' | '3D' | '7D' | '15D' | '30D' | '90D';
  projectedValue: number;
  confidence: number;
  methodology: string;
  factors: {
    tvlGrowth: number;
    yieldAccrual: number;
    priceAppreciation: number;
    riskAdjustment: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

class ValueProjectionService {
  async calculateProjections(
    opportunityId: string,
    initialInvestment: number
  ): Promise<{ [timeframe: string]: ValueProjection }> {
    const opportunity = await this.adapterManager.getOpportunityById(opportunityId);
    const historicalData = await this.getHistoricalData(opportunityId);

    const timeframes = ['1D', '3D', '7D', '15D', '30D', '90D'] as const;
    const projections: { [timeframe: string]: ValueProjection } = {};

    for (const timeframe of timeframes) {
      projections[timeframe] = await this.calculateTimeframeProjection(
        opportunity,
        historicalData,
        initialInvestment,
        timeframe
      );
    }

    return projections;
  }

  private async calculateTimeframeProjection(
    opportunity: Opportunity,
    historicalData: HistoricalData,
    investment: number,
    timeframe: string
  ): Promise<ValueProjection> {
    const days = this.timeframeToDays(timeframe);

    // Monte Carlo simulation for projection
    const simulations = await this.runMonteCarloSimulation(
      opportunity,
      historicalData,
      investment,
      days,
      1000 // 1000 simulations
    );

    return {
      timeframe,
      projectedValue: simulations.median,
      confidence: simulations.confidence,
      methodology: 'Monte Carlo with risk-adjusted returns',
      factors: {
        tvlGrowth: this.calculateTvlGrowthFactor(historicalData),
        yieldAccrual: this.calculateYieldFactor(opportunity.apy, days),
        priceAppreciation: this.calculatePriceFactor(historicalData),
        riskAdjustment: this.calculateRiskFactor(opportunity.risk)
      },
      scenarios: {
        optimistic: simulations.percentile90,
        realistic: simulations.median,
        pessimistic: simulations.percentile10
      }
    };
  }
}
```

## API Integration Strategy

### Primary Data Sources

**1. Stacks Blockchain APIs**
```typescript
// Hiro API (Stacks 2.0 mainnet)
const HIRO_API_BASE = 'https://api.hiro.so';

interface StacksApiService {
  // Contract transactions
  getContractTransactions(contractId: string, days: number): Promise<TransactionData[]>;

  // Token holders
  getTokenHolders(tokenAddress: string): Promise<Holder[]>;

  // Block data
  getBlocks(heightRange: { start: number; end: number }): Promise<BlockData[]>;

  // Contract state
  getContractState(contractId: string): Promise<ContractState>;
}

// Alternative: Stacks API
const STACKS_API_BASE = 'https://stacks-node-api.mainnet.stacks.co';
```

**2. Enhanced Protocol APIs**
```typescript
// ALEX Enhanced API
interface AlexEnhancedApi {
  getPoolDetailedMetrics(poolId: string): Promise<PoolMetrics>;
  getPoolHistoricalData(poolId: string, days: number): Promise<HistoricalData>;
  getTokenHolders(tokenAddress: string): Promise<Holder[]>;
}

// Arkadiko Enhanced API
interface ArkadikoEnhancedApi {
  getVaultDetailedMetrics(vaultId: string): Promise<VaultMetrics>;
  getPoolLiquidityProviders(poolId: string): Promise<Provider[]>;
  getProtocolTreasury(): Promise<TreasuryData>;
}
```

**3. Market Data APIs**
```typescript
// CoinGecko API
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

interface CoinGeckoService {
  getTokenPrice(contractAddress: string, days: number): Promise<PriceData[]>;
  getTokenMarketData(contractAddress: string): Promise<MarketData>;
  getMarketCapRank(contractAddress: string): Promise<number>;
}

// Alternative: CoinMarketCap
const CMC_API_BASE = 'https://pro-api.coinmarketcap.com/v1';
```

**4. Social & Sentiment APIs**
```typescript
// LunarCrush or alternative
interface SocialDataService {
  getSocialMetrics(tokenSymbol: string): Promise<SocialMetrics>;
  getSentimentScore(tokenSymbol: string): Promise<number>;
  getDeveloperActivity(contractId: string): Promise<DeveloperMetrics>;
}
```

### Data Processing Pipeline

```typescript
class DataProcessingPipeline {
  private services: {
    stacks: StacksApiService;
    protocols: ProtocolApiService;
    markets: MarketDataService;
    social: SocialDataService;
  };

  async processOpportunity(opportunity: Opportunity): Promise<EnrichedOpportunity> {
    // Fetch all data in parallel
    const [
      transactionData,
      holderData,
      priceData,
      socialData,
      historicalData
    ] = await Promise.all([
      this.fetchTransactionData(opportunity),
      this.fetchHolderData(opportunity),
      this.fetchPriceData(opportunity),
      this.fetchSocialData(opportunity),
      this.fetchHistoricalData(opportunity)
    ]);

    // Process and enrich
    const enhancedData = {
      ...opportunity,
      riskScore: await this.calculateEnhancedRiskScore(opportunity, {
        transactionData,
        holderData,
        priceData,
        socialData,
        historicalData
      }),
      participants: this.calculateRealParticipants(transactionData),
      historicalMetrics: this.processHistoricalMetrics(historicalData),
      projections: await this.calculateProjections(opportunity, historicalData)
    };

    return enhancedData;
  }
}
```

## Implementation Priority

### Phase 1: Core Enhancement (Weeks 1-2)
1. **Enhanced Participant Tracking**
   - Integrate with Hiro API for transaction analysis
   - Implement LP token holder counting
   - Add whale transaction detection

2. **Historical Data Enhancement**
   - Extend data collection to 90 days
   - Implement proper data storage and caching
   - Add data consistency validation

### Phase 2: Risk Analysis Enhancement (Weeks 3-4)
1. **Enhanced Risk Components**
   - Implement advanced liquidity analysis
   - Add stability metrics (TVL volatility, drawdowns)
   - Enhanced yield sustainability calculations
   - Concentration risk with Gini coefficient
   - Momentum analysis with flow metrics

2. **Chart Data Infrastructure**
   - Multi-timeframe data collection
   - Efficient data storage and retrieval
   - Real-time chart updates

### Phase 3: Advanced Features (Weeks 5-6)
1. **Value Projections**
   - Monte Carlo simulation implementation
   - Risk-adjusted return calculations
   - Multi-scenario projections

2. **Social & Sentiment Integration**
   - Social media monitoring
   - Developer activity tracking
   - Market sentiment analysis

## Error Handling & Fallbacks

### Data Source Redundancy
```typescript
class FallbackDataManager {
  async getWithFallback<T>(
    primaryRequest: () => Promise<T>,
    fallbackRequests: (() => Promise<T>)[],
    cacheKey: string
  ): Promise<T> {
    try {
      const result = await primaryRequest();
      await this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      // Try cached data first
      const cached = await this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }

      // Try fallback sources
      for (const fallback of fallbackRequests) {
        try {
          const fallbackResult = await fallback();
          await this.cache.set(cacheKey, fallbackResult);
          return fallbackResult;
        } catch (fallbackError) {
          continue;
        }
      }

      throw new Error(`All data sources failed for ${cacheKey}`);
    }
  }
}
```

### Data Validation
```typescript
class DataValidator {
  validateOpportunityData(data: any): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!data.tvlUsd || data.tvlUsd < 0) errors.push('Invalid TVL');
    if (!data.apr || data.apr < 0 || data.apr > 10) errors.push('Invalid APR');
    if (!data.apy || data.apy < 0 || data.apy > 20) errors.push('Invalid APY');

    // Reasonableness checks
    if (data.volume24h && data.volume24h > data.tvlUsd * 10) {
      errors.push('Volume exceeds TVL by unreasonable amount');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## Monitoring & Alerting

### Data Quality Monitoring
```typescript
class DataQualityMonitor {
  async checkDataQuality(): Promise<QualityReport> {
    const opportunities = await this.adapterManager.getAllOpportunities();
    const issues: DataQualityIssue[] = [];

    for (const opportunity of opportunities) {
      // Check for stale data
      if (Date.now() - opportunity.lastUpdated > 24 * 60 * 60 * 1000) {
        issues.push({
          type: 'stale_data',
          opportunityId: opportunity.id,
          severity: 'warning',
          message: 'Data not updated in 24 hours'
        });
      }

      // Check for missing volume data
      if (!opportunity.volume24h) {
        issues.push({
          type: 'missing_volume',
          opportunityId: opportunity.id,
          severity: 'warning',
          message: '24h volume data missing'
        });
      }
    }

    return {
      totalOpportunities: opportunities.length,
      issues,
      qualityScore: this.calculateQualityScore(issues.length, opportunities.length)
    };
  }
}
```

## Conclusion

This comprehensive API data solution provides:

1. **Real-time Data**: Accurate 24h volume and participant counts
2. **Enhanced Risk Analysis**: 5-component risk model with detailed data inputs
3. **Rich Chart Data**: Multi-timeframe historical data for visualization
4. **Value Projections**: Advanced projection models with risk adjustments
5. **Robust Infrastructure**: Fallback mechanisms, validation, and monitoring

The implementation follows a phased approach, prioritizing core data enhancements first, followed by advanced features. The solution ensures data accuracy, completeness, and reliability while providing comprehensive insights for yield farming decisions.