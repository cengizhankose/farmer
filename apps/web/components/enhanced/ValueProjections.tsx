"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { ValueProjection } from "@/types/enhanced-data";

interface ValueProjectionsProps {
  projections: ValueProjection[];
  currentTvl: number;
  timeframe?: string;
  showScenarios?: boolean;
  showChart?: boolean;
}

const ValueProjections: React.FC<ValueProjectionsProps> = ({
  projections,
  currentTvl,
  timeframe = "30D",
  showScenarios = true,
  showChart = true
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScenarioColor = (scenario: string): string => {
    switch (scenario) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getScenarioBg = (scenario: string): string => {
    switch (scenario) {
      case 'bullish':
        return 'bg-green-400/10 border-green-400/20';
      case 'bearish':
        return 'bg-red-400/10 border-red-400/20';
      default:
        return 'bg-yellow-400/10 border-yellow-400/20';
    }
  };

  // Find the projection for the selected timeframe
  const selectedProjection = projections.find(p => p.timeframe === timeframe) || projections[0];

  if (!selectedProjection) {
    return (
      <div className="bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">Value Projections</h3>
        </div>
        <p className="text-white/50 text-sm">No projection data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">Value Projections</h3>
        </div>
        <div className="text-sm text-white/50">
          Based on {selectedProjection.simulationCount.toLocaleString()} simulations
        </div>
      </div>

      {/* Expected Value */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">Expected Value ({timeframe})</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tabular-nums">
              {formatCurrency(selectedProjection.expectedValue)}
            </span>
            <div className="text-xs text-white/50">
              ({formatPercentage(((selectedProjection.expectedValue - currentTvl) / currentTvl) * 100)})
            </div>
          </div>
        </div>
        <div className="text-xs text-white/50">
          Confidence Interval: {formatCurrency(selectedProjection.confidenceInterval[0])} - {formatCurrency(selectedProjection.confidenceInterval[1])}
        </div>
      </div>

      {/* Scenarios */}
      {showScenarios && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(selectedProjection.scenarios).map(([scenario, data]) => (
            <motion.div
              key={scenario}
              className={`p-4 rounded-lg border ${getScenarioBg(scenario)}`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium capitalize ${getScenarioColor(scenario)}`}>
                  {scenario}
                </span>
                <span className={`text-xs ${getScenarioColor(scenario)}`}>
                  {formatPercentage(data.probability * 100)}
                </span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {formatCurrency(data.projectedValue)}
              </div>
              <div className="text-xs text-white/60">
                Range: {formatCurrency(data.range[0])} - {formatCurrency(data.range[1])}
              </div>
              <div className="text-xs text-white/50 mt-1">
                Confidence: {formatPercentage(data.confidence * 100)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Volatility */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Volatility</span>
          <span className="text-white font-medium">
            {formatPercentage(selectedProjection.volatility * 100)}
          </span>
        </div>
      </div>

      {/* Chart Placeholder */}
      {showChart && (
        <div className="mt-6 h-40 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-white/30 mx-auto mb-2" />
            <p className="text-white/50 text-sm">Projection Chart</p>
            <p className="text-white/30 text-xs">Chart visualization would be rendered here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValueProjections;