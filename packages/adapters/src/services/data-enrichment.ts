import {
  Opportunity,
  EnrichedOpportunity,
  RiskInputData,
  PartialRiskData,
  RiskFactor,
  HistoricalData
} from '@shared/core';
import { RiskCalculator } from '@shared/core';
import { HistoricalDataService } from './historical-data';

export class DataEnrichmentService {
  private riskCalculator: RiskCalculator;
  private historicalDataService: HistoricalDataService;

  constructor() {
    this.riskCalculator = new RiskCalculator();
    this.historicalDataService = new HistoricalDataService();
  }

  async enrichWithDefiLlamaData(opportunity: Opportunity): Promise<EnrichedOpportunity> {
    try {
      // Fetch historical data if poolId is available
      const { historicalData } = await this.historicalDataService.enrichOpportunityWithHistoricalData(opportunity);

      // Prepare risk input data
      const riskInputData: RiskInputData = {
        tvlUsd: opportunity.tvlUsd,
        apr: opportunity.apr,
        apy: opportunity.apy,
        volume24h: opportunity.volume24h,
        protocol: opportunity.protocol,
        chain: opportunity.chain,
        tokens: opportunity.tokens,
        historicalData,
        stablecoin: opportunity.stablecoin,
        ilRisk: opportunity.ilRisk,
        exposure: opportunity.exposure,
        rewardTokens: Array.isArray(opportunity.rewardToken) ? opportunity.rewardToken : [opportunity.rewardToken],
      };

      // Calculate risk score
      const riskScore = this.riskCalculator.calculateRiskScore(riskInputData);

      // Extract risk factors for display
      const riskFactors = this.extractRiskFactors(riskScore);

      return {
        ...opportunity,
        riskScore,
        historicalData,
        riskFactors,
      };
    } catch (error) {
      console.warn(`Failed to enrich DefiLlama opportunity ${opportunity.id}:`, error);
      return this.createFallbackEnrichedOpportunity(opportunity);
    }
  }

  async enrichWithArkadikoData(opportunity: Opportunity): Promise<EnrichedOpportunity> {
    try {
      // Arkadiko doesn't have historical chart data, so we'll use statistical estimation
      const partialRiskData = this.fallbackToStatisticalEstimates(opportunity);

      // Prepare risk input data with estimated historical data
      const riskInputData: RiskInputData = {
        tvlUsd: opportunity.tvlUsd,
        apr: opportunity.apr,
        apy: opportunity.apy,
        volume24h: opportunity.volume24h,
        protocol: opportunity.protocol,
        chain: opportunity.chain,
        tokens: opportunity.tokens,
        historicalData: partialRiskData.historicalData as HistoricalData | undefined,
        stablecoin: opportunity.stablecoin,
        ilRisk: opportunity.ilRisk,
        exposure: opportunity.exposure,
        rewardTokens: Array.isArray(opportunity.rewardToken) ? opportunity.rewardToken : [opportunity.rewardToken],
      };

      // Calculate risk score with lower confidence due to estimated data
      const riskScore = this.riskCalculator.calculateRiskScore(riskInputData);

      // Adjust confidence based on estimation quality
      riskScore.confidence = this.adjustConfidenceForEstimation(riskScore.confidence, partialRiskData.confidence);

      // Extract risk factors
      const riskFactors = this.extractRiskFactors(riskScore);

      return {
        ...opportunity,
        riskScore,
        historicalData: partialRiskData.historicalData as HistoricalData | undefined,
        riskFactors,
      };
    } catch (error) {
      console.warn(`Failed to enrich Arkadiko opportunity ${opportunity.id}:`, error);
      return this.createFallbackEnrichedOpportunity(opportunity);
    }
  }

  async estimateParticipants(tvl: number, volume24h: number, protocol: string): Promise<number> {
    // Enhanced participant estimation with protocol-specific adjustments
    const protocolMultipliers = {
      'defillama': 1.0,
      'arkadiko': 0.8,  // Smaller ecosystem
      'alex': 0.9,      // Moderate ecosystem
      'zest': 0.7,      // Newer protocol
    };

    const multiplier = protocolMultipliers[protocol.toLowerCase() as keyof typeof protocolMultipliers] || 0.6;

    // Base estimation using square root of TVL (diminishing returns)
    let participants = Math.sqrt(tvl / 5000) * 10; // Assume $5k avg position size

    // Adjust based on volume activity
    if (volume24h > 0) {
      const avgTransactionSize = this.estimateAvgTransactionSize(protocol, tvl);
      const volumeBasedParticipants = volume24h / avgTransactionSize;

      // Weight the estimates (60% TVL-based, 40% volume-based)
      participants = (participants * 0.6) + (volumeBasedParticipants * 0.4);
    }

    // Apply protocol multiplier
    participants *= multiplier;

    // Ensure reasonable bounds
    const minParticipants = Math.max(1, Math.floor(tvl / 100000)); // At least 1 per $100k TVL
    const maxParticipants = Math.floor(tvl / 1000); // At most 1 per $1k TVL

    return Math.max(minParticipants, Math.min(maxParticipants, Math.round(participants)));
  }

