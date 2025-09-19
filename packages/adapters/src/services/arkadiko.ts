import { ArkadikoTicker, ArkadikoPool, ArkadikoPrice, ArkadikoPoolPrice, ArkadikoVaultData, ArkadikoApiResponse } from '../types/arkadiko';

export class ArkadikoService {
  private readonly baseUrl = 'https://arkadiko-api.herokuapp.com/api/v1';
  private readonly timeout = 10000; // 10 seconds

  async getTickers(): Promise<ArkadikoTicker[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/tickers`);
      const data = await response.json();

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      }

      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }

      throw new Error('Invalid response format from Arkadiko tickers API');
    } catch (error) {
      console.error('Error fetching Arkadiko tickers:', error);
      throw new Error(`Failed to fetch tickers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPool(poolId: string): Promise<ArkadikoPool> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/pools/${poolId}`);
      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      // Handle direct pool object response
      if (data.id) {
        return data;
      }

      throw new Error('Invalid response format from Arkadiko pool API');
    } catch (error) {
      console.error(`Error fetching Arkadiko pool ${poolId}:`, error);
      throw new Error(`Failed to fetch pool: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPools(): Promise<ArkadikoPool[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/pools`);
      const data = await response.json();

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      }

      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }

      throw new Error('Invalid response format from Arkadiko pools API');
    } catch (error) {
      console.error('Error fetching Arkadiko pools:', error);
      throw new Error(`Failed to fetch pools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPoolPrices(poolId: string, days: number = 30): Promise<ArkadikoPoolPrice[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/pools/${poolId}/prices?days=${days}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map(point => ({
          pool_id: poolId,
          timestamp: point.timestamp || Date.now(),
          token_x_price: point.token_x_price || 0,
          token_y_price: point.token_y_price || 0,
          liquidity_usd: point.liquidity_usd || 0,
          volume_24h: point.volume_24h || 0,
        }));
      }

      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }

      throw new Error('Invalid response format from Arkadiko pool prices API');
    } catch (error) {
      console.error(`Error fetching pool prices for ${poolId}:`, error);
      // Return empty array instead of throwing to allow graceful degradation
      return [];
    }
  }

  async getTokenPrice(tokenSymbol: string): Promise<number> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/prices/${tokenSymbol}`);
      const data = await response.json();

      if (typeof data.price === 'number') {
        return data.price;
      }

      if (data.success && typeof data.data?.price === 'number') {
        return data.data.price;
      }

      return 0;
    } catch (error) {
      console.warn(`Error fetching price for ${tokenSymbol}:`, error);
      return 0;
    }
  }

  async getVaults(): Promise<ArkadikoVaultData[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/vaults`);
      const data = await response.json();

      if (Array.isArray(data)) {
        return data;
      }

      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }

      // Return empty array if no vaults data available
      return [];
    } catch (error) {
      console.warn('Error fetching Arkadiko vaults:', error);
      return [];
    }
  }

  async getVault(vaultId: string): Promise<ArkadikoVaultData | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/vaults/${vaultId}`);
      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      if (data.vault_id) {
        return data;
      }

      return null;
    } catch (error) {
      console.warn(`Error fetching vault ${vaultId}:`, error);
      return null;
    }
  }

  async getStats(): Promise<{totalLiquidity: number; totalVolume24h: number; poolCount: number}> {
    try {
      const [tickers, pools] = await Promise.all([
        this.getTickers().catch(() => []),
        this.getPools().catch(() => [])
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalLiquidity = (tickers as any[]).reduce((sum: any, ticker: any) => {
        return sum + (Number(ticker.liquidity_in_usd) || 0);
      }, 0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalVolume24h = (tickers as any[]).reduce((sum: any, ticker: any) => {
        // Calculate total volume in USD using base and target volumes
        const baseVolumeUsd = Number(ticker.base_volume) * Number(ticker.base_price);
        const targetVolumeUsd = Number(ticker.target_volume) * Number(ticker.target_price);
        return sum + baseVolumeUsd + targetVolumeUsd;
      }, 0);

      return {
        totalLiquidity,
        totalVolume24h,
        poolCount: pools.length
      };
    } catch (error) {
      console.warn('Error fetching Arkadiko stats:', error);
      return {
        totalLiquidity: 0,
        totalVolume24h: 0,
        poolCount: 0
      };
    }
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Stacks-Yield-Aggregator/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}