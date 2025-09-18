# Risk Engine Implementation Plan

## Executive Summary

This document outlines the implementation plan for a comprehensive 5-component deterministic risk scoring system for yield farming opportunities. The system generates risk scores from 0-100 (higher = riskier) using existing adapter data and additional historical data sources.

## Current Data Analysis

### Available Data Sources

#### ✅ DefiLlama Adapter - Fully Supported
**Current Snapshot Data:**
- `tvlUsd`, `apy`, `apyBase`, `apyReward`
- `volumeUsd1d`, `volumeUsd7d` (some pools)
- `apyPct1D`, `apyPct7D`, `apyPct30D` - APY percentage changes
- `apyMean30d` - 30-day average APY
- `stablecoin`, `ilRisk`, `exposure` - Risk categorization
- `mu`, `sigma`, `count` - Statistical measures
- `predictions` - ML-based risk predictions

**Historical Time Series (Chart API):**
- Daily `timestamp`, `tvlUsd`, `apy`, `apyBase`, `apyReward`
- Complete historical data going back 2+ years
- Perfect for TVL_7, TVL_30, TVL_90 and APR_30, APR_90 arrays

#### ✅ Arkadiko Adapter - Partially Supported
**Current Data:**
- `tvlUsd`, estimated APR/APY
- `volume24h`, `liquidity_in_usd`
- Pool balances, swap fees
- Protocol-specific metadata

**Limitations:**
- No historical time series
- Limited volume data
- No participants count

### Data Gaps Analysis

#### ❌ Critical Missing Data
1. **Participants Count** - Required for concentration risk calculations
2. **Historical Volume Arrays** - Limited availability for volume volatility analysis
3. **Granular User Activity** - No user-level transaction data

#### 🔄 Available Alternatives & Workarounds
1. **Volume-based Participant Estimation** - Use TVL/Volume ratios as proxy
2. **Cross-chain Data Enrichment** - Use DefiLlama historical charts for all protocols
3. **Statistical Modeling** - Use volatility measures from available data

## Risk Model Implementation Strategy

### Phase 1: Core Risk Engine (Immediate Implementation)

#### 1.1 Risk Calculator Service
```typescript
// packages/shared/src/services/risk-calculator.ts
export class RiskCalculator {
  calculateRiskScore(data: RiskInputData): RiskScore;
  calculateLiquidityRisk(input: LiquidityInput): ComponentScore;
  calculateStabilityRisk(input: StabilityInput): ComponentScore;
  calculateYieldSustainabilityRisk(input: YieldInput): ComponentScore;
  calculateConcentrationRisk(input: ConcentrationInput): ComponentScore;
  calculateMomentumRisk(input: MomentumInput): ComponentScore;
}
```

#### 1.2 Historical Data Service
```typescript
// packages/adapters/src/services/historical-data.ts
export class HistoricalDataService {
  async getTimeSeriesData(poolId: string, days: number): Promise<TimeSeriesData>;
  async enrichOpportunityWithHistoricalData(opportunity: Opportunity): Promise<EnrichedOpportunity>;
  private normalizeDataToArrays(chartData: any[]): HistoricalArrays;
  private fillMissingData(arrays: HistoricalArrays): HistoricalArrays;
}
```

#### 1.3 Extended Opportunity Types
```typescript
// packages/shared/src/types.ts
export interface EnrichedOpportunity extends Opportunity {
  riskScore: RiskScore;
  historicalData?: HistoricalData;
  riskFactors: RiskFactor[];
}

export interface RiskScore {
  total: number; // 0-100
  label: 'low' | 'medium' | 'high';
  components: {
    liquidity: number;    // LQ: 0-100
    stability: number;    // ST: 0-100
    yield: number;        // YS: 0-100
    concentration: number; // CN: 0-100
    momentum: number;     // MO: 0-100
  };
  drivers: string[]; // Top 2 risk factors
  confidence: 'high' | 'medium' | 'low';
}

export interface HistoricalData {
  tvl_7: number[];    // Last 7 daily TVL values
  tvl_30: number[];   // Last 30 daily TVL values
  tvl_90: number[];   // Last 90 daily TVL values
  apr_30: number[];   // Last 30 daily APR values
  apr_90: number[];   // Last 90 daily APR values
  vol_30?: number[];  // Last 30 daily volume values (when available)
}
```

### Phase 2: Enhanced Data Collection (Week 2-3)

