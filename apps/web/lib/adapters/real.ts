/**
 * Real Data Bridge Layer
 * 
 * Provides a bridge between the adapter system and the web app,
 * handling data transformation, caching, error handling, and logging.
 */

import { Opportunity as SharedOpportunity } from "../../../../packages/shared/src/types";
import type { CardOpportunity as MockOpportunity } from "../types";

// Logging utilities
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogContext {
  component?: string;
  action?: string;
  opportunityId?: string;
  protocol?: string;
  errorType?: string;
  statusCode?: number;
}

class Logger {
  private static level = LogLevel.INFO;

  static setLevel(level: LogLevel) {
    Logger.level = level;
  }

  private static formatMessage(level: LogLevel, message: string, context?: LogContext, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];

    let contextStr = '';
    if (context) {
      const contextParts = [
        context.component && `[${context.component}]`,
        context.action && `${context.action}`,
        context.opportunityId && `ID:${context.opportunityId}`,
        context.protocol && `Protocol:${context.protocol}`,
        context.errorType && `Type:${context.errorType}`,
        context.statusCode && `Status:${context.statusCode}`
      ].filter(Boolean);

      if (contextParts.length > 0) {
        contextStr = `(${contextParts.join(' ')}) `;
      }
    }

    return `[${timestamp}] [${levelStr}] [RealDataBridge] ${contextStr}${message}`;
  }

  private static log(level: LogLevel, message: string, context?: LogContext, ...args: unknown[]) {
    if (level >= Logger.level) {
      const formattedMessage = this.formatMessage(level, message, context);

      // Use console.error for errors, console.log for others
      if (level === LogLevel.ERROR) {
        console.error(formattedMessage, ...args);
      } else {
        console.log(formattedMessage, ...args);
      }
    }
  }

  static debug(message: string, context?: LogContext, ...args: unknown[]) {
    Logger.log(LogLevel.DEBUG, message, context, ...args);
  }

  static info(message: string, context?: LogContext, ...args: unknown[]) {
    Logger.log(LogLevel.INFO, message, context, ...args);
  }

  static warn(message: string, context?: LogContext, ...args: unknown[]) {
    Logger.log(LogLevel.WARN, message, context, ...args);
  }

  static error(message: string, error?: unknown, context?: LogContext, ...args: unknown[]) {
    const errorContext = {
      ...context,
      errorType: error instanceof Error ? error.constructor.name : typeof error
    };

    Logger.log(LogLevel.ERROR, message, errorContext, ...args);

    // Additional error details in development
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.debug(`└─ Stack trace: ${error.stack}`);
    }
  }

  // Structured error reporting for specific scenarios
  static reportApiError(endpoint: string, error: Error, context?: LogContext) {
    const errorContext: LogContext = {
      ...context,
      component: 'API',
      action: endpoint,
      errorType: error.constructor.name
    };

    if (error.message.includes('404')) {
      errorContext.statusCode = 404;
      this.warn(`Resource not found: ${endpoint}`, errorContext);
    } else if (error.message.includes('400')) {
      errorContext.statusCode = 400;
      this.warn(`Bad request: ${endpoint}`, errorContext);
    } else {
      this.error(`API call failed: ${endpoint}`, error, errorContext);
    }
  }

  static reportDataIssue(type: 'missing' | 'corrupted' | 'unexpected', field: string, data?: unknown) {
    const context: LogContext = {
      component: 'DataProcessing',
      action: type,
      errorType: 'DataIssue'
    };

    this.warn(`Data ${type}: ${field}`, context, data);
  }
}

// Error classes for better error handling
export class DataFetchError extends Error {
  constructor(
    message: string,
    public source: 'adapter' | 'transform' | 'cache',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DataFetchError';
  }
}

export class DataTransformError extends Error {
  constructor(
    message: string,
    public data: unknown,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DataTransformError';
  }
}

