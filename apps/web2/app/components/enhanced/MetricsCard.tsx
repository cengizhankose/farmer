'use client';

import React from 'react';
import { MetricsCardProps } from '../../types/enhanced-data';

export function MetricsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  format = 'number',
  precision = 2,
  trend
}: MetricsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        if (val >= 1e6) return `$${(val / 1e6).toFixed(precision)}M`;
        if (val >= 1e3) return `$${(val / 1e3).toFixed(precision)}K`;
        return `$${val.toFixed(precision)}`;

      case 'percentage':
        return `${(val * 100).toFixed(precision)}%`;

      case 'custom':
        return val.toString();

      default:
        return val.toLocaleString(undefined, { maximumFractionDigits: precision });
    }
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return '#10b981';
    if (changeType === 'negative') return '#ef4444';
    return '#6b7280';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↑';
    if (changeType === 'negative') return '↓';
    return '→';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡';
  };

  const getChangeColorClass = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '0.75rem'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            {title}
          </h3>
          {description && (
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.75rem',
              color: '#9ca3af'
            }}>
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div style={{
            fontSize: '1.25rem',
            color: '#6b7280'
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div style={{
        marginBottom: '0.5rem'
      }}>
        <span style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          {formatValue(value)}
        </span>
      </div>

      {/* Change and Trend */}
      {(change !== undefined || trend) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {change !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '2px 6px',
              backgroundColor: changeType === 'positive' ? '#ecfdf5' : changeType === 'negative' ? '#fef2f2' : '#f9fafb',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: getChangeColor()
            }}>
              <span>{getChangeIcon()}</span>
              <span>{format === 'percentage' ? formatValue(change) : change.toFixed(precision)}</span>
            </div>
          )}

          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <span>{getTrendIcon()}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized metric cards for specific data types
export function TVLMetricsCard({ tvl, change24h, trend }: {
  tvl: number;
  change24h?: number;
  trend?: 'up' | 'down' | 'stable';
}) {
  return (
    <MetricsCard
      title="Total Value Locked"
      value={tvl}
      change={change24h}
      changeType={change24h && change24h > 0 ? 'positive' : change24h && change24h < 0 ? 'negative' : 'neutral'}
      format="currency"
      trend={trend}
      icon="💰"
      description="Total funds deposited in the pool"
    />
  );
}

export function APRMetricsCard({ apr, change24h, volatility }: {
  apr: number;
  change24h?: number;
  volatility?: number;
}) {
  return (
    <MetricsCard
      title="Annual Percentage Rate"
      value={apr}
      change={change24h}
      changeType={change24h && change24h > 0 ? 'positive' : change24h && change24h < 0 ? 'negative' : 'neutral'}
      format="percentage"
      icon="📊"
      description={volatility ? `30-day volatility: ${(volatility * 100).toFixed(1)}%` : undefined}
    />
  );
}

export function VolumeMetricsCard({ volume, change24h, participants }: {
  volume: number;
  change24h?: number;
  participants?: number;
}) {
  return (
    <MetricsCard
      title="24h Trading Volume"
      value={volume}
      change={change24h}
      changeType={change24h && change24h > 0 ? 'positive' : change24h && change24h < 0 ? 'negative' : 'neutral'}
      format="currency"
      icon="💱"
      description={participants ? `${participants} participants` : undefined}
    />
  );
}

export function ParticipantMetricsCard({ participants, growth, newUsers }: {
  participants: number;
  growth?: number;
  newUsers?: number;
}) {
  return (
    <MetricsCard
      title="Unique Participants"
      value={participants}
      change={growth}
      changeType={growth && growth > 0 ? 'positive' : growth && growth < 0 ? 'negative' : 'neutral'}
      icon="👥"
      description={newUsers ? `${newUsers} new users (24h)` : undefined}
    />
  );
}

export function RiskMetricsCard({ riskScore, confidence }: {
  riskScore: number;
  confidence: 'high' | 'medium' | 'low';
}) {
  const getRiskColor = (score: number) => {
    if (score <= 30) return '#10b981';
    if (score <= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    return 'High';
  };

  return (
    <MetricsCard
      title="Risk Score"
      value={riskScore}
      icon="⚠️"
      description={`Confidence: ${confidence} - ${getRiskLabel(riskScore)} Risk`}
    />
  );
}

export function ConcentrationMetricsCard({ giniCoefficient, top10Holders }: {
  giniCoefficient: number;
  top10Holders: number;
}) {
  return (
    <MetricsCard
      title="Concentration Risk"
      value={giniCoefficient}
      format="custom"
      icon="🎯"
      description={`Top 10 holders: ${top10Holders.toFixed(1)}%`}
    />
  );
}