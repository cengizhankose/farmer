// Enhanced types for frontend data visualization
export type Timeframe = '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL';

// Basic chart data interface
export interface ChartData {
  timestamps: number[];
  tvlUsd: number[];
  volume?: number[];
  apy?: number[];
  apyBase?: number[];
  apyReward?: number[];
  price?: number[];
  fees?: number[];
  participants?: number[];
}

// Historical data interface
export interface HistoricalData {
  timeframe: Timeframe;
  data: ChartData;
  metadata: {
    startTime: number;
    endTime: number;
    dataPoints: number;
    completeness: number;
  };
}

// Enhanced participant data with blockchain-level analysis
export interface EnhancedParticipantData {
  uniqueParticipants: number;
  transactionCount: number;
  totalVolume: number;
  averageTransactionSize: number;
  whaleTransactionCount: number;
  activeUsers24h: number;
  giniCoefficient: number;
  concentrationRisk: number;
  newUsers24h: number;
  retentionRate: number;
  participantGrowth7d: number;
  participantGrowth30d: number;
}

// Enhanced liquidity data with market depth analysis
export interface EnhancedLiquidityData {
  currentTvl: number;
  volume24h: number;
  uniqueParticipants24h: number;
  whaleTransactionCount: number;
  orderBookDepth?: number;
  slippage1Percent?: number;
  liquidityDepth: {
    depth1m: number;
    depth5m: number;
    depth10m: number;
    depth1h: number;
  };
  turnoverRatio: number;
  volumeTvlRatio: number;
  liquidityScore: number;
  marketDepthScore: number;
}

// Enhanced stability data with volatility metrics
export interface EnhancedStabilityData {
  tvlVolatility30d: number;
  maxDrawdown30d: number;
  tvlTrend7d: number;
  priceVolatility30d: number;
  currentTvl?: number;
  currentApr?: number;
  priceReturn24h?: number;
  volatilityScore: number;
  stabilityScore: number;
  drawdownRecovery: number;
  trendConsistency: number;
  riskAdjustedReturn: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
}

// Enhanced yield data with sustainability analysis
export interface EnhancedYieldData {
  apr: number;
  apy: number;
  tradingFeeApr: number;
  rewardTokenApr: number;
  rewardTokenPrice: number;
  rewardTokenVolatility30d: number;
  aprVolatility30d: number;
  yieldVolatility30d: number;
  sustainableApr: number;
  yieldScore: number;
  rewardDependencyRatio: number;
  incentiveQuality: number;
  earningsConsistency: number;
}

// Enhanced concentration risk data
export interface EnhancedConcentrationData {
  top10HolderPercentage: number;
  holderCount: number;
  giniCoefficient: number;
  herfindahlIndex: number;
  largestHolderPercentage: number;
  whaleTransactionRatio: number;
  concentrationScore: number;
  distributionScore: number;
  decentralizationLevel: 'high' | 'medium' | 'low';
}

// Enhanced momentum data with trend analysis
export interface EnhancedMomentumData {
  tvlGrowth7d: number;
  tvlGrowth30d: number;
  volumeGrowth7d: number;
  volumeGrowth30d: number;
  participantGrowth7d: number;
  momentumScore: number;
  trendStrength: number;
  sentimentIndicator: number;
  growthSustainability: number;
}

// Value projection data with Monte Carlo simulation
export interface ValueProjection {
  timeframe: '1d' | '3d' | '7d' | '15d' | '30d' | '90d';
  scenarios: {
    bearish: {
      projectedValue: number;
      probability: number;
      confidence: number;
      range: [number, number];
    };
    neutral: {
      projectedValue: number;
      probability: number;
      confidence: number;
      range: [number, number];
    };
    bullish: {
      projectedValue: number;
      probability: number;
      confidence: number;
      range: [number, number];
    };
  };
  expectedValue: number;
  volatility: number;
  confidenceInterval: [number, number];
  simulationCount: number;
}

// Market and social sentiment data
export interface MarketSentimentData {
  socialSentiment: number;
  newsSentiment: number;
  onchainSentiment: number;
  overallSentiment: number;
  sentimentTrend: 'improving' | 'stable' | 'declining';
  socialVolume: number;
  mentions24h: number;
  uniqueMentions: number;
  sentimentScore: number;
}

// Blockchain-specific metrics for Stacks
export interface BlockchainMetrics {
  contractTransactions: number;
  contractVolume: number;
  uniqueSenders: number;
  uniqueReceivers: number;
  averageGasUsed: number;
  transactionFrequency: number;
  networkCongestion: number;
  healthScore: number;
  activityScore: number;
}

// Comprehensive enhanced opportunity data
export interface EnhancedOpportunityData {
  // Basic data
  id: string;
  protocol: string;
  pool: string;
  chain: string;
  tokens: string[];

  // Enhanced financial data
  tvlUsd: number;
  apr: number;
  apy: number;
  volume24h: number;
  fees24h: number;
  marketCap?: number;
  fullyDilutedValuation?: number;

  // Enhanced participant data
  participants: EnhancedParticipantData;

  // Enhanced liquidity data
  liquidity: EnhancedLiquidityData;

  // Enhanced stability data
  stability: EnhancedStabilityData;

  // Enhanced yield data
  yield: EnhancedYieldData;

  // Enhanced concentration data
  concentration: EnhancedConcentrationData;

  // Enhanced momentum data
  momentum: EnhancedMomentumData;

  // Market sentiment
  sentiment?: MarketSentimentData;

  // Blockchain metrics
  blockchain: BlockchainMetrics;

  // Risk analysis
  riskScore: any; // Will be imported from @shared/core

  // Historical data
  historicalData: HistoricalData;

  // Chart data
  chartData: {
    tvl: ChartData;
    apr: ChartData;
    volume: ChartData;
    participants?: ChartData;
    price?: ChartData;
    fees?: ChartData;
  };

  // Value projections
  projections: ValueProjection[];

  // Metadata
  lastUpdated: number;
  dataQuality: {
    completeness: number;
    reliability: number;
    timeliness: number;
    overallScore: number;
  };
}

// Chart component props
export interface ChartComponentProps {
  data: ChartData;
  timeframe: Timeframe;
  title: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  color?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
}

// Enhanced risk breakdown props
export interface EnhancedRiskBreakdownProps {
  riskScore: any; // Will be imported from @shared/core
  enhancedData: {
    liquidity: EnhancedLiquidityData;
    stability: EnhancedStabilityData;
    yield: EnhancedYieldData;
    concentration: EnhancedConcentrationData;
    momentum: EnhancedMomentumData;
  };
  showDetails?: boolean;
  showFactors?: boolean;
}

// Value projection component props
export interface ValueProjectionProps {
  projections: ValueProjection[];
  currentTvl: number;
  timeframe?: Timeframe;
  showScenarios?: boolean;
  showChart?: boolean;
}

// Enhanced metrics card props
export interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  description?: string;
  format?: 'currency' | 'percentage' | 'number' | 'custom';
  precision?: number;
  trend?: 'up' | 'down' | 'stable';
}

// Data table component props
export interface DataTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    type?: 'string' | 'number' | 'percentage' | 'currency' | 'date';
    format?: (value: any) => string;
    sortable?: boolean;
  }[];
  sortable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

// Time selector component props
export interface TimeSelectorProps {
  timeframes: Timeframe[];
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
  disabled?: boolean;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  retry?: () => void;
}

// Theme configuration
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    neutral: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
  };
}