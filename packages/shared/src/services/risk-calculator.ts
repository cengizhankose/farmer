import {
  RiskScore,
  ComponentScore,
  RiskInputData,
  LiquidityInput,
  StabilityInput,
  YieldInput,
  ConcentrationInput,
  MomentumInput,
  RiskFactor,
  ReferenceValues,
  RiskCalculationConfig,
  StatisticalMeasures
} from '../types/risk';
import { mean, max, min, std } from 'mathjs';

export class RiskCalculator {
  private config: RiskCalculationConfig;

  constructor(config?: Partial<RiskCalculationConfig>) {
    this.config = {
      weights: {
        liquidity: 0.30,
        stability: 0.25,
        yield: 0.20,
        concentration: 0.15,
        momentum: 0.10,
      },
      references: {
        TVL_REF_HIGH: 10_000_000,    // $10M+ considered high liquidity
        TVL_REF_FLOOR: 10_000,       // $10K minimum for inclusion
        TURN_REF: 0.20,              // 20% daily turnover considered healthy
        WHALE_REF_USD: 10_000,       // $10K+ volume per participant = whale activity
        PART_REF_HIGH: 1000,         // 1000+ participants = good distribution
        PART_REF_LOW: 50,            // <50 participants = concentration risk
        APR_REF_HIGH: 0.50,          // 50%+ APR considered potentially unsustainable
        SLOPE_REF: 0.01,             // 1% TVL change per day reference
        VOLATILITY_REF_LOW: 0.05,    // 5% daily volatility considered low
        VOLATILITY_REF_HIGH: 0.30,  // 30%+ daily volatility considered high
        DRAWDOWN_REF_SEVERE: 0.40,  // 40%+ drawdown considered severe
        CORR_REF_HIGH: 0.8,   // 0.8+ correlation considered high
      },
      protocols: {
        'defillama': { participantMultiplier: 1.0, riskAdjustment: 0.0, minTvlThreshold: 100_000 },
        'arkadiko': { participantMultiplier: 0.8, riskAdjustment: 0.05, minTvlThreshold: 50_000 },
        'alex': { participantMultiplier: 0.9, riskAdjustment: 0.03, minTvlThreshold: 75_000 },
        'default': { participantMultiplier: 0.7, riskAdjustment: 0.10, minTvlThreshold: 25_000 },
      },
      ...config,
    };
  }

  calculateRiskScore(data: RiskInputData): RiskScore {
    // Estimate participants if not provided
    const estimatedParticipants = this.estimateParticipants(
      data.tvlUsd,
      data.volume24h || 0,
      data.protocol
    );

    // Calculate individual component scores
    const liquidityScore = this.calculateLiquidityRisk({
      tvlUsd: data.tvlUsd,
      volume24h: data.volume24h || 0,
      estimatedParticipants,
      protocol: data.protocol,
    });

    const stabilityScore = this.calculateStabilityRisk({
      tvl_7: data.historicalData?.tvl_7 || [data.tvlUsd],
      tvl_30: data.historicalData?.tvl_30 || [data.tvlUsd],
      tvl_90: data.historicalData?.tvl_90 || [data.tvlUsd],
      vol_30: data.historicalData?.vol_30,
    });

    const yieldScore = this.calculateYieldSustainabilityRisk({
      apr: data.apr,
      apy: data.apy,
      apr_30: data.historicalData?.apr_30 || [data.apr],
      apr_90: data.historicalData?.apr_90 || [data.apr],
    });

    const concentrationScore = this.calculateConcentrationRisk({
      estimatedParticipants,
      volume24h: data.volume24h || 0,
      tvlUsd: data.tvlUsd,
      protocol: data.protocol,
    });

    const momentumScore = this.calculateMomentumRisk({
      tvl_7: data.historicalData?.tvl_7 || [data.tvlUsd],
      tvl_30: data.historicalData?.tvl_30 || [data.tvlUsd],
      currentTvl: data.tvlUsd,
    });

    // Calculate weighted total score
    const totalScore = Math.round(
      liquidityScore.score * this.config.weights.liquidity +
      stabilityScore.score * this.config.weights.stability +
      yieldScore.score * this.config.weights.yield +
      concentrationScore.score * this.config.weights.concentration +
      momentumScore.score * this.config.weights.momentum
    );

    // Determine risk label
    const label = this.getRiskLabel(totalScore);

    // Collect all risk factors and find top drivers
    const allFactors = [
      ...liquidityScore.factors,
      ...stabilityScore.factors,
      ...yieldScore.factors,
      ...concentrationScore.factors,
      ...momentumScore.factors,
    ];

    const drivers = this.getTopRiskDrivers(allFactors);

    // Calculate overall confidence
    const confidence = this.calculateConfidence([
      liquidityScore.confidence,
      stabilityScore.confidence,
      yieldScore.confidence,
      concentrationScore.confidence,
      momentumScore.confidence,
    ]);

    return {
      total: Math.min(100, Math.max(0, totalScore)),
      label,
      components: {
        liquidity: Math.round(liquidityScore.score),
        stability: Math.round(stabilityScore.score),
        yield: Math.round(yieldScore.score),
        concentration: Math.round(concentrationScore.score),
        momentum: Math.round(momentumScore.score),
      },
      drivers,
      confidence,
    };
  }

