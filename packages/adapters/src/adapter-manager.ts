import { Adapter, Opportunity, Chain, CacheEntry, AdapterStats } from './types';
import { AlexAdapter } from './protocols/alex';
import { ArkadikoAdapter } from './protocols/arkadiko';
import { DefiLlamaAdapter } from './protocols/defillama';

export class AdapterManager {
  private adapters: Map<string, Adapter> = new Map();
  private cache: Map<string, CacheEntry<Opportunity[]>> = new Map();
  private statsCache: CacheEntry<AdapterStats> | null = null;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private readonly statsCacheTimeout = 10 * 60 * 1000; // 10 minutes

  constructor() {
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

  async getEnrichedOpportunityById(id: string): Promise<Opportunity | null> {
    return this.getOpportunityById(id);
  }

  async getEnrichedOpportunities(): Promise<Opportunity[]> {
    return this.getAllOpportunities();
  }

  // Alias for backward compatibility
  async getOpportunityDetail(id: string): Promise<Opportunity | null> {
    return this.getOpportunityById(id);
  }

  async getChartData(poolId: string): Promise<any[]> {
    try {
      // Try DefiLlama adapter first for chart data
      const defiLlamaAdapter = this.adapters.get('defillama') as any;
      if (defiLlamaAdapter && typeof defiLlamaAdapter.getChartData === 'function') {
        const llama = await defiLlamaAdapter.getChartData(poolId);
        if (Array.isArray(llama) && llama.length > 0) return llama;
      }

      // Fallback to Arkadiko adapter for pool prices
      const arkadikoAdapter = this.adapters.get('arkadiko') as any;
      if (arkadikoAdapter && typeof arkadikoAdapter.getPoolPrices === 'function') {
        const ark = await arkadikoAdapter.getPoolPrices(poolId);
        if (Array.isArray(ark) && ark.length > 0) return ark;
      }

      return [];
    } catch (error) {
      console.warn(`Chart data unavailable for pool ${poolId}:`, error);
      return [];
    }
  }

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
}

// Export singleton instance
export const adapterManager = new AdapterManager();
