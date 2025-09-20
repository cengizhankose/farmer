"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingUp, Activity, DollarSign, Users, Target } from "lucide-react";
// Temporary RiskScore type until @shared/core import is fixed
interface RiskScore {
  total: number;
  confidence: 'high' | 'medium' | 'low';
  components: {
    liquidity: number;
    stability: number;
    yield: number;
    concentration: number;
    momentum: number;
  };
  drivers?: string[];
}
import { EnhancedRiskBreakdownProps } from "@/types/enhanced-data";

const EnhancedRiskBreakdown: React.FC<EnhancedRiskBreakdownProps> = ({
  riskScore,
  enhancedData,
  showDetails = true,
  showFactors = true
}) => {
  const getRiskColor = (score: number): string => {
    if (score <= 33) return 'text-green-400';
    if (score <= 66) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBg = (score: number): string => {
    if (score <= 33) return 'bg-green-400/10 border-green-400/20';
    if (score <= 66) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  const getRiskLevel = (score: number): string => {
    if (score <= 33) return 'Low';
    if (score <= 66) return 'Medium';
    return 'High';
  };

  const getRiskIcon = (score: number, type: string) => {
    const iconProps = "h-5 w-5";
    switch (type) {
      case 'liquidity':
        return <DollarSign className={`${iconProps} ${getRiskColor(score)}`} />;
      case 'stability':
        return <Activity className={`${iconProps} ${getRiskColor(score)}`} />;
      case 'yield':
        return <TrendingUp className={`${iconProps} ${getRiskColor(score)}`} />;
      case 'concentration':
        return <Users className={`${iconProps} ${getRiskColor(score)}`} />;
      case 'momentum':
        return <Target className={`${iconProps} ${getRiskColor(score)}`} />;
      default:
        return <Shield className={`${iconProps} ${getRiskColor(score)}`} />;
    }
  };

  const riskComponents = [
    {
      type: 'liquidity',
      name: 'Liquidity Risk',
      score: enhancedData.liquidity.liquidityScore,
      description: 'Risk related to the ability to exit positions without significant price impact',
      factors: [
        `Liquidity Depth: ${enhancedData.liquidity.liquidityDepth.depth1h.toLocaleString()}`,
        `Turnover Ratio: ${(enhancedData.liquidity.turnoverRatio * 100).toFixed(1)}%`,
        `Volume/TVL: ${(enhancedData.liquidity.volumeTvlRatio * 100).toFixed(1)}%`
      ]
    },
    {
      type: 'stability',
      name: 'Stability Risk',
      score: enhancedData.stability.stabilityScore,
      description: 'Risk related to price volatility and drawdowns',
      factors: [
        `30D Volatility: ${(enhancedData.stability.tvlVolatility30d * 100).toFixed(1)}%`,
        `Max Drawdown: ${(enhancedData.stability.maxDrawdown30d * 100).toFixed(1)}%`,
        `Trend Consistency: ${(enhancedData.stability.trendConsistency * 100).toFixed(1)}%`
      ]
    },
    {
      type: 'yield',
      name: 'Yield Risk',
      score: enhancedData.yield.yieldScore,
      description: 'Risk related to yield sustainability and token incentives',
      factors: [
        `Yield Volatility: ${(enhancedData.yield.yieldVolatility30d * 100).toFixed(1)}%`,
        `Reward Dependency: ${(enhancedData.yield.rewardDependencyRatio * 100).toFixed(1)}%`,
        `Incentive Quality: ${(enhancedData.yield.incentiveQuality * 100).toFixed(1)}%`
      ]
    },
    {
      type: 'concentration',
      name: 'Concentration Risk',
      score: enhancedData.concentration.concentrationScore,
      description: 'Risk related to asset and holder concentration',
      factors: [
        `Top 10 Holders: ${(enhancedData.concentration.top10HolderPercentage * 100).toFixed(1)}%`,
        `Gini Coefficient: ${enhancedData.concentration.giniCoefficient.toFixed(3)}`,
        `Herfindahl Index: ${enhancedData.concentration.herfindahlIndex.toFixed(3)}`
      ]
    },
    {
      type: 'momentum',
      name: 'Momentum Risk',
      score: enhancedData.momentum.momentumScore,
      description: 'Risk related to growth sustainability and trend reversals',
      factors: [
        `TVL Growth (7D): ${(enhancedData.momentum.tvlGrowth7d * 100).toFixed(1)}%`,
        `Volume Growth (7D): ${(enhancedData.momentum.volumeGrowth7d * 100).toFixed(1)}%`,
        `Growth Sustainability: ${(enhancedData.momentum.growthSustainability * 100).toFixed(1)}%`
      ]
    }
  ];

  return (
    <div className="bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-white/60" />
        <div>
          <h3 className="text-lg font-semibold text-white">Enhanced Risk Analysis</h3>
          <p className="text-sm text-white/60">Multi-dimensional risk assessment</p>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">Overall Risk Score</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getRiskColor(riskScore.total)}`}>
              {Math.round(riskScore.total)}/100
            </span>
            {getRiskIcon(riskScore.total, 'overall')}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${getRiskColor(riskScore.total)}`}>
            {getRiskLevel(riskScore.total)} Risk
          </span>
          <span className="text-white/50">
            Confidence: {riskScore.confidence.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Risk Components */}
      <div className="space-y-4">
        {riskComponents.map((component) => (
          <motion.div
            key={component.type}
            className={`p-4 rounded-lg border ${getRiskBg(component.score)}`}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getRiskIcon(component.score, component.type)}
                <span className="text-white font-medium">{component.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getRiskColor(component.score)}`}>
                  {Math.round(component.score)}
                </span>
                <span className="text-xs text-white/60">/100</span>
              </div>
            </div>

            <p className="text-sm text-white/70 mb-3">{component.description}</p>

            {showFactors && (
              <div className="space-y-1">
                {component.factors.map((factor, index) => (
                  <div key={index} className="text-xs text-white/50 flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                    {factor}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Risk Drivers */}
      {showDetails && riskScore.drivers && riskScore.drivers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-white mb-3">Key Risk Drivers</h4>
          <div className="space-y-2">
            {riskScore.drivers.slice(0, 5).map((driver, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRiskBreakdown;