import { Adapter, Opportunity, ProtocolInfo, Chain } from '../types';

export abstract class BaseAdapter implements Adapter {
  protected protocolInfo: ProtocolInfo;

  constructor(protocolInfo: ProtocolInfo) {
    this.protocolInfo = protocolInfo;
  }

  abstract list(): Promise<Opportunity[]>;
  abstract detail(id: string): Promise<Opportunity>;

  getProtocolInfo(): ProtocolInfo {
    return this.protocolInfo;
  }

  protected createOpportunityId(protocol: string, pool: string): string {
    return `${protocol.toLowerCase()}-${pool.toLowerCase().replace(/[\/\s]/g, '-')}`;
  }

  protected calculateRisk(
    apr: number,
    tvlUsd?: number,
    isStablecoin = false
  ): 'low' | 'med' | 'high' {
    if (isStablecoin && apr < 0.1) return 'low';
    if (apr < 0.15) return 'low';
    if (apr < 0.3) return 'med';
    return 'high';
  }

  protected async fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    try {
      return await fetchFn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(fetchFn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  protected handleError(error: any, context: string): never {
    console.error(`Error in ${this.protocolInfo.name} adapter (${context}):`, error);
    throw new Error(`Failed to fetch data from ${this.protocolInfo.name}: ${error.message}`);
  }
}