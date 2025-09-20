/**
 * Basic risk calculator utilities
 */
export class RiskCalculator {
    /**
     * Calculate basic risk score from multiple factors
     */
    static calculateRiskScore(factors) {
        const weights = {
            liquidity: 0.3,
            stability: 0.25,
            yield: 0.2,
            concentration: 0.15,
            momentum: 0.1
        };
        return (factors.liquidity * weights.liquidity +
            factors.stability * weights.stability +
            factors.yield * weights.yield +
            factors.concentration * weights.concentration +
            factors.momentum * weights.momentum);
    }
    /**
     * Get risk level from score
     */
    static getRiskLevel(score) {
        if (score <= 30)
            return 'low';
        if (score <= 60)
            return 'medium';
        return 'high';
    }
    /**
     * Calculate volatility from historical data
     */
    static calculateVolatility(prices) {
        if (prices.length < 2)
            return 0;
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
        const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
        return Math.sqrt(variance);
    }
    /**
     * Calculate Sharpe ratio
     */
    static calculateSharpeRatio(returns, riskFreeRate = 0) {
        if (returns.length === 0)
            return 0;
        const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const volatility = this.calculateVolatility(returns);
        if (volatility === 0)
            return 0;
        return (meanReturn - riskFreeRate) / volatility;
    }
    /**
     * Calculate maximum drawdown
     */
    static calculateMaxDrawdown(prices) {
        if (prices.length === 0)
            return 0;
        let maxPrice = prices[0];
        let maxDrawdown = 0;
        for (const price of prices) {
            if (price > maxPrice) {
                maxPrice = price;
            }
            const drawdown = (maxPrice - price) / maxPrice;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        return maxDrawdown;
    }
}