  fallbackToStatisticalEstimates(opportunity: Opportunity): PartialRiskData {
    // Create synthetic historical data based on current state and typical patterns
    const currentTvl = opportunity.tvlUsd;
    const currentApr = opportunity.apr;

    // Generate realistic TVL variations (±15% typical volatility)
    const tvlVolatility = this.estimateTvlVolatility(opportunity.protocol, currentTvl);
    const aprVolatility = this.estimateAprVolatility(opportunity.protocol, currentApr);

    // Generate 30-day synthetic data
    const tvl_30 = this.generateSyntheticTvlSeries(currentTvl, tvlVolatility, 30);
    const tvl_90 = this.generateSyntheticTvlSeries(currentTvl, tvlVolatility, 90);
    const apr_30 = this.generateSyntheticAprSeries(currentApr, aprVolatility, 30);
    const apr_90 = this.generateSyntheticAprSeries(currentApr, aprVolatility, 90);

    // Take recent subsets for shorter periods
    const tvl_7 = tvl_30.slice(-7);

    const historicalData: HistoricalData = {
      tvl_7,
      tvl_30,
      tvl_90,
      apr_30,
      apr_90,
      // No volume data for Arkadiko synthetic estimation
    };

    return {
      historicalData,
      confidence: 0.4, // Lower confidence for synthetic data
      source: 'estimation',
    };
  }