// Cache management
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class DataCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static cache = new Map<string, CacheEntry<any>>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  static set<T>(key: string, data: T, ttl: number = DataCache.DEFAULT_TTL): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + ttl
    };
    
    DataCache.cache.set(key, entry);
    Logger.debug(`Cache set: ${key}, TTL: ${ttl}ms`);
  }
  
  static get<T>(key: string): T | null {
    const entry = DataCache.cache.get(key);
    
    if (!entry) {
      Logger.debug(`Cache miss: ${key}`);
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      DataCache.cache.delete(key);
      Logger.debug(`Cache expired: ${key}`);
      return null;
    }
    
    Logger.debug(`Cache hit: ${key}, age: ${Date.now() - entry.timestamp}ms`);
    return entry.data;
  }
  
  static clear(): void {
    DataCache.cache.clear();
    Logger.info('Cache cleared');
  }
  
  static getStats() {
    const entries = Array.from(DataCache.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([, entry]) => now <= entry.expiry).length,
      expiredEntries: entries.filter(([, entry]) => now > entry.expiry).length,
      oldestEntry: Math.min(...entries.map(([, entry]) => entry.timestamp)),
      newestEntry: Math.max(...entries.map(([, entry]) => entry.timestamp))
    };
  }
}

// Data transformation utilities
function transformRiskLevel(risk: string): "Low" | "Medium" | "High" {
  const normalized = risk.toLowerCase();
  
  switch (normalized) {
    case 'low':
      return 'Low';
    case 'med':
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    default:
      Logger.warn(`Unknown risk level: ${risk}, defaulting to Medium`);
      return 'Medium';
  }
}

function convertDecimalToPercentage(decimal: number): number {
  // DeFiLlama already provides percentage values, so return as-is
  return decimal;
}

