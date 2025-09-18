import { LlamaPool, LlamaChartData, LlamaProtocol, LlamaPoolsResponse } from '../types/defillama';

export class DefiLlamaService {
  private readonly baseUrl = 'https://yields.llama.fi';
  private readonly protocolUrl = 'https://api.llama.fi';
  private readonly timeout = 10000; // 10 seconds

  async getPools(): Promise<LlamaPool[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/pools`);
      const data: LlamaPoolsResponse = await response.json();

      if (data.status === 'success' && Array.isArray(data.data)) {
        return data.data;
      }

      // Fallback: try direct array response
      if (Array.isArray(data)) {
        return data as LlamaPool[];
      }

      throw new Error('Invalid response format from DefiLlama pools API');
    } catch (error) {
      console.error('Error fetching DefiLlama pools:', error);
      throw new Error(`Failed to fetch pools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPoolChart(poolId: string): Promise<LlamaChartData[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/chart/${poolId}`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid chart data format');
      }

      return data.map(point => ({
        timestamp: point.timestamp,
        tvlUsd: point.tvlUsd || 0,
        apy: point.apy || 0,
        apyBase: point.apyBase || 0,
        apyReward: point.apyReward || 0,
      }));
    } catch (error) {
      console.error(`Error fetching chart for pool ${poolId}:`, error);
      throw new Error(`Failed to fetch chart data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProtocol(protocolSlug: string): Promise<LlamaProtocol> {
    try {
      const response = await this.fetchWithTimeout(`${this.protocolUrl}/protocol/${protocolSlug}`);
      const data: LlamaProtocol = await response.json();

      return {
        id: data.id || protocolSlug,
        name: data.name || protocolSlug,
        address: data.address || '',
        symbol: data.symbol || '',
        url: data.url || '',
        description: data.description || '',
        chain: data.chain || '',
        logo: data.logo || '',
        audits: data.audits || '',
        audit_note: data.audit_note || '',
        gecko_id: data.gecko_id || '',
        cmcId: data.cmcId || '',
        category: data.category || '',
        chains: data.chains || [],
        module: data.module || '',
        twitter: data.twitter || '',
        forkedFrom: data.forkedFrom || [],
        oracles: data.oracles || [],
        listedAt: data.listedAt || 0,
        methodology: data.methodology || '',
        slug: data.slug || protocolSlug,
        tvl: data.tvl || 0,
        chainTvls: data.chainTvls || {},
        change_1h: data.change_1h || 0,
        change_1d: data.change_1d || 0,
        change_7d: data.change_7d || 0,
        tokenBreakdowns: data.tokenBreakdowns || {},
        mcap: data.mcap || 0,
      };
    } catch (error) {
      console.warn(`Error fetching protocol ${protocolSlug}, using defaults:`, error);
      // Return default protocol info if API fails
      return {
        id: protocolSlug,
        name: protocolSlug.toUpperCase(),
        address: '',
        symbol: '',
        url: '',
        description: '',
        chain: '',
        logo: '',
        audits: '',
        audit_note: '',
        gecko_id: '',
        cmcId: '',
        category: '',
        chains: [],
        module: '',
        twitter: '',
        forkedFrom: [],
        oracles: [],
        listedAt: 0,
        methodology: '',
        slug: protocolSlug,
        tvl: 0,
        chainTvls: {},
        change_1h: 0,
        change_1d: 0,
        change_7d: 0,
        tokenBreakdowns: {},
        mcap: 0,
      };
    }
  }

  async getPoolsByChain(chain: string): Promise<LlamaPool[]> {
    try {
      const pools = await this.getPools();
      return pools.filter(pool =>
        pool.chain?.toLowerCase() === chain.toLowerCase()
      );
    } catch (error) {
      console.error(`Error fetching pools for chain ${chain}:`, error);
      return [];
    }
  }

  async getPoolsByProject(project: string): Promise<LlamaPool[]> {
    try {
      const pools = await this.getPools();
      return pools.filter(pool =>
        pool.project?.toLowerCase() === project.toLowerCase()
      );
    } catch (error) {
      console.error(`Error fetching pools for project ${project}:`, error);
      return [];
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