  // Batch enrichment for multiple opportunities
  async enrichOpportunities(opportunities: Opportunity[]): Promise<EnrichedOpportunity[]> {
    const enrichedOpportunities: EnrichedOpportunity[] = [];

    // Process in batches to manage API rate limits
    const batchSize = 3;

    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      const batchPromises = batch.map(async (opportunity) => {
        // Route to appropriate enrichment method based on data availability
        if (opportunity.poolId && opportunity.poolId.includes('-')) {
          // DefiLlama opportunities have UUID poolIds
          return this.enrichWithDefiLlamaData(opportunity);
        } else {
          // Arkadiko or other opportunities
          return this.enrichWithArkadikoData(opportunity);
        }
      });

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            enrichedOpportunities.push(result.value);
          } else {
            console.warn(`Failed to enrich opportunity ${batch[index].id}:`, result.reason);
            enrichedOpportunities.push(this.createFallbackEnrichedOpportunity(batch[index]));
          }
        });

        // Small delay between batches
        if (i + batchSize < opportunities.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error('Batch enrichment error:', error);
        // Add fallback enriched opportunities for the failed batch
        batch.forEach(opportunity => {
          enrichedOpportunities.push(this.createFallbackEnrichedOpportunity(opportunity));
        });
      }
    }

    return enrichedOpportunities;
  }

  // Private helper methods
  private extractRiskFactors(riskScore: any): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Extract factors from each component (if the risk calculator provides them)
    Object.values(riskScore.components || {}).forEach((componentScore: any) => {
      if (componentScore.factors) {
        factors.push(...componentScore.factors);
      }
    });

    return factors;
  }

  private createFallbackEnrichedOpportunity(opportunity: Opportunity): EnrichedOpportunity {
    // Create a basic risk assessment when detailed analysis fails
    const basicRiskScore = this.calculateBasicRiskScore(opportunity);

    return {
      ...opportunity,
      riskScore: basicRiskScore,
      riskFactors: [],
    };
  }

  private calculateBasicRiskScore(opportunity: Opportunity) {
    // Simple heuristic-based risk scoring as fallback
    let totalScore = 50; // Start with medium risk

    // TVL-based adjustment
    if (opportunity.tvlUsd < 100_000) totalScore += 20;
    else if (opportunity.tvlUsd > 5_000_000) totalScore -= 15;

    // APR-based adjustment
    if (opportunity.apr > 0.5) totalScore += 25; // Very high APR = high risk
    else if (opportunity.apr > 0.2) totalScore += 10;
    else if (opportunity.apr < 0.05) totalScore += 5; // Very low APR = sustainability risk

    // Protocol-based adjustment
    const protocolRiskAdjustments = {
      'ALEX': -5,
      'Arkadiko': -3,
      'ZEST': +10,
    };
    totalScore += protocolRiskAdjustments[opportunity.protocol as keyof typeof protocolRiskAdjustments] || 5;

    // Token-based adjustment
    if (opportunity.stablecoin) totalScore -= 10;
    if (opportunity.ilRisk === 'high') totalScore += 15;

    // Ensure score is within bounds
    totalScore = Math.max(0, Math.min(100, totalScore));

    const label = totalScore <= 30 ? 'low' : totalScore <= 60 ? 'medium' : 'high';

    return {
      total: totalScore,
      label: label as 'low' | 'medium' | 'high',
      components: {
        liquidity: Math.round(totalScore * 0.3),
        stability: Math.round(totalScore * 0.25),
        yield: Math.round(totalScore * 0.2),
        concentration: Math.round(totalScore * 0.15),
        momentum: Math.round(totalScore * 0.1),
      },
      drivers: ['Limited data available'],
      confidence: 'low' as const,
    };
  }

  private estimateAvgTransactionSize(protocol: string, tvl: number): number {
    // Protocol-specific transaction size estimates
    const baseSizes = {
      'arkadiko': 2000,  // Smaller DeFi transactions
      'alex': 3000,      // Medium DeFi transactions
      'zest': 5000,      // Lending protocols typically larger
    };

    const baseSize = baseSizes[protocol.toLowerCase() as keyof typeof baseSizes] || 3000;

    // Adjust based on TVL (larger pools = larger transactions)
    const tvlMultiplier = Math.min(3, Math.sqrt(tvl / 1_000_000));

    return baseSize * tvlMultiplier;
  }

  private estimateTvlVolatility(protocol: string, tvl: number): number {
    // Protocol-specific volatility estimates
    const baseVolatilities = {
      'arkadiko': 0.12,  // Established DeFi protocol
      'alex': 0.15,      // DEX volatility
      'zest': 0.20,      // Newer lending protocol
    };

    const baseVolatility = baseVolatilities[protocol.toLowerCase() as keyof typeof baseVolatilities] || 0.18;

    // Smaller pools tend to be more volatile
    const sizeMultiplier = tvl < 1_000_000 ? 1.5 : tvl < 5_000_000 ? 1.2 : 1.0;

    return baseVolatility * sizeMultiplier;
  }

  private estimateAprVolatility(protocol: string, apr: number): number {
    // Higher APRs tend to be more volatile
    const aprMultiplier = apr > 0.3 ? 1.8 : apr > 0.1 ? 1.3 : 1.0;

    // Base APR volatility
    const baseVolatility = 0.15;

    return baseVolatility * aprMultiplier;
  }

  private generateSyntheticTvlSeries(baseTvl: number, volatility: number, days: number): number[] {
    const series: number[] = [];
    let currentValue = baseTvl;

    for (let i = 0; i < days; i++) {
      // Random walk with mean reversion
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const meanReversion = (baseTvl - currentValue) * 0.05 / baseTvl; // 5% daily mean reversion

      currentValue *= (1 + randomChange + meanReversion);
      currentValue = Math.max(currentValue, baseTvl * 0.3); // Don't drop below 30% of base

      series.push(currentValue);
    }

    return series;
  }

  private generateSyntheticAprSeries(baseApr: number, volatility: number, days: number): number[] {
    const series: number[] = [];
    let currentValue = baseApr;

    for (let i = 0; i < days; i++) {
      // APR random walk with bounds
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      currentValue *= (1 + randomChange);

      // Keep APR within reasonable bounds
      currentValue = Math.max(0.001, Math.min(2.0, currentValue)); // 0.1% to 200%

      series.push(currentValue);
    }

    return series;
  }

  private adjustConfidenceForEstimation(originalConfidence: 'high' | 'medium' | 'low', estimationConfidence: number): 'high' | 'medium' | 'low' {
    const confidenceScores = { high: 0.9, medium: 0.6, low: 0.3 };
    const originalScore = confidenceScores[originalConfidence];
    const adjustedScore = originalScore * estimationConfidence;

    if (adjustedScore >= 0.7) return 'high';
    if (adjustedScore >= 0.4) return 'medium';
    return 'low';
  }
}