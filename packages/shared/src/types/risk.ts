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

export interface ComponentScore {
  score: number; // 0-100
  factors: RiskFactor[];
  confidence: number; // 0-1
}

export interface RiskFactor {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface HistoricalData {
  tvl_7: number[];    // Last 7 daily TVL values
  tvl_30: number[];   // Last 30 daily TVL values
  tvl_90: number[];   // Last 90 daily TVL values
  apr_30: number[];   // Last 30 daily APR values
  apr_90: number[];   // Last 90 daily APR values
  vol_30?: number[];  // Last 30 daily volume values (when available)
}

export interface TimeSeriesData {
  timestamp: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  volumeUsd?: number;
}

export interface HistoricalArrays {
  tvl_7: number[];
  tvl_30: number[];
  tvl_90: number[];
  apr_30: number[];
  apr_90: number[];
  vol_30: number[];
  timestamps: string[];
}

// Risk calculation inputs
export interface RiskInputData {
  // Current state
  tvlUsd: number;
  apr: number;
  apy: number;
  volume24h?: number;
  protocol: string;
  chain: string;
  tokens: string[];

  // Historical data
  historicalData?: HistoricalData;

  // Additional metadata
  stablecoin?: boolean;
  ilRisk?: string;
  exposure?: string;
  rewardTokens?: string[];
}

export interface LiquidityInput {
  tvlUsd: number;
  volume24h: number;
  estimatedParticipants: number;
  protocol: string;
}

export interface StabilityInput {
  tvl_7: number[];
  tvl_30: number[];
  tvl_90: number[];
  vol_30?: number[];
}

export interface YieldInput {
  apr: number;
  apy: number;
  apr_30: number[];
  apr_90: number[];
  apyPct7D?: number;
  apyPct30D?: number;
}

export interface ConcentrationInput {
  estimatedParticipants: number;
  volume24h: number;
  tvlUsd: number;
  protocol: string;
}

export interface MomentumInput {
  tvl_7: number[];
  tvl_30: number[];
  currentTvl: number;
}

// Enriched opportunity with risk data
export interface EnrichedOpportunity {
  // Base opportunity data
  id: string;
  chain: string;
  protocol: string;
  pool: string;
  tokens: string[];
  apr: number;
  apy: number;
  rewardToken: string | string[];
  tvlUsd: number;
  risk: "low" | "med" | "high";
  source: "api" | "mock";
  lastUpdated: number;
  disabled?: boolean;

  // Extended metadata
  poolId?: string;
  underlyingTokens?: string[];
  volume24h?: number;
  fees24h?: number;
  logoUrl?: string;
  exposure?: string;
  ilRisk?: string;
  stablecoin?: boolean;

  // Risk assessment
  riskScore: RiskScore;
  historicalData?: HistoricalData;
  riskFactors: RiskFactor[];
}

// Reference values for risk calculations
export interface ReferenceValues {
  // TVL references (USD)
  TVL_REF_HIGH: number;    // $10M+ considered high liquidity
  TVL_REF_FLOOR: number;   // $10K minimum for inclusion

  // Volume/Turnover references
  TURN_REF: number;        // 20% daily turnover considered healthy
  WHALE_REF_USD: number;   // $10K+ volume per participant = whale activity

  // Participant references
  PART_REF_HIGH: number;   // 1000+ participants = good distribution
  PART_REF_LOW: number;    // <50 participants = concentration risk

  // APR references
  APR_REF_HIGH: number;    // 50%+ APR considered potentially unsustainable

  // Volatility references
  SLOPE_REF: number;       // 1% TVL change per day reference
}

// Statistical measures
export interface StatisticalMeasures {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  skewness?: number;
  kurtosis?: number;
}

// Risk calculation configuration
export interface RiskCalculationConfig {
  weights: {
    liquidity: number;    // 0.30
    stability: number;    // 0.25
    yield: number;        // 0.20
    concentration: number; // 0.15
    momentum: number;     // 0.10
  };
  references: ReferenceValues;
  protocols: {
    [protocol: string]: {
      participantMultiplier: number;
      riskAdjustment: number;
      minTvlThreshold: number;
    };
  };
}

// Data enrichment types
export interface PartialRiskData {
  estimatedParticipants?: number;
  historicalData?: Partial<HistoricalData>;
  confidence: number;
  source: 'estimation' | 'api' | 'hybrid';
}