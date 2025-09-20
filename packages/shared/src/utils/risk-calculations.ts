import {
  HistoricalRiskData,
  AdvancedRiskMetrics,
  CorrelationData,
  SystemicRiskMetrics,
  StressTestResult,
  PortfolioRiskMetrics,
  RiskAttribution,
  MonteCarloResult,
  LiquidityRiskMetrics,
  MarketRegime
} from "../types/risk-advanced";

/**
 * Advanced Risk Calculations Library
 * Provides sophisticated financial risk metrics and analysis functions
 */

export class RiskCalculations {
  // Helper functions
  private static readonly DAYS_PER_YEAR = 365;
  private static readonly RISK_FREE_RATE = 0.02; // 2% annual risk-free rate
  private static readonly CONFIDENCE_LEVELS = [0.95, 0.99];

  /**
   * Calculate Sharpe Ratio
   * Measures excess return per unit of volatility
   */
  static calculateSharpeRatio(
    returns: number[],
    riskFreeRate: number = this.RISK_FREE_RATE,
    periodsPerYear: number = this.DAYS_PER_YEAR
  ): number {
    if (returns.length < 2) return 0;

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const excessReturns = returns.map(r => r - riskFreeRate / periodsPerYear);
    const volatility = this.calculateStandardDeviation(excessReturns);

    return volatility === 0 ? 0 : (meanReturn * Math.sqrt(periodsPerYear)) / volatility;
  }

  /**
   * Calculate Sortino Ratio
   * Similar to Sharpe but only considers downside volatility
   */
  static calculateSortinoRatio(
    returns: number[],
    riskFreeRate: number = this.RISK_FREE_RATE,
    targetReturn: number = 0,
    periodsPerYear: number = this.DAYS_PER_YEAR
  ): number {
    if (returns.length < 2) return 0;

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const excessReturns = returns.map(r => r - riskFreeRate / periodsPerYear);

    // Calculate downside deviation (only negative returns)
    const downsideReturns = excessReturns.filter(r => r < targetReturn);
    const downsideSquared = downsideReturns.map(r => Math.pow(r - targetReturn, 2));
    const downsideVariance = downsideSquared.reduce((sum, sq) => sum + sq, 0) / returns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);