#### 2.1 Multi-Source Data Aggregation
```typescript
// packages/adapters/src/services/data-enrichment.ts
export class DataEnrichmentService {
  async enrichWithDefiLlamaData(opportunity: Opportunity): Promise<EnrichedOpportunity>;
  async enrichWithArkadikoData(opportunity: Opportunity): Promise<EnrichedOpportunity>;
  async estimateParticipants(tvl: number, volume24h: number, protocol: string): Promise<number>;
  private fallbackToStatisticalEstimates(opportunity: Opportunity): PartialRiskData;
}
```

#### 2.2 Risk Model Calibration
- Implement reference value detection per chain/protocol
- Add winsorization for outlier handling
- Implement confidence scoring based on data completeness

### Phase 3: Advanced Features (Week 4+)

#### 3.1 Real-time Risk Monitoring
- Background risk score updates
- Risk alert system for significant changes
- Historical risk trend analysis

#### 3.2 ML-Enhanced Risk Prediction
- Integrate DefiLlama's ML predictions
- Train custom risk models on historical data
- Implement ensemble scoring methods

## Implementation Architecture

### Component Breakdown

#### 1. Liquidity Risk (LQ) - 30% Weight
**Available Data:** ✅ Full Implementation Possible
- `depth = log10(TVL_now) / log10(TVL_ref_high)`
- `turnover = (VOL_24h / TVL_now) / turn_ref`
- `participation = estimated_participants / part_ref_high`

**Implementation Strategy:**
- Use DefiLlama TVL data directly
- Calculate turnover from available volume data
- Estimate participants using `estimateParticipants()` service

#### 2. Stability Risk (ST) - 25% Weight
**Available Data:** ✅ Full Implementation Possible (DefiLlama)
- `max_drawdown(TVL_30)`, `max_drawdown(TVL_90)` from chart API
- `volatility(VOL_30)` when available, fallback to TVL volatility
- `slope(TVL_7)` for trend analysis

**Implementation Strategy:**
- Primary: Use DefiLlama chart API for all pools with `pool` UUID
- Fallback: Statistical estimation for Arkadiko-only pools

#### 3. Yield Sustainability Risk (YS) - 20% Weight
**Available Data:** ✅ Full Implementation Possible
- `apr_level = APR_now / apr_ref_high`
- `apr_volatility = stdev(APR_30)` from chart API
- `apr_decay = (mean(APR_7) - mean(APR_30)) / mean(APR_30)`
- `apy_gap = (APY_now - APR_now) / APR_now`

**Implementation Strategy:**
- Leverage DefiLlama's rich APR/APY historical data
- Use `apyPct7D`, `apyPct30D` as additional volatility indicators

#### 4. Concentration Risk (CN) - 15% Weight
**Available Data:** ⚠️ Estimated Implementation Required
- `low_participants = part_ref_low / max(1, estimated_participants)`
- `whale_effect = (VOL_24h / max(1, estimated_participants)) / whale_ref`

**Implementation Strategy:**
- Estimate participants using TVL size, protocol popularity, volume patterns
- Use volume concentration as whale proxy
- Apply protocol-specific multipliers (DEX vs lending vs staking)

#### 5. Momentum/Flight Risk (MO) - 10% Weight
**Available Data:** ✅ Full Implementation Possible
- `outflow_7d = max(0, -(TVL_now - mean(TVL_7)) / mean(TVL_7))`
- `outflow_30d = max(0, -(TVL_now - mean(TVL_30)) / mean(TVL_30))`

**Implementation Strategy:**
- Calculate net flows from TVL time series
- Weight recent outflows more heavily
- Account for market-wide movements vs pool-specific flows

### Reference Values & Calibration

#### Dynamic Reference Calculation
```typescript
const REFERENCE_VALUES = {
  // TVL references (USD)
  TVL_REF_HIGH: 10_000_000,    // $10M+ considered high liquidity
  TVL_REF_FLOOR: 10_000,       // $10K minimum for inclusion

  // Volume/Turnover references
  TURN_REF: 0.20,              // 20% daily turnover considered healthy
  WHALE_REF_USD: 10_000,       // $10K+ volume per participant = whale activity

  // Participant references
  PART_REF_HIGH: 1000,         // 1000+ participants = good distribution
  PART_REF_LOW: 50,            // <50 participants = concentration risk

  // APR references
  APR_REF_HIGH: 0.50,          // 50%+ APR considered potentially unsustainable

  // Volatility references
  SLOPE_REF: 0.01,             // 1% TVL change per day reference
};
```

