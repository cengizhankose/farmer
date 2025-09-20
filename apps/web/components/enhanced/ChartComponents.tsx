"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { ChartData, Timeframe, ChartComponentProps } from "@/types/enhanced-data";

const ChartComponents: React.FC<ChartComponentProps> = ({
  data,
  timeframe,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  color = "#FF6A00",
  yAxisFormatter,
  tooltipFormatter
}) => {
  const formatValue = (value: number): string => {
    if (tooltipFormatter) {
      return tooltipFormatter(value);
    }

    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatAxisLabel = (value: number): string => {
    if (yAxisFormatter) {
      return yAxisFormatter(value);
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (timeframe === '24H') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '7D' || timeframe === '30D') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Calculate statistics
  const calculateStats = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 0, avg: 0, change: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const change = values.length > 1 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;

    return { min, max, avg, change };
  };

  const tvlStats = calculateStats(data.tvlUsd);
  const volumeStats = data.volume ? calculateStats(data.volume) : null;
  const apyStats = data.apy ? calculateStats(data.apy) : null;

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="text-sm text-white/50">
          {timeframe}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">Current</div>
          <div className="text-lg font-bold text-white tabular-nums">
            {formatValue(data.tvlUsd[data.tvlUsd.length - 1] || 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">Average</div>
          <div className="text-lg font-bold text-white tabular-nums">
            {formatValue(tvlStats.avg)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">Change</div>
          <div className="flex items-center justify-center gap-1">
            {getChangeIcon(tvlStats.change)}
            <span className={`text-sm font-medium ${getChangeColor(tvlStats.change)}`}>
              {tvlStats.change >= 0 ? '+' : ''}{tvlStats.change.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">Volatility</div>
          <div className="text-sm font-medium text-white">
            {((tvlStats.max - tvlStats.min) / tvlStats.avg * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="relative" style={{ height }}>
        <motion.div
          className="w-full h-full bg-white/5 rounded-lg border border-white/10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50 text-sm mb-1">Interactive Chart</p>
            <p className="text-white/30 text-xs">
              {data.timestamps.length} data points • {timeframe} timeframe
            </p>
            <div className="mt-3 text-xs text-white/40">
              <div>Min: {formatValue(tvlStats.min)}</div>
              <div>Max: {formatValue(tvlStats.max)}</div>
            </div>
          </div>
        </motion.div>

        {/* Grid Lines (Visual representation) */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-5 grid-rows-4 h-full gap-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border border-white/10"></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-white/70">TVL</span>
          </div>
          {data.volume && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-white/70">Volume</span>
            </div>
          )}
          {data.apy && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-white/70">APY</span>
            </div>
          )}
        </div>
      )}

      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {volumeStats && (
          <div className="text-center">
            <div className="text-white/50 mb-1">Volume 24h</div>
            <div className="text-white font-medium">
              {formatValue(volumeStats.avg)}
            </div>
          </div>
        )}
        {apyStats && (
          <div className="text-center">
            <div className="text-white/50 mb-1">Avg APY</div>
            <div className="text-white font-medium">
              {apyStats.avg.toFixed(2)}%
            </div>
          </div>
        )}
        <div className="text-center">
          <div className="text-white/50 mb-1">Data Points</div>
          <div className="text-white font-medium">
            {data.timestamps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

// Specialized chart components
export const TVLChart: React.FC<Omit<ChartComponentProps, 'title'>> = (props) => (
  <ChartComponents {...props} title="TVL Overview" color="#FF6A00" />
);

export const VolumeChart: React.FC<Omit<ChartComponentProps, 'title'>> = (props) => (
  <ChartComponents {...props} title="Volume Analysis" color="#3B82F6" />
);

export const APRChart: React.FC<Omit<ChartComponentProps, 'title'>> = (props) => (
  <ChartComponents {...props} title="APR Trends" color="#10B981" />
);

export const CombinedChart: React.FC<Omit<ChartComponentProps, 'title'>> = (props) => (
  <ChartComponents {...props} title="Combined Metrics" color="#8B5CF6" />
);

export default ChartComponents;