    return downsideDeviation === 0 ? 0 : (meanReturn * Math.sqrt(periodsPerYear)) / downsideDeviation;
  }

  /**
   * Calculate Value at Risk (VaR)
   * Maximum expected loss over a time period at a confidence level
   */
  static calculateValueAtRisk(
    returns: number[],
    confidenceLevel: number = 0.95,
    timeHorizon: number = 1
  ): number {
    if (returns.length === 0) return 0;

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    const varValue = sortedReturns[index] || 0;

    // Scale for time horizon (square root of time rule)
    return varValue * Math.sqrt(timeHorizon);
  }

  /**
   * Calculate Expected Shortfall (CVaR)
   * Average loss beyond the VaR threshold
   */
  static calculateExpectedShortfall(
    returns: number[],
    confidenceLevel: number = 0.95
  ): number {
    if (returns.length === 0) return 0;

    const varValue = this.calculateValueAtRisk(returns, confidenceLevel);
    const tailReturns = returns.filter(r => r <= varValue);

    return tailReturns.length === 0 ? 0 :
      tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
  }

  /**
   * Calculate Maximum Drawdown and period
   */
  static calculateMaxDrawdown(values: number[]): {
    maxDrawdown: number;
    maxDrawdownPeriod: number;
    drawdownStartIndex?: number;
    drawdownEndIndex?: number;
  } {
    if (values.length === 0) return { maxDrawdown: 0, maxDrawdownPeriod: 0 };

    let peak = values[0];
    let maxDrawdown = 0;
    let currentDrawdownPeriod = 0;
    let maxDrawdownPeriod = 0;
    let drawdownStartIndex = 0;
    let maxDrawdownStartIndex = 0;
    let maxDrawdownEndIndex = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
        currentDrawdownPeriod = 0;
        drawdownStartIndex = i;
      } else {
        const drawdown = (peak - values[i]) / peak;
        currentDrawdownPeriod++;

        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
          maxDrawdownPeriod = currentDrawdownPeriod;
          maxDrawdownStartIndex = drawdownStartIndex;
          maxDrawdownEndIndex = i;
        }
      }
    }

    return {
      maxDrawdown,
      maxDrawdownPeriod,
      drawdownStartIndex: maxDrawdownStartIndex,
      drawdownEndIndex: maxDrawdownEndIndex
    };
  }

  /**
   * Calculate Beta to market/benchmark
   */
  static calculateBeta(assetReturns: number[], marketReturns: number[]): number {
    if (assetReturns.length !== marketReturns.length || assetReturns.length < 2) {
      return 0;
    }

    const assetMean = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < assetReturns.length; i++) {
      const assetDeviation = assetReturns[i] - assetMean;
      const marketDeviation = marketReturns[i] - marketMean;

      covariance += assetDeviation * marketDeviation;
      marketVariance += marketDeviation * marketDeviation;
    }

    covariance /= assetReturns.length - 1;
    marketVariance /= marketReturns.length - 1;

    return marketVariance === 0 ? 0 : covariance / marketVariance;
  }

  /**
   * Calculate correlation coefficient
   */
  static calculateCorrelation(series1: number[], series2: number[]): number {
    if (series1.length !== series2.length || series1.length < 2) return 0;

    const mean1 = series1.reduce((sum, val) => sum + val, 0) / series1.length;
    const mean2 = series2.reduce((sum, val) => sum + val, 0) / series2.length;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < series1.length; i++) {
      const diff1 = series1[i] - mean1;
      const diff2 = series2[i] - mean2;

      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate Calmar Ratio
   * Annualized return relative to maximum drawdown
   */
  static calculateCalmarRatio(annualizedReturn: number, maxDrawdown: number): number {
    return maxDrawdown === 0 ? 0 : annualizedReturn / Math.abs(maxDrawdown);
  }

  /**
   * Calculate Omega Ratio
   * Probability weighted ratio of gains versus losses relative to a threshold
   */
  static calculateOmegaRatio(returns: number[], threshold: number = 0): number {
    const gains = returns.filter(r => r > threshold).reduce((sum, r) => sum + (r - threshold), 0);
    const losses = returns.filter(r => r < threshold).reduce((sum, r) => sum + Math.abs(threshold - r), 0);

    return losses === 0 ? Infinity : gains / losses;
  }

  /**
   * Calculate Information Ratio
   * Measures active return per unit of active risk
   */
  static calculateInformationRatio(
    portfolioReturns: number[],
    benchmarkReturns: number[]
  ): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) {
      return 0;
    }

    const activeReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    const meanActiveReturn = activeReturns.reduce((sum, r) => sum + r, 0) / activeReturns.length;
    const trackingError = this.calculateStandardDeviation(activeReturns);

    return trackingError === 0 ? 0 : meanActiveReturn / trackingError;
  }

  /**
   * Monte Carlo Simulation for risk assessment
   */
  static runMonteCarloSimulation(
    initialValue: number,
    expectedReturn: number,
    volatility: number,
    timeHorizon: number,
    simulations: number = 10000
  ): MonteCarloResult {
    const dt = 1 / this.DAYS_PER_YEAR; // daily time step
    const results: number[] = [];

    for (let sim = 0; sim < simulations; sim++) {
      let value = initialValue;

      for (let t = 0; t < timeHorizon; t++) {
        const randomShock = this.boxMullerTransform(); // standard normal random variable
        const growthRate = (expectedReturn - 0.5 * volatility * volatility) * dt +
                         volatility * Math.sqrt(dt) * randomShock;
        value *= Math.exp(growthRate);
      }

      results.push(value);
    }

    const finalReturns = results.map(value => (value - initialValue) / initialValue);
    const meanReturn = finalReturns.reduce((sum, r) => sum + r, 0) / finalReturns.length;
    const volatilityFinal = this.calculateStandardDeviation(finalReturns);

    const sortedReturns = [...finalReturns].sort((a, b) => a - b);
    const percentiles = {
      p5: sortedReturns[Math.floor(0.05 * sortedReturns.length)],
      p10: sortedReturns[Math.floor(0.10 * sortedReturns.length)],
      p25: sortedReturns[Math.floor(0.25 * sortedReturns.length)],
      p50: sortedReturns[Math.floor(0.50 * sortedReturns.length)],
      p75: sortedReturns[Math.floor(0.75 * sortedReturns.length)],
      p90: sortedReturns[Math.floor(0.90 * sortedReturns.length)],
      p95: sortedReturns[Math.floor(0.95 * sortedReturns.length)],
      p99: sortedReturns[Math.floor(0.99 * sortedReturns.length)]
    };

    const probabilityOfLoss = finalReturns.filter(r => r < 0).length / finalReturns.length;
    const expectedLoss = finalReturns.filter(r => r < 0).reduce((sum, r) => sum + r, 0) /
                        (finalReturns.filter(r => r < 0).length || 1);

    return {
      simulations,
      meanReturn,
      volatility: volatilityFinal,
      percentiles,
      probabilityOfLoss,
      expectedLoss,
      tailRisk: expectedLoss / volatilityFinal
    };
  }

  /**
   * Calculate portfolio risk metrics
   */
  static calculatePortfolioRisk(
    positions: Array<{
      value: number;
      returns: number[];
      beta?: number;
      correlationToPortfolio?: number;
    }>
  ): PortfolioRiskMetrics {
    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const weights = positions.map(pos => pos.value / totalValue);

    // Calculate weighted average return
    const avgReturns = positions.map((pos, i) =>
      pos.returns.map(r => r * weights[i])
    );
    const portfolioReturns = Array(Math.max(...positions.map(p => p.returns.length)))
      .fill(0)
      .map((_, i) => avgReturns.reduce((sum, returns) => sum + (returns[i] || 0), 0));

    const meanReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const volatility = this.calculateStandardDeviation(portfolioReturns);

    // Calculate concentration risk (Herfindahl-Hirschman Index)
    const concentrationRisk = weights.reduce((sum, w) => sum + w * w, 0);

    // Calculate weighted beta
    const weightedBeta = positions.reduce((sum, pos, i) =>
      sum + (pos.beta || 1) * weights[i], 0
    );

    // Calculate diversification benefit
    const correlationMatrix = this.calculateCorrelationMatrix(
      positions.map(p => p.returns)
    );
    const diversificationScore = this.calculateDiversificationScore(weights, correlationMatrix);

    const maxDrawdownResult = this.calculateMaxDrawdown(
      this.cumulateReturns(portfolioReturns)
    );

    return {
      totalValue,
      weightedRiskScore: volatility * 100, // Convert to percentage
      diversificationScore: diversificationScore * 100,
      concentrationRisk: concentrationRisk * 100,
      correlationRisk: this.calculateAverageCorrelation(correlationMatrix) * 100,
      liquidityRisk: this.calculatePortfolioLiquidityRisk(positions) * 100,
      marketRisk: volatility * Math.abs(weightedBeta) * 100,
      maxDrawdown: maxDrawdownResult.maxDrawdown * 100,
      sharpeRatio: this.calculateSharpeRatio(portfolioReturns),
      sortinoRatio: this.calculateSortinoRatio(portfolioReturns),
      var95: this.calculateValueAtRisk(portfolioReturns, 0.95) * 100,
      var99: this.calculateValueAtRisk(portfolioReturns, 0.99) * 100,
      expectedShortfall: this.calculateExpectedShortfall(portfolioReturns, 0.95) * 100,
      beta: weightedBeta,
      alpha: meanReturn * this.DAYS_PER_YEAR - this.RISK_FREE_RATE -
             (weightedBeta * (this.RISK_FREE_RATE - this.RISK_FREE_RATE)), // Simplified
      informationRatio: this.calculateInformationRatio(portfolioReturns,
        Array(portfolioReturns.length).fill(this.RISK_FREE_RATE / this.DAYS_PER_YEAR))
    };
  }

  // Helper methods
  private static calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
                     (values.length - 1);

    return Math.sqrt(variance);
  }

  private static boxMullerTransform(): number {
    const u1 = Math.random();
    const u2 = Math.random();

    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private static cumulateReturns(returns: number[]): number[] {
    const result: number[] = [100]; // Start with base value of 100

    for (let i = 0; i < returns.length; i++) {
      result.push(result[result.length - 1] * (1 + returns[i]));
    }

    return result;
  }

  private static calculateCorrelationMatrix(returnsSeries: number[][]): number[][] {
    const n = returnsSeries.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        matrix[i][j] = this.calculateCorrelation(returnsSeries[i], returnsSeries[j]);
      }
    }

    return matrix;
  }

  private static calculateDiversificationScore(weights: number[], correlationMatrix: number[][]): number {
    let portfolioVariance = 0;

    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        portfolioVariance += weights[i] * weights[j] * correlationMatrix[i][j];
      }
    }

    const weightedAvgVolatility = weights.reduce((sum, w, i) =>
      sum + w * Math.sqrt(correlationMatrix[i][i]), 0
    );

    // Diversification benefit = 1 - (portfolio volatility / weighted average volatility)
    const portfolioVolatility = Math.sqrt(portfolioVariance);
    return weightedAvgVolatility === 0 ? 1 :
           Math.max(0, 1 - portfolioVolatility / weightedAvgVolatility);
  }

  private static calculateAverageCorrelation(correlationMatrix: number[][]): number {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < correlationMatrix.length; i++) {
      for (let j = i + 1; j < correlationMatrix[i].length; j++) {
        sum += correlationMatrix[i][j];
        count++;
      }
    }

    return count === 0 ? 0 : sum / count;
  }

  private static calculatePortfolioLiquidityRisk(
    positions: Array<{ value: number; returns: number[] }>
  ): number {
    // Simplified liquidity risk calculation based on return volatility and position size
    let totalRisk = 0;

    positions.forEach(pos => {
      const volatility = this.calculateStandardDeviation(pos.returns);
      const sizeRisk = Math.log(pos.value + 1) / Math.log(1000000); // Normalize by $1M
      totalRisk += volatility * sizeRisk;
    });

    return totalRisk / positions.length;
  }

  /**
   * Detect market regime based on volatility and trends
   */
  static detectMarketRegime(
    prices: number[],
    volatilityWindow: number = 30,
    trendWindow: number = 90
  ): MarketRegime {
    if (prices.length < Math.max(volatilityWindow, trendWindow)) {
      return {
        regime: 'sideways',
        confidence: 0.5,
        duration: 'unknown',
        characteristics: {
          volatility: 0.2,
          trend_strength: 0,
          correlation_level: 0.5,
          liquidity_conditions: 'normal'
        },
        riskImplications: {
          preferred_strategies: [],
          risk_factors: [],
          hedging_recommendations: []
        }
      };
    }

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }

    const recentVolatility = this.calculateStandardDeviation(
      returns.slice(-volatilityWindow)
    );
    const trendReturns = returns.slice(-trendWindow);
    const trendStrength = Math.abs(trendReturns.reduce((sum, r) => sum + r, 0) / trendReturns.length);

    // Determine regime
    let regime: MarketRegime['regime'];
    let confidence: number;

    if (recentVolatility > 0.03) {
      regime = 'high_volatility';
      confidence = Math.min(0.9, recentVolatility / 0.05);
    } else if (trendStrength > 0.001) {
      regime = prices[prices.length - 1] > prices[prices.length - trendWindow] ? 'bull' : 'bear';
      confidence = Math.min(0.9, trendStrength / 0.005);
    } else {
      regime = 'sideways';
      confidence = Math.max(0.3, 1 - trendStrength / 0.002);
    }

    return {
      regime,
      confidence,
      duration: `${trendWindow} days`,
      characteristics: {
        volatility: recentVolatility,
        trend_strength: trendStrength,
        correlation_level: 0.5, // Placeholder - would need multiple assets
        liquidity_conditions: recentVolatility > 0.025 ? 'tight' : 'normal'
      },
      riskImplications: this.getRegimeRiskImplications(regime)
    };
  }

  private static getRegimeRiskImplications(regime: MarketRegime['regime']) {
    const implications = {
      bull: {
        preferred_strategies: ['growth', 'momentum', 'moderate_risk'],
        risk_factors: ['overvaluation', 'sudden_reversal', 'interest_rate_changes'],
        hedging_recommendations: ['partial_profits', 'stop_losses', 'diversification']
      },
      bear: {
        preferred_strategies: ['defensive', 'quality', 'income_focused'],
        risk_factors: ['further_declines', 'liquidity_drying', 'forced_selling'],
        hedging_recommendations: ['cash_position', 'hedging_instruments', 'defensive_assets']
      },
      sideways: {
        preferred_strategies: ['range_trading', 'income', 'value_investing'],
        risk_factors: ['breakout_risk', 'range_expansion', 'time_decay'],
        hedging_recommendations: ['options_strategies', 'diversification', 'patient_capital']
      },
      high_volatility: {
        preferred_strategies: ['volatility_trading', 'risk_arbitrage', 'defensive_posturing'],
        risk_factors: ['whipsaw', 'gap_risk', 'liquidity_shocks'],
        hedging_recommendations: ['volatility_hedges', 'reduced_position_sizing', 'quick_exit_strategies']
      },
      low_volatility: {
        preferred_strategies: ['carry_trades', 'leverage', 'yield_enhancement'],
        risk_factors: ['volatility_spike', 'liquidity_traps', 'complacency'],
        hedging_recommendations: ['volatility_protection', 'tail_risk_hedges', 'diversified_income']
      }
    };

    return implications[regime] || implications.sideways;
  }
}