function formatLastUpdated(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return '1m';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

/**
 * Transform real data (SharedOpportunity) to mock data format (MockOpportunity)
 */
function transformOpportunity(real: SharedOpportunity): MockOpportunity {
  try {
    Logger.debug(`Transforming opportunity: ${real.id}`);
    
    // Use logo provided by adapters as-is
    const resolvedLogo = real.logoUrl || '';

    const transformed: MockOpportunity = {
      id: real.id,
      protocol: real.protocol,
      pair: real.pool, // pool -> pair mapping
      chain: real.chain,
      apr: convertDecimalToPercentage(real.apr), // Convert decimal to percentage
      apy: convertDecimalToPercentage(real.apy), // Convert decimal to percentage
      risk: transformRiskLevel(real.risk), // Capitalize risk level
      tvlUsd: real.tvlUsd,
      rewardToken: Array.isArray(real.rewardToken) ? real.rewardToken[0] : real.rewardToken,
      lastUpdated: formatLastUpdated(real.lastUpdated),
      originalUrl: `https://defillama.com/pool/${real.poolId || real.id}`, // Fallback URL
      summary: `${real.protocol} pool with ${real.exposure || 'mixed'} exposure${real.stablecoin ? ' (stablecoin)' : ''}${real.ilRisk ? `, IL risk: ${real.ilRisk}` : ''}`,
      logoUrl: resolvedLogo
    };
    
    Logger.debug(`Successfully transformed opportunity: ${real.id} -> ${transformed.id}`);
    return transformed;
    
  } catch (error) {
    Logger.error(`Failed to transform opportunity: ${real.id}`, error);
    throw new DataTransformError(
      `Failed to transform opportunity ${real.id}`,
      real,
      error as Error
    );
  }
}

/**
 * Real Data Adapter - interfaces with the adapter system
 */
class RealDataAdapter {
  private static instance: RealDataAdapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private adapterManager: any = null;
  
  private constructor() {
    Logger.info('RealDataAdapter initialized');
  }
  
  static getInstance(): RealDataAdapter {
    if (!RealDataAdapter.instance) {
      RealDataAdapter.instance = new RealDataAdapter();
    }
    return RealDataAdapter.instance;
  }
  
  /**
   * Lazy load adapter manager to avoid SSR issues
   */
  private async getAdapterManager() {
    if (!this.adapterManager) {
      try {
        Logger.debug('Loading adapter manager...');
        
        // Dynamic import to avoid SSR issues
        Logger.info('Loading real data adapter manager...');
        
        // REAL DATA FULLY ACTIVATED! 
        const { AdapterManager } = await import('../../../../packages/adapters/dist/adapters/src/adapter-manager.js');
        this.adapterManager = new AdapterManager();
        Logger.info('🚀 REAL DATA ADAPTER FULLY ACTIVATED! All API calls now live!');
        Logger.info('✨ Fetching data from ALEX, Arkadiko, and DefiLlama APIs...');
        
        Logger.info('Adapter manager loaded successfully');
      } catch (error) {
        Logger.error('Failed to load adapter manager', error);
        throw new DataFetchError(
          'Failed to initialize adapter manager',
          'adapter',
          error as Error
        );
      }
    }
    
    return this.adapterManager;
  }
  
  /**
   * Fetch all opportunities from real data sources
   */
  async fetchOpportunities(): Promise<MockOpportunity[]> {
    const cacheKey = 'opportunities_all';
    
    try {
      // Check cache first
      const cached = DataCache.get<MockOpportunity[]>(cacheKey);
      if (cached) {
        Logger.info(`Returning ${cached.length} opportunities from cache`);
        return cached;
      }
      
      Logger.info('Fetching opportunities from real data sources...');
      
      const adapterManager = await this.getAdapterManager();
      const realOpportunities: SharedOpportunity[] = await adapterManager.getAllOpportunities();
      
      Logger.info(`Fetched ${realOpportunities.length} opportunities from adapter`);
      
      // Transform to mock format
      const transformed = realOpportunities.map(transformOpportunity);
      
      // Filter to only enabled chains (Stacks for now)
      const filtered = transformed.filter(opp => opp.chain === 'stacks');
      
      Logger.info(`Transformed and filtered to ${filtered.length} opportunities`);
      
      // Cache the result
      DataCache.set(cacheKey, filtered);
      
      return filtered;
      
    } catch (error) {
      Logger.error('Failed to fetch opportunities', error);
      
      if (error instanceof DataFetchError || error instanceof DataTransformError) {
        throw error;
      }
      
      throw new DataFetchError(
        'Failed to fetch opportunities',
        'adapter',
        error as Error
      );
    }
  }
  
  /**
   * Fetch single opportunity by ID
   */
  async fetchOpportunityById(id: string): Promise<MockOpportunity | null> {
    const cacheKey = `opportunity_${id}`;

    try {
      // Check cache first
      const cached = DataCache.get<MockOpportunity>(cacheKey);
      if (cached) {
        Logger.info(`Returning opportunity from cache`, { opportunityId: id });
        return cached;
      }

      Logger.info(`Fetching opportunity from real data sources`, { opportunityId: id });

      const adapterManager = await this.getAdapterManager();

      // For Arkadiko IDs, skip detail (some IDs 404); otherwise try detail first
      const isArkadikoId = id.toLowerCase().startsWith('arkadiko-');
      if (!isArkadikoId) {
        try {
          const realOpportunity: SharedOpportunity = await adapterManager.getOpportunityDetail(id);
          const transformed = transformOpportunity(realOpportunity);
          Logger.info(`Successfully fetched opportunity detail`, { opportunityId: id, protocol: realOpportunity.protocol });
          DataCache.set(cacheKey, transformed, 10 * 60 * 1000); // 10 minutes for details
          return transformed;
        } catch (detailError) {
          Logger.reportApiError('getOpportunityDetail', detailError as Error, { opportunityId: id });
          Logger.warn(`Detail fetch failed, falling back to list search`, { opportunityId: id });
        }
      } else {
        Logger.debug(`Skipping Arkadiko detail; using list fallback`, { opportunityId: id, protocol: 'Arkadiko' });
      }

      try {
        // Fallback: search in full list
        const allOpportunities = await this.fetchOpportunities();
        const found = allOpportunities.find(opp => opp.id === id);

        if (found) {
          Logger.info(`Found opportunity in list fallback`, { opportunityId: id, protocol: found.protocol });
          DataCache.set(cacheKey, found, 5 * 60 * 1000); // 5 minutes for fallback
          return found;
        }

        Logger.warn(`Opportunity not found in any data source`, { opportunityId: id });
        return null;
      } catch (listError) {
        Logger.error(`Failed list fallback`, listError, { opportunityId: id });
        return null;
      }

    } catch (error) {
      Logger.error(`Failed to fetch opportunity`, error, { opportunityId: id });

      if (error instanceof DataFetchError || error instanceof DataTransformError) {
        throw error;
      }

      throw new DataFetchError(
        `Failed to fetch opportunity ${id}`,
        'adapter',
        error as Error
      );
    }
  }
  
  /**
   * Fetch aggregate statistics
   */
  async fetchStats(): Promise<{ avgApr7d: number; totalTvlUsd: number; results: number }> {
    const cacheKey = 'stats_aggregate';
    
    try {
      // Check cache first
      const cached = DataCache.get<{ avgApr7d: number; totalTvlUsd: number; results: number }>(cacheKey);
      if (cached) {
        Logger.info('Returning stats from cache');
        return cached;
      }
      
      Logger.info('Calculating stats from opportunities...');
      
      const opportunities = await this.fetchOpportunities();
      
      const stats = {
        avgApr7d: opportunities.reduce((sum, opp) => sum + opp.apr, 0) / opportunities.length,
        totalTvlUsd: opportunities.reduce((sum, opp) => sum + opp.tvlUsd, 0),
        results: opportunities.length
      };
      
      Logger.info(`Calculated stats: avgApr=${stats.avgApr7d.toFixed(1)}%, totalTvl=$${(stats.totalTvlUsd / 1_000_000).toFixed(1)}M, results=${stats.results}`);
      
      // Cache for 2 minutes
      DataCache.set(cacheKey, stats, 2 * 60 * 1000);
      
      return stats;
      
    } catch (error) {
      Logger.error('Failed to calculate stats', error);
      
      // Return fallback stats
      const fallbackStats = {
        avgApr7d: 12.5,
        totalTvlUsd: 2_000_000,
        results: 0
      };
      
      Logger.warn('Returning fallback stats due to error');
      return fallbackStats;
    }
  }
  
  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return DataCache.getStats();
  }
  
  /**
   * Clear all cached data
   */
  clearCache() {
    DataCache.clear();
  }

  /**
   * Fetch historical chart series for an opportunity by id
   * Returns normalized points with timestamp, tvlUsd, apy, apr, volume24h when available
   */
  async fetchChartSeries(id: string, days: number = 30): Promise<Array<{
    timestamp: number;
    tvlUsd: number;
    apy?: number;
    apr?: number;
    volume24h?: number;
  }>> {
    try {
      const adapterManager = await this.getAdapterManager();

      // Resolve poolId without forcing protocol detail (avoid Arkadiko 404)
      let poolId: string | undefined;
      try {
        const opp: SharedOpportunity | null = await adapterManager.getOpportunityDetail(id);
        poolId = opp?.poolId;
      } catch (detailError) {
        Logger.reportApiError('getOpportunityDetail', detailError as Error, { opportunityId: id });
        poolId = undefined;
      }

      if (!poolId) {
        try {
          const all: SharedOpportunity[] = await adapterManager.getAllOpportunities();
          const found = all.find(o => o.id === id);
          poolId = found?.poolId;
          if (found) {
            Logger.debug(`Found poolId in list fallback`, { opportunityId: id, protocol: found.protocol });
          }
        } catch (listError) {
          Logger.reportApiError('getAllOpportunities', listError as Error, { opportunityId: id });
          poolId = undefined;
        }
      }

      if (!poolId) {
        Logger.reportDataIssue('missing', 'poolId', { opportunityId: id });
        Logger.info(`No poolId found, returning empty chart data`, { opportunityId: id });
        return [];
      }

      const raw = await adapterManager.getChartData(poolId);

      // Normalize potential shapes (DefiLlama vs Arkadiko)
      // DefiLlama: { timestamp, tvlUsd, apy, apyBase, apyReward }
      // Arkadiko: { timestamp, liquidity_usd, volume_24h }
      type LlamaPoint = { timestamp: number | string; tvlUsd?: number; apy?: number; apyBase?: number; apyReward?: number };
      type ArkPoint = { timestamp: number | string; liquidity_usd?: number; volume_24h?: number };
      const arr = Array.isArray(raw) ? raw : [];

      if (arr.length === 0) {
        Logger.reportDataIssue('missing', 'chartData', { opportunityId: id, poolId });
        Logger.info(`No chart data available for pool`, { opportunityId: id });
        return [];
      }

      const points = arr.map((p: LlamaPoint | ArkPoint) => {
        const tsVal = (p as LlamaPoint).timestamp ?? (p as ArkPoint).timestamp;
        const ts = typeof tsVal === 'string' ? Date.parse(tsVal) : Number(tsVal) || Date.now();
        const tvl = typeof (p as LlamaPoint).tvlUsd === 'number' ? (p as LlamaPoint).tvlUsd : (typeof (p as ArkPoint).liquidity_usd === 'number' ? (p as ArkPoint).liquidity_usd! : 0);
        const apy = typeof (p as LlamaPoint).apy === 'number' ? (p as LlamaPoint).apy : (typeof (p as LlamaPoint).apyBase === 'number' ? (p as LlamaPoint).apyBase : undefined);
        const apr = typeof apy === 'number' ? apy : undefined; // approximate
        const volume24h = typeof (p as ArkPoint).volume_24h === 'number' ? (p as ArkPoint).volume_24h : undefined;
        return { timestamp: ts, tvlUsd: tvl ?? 0, apy, apr, volume24h };
      });

      // Filter by days
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const filtered = points.filter(pt => pt.timestamp >= cutoff);
      const result = filtered.length > 5 ? filtered : points;

      Logger.debug(`Chart data processed`, { opportunityId: id, action: 'processChartData' });

      return result;

    } catch (error) {
      Logger.reportApiError('getChartData', error as Error, { opportunityId: id });

      // Return empty array instead of throwing error to maintain UI functionality
      Logger.info(`Returning empty chart data due to API error`, { opportunityId: id });
      return [];
    }
  }
}

