"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  ComposedChart,
  Area, 
  Line,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from "recharts";
import { ExternalLink, FileText, TrendingUp, TrendingDown, Activity, Users } from "lucide-react";
import type { Opportunity } from "@/lib/mock";
import { colors } from "@/lib/colors";

interface OpportunityOverviewCardProps {
  data: Opportunity;
}

// Demo data generator
function generateDemoSeries(days = 30) {
  const series = [];
  const now = Date.now();
  let baseApr = 12.3;
  let baseTvl = 1250000;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const aprVariation = (Math.random() - 0.5) * 2;
    const tvlVariation = (Math.random() - 0.45) * 100000;
    const volume = Math.random() * 50000 + 10000;
    
    baseApr = Math.max(8, Math.min(18, baseApr + aprVariation * 0.3));
    baseTvl = Math.max(800000, baseTvl + tvlVariation);
    
    series.push({
      date: date.toISOString().slice(0, 10),
      apr: Number(baseApr.toFixed(2)),
      tvl: Math.round(baseTvl / 1000000 * 100) / 100, // in millions
      volume: Math.round(volume),
      pnl: Math.random() > 0.5 ? Math.random() * 5000 : -Math.random() * 2000,
    });
  }
  
  return series;
}

export function OpportunityOverviewCard({ data }: OpportunityOverviewCardProps) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "1Y">("30D");
  const series = generateDemoSeries(timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : timeRange === "90D" ? 90 : 365);

  const latestMetrics = {
    apr: series[series.length - 1].apr,
    tvl: series[series.length - 1].tvl,
    volume24h: series[series.length - 1].volume,
    participants: Math.floor(Math.random() * 500 + 100),
  };

  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ value: number }>; 
    label?: string 
  }) => {
    if (!active || !payload) return null;
    
    return (
      <div className="rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-black/5">
        <div className="text-xs font-medium text-zinc-700 mb-1">{label}</div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.orange[600] }} />
            <span className="text-xs text-zinc-600">TVL:</span>
            <span className="text-xs font-medium">${payload[0]?.value}M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-600">APR:</span>
            <span className="text-xs font-medium">{payload[1]?.value}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-600">Volume:</span>
            <span className="text-xs font-medium">${(payload[2]?.value / 1000).toFixed(1)}K</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Current APR"
          value={`${latestMetrics.apr}%`}
          trend={2.3}
          icon={<TrendingUp size={14} />}
        />
        <MetricCard
          label="TVL"
          value={`$${latestMetrics.tvl}M`}
          trend={5.2}
          icon={<Activity size={14} />}
        />
        <MetricCard
          label="24h Volume"
          value={`$${(latestMetrics.volume24h / 1000).toFixed(1)}K`}
          trend={-1.8}
          icon={<Activity size={14} />}
        />
        <MetricCard
          label="Participants"
          value={latestMetrics.participants.toString()}
          trend={12}
          icon={<Users size={14} />}
        />
      </div>

      {/* Main Chart Card */}
      <div className="rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-5 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-lg md:text-xl text-zinc-900">
              Performance Overview
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              APR → APY assumes continuous compounding · Reward: {data.rewardToken}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="inline-flex rounded-lg bg-white p-0.5 ring-1 ring-black/5">
              {(["7D", "30D", "90D", "1Y"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    timeRange === range
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            
            {/* Quick Links */}
            <a
              href={data.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs bg-white ring-1 ring-black/5 hover:bg-zinc-50 transition-colors"
            >
              <FileText size={12} />
              Docs
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientTvl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.orange[600]} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={colors.orange[600]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                stroke="rgba(0,0,0,.06)" 
                strokeDasharray="0" 
                vertical={false} 
              />
              
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "rgba(0,0,0,.55)" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              
              <YAxis 
                yAxisId="tvl"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "rgba(0,0,0,.55)" }}
                tickFormatter={(value) => `$${value}M`}
              />
              
              <YAxis 
                yAxisId="apr"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "rgba(0,0,0,.55)" }}
                tickFormatter={(value) => `${value}%`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                yAxisId="tvl"
                type="monotone"
                dataKey="tvl"
                name="TVL"
                stroke={colors.orange[600]}
                strokeWidth={2}
                fill="url(#gradientTvl)"
              />
              
              <Line
                yAxisId="apr"
                type="monotone"
                dataKey="apr"
                name="APR"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={false}
              />
              
              <Bar
                yAxisId="tvl"
                dataKey="volume"
                name="24h Volume"
                fill="rgba(34, 197, 94, 0.3)"
                barSize={20}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5" style={{ backgroundColor: colors.orange[600] }} />
            <span className="text-zinc-600">TVL (Area)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-500" />
            <span className="text-zinc-600">APR (Line)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-500/30" />
            <span className="text-zinc-600">24h Volume (Bar)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ 
  label, 
  value, 
  trend, 
  icon 
}: { 
  label: string; 
  value: string; 
  trend: number;
  icon: React.ReactNode;
}) {
  const isPositive = trend > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-black/5 bg-white p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        <div className="text-zinc-400">{icon}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold text-zinc-900 tabular-nums">
          {value}
        </span>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${
          isPositive ? "text-emerald-600" : "text-rose-600"
        }`}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(trend)}%
        </span>
      </div>
    </motion.div>
  );
}