  calculateLiquidityRisk(input: LiquidityInput): ComponentScore {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let confidence = 1.0;

    // 1. TVL Depth (40% of liquidity score)
    const depth = Math.log10(input.tvlUsd) / Math.log10(this.config.references.TVL_REF_HIGH);
    const depthScore = Math.max(0, Math.min(100, (1 - Math.min(1, depth)) * 100));
    totalScore += depthScore * 0.4;

    factors.push({
      name: 'TVL Depth',
      value: input.tvlUsd,
      impact: input.tvlUsd > this.config.references.TVL_REF_HIGH ? 'positive' : 'negative',
      description: `Pool has $${(input.tvlUsd / 1e6).toFixed(1)}M TVL`,
      severity: depthScore > 60 ? 'high' : depthScore > 30 ? 'medium' : 'low',
    });

    // 2. Turnover Ratio (35% of liquidity score)
    let turnoverScore = 0;
    if (input.volume24h > 0) {
      const turnover = (input.volume24h / input.tvlUsd) / this.config.references.TURN_REF;
      turnoverScore = Math.max(0, Math.min(100, Math.abs(turnover - 1) * 50));

      factors.push({
        name: 'Turnover Ratio',
        value: input.volume24h / input.tvlUsd,
        impact: turnover > 0.5 && turnover < 2 ? 'positive' : 'negative',
        description: `Daily turnover: ${((input.volume24h / input.tvlUsd) * 100).toFixed(1)}%`,
        severity: turnoverScore > 60 ? 'high' : turnoverScore > 30 ? 'medium' : 'low',
      });
    } else {
      turnoverScore = 50; // Medium risk when no volume data
      confidence *= 0.7;
    }
    totalScore += turnoverScore * 0.35;

    // 3. Participation Level (25% of liquidity score)
    const participation = input.estimatedParticipants / this.config.references.PART_REF_HIGH;
    const participationScore = Math.max(0, Math.min(100, (1 - Math.min(1, participation)) * 100));
    totalScore += participationScore * 0.25;

    factors.push({
      name: 'Participation',
      value: input.estimatedParticipants,
      impact: input.estimatedParticipants > this.config.references.PART_REF_LOW ? 'positive' : 'negative',
      description: `Estimated ${input.estimatedParticipants} participants`,
      severity: participationScore > 60 ? 'high' : participationScore > 30 ? 'medium' : 'low',
    });

    return {
      score: totalScore,
      factors,
      confidence,
    };
  }

  calculateStabilityRisk(input: StabilityInput): ComponentScore {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let confidence = 1.0;

    // 1. TVL Volatility (40% of stability score)
    const tvlVolatility = this.calculateVolatility(input.tvl_30);
    const volatilityScore = Math.min(100, tvlVolatility * 200); // Scale volatility to 0-100
    totalScore += volatilityScore * 0.4;

    factors.push({
      name: 'TVL Volatility',
      value: tvlVolatility,
      impact: tvlVolatility < 0.1 ? 'positive' : 'negative',
      description: `TVL volatility: ${(tvlVolatility * 100).toFixed(1)}%`,
      severity: volatilityScore > 60 ? 'high' : volatilityScore > 30 ? 'medium' : 'low',
    });

    // 2. Maximum Drawdown (35% of stability score)
    const maxDrawdown = this.calculateMaxDrawdown(input.tvl_30);
    const drawdownScore = Math.min(100, maxDrawdown * 100);
    totalScore += drawdownScore * 0.35;

    factors.push({
      name: 'Max Drawdown',
      value: maxDrawdown,
      impact: maxDrawdown < 0.2 ? 'positive' : 'negative',
      description: `Maximum 30-day drawdown: ${(maxDrawdown * 100).toFixed(1)}%`,
      severity: drawdownScore > 60 ? 'high' : drawdownScore > 30 ? 'medium' : 'low',
    });

    // 3. TVL Trend (25% of stability score)
    const trend = this.calculateTrend(input.tvl_7);
    const trendScore = Math.max(0, Math.min(100, -trend * 500)); // Negative trend = higher risk
    totalScore += trendScore * 0.25;

    factors.push({
      name: 'TVL Trend',
      value: trend,
      impact: trend > 0 ? 'positive' : 'negative',
      description: `7-day trend: ${(trend * 100).toFixed(2)}%/day`,
      severity: trendScore > 60 ? 'high' : trendScore > 30 ? 'medium' : 'low',
    });

    // Adjust confidence based on data availability
    if (input.tvl_30.length < 7) confidence *= 0.6;
    if (input.tvl_90.length < 30) confidence *= 0.8;

    return {
      score: totalScore,
      factors,
      confidence,
    };
  }

