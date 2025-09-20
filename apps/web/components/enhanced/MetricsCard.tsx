"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  format?: 'currency' | 'percentage' | 'number' | 'custom';
  precision?: number;
  trend?: 'up' | 'down' | 'stable';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  format = 'number',
  precision = 2,
  trend
}) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: val > 1000000 ? 'compact' : 'standard'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(precision)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US', {
          notation: val > 1000000 ? 'compact' : 'standard',
          maximumFractionDigits: precision
        }).format(val);
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChangeColor = () => {
    if (!change && change !== 0) return 'text-gray-400';
    if (changeType === 'positive') return 'text-green-400';
    if (changeType === 'negative') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      className="bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-xl p-4 hover:bg-white/12 transition-colors"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/70 text-sm font-medium">{title}</h3>
        {icon && <div className="text-white/60">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-white tabular-nums">
          {formatValue(value)}
        </span>
        {trend && getTrendIcon()}
      </div>

      {(change !== undefined && change !== null) && (
        <div className={`text-xs font-medium ${getChangeColor()}`}>
          {change > 0 ? '+' : ''}{formatValue(change)}
        </div>
      )}

      {description && (
        <p className="text-white/50 text-xs mt-2">{description}</p>
      )}
    </motion.div>
  );
};

// Specialized metric cards
export const APRMetricsCard: React.FC<{
  apr: number;
  change24h?: number;
  volatility?: number;
}> = ({ apr, change24h, volatility }) => (
  <MetricsCard
    title="APR"
    value={apr}
    change={change24h}
    changeType={change24h && change24h > 0 ? 'positive' : 'negative'}
    format="percentage"
    precision={2}
    trend={change24h && change24h > 0 ? 'up' : change24h && change24h < 0 ? 'down' : 'stable'}
    description={volatility ? `Volatility: ${(volatility * 100).toFixed(1)}%` : undefined}
  />
);

export const TVLMetricsCard: React.FC<{
  tvl: number;
  change24h?: number;
  trend?: 'up' | 'down' | 'stable';
}> = ({ tvl, change24h, trend }) => (
  <MetricsCard
    title="TVL"
    value={tvl}
    change={change24h}
    changeType={change24h && change24h > 0 ? 'positive' : 'negative'}
    format="currency"
    trend={trend}
  />
);

export const VolumeMetricsCard: React.FC<{
  volume: number;
  change24h?: number;
  participants?: number;
}> = ({ volume, change24h, participants }) => (
  <MetricsCard
    title="Volume"
    value={volume}
    change={change24h}
    changeType={change24h && change24h > 0 ? 'positive' : 'negative'}
    format="currency"
    description={participants ? `${participants} participants` : undefined}
  />
);

export const ParticipantMetricsCard: React.FC<{
  participants: number;
  growth?: number;
  newUsers?: number;
}> = ({ participants, growth, newUsers }) => (
  <MetricsCard
    title="Participants"
    value={participants}
    change={growth}
    changeType={growth && growth > 0 ? 'positive' : 'negative'}
    format="number"
    description={newUsers ? `${newUsers} new users` : undefined}
  />
);

export default MetricsCard;