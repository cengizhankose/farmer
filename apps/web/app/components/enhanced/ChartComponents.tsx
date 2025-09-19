'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartComponentProps, Timeframe } from '../../types/enhanced-data';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

function CustomTooltip({ active, payload, label, formatter, labelFormatter }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          {labelFormatter ? labelFormatter(label || '') : label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: entry.color
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              minWidth: '80px'
            }}>
              {entry.name}:
            </span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function TVLChart({ data, timeframe, title = "TVL Over Time", height = 300 }: ChartComponentProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (label: string) => {
    const date = new Date(label);
    switch (timeframe) {
      case '7D':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '30D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  // Transform data for chart
  const chartData = data.timestamps.map((timestamp, index) => ({
    timestamp: formatDate(timestamp),
    tvl: data.tvlUsd[index] || 0,
    date: timestamp
  }));

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            content={<CustomTooltip formatter={formatTooltip} labelFormatter={formatDate} />}
          />
          <Area
            type="monotone"
            dataKey="tvl"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function APRChart({ data, timeframe, title = "APR Over Time", height = 300 }: ChartComponentProps) {
  const formatYAxis = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTooltip = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDate = (label: string) => {
    const date = new Date(label);
    switch (timeframe) {
      case '7D':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '30D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  // Transform data for chart
  const chartData = data.timestamps.map((timestamp, index) => ({
    timestamp: formatDate(timestamp),
    apr: data.apy[index] || 0,
    baseApr: data.apyBase ? data.apyBase[index] || 0 : undefined,
    rewardApr: data.apyReward ? data.apyReward[index] || 0 : undefined,
    date: timestamp
  }));

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            content={<CustomTooltip formatter={formatTooltip} labelFormatter={formatDate} />}
          />
          {chartData[0]?.baseApr !== undefined && (
            <Line
              type="monotone"
              dataKey="baseApr"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Base APR"
            />
          )}
          {chartData[0]?.rewardApr !== undefined && (
            <Line
              type="monotone"
              dataKey="rewardApr"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Reward APR"
            />
          )}
          <Line
            type="monotone"
            dataKey="apr"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={false}
            name="Total APR"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VolumeChart({ data, timeframe, title = "Volume Over Time", height = 300 }: ChartComponentProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (label: string) => {
    const date = new Date(label);
    switch (timeframe) {
      case '7D':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '30D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  // Transform data for chart
  const chartData = data.timestamps.map((timestamp, index) => ({
    timestamp: formatDate(timestamp),
    volume: data.volumeUsd ? data.volumeUsd[index] || 0 : 0,
    date: timestamp
  }));

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            content={<CustomTooltip formatter={formatTooltip} labelFormatter={formatDate} />}
          />
          <Bar
            dataKey="volume"
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ParticipantsChart({ data, timeframe, title = "Participants Over Time", height = 300 }: ChartComponentProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatTooltip = (value: number) => {
    return value.toLocaleString();
  };

  const formatDate = (label: string) => {
    const date = new Date(label);
    switch (timeframe) {
      case '7D':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '30D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  // Transform data for chart
  const chartData = data.timestamps.map((timestamp, index) => ({
    timestamp: formatDate(timestamp),
    participants: data.participants ? data.participants[index] || 0 : 0,
    date: timestamp
  }));

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            content={<CustomTooltip formatter={formatTooltip} labelFormatter={formatDate} />}
          />
          <Line
            type="monotone"
            dataKey="participants"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CombinedChart({
  data,
  timeframe,
  title = "Combined Metrics",
  height = 400
}: ChartComponentProps & { metrics?: ('tvl' | 'apr' | 'volume')[] }) {
  const formatYAxis = {
    tvl: (value: number) => {
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
      return `$${value}`;
    },
    apr: (value: number) => `${(value * 100).toFixed(1)}%`,
    volume: (value: number) => {
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
      return `$${value}`;
    }
  };

  const formatDate = (label: string) => {
    const date = new Date(label);
    switch (timeframe) {
      case '7D':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '30D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90D':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  // Transform data for combined chart
  const chartData = data.timestamps.map((timestamp, index) => ({
    timestamp: formatDate(timestamp),
    tvl: data.tvlUsd[index] || 0,
    apr: data.apy[index] || 0,
    volume: data.volumeUsd ? data.volumeUsd[index] || 0 : undefined,
    date: timestamp
  }));

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            yAxisId="left"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={formatYAxis.tvl}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={formatYAxis.apr}
          />
          <Tooltip
            content={<CustomTooltip
              formatter={(value: number) => {
                return value.toLocaleString();
              }}
              labelFormatter={formatDate}
            />}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tvl"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="TVL"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="apr"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            name="APR"
          />
          {chartData[0]?.volume !== undefined && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="volume"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Volume"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}