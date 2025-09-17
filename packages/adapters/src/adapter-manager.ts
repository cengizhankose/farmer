import { Adapter, Opportunity, Chain } from '@shared/core';
import { AlexAdapter } from './protocols/alex';
import { ArkadikoAdapter } from './protocols/arkadiko';

export class AdapterManager {
  private adapters: Map<string, Adapter> = new Map();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    // Stacks adapters
    this.adapters.set('alex', new AlexAdapter());
    this.adapters.set('arkadiko', new ArkadikoAdapter());

    // TODO: Add Ethereum adapters in Phase B
    // this.adapters.set('uniswap', new UniswapAdapter());
    // this.adapters.set('compound', new CompoundAdapter());

    // TODO: Add Solana adapters in Phase B
    // this.adapters.set('raydium', new RaydiumAdapter());
    // this.adapters.set('saber', new SaberAdapter());
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
    const allOpportunities: Opportunity[] = [];

    for (const adapter of this.getAllAdapters()) {
      try {
        const opportunities = await adapter.list();
        allOpportunities.push(...opportunities);
      } catch (error) {
        console.error(
          `Failed to fetch opportunities from ${adapter.getProtocolInfo().name}:`,
          error
        );
        // Continue with other adapters even if one fails
      }
    }

    return allOpportunities;
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

  async refreshAllData(): Promise<Map<string, Opportunity[]>> {
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