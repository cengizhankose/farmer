import axios from 'axios';
import { Opportunity, ProtocolInfo } from '@shared/core';
import { BaseAdapter } from './base-adapter';

interface AlexPoolData {
  pool_id: string;
  token_x: string;
  token_y: string;
  total_liquidity: number;
  apr_24h: number;
  apy_24h: number;
  volume_24h: number;
  fees_24h: number;
}

interface AlexApiResponse {
  pools: AlexPoolData[];
  updated_at: string;
}

export class AlexAdapter extends BaseAdapter {
  private readonly apiBaseUrl = 'https://api.alexgo.io/v1';

  constructor() {
    const protocolInfo: ProtocolInfo = {
      name: 'ALEX',
      chain: 'stacks',
      baseUrl: 'https://api.alexgo.io/v1',
      description: 'Automated market maker and DeFi protocol on Stacks',
      website: 'https://alexgo.io',
      logo: '/logos/alex.png',
      supportedTokens: ['STX', 'USDA', 'xBTC', 'ALEX', 'DIKO'],
    };
    super(protocolInfo);
  }

  async list(): Promise<Opportunity[]> {
    try {
      return await this.fetchWithRetry(async () => {
        const response = await axios.get<AlexApiResponse>(`${this.apiBaseUrl}/pools`, {
          timeout: 10000,
        });

        const opportunities: Opportunity[] = response.data.pools
          .filter(pool => pool.total_liquidity > 1000) // Filter out low liquidity pools
          .map(pool => this.mapPoolToOpportunity(pool, response.data.updated_at));

        return opportunities;
      });
    } catch (error) {
      this.handleError(error, 'list');
    }
  }

  async detail(id: string): Promise<Opportunity> {
    try {
      return await this.fetchWithRetry(async () => {
        const poolId = this.extractPoolIdFromOpportunityId(id);
        const response = await axios.get<AlexPoolData>(
          `${this.apiBaseUrl}/pools/${poolId}`,
          { timeout: 10000 }
        );

        return this.mapPoolToOpportunity(response.data, new Date().toISOString());
      });
    } catch (error) {
      this.handleError(error, 'detail');
    }
  }

  private mapPoolToOpportunity(pool: AlexPoolData, updatedAt: string): Opportunity {
    const tokens = [pool.token_x, pool.token_y];
    const poolName = `${pool.token_x}/${pool.token_y}`;
    const isStablecoinPair = this.isStablecoinPair(tokens);

    return {
      id: this.createOpportunityId('alex', poolName),
      chain: 'stacks',
      protocol: 'ALEX',
      pool: poolName,
      tokens,
      apr: pool.apr_24h || 0,
      apy: pool.apy_24h || pool.apr_24h || 0,
      rewardToken: 'ALEX',
      tvlUsd: pool.total_liquidity,
      risk: this.calculateRisk(pool.apr_24h || 0, pool.total_liquidity, isStablecoinPair),
      source: 'api',
      lastUpdated: new Date(updatedAt).getTime(),
      disabled: false,
    };
  }

  private extractPoolIdFromOpportunityId(opportunityId: string): string {
    // Extract pool ID from opportunity ID format: "alex-stx-usda" -> "STX-USDA"
    const parts = opportunityId.split('-');
    if (parts.length >= 3) {
      return `${parts[1].toUpperCase()}-${parts[2].toUpperCase()}`;
    }
    throw new Error(`Invalid opportunity ID format: ${opportunityId}`);
  }

  private isStablecoinPair(tokens: string[]): boolean {
    const stablecoins = ['USDA', 'USDC', 'USDT', 'DAI'];
    return tokens.some(token =>
      stablecoins.includes(token.toUpperCase())
    );
  }

  async getPoolsInfo(): Promise<AlexPoolData[]> {
    try {
      const response = await axios.get<AlexApiResponse>(`${this.apiBaseUrl}/pools`);
      return response.data.pools;
    } catch (error) {
      this.handleError(error, 'getPoolsInfo');
    }
  }

  async getTokenPrice(tokenSymbol: string): Promise<number> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/prices/${tokenSymbol}`);
      return response.data.price_usd || 0;
    } catch (error) {
      console.warn(`Failed to fetch price for ${tokenSymbol}:`, error instanceof Error ? error.message : error);
      return 0;
    }
  }
}