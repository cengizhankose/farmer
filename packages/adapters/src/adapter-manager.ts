import { Adapter, Opportunity, Chain, CacheEntry, AdapterStats, EnrichedOpportunity } from '@shared/core';
import { AlexAdapter } from './protocols/alex';
import { ArkadikoAdapter } from './protocols/arkadiko';
import { DefiLlamaAdapter } from './protocols/defillama';
import { DataEnrichmentService } from './services/data-enrichment';
// import { EnhancedDataService } from './services/enhanced-data-service';
// import { ChartDataProvider } from './services/chart-data-provider';
// import { ValueProjectionService } from './services/value-projection';
import { RiskCalculator } from '@shared/core';
// import { EnhancedRiskCalculator } from '@shared/core';

export class AdapterManager {
  private adapters: Map<string, Adapter> = new Map();
  private cache: Map<string, CacheEntry<Opportunity[]>> = new Map();
  private enrichedCache: Map<string, CacheEntry<EnrichedOpportunity[]>> = new Map();
  private statsCache: CacheEntry<AdapterStats> | null = null;
  private dataEnrichmentService: DataEnrichmentService;
  // private enhancedDataService: EnhancedDataService;
  // private chartDataProvider: ChartDataProvider;
  // private valueProjectionService: ValueProjectionService;
  private enhancedRiskCalculator: RiskCalculator;
  // private advancedRiskCalculator: EnhancedRiskCalculator;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private readonly statsCacheTimeout = 10 * 60 * 1000; // 10 minutes
  private readonly enrichedCacheTimeout = 10 * 60 * 1000; // 10 minutes for enriched data

  constructor() {
    this.dataEnrichmentService = new DataEnrichmentService();
    // this.enhancedDataService = new EnhancedDataService();
    // this.chartDataProvider = new ChartDataProvider();
    // this.valueProjectionService = new ValueProjectionService();
    this.enhancedRiskCalculator = new RiskCalculator();
    // this.advancedRiskCalculator = new EnhancedRiskCalculator();
    this.initializeAdapters();
    this.startCacheCleanup();
  }

  private initializeAdapters(): void {
    // Real API adapters
    this.adapters.set('defillama', new DefiLlamaAdapter(['alex', 'arkadiko']));
    this.adapters.set('arkadiko', new ArkadikoAdapter());
    this.adapters.set('alex', new AlexAdapter());

    // TODO: Add Ethereum adapters in Phase B
    // this.adapters.set('uniswap', new UniswapAdapter());
    // this.adapters.set('compound', new CompoundAdapter());

    // TODO: Add Solana adapters in Phase B
    // this.adapters.set('raydium', new RaydiumAdapter());
    // this.adapters.set('saber', new SaberAdapter());
  }

