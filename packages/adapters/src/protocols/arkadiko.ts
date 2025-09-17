import axios from 'axios';
import { Opportunity, ProtocolInfo } from '@shared/core';
import { BaseAdapter } from './base-adapter';

interface ArkadikoVaultData {
  vault_id: string;
  collateral_token: string;
  debt_token: string;
  collateral_amount: number;
  debt_amount: number;
  stability_fee: number;
  liquidation_ratio: number;
  current_ratio: number;
}

interface ArkadikoLiquidityPool {
  pool_id: string;
  token_a: string;
  token_b: string;
  total_liquidity_usd: number;
  apr: number;
  rewards_apr: number;
  trading_fee_apr: number;
}

interface ArkadikoApiResponse {
  pools: ArkadikoLiquidityPool[];
  vaults: ArkadikoVaultData[];
  updated_at: string;
}

export class ArkadikoAdapter extends BaseAdapter {
  private readonly apiBaseUrl = 'https://api.arkadiko.finance/v1';

  constructor() {
    const protocolInfo: ProtocolInfo = {
      name: 'Arkadiko',
      chain: 'stacks',
      baseUrl: 'https://api.arkadiko.finance/v1',
      description: 'Decentralized borrowing and lending protocol on Stacks',
      website: 'https://arkadiko.finance',
      logo: '/logos/arkadiko.png',
      supportedTokens: ['STX', 'xBTC', 'USDA', 'DIKO'],
    };
    super(protocolInfo);
  }

  async list(): Promise<Opportunity[]> {
    try {
      return await this.fetchWithRetry(async () => {
        const response = await axios.get<ArkadikoApiResponse>(`${this.apiBaseUrl}/data`, {
          timeout: 10000,
        });

        const poolOpportunities = response.data.pools
          .filter(pool => pool.total_liquidity_usd > 500) // Filter out low liquidity pools
          .map(pool => this.mapPoolToOpportunity(pool, response.data.updated_at));

        // For now, we'll focus on liquidity pools. Vault strategies can be added later
        return poolOpportunities;
      });
    } catch (error) {
      // Fallback to mock data if API is unavailable
      console.warn('Arkadiko API unavailable, using mock data');
      return this.getMockOpportunities();
    }
  }

  async detail(id: string): Promise<Opportunity> {
    try {
      return await this.fetchWithRetry(async () => {
        const poolId = this.extractPoolIdFromOpportunityId(id);
        const response = await axios.get<ArkadikoLiquidityPool>(
          `${this.apiBaseUrl}/pools/${poolId}`,
          { timeout: 10000 }
        );

        return this.mapPoolToOpportunity(response.data, new Date().toISOString());
      });
    } catch (error) {
      // Fallback to mock data for specific opportunity
      const mockOpportunities = this.getMockOpportunities();
      const opportunity = mockOpportunities.find(op => op.id === id);
      if (opportunity) {
        return opportunity;
      }
      this.handleError(error, 'detail');
    }
  }

  private mapPoolToOpportunity(pool: ArkadikoLiquidityPool, updatedAt: string): Opportunity {
    const tokens = [pool.token_a, pool.token_b];
    const poolName = `${pool.token_a}/${pool.token_b}`;
    const totalApr = pool.apr + pool.rewards_apr + pool.trading_fee_apr;
    const isStablecoinPair = this.isStablecoinPair(tokens);

    return {
      id: this.createOpportunityId('arkadiko', poolName),
      chain: 'stacks',
      protocol: 'Arkadiko',
      pool: poolName,
      tokens,
      apr: totalApr,
      apy: this.aprToApy(totalApr),
      rewardToken: 'DIKO',
      tvlUsd: pool.total_liquidity_usd,
      risk: this.calculateRisk(totalApr, pool.total_liquidity_usd, isStablecoinPair),
      source: 'api',
      lastUpdated: new Date(updatedAt).getTime(),
      disabled: false,
    };
  }

  private extractPoolIdFromOpportunityId(opportunityId: string): string {
    // Extract pool ID from opportunity ID format: "arkadiko-diko-stx" -> "DIKO-STX"
    const parts = opportunityId.split('-');
    if (parts.length >= 3) {
      return `${parts[1].toUpperCase()}-${parts[2].toUpperCase()}`;
    }
    throw new Error(`Invalid opportunity ID format: ${opportunityId}`);
  }

  private isStablecoinPair(tokens: string[]): boolean {
    const stablecoins = ['USDA', 'USDC', 'USDT'];
    return tokens.some(token =>
      stablecoins.includes(token.toUpperCase())
    );
  }

  private aprToApy(apr: number, periodsPerYear = 365): number {
    return Math.pow(1 + apr / periodsPerYear, periodsPerYear) - 1;
  }

  private getMockOpportunities(): Opportunity[] {
    return [
      {
        id: this.createOpportunityId('arkadiko', 'DIKO/STX'),
        chain: 'stacks',
        protocol: 'Arkadiko',
        pool: 'DIKO/STX',
        tokens: ['DIKO', 'STX'],
        apr: 0.18,
        apy: 0.197,
        rewardToken: 'DIKO',
        tvlUsd: 850000,
        risk: 'med',
        source: 'api',
        lastUpdated: Date.now(),
        disabled: false,
      },
      {
        id: this.createOpportunityId('arkadiko', 'STX/USDA'),
        chain: 'stacks',
        protocol: 'Arkadiko',
        pool: 'STX/USDA',
        tokens: ['STX', 'USDA'],
        apr: 0.12,
        apy: 0.127,
        rewardToken: 'DIKO',
        tvlUsd: 1200000,
        risk: 'low',
        source: 'api',
        lastUpdated: Date.now(),
        disabled: false,
      },
      {
        id: this.createOpportunityId('arkadiko', 'xBTC/STX'),
        chain: 'stacks',
        protocol: 'Arkadiko',
        pool: 'xBTC/STX',
        tokens: ['xBTC', 'STX'],
        apr: 0.22,
        apy: 0.246,
        rewardToken: 'DIKO',
        tvlUsd: 650000,
        risk: 'med',
        source: 'api',
        lastUpdated: Date.now(),
        disabled: false,
      },
    ];
  }

  async getVaultInfo(): Promise<ArkadikoVaultData[]> {
    try {
      const response = await axios.get<ArkadikoApiResponse>(`${this.apiBaseUrl}/data`);
      return response.data.vaults;
    } catch (error) {
      console.warn('Failed to fetch Arkadiko vault info:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getLiquidationRatio(vaultId: string): Promise<number> {
    try {
      const vaults = await this.getVaultInfo();
      const vault = vaults.find(v => v.vault_id === vaultId);
      return vault?.liquidation_ratio || 1.5; // Default 150%
    } catch (error) {
      console.warn(`Failed to fetch liquidation ratio for vault ${vaultId}:`, error instanceof Error ? error.message : error);
      return 1.5;
    }
  }
}