  calculateYieldSustainabilityRisk(input: YieldInput): ComponentScore {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let confidence = 1.0;

    // 1. APR Level Risk (40% of yield score)
    const aprLevel = input.apr / this.config.references.APR_REF_HIGH;
    const aprLevelScore = Math.min(100, aprLevel * 80); // High APR = higher risk
    totalScore += aprLevelScore * 0.4;

    factors.push({
      name: 'APR Level',
      value: input.apr,
      impact: input.apr < 0.25 ? 'positive' : 'negative',
      description: `Current APR: ${(input.apr * 100).toFixed(1)}%`,
      severity: aprLevelScore > 60 ? 'high' : aprLevelScore > 30 ? 'medium' : 'low',
    });

    // 2. APR Volatility (30% of yield score)
    const aprVolatility = this.calculateVolatility(input.apr_30);
    const volatilityScore = Math.min(100, aprVolatility * 300);
    totalScore += volatilityScore * 0.3;

    factors.push({
      name: 'APR Volatility',
      value: aprVolatility,
      impact: aprVolatility < 0.1 ? 'positive' : 'negative',
      description: `APR volatility: ${(aprVolatility * 100).toFixed(1)}%`,
      severity: volatilityScore > 60 ? 'high' : volatilityScore > 30 ? 'medium' : 'low',
    });

    // 3. APY-APR Gap (30% of yield score)
    const apyGap = input.apy > 0 ? (input.apy - input.apr) / input.apr : 0;
    const gapScore = Math.min(100, Math.max(0, apyGap * 100)); // Large gap = reward dependency risk
    totalScore += gapScore * 0.3;

    factors.push({
      name: 'Reward Dependency',
      value: apyGap,
      impact: apyGap < 0.5 ? 'positive' : 'negative',
      description: `APY-APR gap: ${(apyGap * 100).toFixed(1)}%`,
      severity: gapScore > 60 ? 'high' : gapScore > 30 ? 'medium' : 'low',
    });

    // Adjust confidence based on data availability
    if (input.apr_30.length < 7) confidence *= 0.7;
    if (input.apr_90.length < 30) confidence *= 0.8;

    return {
      score: totalScore,
      factors,
      confidence,
    };
  }

  calculateConcentrationRisk(input: ConcentrationInput): ComponentScore {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let confidence = 0.6; // Lower confidence due to estimation

    // 1. Low Participation Risk (60% of concentration score)
    const participationRisk = this.config.references.PART_REF_LOW / Math.max(1, input.estimatedParticipants);
    const participationScore = Math.min(100, participationRisk * 100);
    totalScore += participationScore * 0.6;

    factors.push({
      name: 'User Concentration',
      value: input.estimatedParticipants,
      impact: input.estimatedParticipants > this.config.references.PART_REF_LOW ? 'positive' : 'negative',
      description: `Est. ${input.estimatedParticipants} participants`,
      severity: participationScore > 60 ? 'high' : participationScore > 30 ? 'medium' : 'low',
    });

    // 2. Whale Effect (40% of concentration score)
    let whaleScore = 0;
    if (input.volume24h > 0 && input.estimatedParticipants > 0) {
      const avgVolumePerParticipant = input.volume24h / input.estimatedParticipants;
      const whaleEffect = avgVolumePerParticipant / this.config.references.WHALE_REF_USD;
      whaleScore = Math.min(100, whaleEffect * 50);

      factors.push({
        name: 'Whale Activity',
        value: avgVolumePerParticipant,
        impact: whaleEffect < 1 ? 'positive' : 'negative',
        description: `Avg volume/user: $${avgVolumePerParticipant.toFixed(0)}`,
        severity: whaleScore > 60 ? 'high' : whaleScore > 30 ? 'medium' : 'low',
      });
    } else {
      whaleScore = 30; // Medium risk when no data
      confidence *= 0.5;
    }
    totalScore += whaleScore * 0.4;

    return {
      score: totalScore,
      factors,
      confidence,
    };
  }