  private startCacheCleanup(): void {
    // Clean expired cache entries every 10 minutes
    setInterval(() => {
      const now = Date.now();

      // Clean opportunities cache
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiry < now) {
          this.cache.delete(key);
        }
      }

      // Clean enriched opportunities cache
      for (const [key, entry] of this.enrichedCache.entries()) {
        if (entry.expiry < now) {
          this.enrichedCache.delete(key);
        }
      }

      // Clean stats cache
      if (this.statsCache && this.statsCache.expiry < now) {
        this.statsCache = null;
      }
    }, 10 * 60 * 1000);
  }

  getAdapter(protocolName: string): Adapter | null {
    return this.adapters.get(protocolName.toLowerCase()) || null;
  }

  getAllAdapters(): Adapter[] {
    return Array.from(this.adapters.values());
  }

  getAdaptersByChain(chain: Chain): Adapter[] {
    return this.getAllAdapters().filter(
      adapter => adapter.getProtocolInfo().chain === chain
    );
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    const cacheKey = 'all-opportunities';
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      // Fetch from priority adapters in parallel
      const priorityAdapters = ['defillama', 'arkadiko'];
      const results = await Promise.allSettled([
        this.fetchOpportunities('defillama'),
        this.fetchOpportunities('arkadiko'),
      ]);

      const opportunities = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<Opportunity[]>).value);

      // Deduplicate by pool name and protocol
      const deduped = this.deduplicateOpportunities(opportunities);

      // Cache results
      this.cache.set(cacheKey, {
        data: deduped,
        expiry: Date.now() + this.cacheTimeout,
        lastFetch: Date.now()
      });

      return deduped;
    } catch (error) {
      console.error('Failed to fetch opportunities from external APIs:', error);
      return [];
    }
  }

  async getEnrichedOpportunities(): Promise<EnrichedOpportunity[]> {
    const cacheKey = 'all-enriched-opportunities';
    const cached = this.enrichedCache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      // Get base opportunities
      const opportunities = await this.getAllOpportunities();

      if (opportunities.length === 0) {
        return [];
      }

      // Enrich with basic data services
      console.log(`Enriching ${opportunities.length} opportunities with basic data...`);
      const enrichedOpportunities = await this.dataEnrichmentService.enrichOpportunities(opportunities);

      // Cache enriched results
      this.enrichedCache.set(cacheKey, {
        data: enrichedOpportunities,
        expiry: Date.now() + this.enrichedCacheTimeout,
        lastFetch: Date.now()
      });

      console.log(`Successfully enriched ${enrichedOpportunities.length} opportunities`);
      return enrichedOpportunities;
    } catch (error) {
      console.error('Failed to enrich opportunities with enhanced data:', error);

      // Fallback to base opportunities without enrichment
      const baseOpportunities = await this.getAllOpportunities();
      return baseOpportunities.map(opp => this.createFallbackEnrichedOpportunity(opp));
    }
  }

  // NEW: Fully enhanced opportunities with blockchain-level analysis
  async getFullyEnhancedOpportunities(): Promise<EnrichedOpportunity[]> {
    const cacheKey = 'fully-enhanced-opportunities';
    const cached = this.enrichedCache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      // Get base opportunities
      const opportunities = await this.getAllOpportunities();

      if (opportunities.length === 0) {
        return [];
      }

      console.log(`Enriching ${opportunities.length} opportunities with full blockchain-level analysis...`);

      // First enrich with basic data
      const basicEnriched = await this.dataEnrichmentService.enrichOpportunities(opportunities);

      // Then enhance with blockchain-level data using enhanced services
      const fullyEnhancedOpportunities: EnrichedOpportunity[] = [];

      for (const opportunity of basicEnriched) {
        try {
          // Apply enhanced risk calculation with full blockchain analysis - disabled for now
          // const enhancedRiskScore = await this.getEnhancedRiskScore(opportunity as Opportunity);
          const enhancedRiskScore = null;

          // Enhance with additional blockchain data - disabled for now
          // const enhancedData = await this.enhancedDataService.enhanceOpportunity(opportunity as Opportunity);

          // Merge enhanced data with opportunity
          const fullyEnhanced: EnrichedOpportunity = {
            ...opportunity,
            riskScore: enhancedRiskScore || opportunity.riskScore,
            // Additional enhanced fields would be added here based on enhancedData
          };

          fullyEnhancedOpportunities.push(fullyEnhanced);
        } catch (error) {
          console.warn(`Failed to fully enhance opportunity ${opportunity.id}:`, error);
          // Use basic enriched version as fallback
          fullyEnhancedOpportunities.push(opportunity);
        }
      }

      // Cache fully enhanced results
      this.enrichedCache.set(cacheKey, {
        data: fullyEnhancedOpportunities,
        expiry: Date.now() + this.enrichedCacheTimeout,
        lastFetch: Date.now()
      });

      console.log(`Successfully fully enhanced ${fullyEnhancedOpportunities.length} opportunities`);
      return fullyEnhancedOpportunities;
    } catch (error) {
      console.error('Failed to fully enhance opportunities:', error);

      // Fallback to basic enriched opportunities
      return await this.getEnrichedOpportunities();
    }
  }

  async getEnrichedOpportunityById(id: string): Promise<EnrichedOpportunity | null> {
    try {
      // Get base opportunity first
      const opportunity = await this.getOpportunityById(id);

      if (!opportunity) {
        return null;
      }

      // Enrich with basic data services
      if (opportunity.poolId && opportunity.poolId.includes('-')) {
        // DefiLlama opportunity
        return await this.dataEnrichmentService.enrichWithDefiLlamaData(opportunity);
      } else {
        // Arkadiko or other opportunity
        return await this.dataEnrichmentService.enrichWithArkadikoData(opportunity);
      }
    } catch (error) {
      console.error(`Failed to enrich opportunity ${id}:`, error);

      // Fallback to base opportunity
      const baseOpportunity = await this.getOpportunityById(id);
      return baseOpportunity ? this.createFallbackEnrichedOpportunity(baseOpportunity) : null;
    }
  }

  private async fetchOpportunities(adapterName: string): Promise<Opportunity[]> {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) return [];

    try {
      return await adapter.list();
    } catch (error) {
      console.warn(`Failed to fetch from ${adapterName}:`, error);
      return [];
    }
  }

  private deduplicateOpportunities(opportunities: Opportunity[]): Opportunity[] {
    const seen = new Set<string>();
    const deduped = opportunities.filter(opp => {
      // Create a unique key based on protocol and pool
      const key = `${opp.protocol.toLowerCase()}-${opp.pool.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by TVL (highest first) and then by APY
    return deduped.sort((a, b) => {
      const tvlDiff = b.tvlUsd - a.tvlUsd;
      if (tvlDiff !== 0) return tvlDiff;
      return b.apy - a.apy;
    });
  }

  async getOpportunitiesByChain(chain: Chain): Promise<Opportunity[]> {
    const chainAdapters = this.getAdaptersByChain(chain);
    const opportunities: Opportunity[] = [];

    for (const adapter of chainAdapters) {
      try {
        const adapterOpportunities = await adapter.list();
        opportunities.push(...adapterOpportunities);
      } catch (error) {
        console.error(
          `Failed to fetch opportunities from ${adapter.getProtocolInfo().name}:`,
          error
        );
      }
    }

    return opportunities;
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    // Extract protocol name from opportunity ID
    const protocolName = id.split('-')[0];
    const adapter = this.getAdapter(protocolName);

    if (!adapter) {
      console.warn(`No adapter found for protocol: ${protocolName}`);
      return null;
    }

    try {
      return await adapter.detail(id);
    } catch (error) {
      console.error(`Failed to fetch opportunity ${id}:`, error);
      return null;
    }
  }

  // Alias for backward compatibility
  async getOpportunityDetail(id: string): Promise<Opportunity | null> {
    return this.getOpportunityById(id);
  }

  // Enhanced methods temporarily disabled
  // async getChartData(opportunity: Opportunity, timeframes: ('7D' | '30D' | '90D')[] = ['7D', '30D', '90D']): Promise<any> {
  //   try {
  //     return await this.chartDataProvider.getPoolChartData(opportunity, timeframes);
  //   } catch (error) {
  //     console.warn(`Chart data unavailable for opportunity ${opportunity.id}:`, error);
  //     return {};
  //   }
  // }

  // async getValueProjections(
  //   opportunity: Opportunity,
  //   initialInvestment: number,
  //   timeframes: ('1D' | '3D' | '7D' | '15D' | '30D' | '90D')[] = ['1D', '3D', '7D', '15D', '30D', '90D']
  // ): Promise<any> {
  //   try {
  //     return await this.valueProjectionService.calculateProjections(opportunity, initialInvestment, timeframes);
  //   } catch (error) {
  //     console.warn(`Value projections unavailable for opportunity ${opportunity.id}:`, error);
  //     return {};
  //   }
  // }

  // async getEnhancedParticipantData(opportunity: Opportunity): Promise<any> {
  //   try {
  //     return await this.enhancedDataService.getEnhancedParticipantData(opportunity);
  //   } catch (error) {
  //     console.warn(`Enhanced participant data unavailable for opportunity ${opportunity.id}:`, error);
  //     return null;
  //   }
  // }

  // async getEnhancedRiskData(opportunity: Opportunity): Promise<any> {
  //   try {
  //     return await this.enhancedRiskCalculator.calculateRiskScore({
  //       tvlUsd: opportunity.tvlUsd,
  //       apr: opportunity.apr,
  //       apy: opportunity.apy,
  //       volume24h: opportunity.volume24h,
  //       protocol: opportunity.protocol,
  //       chain: opportunity.chain,
  //       tokens: opportunity.tokens,
  //       stablecoin: opportunity.stablecoin,
  //       ilRisk: opportunity.ilRisk,
  //       exposure: opportunity.exposure,
  //       rewardTokens: Array.isArray(opportunity.rewardToken) ? opportunity.rewardToken : [opportunity.rewardToken],
  //     });
  //   } catch (error) {
  //     console.warn(`Enhanced risk data unavailable for opportunity ${opportunity.id}:`, error);
  //     return null;
  //   }
  // }

  async getAdapterStats(): Promise<AdapterStats> {
    // Check cache first
    if (this.statsCache && this.statsCache.expiry > Date.now()) {
      return this.statsCache.data;
    }

    try {
      const opportunities = await this.getAllOpportunities();

      const stats: AdapterStats = {
        totalOpportunities: opportunities.length,
        bySource: {},
        byProtocol: {},
        totalTvl: 0,
        avgApy: 0,
        lastUpdate: Date.now(),
      };

      // Calculate stats
      let totalApy = 0;
      for (const opp of opportunities) {
        // By source
        stats.bySource[opp.source] = (stats.bySource[opp.source] || 0) + 1;

        // By protocol
        stats.byProtocol[opp.protocol] = (stats.byProtocol[opp.protocol] || 0) + 1;

        // TVL and APY
        stats.totalTvl += opp.tvlUsd;
        totalApy += opp.apy;
      }

      stats.avgApy = opportunities.length > 0 ? totalApy / opportunities.length : 0;

      // Cache stats
      this.statsCache = {
        data: stats,
        expiry: Date.now() + this.statsCacheTimeout,
        lastFetch: Date.now(),
      };

      return stats;
    } catch (error) {
      console.error('Failed to calculate adapter stats:', error);
      return {
        totalOpportunities: 0,
        bySource: {},
        byProtocol: {},
        totalTvl: 0,
        avgApy: 0,
        lastUpdate: Date.now(),
      };
    }
  }

  async refreshAllData(): Promise<Map<string, Opportunity[]>> {
    // Clear cache before refreshing
    this.clearCache();

    const results = new Map<string, Opportunity[]>();

    for (const [protocolName, adapter] of this.adapters) {
      try {
        const opportunities = await adapter.list();
        results.set(protocolName, opportunities);
      } catch (error) {
        console.error(`Failed to refresh data for ${protocolName}:`, error);
        results.set(protocolName, []);
      }
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
    this.enrichedCache.clear();
    this.statsCache = null;
    console.log('AdapterManager cache cleared');
  }

  getCacheStats(): {
    entriesCount: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    return {
      entriesCount: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + entry.data.length, 0),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.lastFetch)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.lastFetch)) : null,
    };
  }

  async preloadCache(): Promise<void> {
    console.log('Preloading AdapterManager cache...');
    try {
      await Promise.all([
        this.getAllOpportunities(),
        this.getAdapterStats(),
      ]);
      console.log('Cache preload completed');
    } catch (error) {
      console.warn('Cache preload failed:', error);
    }
  }

  isProtocolSupported(protocolName: string): boolean {
    return this.adapters.has(protocolName.toLowerCase());
  }

  getSupportedProtocols(): string[] {
    return Array.from(this.adapters.keys());
  }

  getSupportedChains(): Chain[] {
    const chains = new Set<Chain>();
    for (const adapter of this.getAllAdapters()) {
      chains.add(adapter.getProtocolInfo().chain);
    }
    return Array.from(chains);
  }

  async healthCheck(): Promise<Map<string, boolean>> {
    const healthStatus = new Map<string, boolean>();

    for (const [protocolName, adapter] of this.adapters) {
      try {
        // Try to fetch at least one opportunity to test adapter health
        const opportunities = await adapter.list();
        healthStatus.set(protocolName, opportunities.length > 0);
      } catch (error) {
        console.error(`Health check failed for ${protocolName}:`, error);
        healthStatus.set(protocolName, false);
      }
    }

    return healthStatus;
  }

  // Temporarily disabled - requires enhanced data services
  // private async enhanceWithEnhancedData(opportunities: Opportunity[]): Promise<EnrichedOpportunity[]> {
  //   // Process in batches to manage API rate limits
  //   const batchSize = 2;
  //   const enrichedOpportunities: EnrichedOpportunity[] = [];

  //   for (let i = 0; i < opportunities.length; i += batchSize) {
  //     const batch = opportunities.slice(i, i + batchSize);

  //     const batchPromises = batch.map(async (opportunity) => {
  //       return this.enhanceSingleOpportunity(opportunity);
  //     });

  //     try {
  //       const batchResults = await Promise.allSettled(batchPromises);

  //       batchResults.forEach((result, index) => {
  //         if (result.status === 'fulfilled') {
  //           enrichedOpportunities.push(result.value);
  //         } else {
  //           console.warn(`Failed to enhance opportunity ${batch[index].id}:`, result.reason);
  //           enrichedOpportunities.push(this.createFallbackEnrichedOpportunity(batch[index]));
  //         }
  //       });

  //       // Small delay between batches
  //       if (i + batchSize < opportunities.length) {
  //         await new Promise(resolve => setTimeout(resolve, 500));
  //       }
  //     } catch (error) {
  //       console.error('Batch enhancement error:', error);
  //       // Add fallback enriched opportunities for the failed batch
  //       batch.forEach(opportunity => {
  //         enrichedOpportunities.push(this.createFallbackEnrichedOpportunity(opportunity));
  //       });
  //     }
  //   }

  //   return enrichedOpportunities;
  // }

  // Temporarily disabled - requires enhanced data services
  // private async enhanceSingleOpportunity(opportunity: Opportunity): Promise<EnrichedOpportunity> {
  //   try {
  //     // Get enhanced data from multiple sources
  //     const [
  //       enhancedParticipantData,
  //       enhancedLiquidityData,
  //       enhancedStabilityData,
  //       enhancedYieldData,
  //       enhancedRiskScore
  //     ] = await Promise.all([
  //       this.enhancedDataService.getEnhancedParticipantData(opportunity),
  //       this.enhancedDataService.getEnhancedLiquidityData(opportunity),
  //       this.enhancedDataService.getEnhancedStabilityData(opportunity),
  //       this.enhancedDataService.getEnhancedYieldData(opportunity),
  //       this.getEnhancedRiskData(opportunity)
  //     ]);

  //     // Get historical data if available
  //     const historicalData = opportunity.poolId && opportunity.poolId.includes('-')
  //       ? await this.dataEnrichmentService.enrichWithDefiLlamaData(opportunity).then(result => result.historicalData)
  //       : undefined;

  //     return {
  //       ...opportunity,
  //       riskScore: enhancedRiskScore,
  //       historicalData,
  //       participants: enhancedParticipantData,
  //       liquidity: enhancedLiquidityData,
  //       stability: enhancedStabilityData,
  //       yield: enhancedYieldData,
  //       // Note: riskFactors would be extracted from enhancedRiskScore if available
  //     };
  //   } catch (error) {
  //     console.warn(`Failed to enhance opportunity ${opportunity.id}, using fallback:`, error);
  //     return this.createFallbackEnrichedOpportunity(opportunity);
  //   }
  // }

  // Enhanced risk calculation method - disabled for now
  // async getEnhancedRiskScore(opportunity: Opportunity): Promise<RiskScore | null> {
  //   // Method body temporarily removed
  // }

  private createFallbackEnrichedOpportunity(opportunity: Opportunity): EnrichedOpportunity {
    // Create basic risk assessment when detailed analysis fails
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
      ...opportunity,
      riskScore: {
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
      },
      riskFactors: [],
    };
  }
}

// Export singleton instance
export const adapterManager = new AdapterManager();