import {
  TimeSeriesData,
  HistoricalData,
  HistoricalArrays,
  Opportunity
} from '@shared/core';
import { subDays, parseISO, isAfter, isBefore } from 'date-fns';

export class HistoricalDataService {
  private readonly baseUrl = 'https://yields.llama.fi';
  private readonly timeout = 15000; // 15 seconds for chart data
  private cache = new Map<string, { data: TimeSeriesData[]; expiry: number }>();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 minutes

  async getTimeSeriesData(poolId: string, days: number = 90): Promise<TimeSeriesData[]> {
    const cacheKey = `${poolId}-${days}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/chart/${poolId}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Stacks-Yield-Aggregator/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();

      // Handle both direct array and wrapped response formats
      const chartData = rawData.status === 'success' ? rawData.data : rawData;

      if (!Array.isArray(chartData)) {
        throw new Error('Invalid chart data format');
      }

      // Transform and filter data
      const cutoffDate = subDays(new Date(), days);
      const timeSeriesData: TimeSeriesData[] = chartData
        .map(point => ({
          timestamp: point.timestamp,
          tvlUsd: point.tvlUsd || 0,
          apy: point.apy || 0,
          apyBase: point.apyBase || 0,
          apyReward: point.apyReward || 0,
          volumeUsd: point.volumeUsd1d || point.volumeUsd,
        }))
        .filter(point => {
          try {
            const pointDate = parseISO(point.timestamp);
            return isAfter(pointDate, cutoffDate);
          } catch {
            return false; // Skip invalid dates
          }
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Cache the result
      this.cache.set(cacheKey, {
        data: timeSeriesData,
        expiry: Date.now() + this.cacheTimeout,
      });

      return timeSeriesData;
    } catch (error) {
      console.warn(`Failed to fetch chart data for pool ${poolId}:`, error);
      return [];
    }
  }

  async enrichOpportunityWithHistoricalData(opportunity: Opportunity): Promise<{ opportunity: Opportunity; historicalData?: HistoricalData }> {
    // Only attempt to enrich opportunities with poolId (DefiLlama)
    if (!opportunity.poolId) {
      return { opportunity };
    }

    try {
      const timeSeriesData = await this.getTimeSeriesData(opportunity.poolId, 90);

      if (timeSeriesData.length === 0) {
        return { opportunity };
      }

      const historicalArrays = this.normalizeDataToArrays(timeSeriesData);
      const filledArrays = this.fillMissingData(historicalArrays);

      const historicalData: HistoricalData = {
        tvl_7: filledArrays.tvl_7,
        tvl_30: filledArrays.tvl_30,
        tvl_90: filledArrays.tvl_90,
        apr_30: filledArrays.apr_30,
        apr_90: filledArrays.apr_90,
        vol_30: filledArrays.vol_30.length > 0 ? filledArrays.vol_30 : undefined,
      };

      return { opportunity, historicalData };
    } catch (error) {
      console.warn(`Failed to enrich opportunity ${opportunity.id} with historical data:`, error);
      return { opportunity };
    }
  }

  private normalizeDataToArrays(timeSeriesData: TimeSeriesData[]): HistoricalArrays {
    // Sort by timestamp to ensure chronological order
    const sortedData = timeSeriesData.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const now = new Date();
    const cutoff7 = subDays(now, 7);
    const cutoff30 = subDays(now, 30);
    const cutoff90 = subDays(now, 90);

    // Extract arrays for different time periods
    const tvl_7 = this.extractValuesFromPeriod(sortedData, cutoff7, 'tvlUsd');
    const tvl_30 = this.extractValuesFromPeriod(sortedData, cutoff30, 'tvlUsd');
    const tvl_90 = this.extractValuesFromPeriod(sortedData, cutoff90, 'tvlUsd');

    // Use apyBase for APR calculation (exclude reward APY)
    const apr_30 = this.extractValuesFromPeriod(sortedData, cutoff30, 'apyBase');
    const apr_90 = this.extractValuesFromPeriod(sortedData, cutoff90, 'apyBase');

    // Volume data (often sparse)
    const vol_30 = this.extractValuesFromPeriod(sortedData, cutoff30, 'volumeUsd', true);

    // Extract timestamps for reference
    const timestamps = sortedData.map(d => d.timestamp);

    return {
      tvl_7,
      tvl_30,
      tvl_90,
      apr_30,
      apr_90,
      vol_30,
      timestamps,
    };
  }

  private extractValuesFromPeriod(
    data: TimeSeriesData[],
    cutoffDate: Date,
    field: keyof TimeSeriesData,
    allowEmpty: boolean = false
  ): number[] {
    const filteredData = data.filter(point => {
      try {
        const pointDate = parseISO(point.timestamp);
        return isAfter(pointDate, cutoffDate);
      } catch {
        return false;
      }
    });

    const values = filteredData
      .map(point => point[field] as number)
      .filter(val => allowEmpty || (val !== undefined && val !== null && val > 0));

    return values;
  }

  private fillMissingData(arrays: HistoricalArrays): HistoricalArrays {
    // Fill gaps with forward fill strategy
    const fillArray = (arr: number[], minLength: number): number[] => {
      if (arr.length === 0) return [];

      // If array is too short, pad with last known value
      while (arr.length < minLength && arr.length > 0) {
        arr.push(arr[arr.length - 1]);
      }

      // Fill any zero or null values with previous non-zero value
      for (let i = 1; i < arr.length; i++) {
        if (!arr[i] || arr[i] <= 0) {
          arr[i] = arr[i - 1] || 0;
        }
      }

      return arr;
    };

    return {
      tvl_7: fillArray([...arrays.tvl_7], 3),      // At least 3 points for 7-day
      tvl_30: fillArray([...arrays.tvl_30], 7),    // At least 7 points for 30-day
      tvl_90: fillArray([...arrays.tvl_90], 15),   // At least 15 points for 90-day
      apr_30: fillArray([...arrays.apr_30], 7),    // At least 7 points for APR analysis
      apr_90: fillArray([...arrays.apr_90], 15),   // At least 15 points for long-term APR
      vol_30: arrays.vol_30, // Keep volume as-is (often sparse)
      timestamps: arrays.timestamps,
    };
  }

  // Batch processing for multiple opportunities
  async enrichMultipleOpportunities(opportunities: Opportunity[]): Promise<Array<{ opportunity: Opportunity; historicalData?: HistoricalData }>> {
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    const results: Array<{ opportunity: Opportunity; historicalData?: HistoricalData }> = [];

    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      const batchPromises = batch.map(opportunity =>
        this.enrichOpportunityWithHistoricalData(opportunity)
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Fallback for failed enrichment
            results.push({ opportunity: batch[index] });
            console.warn(`Failed to enrich opportunity ${batch[index].id}:`, result.reason);
          }
        });

        // Small delay between batches to be API-friendly
        if (i + batchSize < opportunities.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        // Handle batch failure
        console.error('Batch processing error:', error);
        batch.forEach(opportunity => results.push({ opportunity }));
      }
    }

    return results;
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { entries: number; totalSize: number } {
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += entry.data.length;
    });

    return {
      entries: this.cache.size,
      totalSize,
    };
  }

  // Data validation and quality checks
  validateTimeSeriesData(data: TimeSeriesData[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (data.length === 0) {
      issues.push('No data points available');
      return { isValid: false, issues };
    }

    // Check for chronological order
    for (let i = 1; i < data.length; i++) {
      const prev = new Date(data[i - 1].timestamp).getTime();
      const curr = new Date(data[i].timestamp).getTime();
      if (curr < prev) {
        issues.push('Data not in chronological order');
        break;
      }
    }

    // Check for reasonable data ranges
    const avgTvl = data.reduce((sum, d) => sum + d.tvlUsd, 0) / data.length;
    if (avgTvl < 1000) {
      issues.push('Suspiciously low TVL values');
    }

    const maxApy = Math.max(...data.map(d => d.apy));
    if (maxApy > 10) { // 1000% APY
      issues.push('Suspiciously high APY values');
    }

    // Check for data completeness
    const nullTvlCount = data.filter(d => !d.tvlUsd || d.tvlUsd <= 0).length;
    if (nullTvlCount > data.length * 0.3) {
      issues.push('More than 30% of TVL data is missing or invalid');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}