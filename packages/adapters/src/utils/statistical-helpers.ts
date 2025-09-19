import { StatisticalMeasures } from '@shared/core';
import { mean, median, std, variance, min, max, quantileSeq } from 'mathjs';

/**
 * Comprehensive statistical helpers for risk calculations
 */
export class StatisticalHelpers {

  /**
   * Calculate comprehensive statistical measures for a dataset
   */
  static calculateStatistics(values: number[]): StatisticalMeasures {
    if (values.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        variance: 0,
        min: 0,
        max: 0,
        percentile25: 0,
        percentile75: 0,
      };
    }

    // Filter out invalid values
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));

    if (validValues.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        variance: 0,
        min: 0,
        max: 0,
        percentile25: 0,
        percentile75: 0,
      };
    }

    const sortedValues = [...validValues].sort((a, b) => a - b);

    const meanVal = mean(validValues);
    const medianVal = median(validValues);
    const stdVal = validValues.length > 1 ? std(validValues) : 0;
    const varVal = validValues.length > 1 ? variance(validValues) : 0;
    const minVal = min(validValues);
    const maxVal = max(validValues);

    return {
      mean: typeof meanVal === 'number' ? meanVal : 0,
      median: typeof medianVal === 'number' ? medianVal : 0,
      stdDev: typeof stdVal === 'number' ? stdVal : 0,
      variance: typeof varVal === 'number' ? varVal : 0,
      min: typeof minVal === 'number' ? minVal : 0,
      max: typeof maxVal === 'number' ? maxVal : 0,
      percentile25: this.percentile(sortedValues, 0.25),
      percentile75: this.percentile(sortedValues, 0.75),
      skewness: this.calculateSkewness(validValues),
      kurtosis: this.calculateKurtosis(validValues),
    };
  }

  /**
   * Calculate percentile for a sorted array
   */
  static percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    if (sortedValues.length === 1) return sortedValues[0];

    const index = p * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sortedValues[lower];
    }

    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  /**
   * Calculate moving average
   */
  static movingAverage(values: number[], window: number): number[] {
    if (values.length < window) return [];

    const result: number[] = [];

    for (let i = window - 1; i < values.length; i++) {
      const windowValues = values.slice(i - window + 1, i + 1);
      const meanVal = mean(windowValues);
      result.push(typeof meanVal === 'number' ? meanVal : 0);
    }

    return result;
  }

  /**
   * Calculate exponential moving average
   */
  static exponentialMovingAverage(values: number[], alpha: number = 0.2): number[] {
    if (values.length === 0) return [];

    const result: number[] = [values[0]];

    for (let i = 1; i < values.length; i++) {
      const ema = alpha * values[i] + (1 - alpha) * result[i - 1];
      result.push(ema);
    }

    return result;
  }

  /**
   * Calculate maximum drawdown from a time series
   */
  static calculateMaxDrawdown(values: number[]): number {
    if (values.length < 2) return 0;

    let maxDrawdown = 0;
    let peak = values[0];

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
      } else if (peak > 0) {
        const drawdown = (peak - values[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate volatility (standard deviation of returns)
   */
  static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const returns = values.slice(1).map((val, i) =>
      values[i] > 0 ? (val - values[i]) / values[i] : 0
    );

    const stdResult = std(returns);
    return typeof stdResult === 'number' ? stdResult : 0;
  }

  /**
   * Calculate annualized volatility
   */
  static calculateAnnualizedVolatility(values: number[], periodsPerYear: number = 365): number {
    const dailyVolatility = this.calculateVolatility(values);
    return dailyVolatility * Math.sqrt(periodsPerYear);
  }

  /**
   * Calculate linear regression slope
   */
  static calculateLinearTrend(values: number[]): { slope: number; intercept: number; r2: number } {
    if (values.length < 2) {
      return { slope: 0, intercept: 0, r2: 0 };
    }

    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = values.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + (x * values[i]), 0);
    const sumX2 = xValues.reduce((sum, x) => sum + (x * x), 0);
    const sumY2 = values.reduce((sum, y) => sum + (y * y), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSumSquares = values.reduce((sum, y, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);

    const r2 = totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

    return { slope, intercept, r2 };
  }

  /**
   * Calculate relative strength index (RSI)
   */
  static calculateRSI(values: number[], period: number = 14): number[] {
    if (values.length < period + 1) return [];

    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate gains and losses
    for (let i = 1; i < values.length; i++) {
      const change = values[i] - values[i - 1];
      gains.push(Math.max(change, 0));
      losses.push(Math.max(-change, 0));
    }

    const rsi: number[] = [];

    // Calculate initial RSI
    const avgGain = mean(gains.slice(0, period)) as number;
    const avgLoss = mean(losses.slice(0, period)) as number;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    // Calculate subsequent RSI values using exponential moving average
    let smoothedAvgGain = avgGain;
    let smoothedAvgLoss = avgLoss;

    for (let i = period; i < gains.length; i++) {
      smoothedAvgGain = ((smoothedAvgGain * (period - 1)) + gains[i]) / period;
      smoothedAvgLoss = ((smoothedAvgLoss * (period - 1)) + losses[i]) / period;

      if (smoothedAvgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = smoothedAvgGain / smoothedAvgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return rsi;
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(values: number[], period: number = 20, stdMultiplier: number = 2): {
    middle: number[];
    upper: number[];
    lower: number[];
  } {
    const middle = this.movingAverage(values, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < values.length; i++) {
      const windowValues = values.slice(i - period + 1, i + 1);
      const stdDevResult = std(windowValues);
      const stdDev = typeof stdDevResult === 'number' ? stdDevResult : 0;
      const ma = middle[i - period + 1];

      upper.push(ma + (stdDev * stdMultiplier));
      lower.push(ma - (stdDev * stdMultiplier));
    }

    return { middle, upper, lower };
  }

  /**
   * Calculate Value at Risk (VaR)
   */
  static calculateVaR(returns: number[], confidenceLevel: number = 0.05): number {
    if (returns.length === 0) return 0;

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(confidenceLevel * sortedReturns.length);

    return sortedReturns[index] || 0;
  }

  /**
   * Calculate Conditional Value at Risk (CVaR)
   */
  static calculateCVaR(returns: number[], confidenceLevel: number = 0.05): number {
    const varValue = this.calculateVaR(returns, confidenceLevel);
    const tailReturns = returns.filter(r => r <= varValue);

    const meanResult = tailReturns.length > 0 ? mean(tailReturns) : 0;
    return typeof meanResult === 'number' ? meanResult : 0;
  }

  /**
   * Calculate Sharpe ratio
   */
  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
    if (returns.length === 0) return 0;

    const avgReturnResult = mean(returns);
    const avgReturn = typeof avgReturnResult === 'number' ? avgReturnResult : 0;
    const volatilityResult = std(returns);
    const volatility = typeof volatilityResult === 'number' ? volatilityResult : 0;

    return volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
  }

  /**
   * Calculate correlation coefficient
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + (val * y[i]), 0);
    const sumX2 = x.reduce((sum, val) => sum + (val * val), 0);
    const sumY2 = y.reduce((sum, val) => sum + (val * val), 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * Calculate skewness
   */
  private static calculateSkewness(values: number[]): number {
    if (values.length < 3) return 0;

    const mResult = mean(values);
    const m = typeof mResult === 'number' ? mResult : 0;
    const sResult = std(values);
    const s = typeof sResult === 'number' ? sResult : 0;

    if (s === 0) return 0;

    const n = values.length;
    const skewness = values.reduce((sum, val) => {
      return sum + Math.pow((val - m) / s, 3);
    }, 0) / n;

    return skewness;
  }

  /**
   * Calculate kurtosis
   */
  private static calculateKurtosis(values: number[]): number {
    if (values.length < 4) return 0;

    const mResult = mean(values);
    const m = typeof mResult === 'number' ? mResult : 0;
    const sResult = std(values);
    const s = typeof sResult === 'number' ? sResult : 0;

    if (s === 0) return 0;

    const n = values.length;
    const kurtosis = values.reduce((sum, val) => {
      return sum + Math.pow((val - m) / s, 4);
    }, 0) / n;

    return kurtosis - 3; // Excess kurtosis
  }

  /**
   * Winsorize data to handle outliers
   */
  static winsorize(values: number[], lowerPercentile: number = 0.05, upperPercentile: number = 0.95): number[] {
    if (values.length === 0) return [];

    const sortedValues = [...values].sort((a, b) => a - b);
    const lowerBound = this.percentile(sortedValues, lowerPercentile);
    const upperBound = this.percentile(sortedValues, upperPercentile);

    return values.map(val => {
      if (val < lowerBound) return lowerBound;
      if (val > upperBound) return upperBound;
      return val;
    });
  }

  /**
   * Normalize values to 0-1 range
   */
  static normalize(values: number[]): number[] {
    if (values.length === 0) return [];

    const minVal = min(values) as number;
    const maxVal = max(values) as number;
    const range = maxVal - minVal;

    if (range === 0) return values.map(() => 0.5);

    return values.map(val => (val - minVal) / range);
  }

  /**
   * Z-score standardization
   */
  static standardize(values: number[]): number[] {
    if (values.length === 0) return [];

    const mResult = mean(values);
    const m = typeof mResult === 'number' ? mResult : 0;
    const sResult = std(values);
    const s = typeof sResult === 'number' ? sResult : 0;

    if (s === 0) return values.map(() => 0);

    return values.map(val => (val - m) / s);
  }
}