// Error boundary utilities
export class ErrorBoundary {
  static async withFallback<T>(
    operation: () => Promise<T>,
    fallback: T,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      Logger.error(`Operation failed in ${context}, using fallback`, error);
      return fallback;
    }
  }
  
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context: string = 'unknown'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.debug(`Attempt ${attempt}/${maxRetries} for ${context}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        Logger.warn(`Attempt ${attempt}/${maxRetries} failed for ${context}`, error);
        
        if (attempt < maxRetries) {
          Logger.debug(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    Logger.error(`All ${maxRetries} attempts failed for ${context}`, lastError!);
    throw lastError!;
  }
}

// Export singleton instance
export const realDataAdapter = RealDataAdapter.getInstance();

// Export utilities for advanced usage
export { Logger, DataCache, LogLevel };

// Initialize logging level based on environment
if (typeof window !== 'undefined') {
  // Client-side: check for debug flag
  if (window.location.search.includes('debug=true')) {
    Logger.setLevel(LogLevel.DEBUG);
    Logger.debug('Debug logging enabled via URL parameter');
  }
} else {
  // Server-side: check NODE_ENV
  if (process.env.NODE_ENV === 'development') {
    Logger.setLevel(LogLevel.DEBUG);
  }
}

Logger.info('Real data bridge layer initialized');