  calculateMomentumRisk(input: MomentumInput): ComponentScore {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let confidence = 1.0;

    // 1. 7-day Outflow (60% of momentum score)
    const meanTvl7Result = input.tvl_7.length > 0 ? mean(input.tvl_7) : input.currentTvl;
    const meanTvl7 = typeof meanTvl7Result === 'number' ? meanTvl7Result : input.currentTvl;
    const outflow7d = Math.max(0, -(input.currentTvl - meanTvl7) / meanTvl7);
    const outflowScore7 = Math.min(100, outflow7d * 200);
    totalScore += outflowScore7 * 0.6;

    factors.push({
      name: '7-day Flow',
      value: outflow7d,
      impact: outflow7d < 0.05 ? 'positive' : 'negative',
      description: `7-day outflow: ${(outflow7d * 100).toFixed(1)}%`,
      severity: outflowScore7 > 60 ? 'high' : outflowScore7 > 30 ? 'medium' : 'low',
    });

    // 2. 30-day Outflow (40% of momentum score)
    const meanTvl30Result = input.tvl_30.length > 0 ? mean(input.tvl_30) : input.currentTvl;
    const meanTvl30 = typeof meanTvl30Result === 'number' ? meanTvl30Result : input.currentTvl;
    const outflow30d = Math.max(0, -(input.currentTvl - meanTvl30) / meanTvl30);
    const outflowScore30 = Math.min(100, outflow30d * 150);
    totalScore += outflowScore30 * 0.4;

    factors.push({
      name: '30-day Flow',
      value: outflow30d,
      impact: outflow30d < 0.1 ? 'positive' : 'negative',
      description: `30-day outflow: ${(outflow30d * 100).toFixed(1)}%`,
      severity: outflowScore30 > 60 ? 'high' : outflowScore30 > 30 ? 'medium' : 'low',
    });

    // Adjust confidence based on data availability
    if (input.tvl_7.length < 3) confidence *= 0.6;
    if (input.tvl_30.length < 7) confidence *= 0.8;

    return {
      score: totalScore,
      factors,
      confidence,
    };
  }

  // Helper methods
  private estimateParticipants(tvlUsd: number, volume24h: number, protocol: string): number {
    const protocolConfig = this.config.protocols[protocol.toLowerCase()] || this.config.protocols.default;

    // Base estimation using TVL size
    let baseParticipants = Math.sqrt(tvlUsd / 1000) * 5; // Rough heuristic

    // Adjust based on volume if available
    if (volume24h > 0) {
      const avgTransactionSize = 5000; // Assume $5k avg transaction
      const volumeBasedParticipants = volume24h / avgTransactionSize;
      baseParticipants = (baseParticipants + volumeBasedParticipants) / 2;
    }

    // Apply protocol-specific multiplier
    baseParticipants *= protocolConfig.participantMultiplier;

    return Math.max(1, Math.round(baseParticipants));
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const returns = values.slice(1).map((val, i) =>
      values[i] > 0 ? (val - values[i]) / values[i] : 0
    );

    const result = std(returns);
    return typeof result === 'number' ? result : 0;
  }

  private calculateMaxDrawdown(values: number[]): number {
    if (values.length < 2) return 0;

    let maxDrawdown = 0;
    let peak = values[0];

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
      } else {
        const drawdown = (peak - values[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    return maxDrawdown;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    return avgY > 0 ? slope / avgY : 0; // Return relative slope
  }

  private getRiskLabel(score: number): 'low' | 'medium' | 'high' {
    if (score <= 30) return 'low';
    if (score <= 60) return 'medium';
    return 'high';
  }

  private getTopRiskDrivers(factors: RiskFactor[]): string[] {
    const negativeFactors = factors
      .filter(f => f.impact === 'negative' && f.severity !== 'low')
      .sort((a, b) => {
        const severityWeight = { high: 3, medium: 2, low: 1 };
        return severityWeight[b.severity] - severityWeight[a.severity];
      });

    return negativeFactors.slice(0, 2).map(f => f.name);
  }

  private calculateConfidence(confidences: number[]): 'high' | 'medium' | 'low' {
    const avgConfidenceResult = mean(confidences);
    const avgConfidence = typeof avgConfidenceResult === 'number' ? avgConfidenceResult : 0.5;
    if (avgConfidence >= 0.8) return 'high';
    if (avgConfidence >= 0.6) return 'medium';
    return 'low';
  }
}