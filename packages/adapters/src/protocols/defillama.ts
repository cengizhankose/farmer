import { Opportunity, ProtocolInfo } from '../types';
import { BaseAdapter } from './base-adapter';
import { DefiLlamaService } from '../services/defillama';
import { LlamaPool } from '../types/defillama';

export class DefiLlamaAdapter extends BaseAdapter {
  private service: DefiLlamaService;
  private protocolFilter: string[];

  constructor(protocolFilter: string[] = ['alex', 'arkadiko', 'bitflow']) {
    const protocolInfo: ProtocolInfo = {
      name: 'DefiLlama',
      chain: 'stacks',
      baseUrl: 'https://yields.llama.fi',
      description: 'Cross-chain yield aggregator data',
      website: 'https://defillama.com',
      logo: '/logos/defillama.png',
      supportedTokens: ['STX', 'USDA', 'xBTC', 'ALEX', 'DIKO'],
      timeout: 10000,
      retryAttempts: 3,
      rateLimit: 60, // 60 requests per minute
    };
    super(protocolInfo);
    this.service = new DefiLlamaService();
    this.protocolFilter = protocolFilter;
  }

  async list(): Promise<Opportunity[]> {
    try {
      return await this.fetchWithRetry(async () => {
        const pools = await this.service.getPools();

        // Filter for Stacks ecosystem protocols or specified protocols
        const relevantPools = pools.filter(pool =>
          pool.chain?.toLowerCase() === 'stacks' ||
          this.protocolFilter.some(protocol =>
            pool.project?.toLowerCase().includes(protocol.toLowerCase())
          )
        );

        // Map pools to opportunities in parallel
        const opportunities = await Promise.allSettled(
          relevantPools.slice(0, 50).map(pool => this.mapPoolToOpportunity(pool))
        );

        // Filter out failed mappings and sort by TVL
        const validOpportunities = opportunities
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<Opportunity>).value)
          .filter(opportunity => opportunity.tvlUsd > 1000) // Filter low liquidity
          .sort((a, b) => b.tvlUsd - a.tvlUsd);

        return validOpportunities;
      });
    } catch (error) {
      this.handleError(error, 'list');
    }
  }

  async detail(id: string): Promise<Opportunity> {
    try {
      return await this.fetchWithRetry(async () => {
        // Get all opportunities and find by exact ID match
        const opportunities = await this.list();
        const opportunity = opportunities.find(o => o.id === id);

        if (!opportunity) {
          throw new Error(`Opportunity not found: ${id}`);
        }

        return opportunity;
      });
    } catch (error) {
      this.handleError(error, 'detail');
    }
  }

  async getChartData(poolId: string) {
    try {
      return await this.service.getPoolChart(poolId);
    } catch (error) {
      console.warn(`Chart data unavailable for pool ${poolId}:`, error);
      return [];
    }
  }

  private async mapPoolToOpportunity(pool: LlamaPool): Promise<Opportunity> {
    // Fetch protocol information for logo
    let logoUrl = '';
    try {
      const protocol = await this.service.getProtocol(pool.project);
      logoUrl = protocol.logo;
    } catch {
      // Use default logo mapping if API call fails
      logoUrl = this.getDefaultLogo(pool.project);
    }

    const tokens = pool.underlyingTokens || [pool.symbol];
    const isStablecoinPair = this.isStablecoinPair(tokens);
    const totalApy = pool.apy || 0;

    return {
      id: `defillama-${pool.project}-${pool.symbol}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      chain: 'stacks',
      protocol: pool.project.toUpperCase(),
      pool: pool.symbol,
      tokens,
      apr: pool.apyBase || 0,
      apy: totalApy,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      rewardToken: pool.rewardTokens || [],
      tvlUsd: pool.tvlUsd || 0,
      risk: this.calculateRisk(totalApy, pool.tvlUsd, isStablecoinPair),
      source: 'api',
      lastUpdated: Date.now(),
      disabled: false,

      // Extended metadata
      poolId: pool.pool,
      underlyingTokens: pool.underlyingTokens,
      logoUrl,
      exposure: this.determineExposure(tokens, isStablecoinPair),
      ilRisk: pool.ilRisk || this.calculateILRisk(tokens),
      stablecoin: isStablecoinPair,
    };
  }


  private isStablecoinPair(tokens: string[]): boolean {
    const stablecoins = ['USDA', 'USDC', 'USDT', 'DAI', 'XUSD'];
    return tokens.some(token =>
      stablecoins.includes(token.toUpperCase())
    );
  }

  private determineExposure(tokens: string[], isStablecoin: boolean): string {
    if (tokens.length === 1) return 'single';
    if (isStablecoin) return 'stablecoin';
    if (tokens.some(t => t.toLowerCase().includes('btc'))) return 'btc';
    if (tokens.some(t => t.toLowerCase().includes('stx'))) return 'stx';
    return 'multi';
  }

  private calculateILRisk(tokens: string[]): string {
    if (tokens.length === 1) return 'none';

    const stablecoins = ['USDA', 'USDC', 'USDT', 'DAI', 'XUSD'];
    const isStablePair = tokens.every(token =>
      stablecoins.includes(token.toUpperCase())
    );

    if (isStablePair) return 'low';

    const hasVolatileToken = tokens.some(token =>
      !stablecoins.includes(token.toUpperCase())
    );

    return hasVolatileToken ? 'high' : 'medium';
  }

  private getDefaultLogo(project: string): string {
    const logoMap: Record<string, string> = {
      'alex': '/logos/alex.png',
      'arkadiko': '/logos/arkadiko.png',
      'bitflow': '/logos/bitflow.png',
      'stackswap': '/logos/stackswap.png',
    };

    return logoMap[project.toLowerCase()] || '/logos/default-protocol.png';
  }

  async getAvailableChains(): Promise<string[]> {
    try {
      const pools = await this.service.getPools();
      const chains = new Set(pools.map(pool => pool.chain).filter(Boolean));
      return Array.from(chains);
    } catch (error) {
      console.warn('Failed to fetch available chains:', error);
      return ['Stacks'];
    }
  }

  async getProtocolStats(): Promise<{ totalTvl: number; poolCount: number; avgApy: number }> {
    try {
      const opportunities = await this.list();
      const totalTvl = opportunities.reduce((sum, opp) => sum + opp.tvlUsd, 0);
      const avgApy = opportunities.reduce((sum, opp) => sum + opp.apy, 0) / opportunities.length;

      return {
        totalTvl,
        poolCount: opportunities.length,
        avgApy: avgApy || 0,
      };
    } catch (error) {
      console.warn('Failed to calculate protocol stats:', error);
      return { totalTvl: 0, poolCount: 0, avgApy: 0 };
    }
  }
}