## Technical Implementation Plan

### Week 1: Foundation
1. ✅ **Risk Calculator Core** - Implement mathematical formulas
2. ✅ **Extended Types** - Add risk-related interfaces
3. ✅ **Historical Data Service** - DefiLlama chart integration
4. ✅ **Basic Risk UI** - Display risk scores in opportunity cards

### Week 2: Data Integration
1. ✅ **Multi-Adapter Support** - Handle both DefiLlama + Arkadiko
2. ✅ **Participant Estimation** - Statistical modeling service
3. ✅ **Reference Value Calibration** - Dynamic calculation per protocol
4. ✅ **Risk Detail Pages** - Component breakdown and explanations

### Week 3: Enhancement & Testing
1. ✅ **Confidence Scoring** - Based on data completeness
2. ✅ **Risk Alerts** - Threshold-based monitoring
3. ✅ **Historical Trends** - Risk evolution over time
4. ✅ **Comprehensive Testing** - Edge cases and fallbacks

### Week 4: Production & Optimization
1. ✅ **Performance Optimization** - Caching and background updates
2. ✅ **Error Handling** - Graceful degradation for missing data
3. ✅ **Documentation** - User guide and API docs
4. ✅ **Monitoring** - Risk calculation health metrics

## Expected Outcomes

### Data Coverage
- **DefiLlama Pools:** 95% complete risk scores (high confidence)
- **Arkadiko Pools:** 85% complete risk scores (medium confidence)
- **Cross-Protocol:** Standardized risk comparison

### Risk Score Distribution
- **Low Risk (0-30):** Stablecoin pairs, major protocol pools with >$1M TVL
- **Medium Risk (31-60):** Mixed asset pools, smaller established protocols
- **High Risk (61-100):** New protocols, low liquidity, volatile yield patterns

### User Benefits
1. **Risk-Aware Decision Making** - Clear 0-100 scores with explanations
2. **Portfolio Risk Management** - Aggregate risk across positions
3. **Opportunity Discovery** - Filter by risk tolerance
4. **Historical Context** - Risk trends and stability over time

## Implementation Dependencies

### Required Packages
```json
{
  "mathjs": "^12.0.0",           // Statistical calculations
  "date-fns": "^3.0.0",         // Date manipulation for time series
  "lodash": "^4.17.21",         // Array/object utilities
  "@types/lodash": "^4.14.0"    // TypeScript support
}
```

### New Files to Create
```
packages/shared/src/services/risk-calculator.ts
packages/shared/src/types/risk.ts
packages/adapters/src/services/historical-data.ts
packages/adapters/src/services/data-enrichment.ts
packages/adapters/src/utils/statistical-helpers.ts
apps/web/src/components/risk/RiskScore.tsx
apps/web/src/components/risk/RiskBreakdown.tsx
apps/web/src/hooks/useRiskData.ts
```

### Integration Points
1. **AdapterManager** - Add `getEnrichedOpportunities()` method
2. **Opportunity Components** - Display risk scores and breakdowns
3. **Detail Pages** - Show risk factor explanations and trends
4. **Filtering/Sorting** - Add risk-based opportunity discovery

## Risk Mitigation

### Data Quality Issues
- **Missing Historical Data:** Implement statistical estimation and confidence scoring
- **API Rate Limits:** Add intelligent caching and background refresh
- **Data Inconsistencies:** Normalize and validate data across sources

### Performance Concerns
- **Complex Calculations:** Cache risk scores with TTL-based invalidation
- **Historical Data Volume:** Fetch and store only required time windows
- **Real-time Updates:** Use background workers for risk recalculation

### User Experience
- **Risk Score Interpretation:** Provide clear explanations and examples
- **Technical Complexity:** Abstract mathematical details behind intuitive UI
- **Decision Paralysis:** Offer risk-based recommendation presets

## Success Metrics

### Technical KPIs
- **Data Coverage:** >90% of opportunities have risk scores
- **Calculation Performance:** <500ms for risk score generation
- **Data Freshness:** Risk scores updated within 1 hour of new data

### User Engagement
- **Risk-Based Filtering:** % of users who filter by risk level
- **Detail Page Views:** Engagement with risk breakdowns and explanations
- **Decision Quality:** Correlation between risk scores and user outcomes

---

*This implementation plan provides a phased approach to building a comprehensive, data-driven risk assessment system that enhances user decision-making while working within current data availability constraints.*