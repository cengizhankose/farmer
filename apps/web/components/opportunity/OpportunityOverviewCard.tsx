"use client";
import React, { useEffect, useMemo, useState } from "react";
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
type Opportunity = {
  id: string;
  protocol: string;
  pair: string;
  chain: string;
  apr: number;
  apy: number;
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string;
  originalUrl: string;
  summary: string;
};
import { colors } from "@/lib/colors";

interface OpportunityOverviewCardProps {
  data: Opportunity;
}

// (Removed demo data generator)

type ChartPoint = { date: string; apr: number; tvl: number; volume: number };

export function OpportunityOverviewCard({ data }: OpportunityOverviewCardProps) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");
  const [series, setSeries] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const days = useMemo(() => (timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 90), [timeRange]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const resp = await fetch(`/api/opportunities/${data.id}/chart?days=${days}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const pts: Array<{ timestamp: number; tvlUsd: number; apy?: number; apr?: number; volume24h?: number }> = json.series || [];
        const mapped: ChartPoint[] = pts.map((p) => ({
          date: new Date(p.timestamp).toISOString().slice(0, 10),
          apr: Number((p.apy ?? p.apr ?? 0).toFixed(2)),
          tvl: Math.round((p.tvlUsd / 1_000_000) * 100) / 100,
          volume: Math.round(p.volume24h || 0),
        }));
        if (!mounted) return;
        setSeries(mapped);
      } catch (e) {
        console.error('Chart load failed', e);
        setErr((e as Error).message);
        setSeries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [data.id, days]);

  const latestMetrics = series.length
    ? {
        apr: series[series.length - 1].apr,
        tvl: series[series.length - 1].tvl,
        volume24h: series[series.length - 1].volume,
        participants: undefined as number | undefined,
      }
    : { apr: data.apr, tvl: Math.round((data.tvlUsd / 1_000_000) * 100) / 100, volume24h: undefined, participants: undefined };

  // Percent trends from last vs previous point
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const pct = (curr: number, base?: number) => (typeof base !== 'number' || base === 0 ? undefined : Math.round(((curr - base) / Math.abs(base)) * 100));
  const aprTrend = last && prev ? pct(last.apr, prev.apr) : undefined;
  const tvlTrend = last && prev ? pct(last.tvl, prev.tvl) : undefined;
  const volTrend = last && prev ? pct(last.volume, prev.volume) : undefined;

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
          value={`${latestMetrics.apr.toFixed(1)}%`}
          trend={aprTrend}
          icon={<TrendingUp size={14} />}
        />
        <MetricCard
          label="TVL"
          value={(() => {
            const tvlM = latestMetrics.tvl;
            if (tvlM >= 1) return `$${tvlM.toFixed(2)}M`;
            if (tvlM >= 0.001) return `$${(tvlM * 1000).toFixed(2)}K`;
            return `$${Math.round(tvlM * 1_000_000).toLocaleString()}`;
          })()}
          trend={tvlTrend}
          icon={<Activity size={14} />}
        />
        <MetricCard
          label="24h Volume"
          value={
            latestMetrics.volume24h && latestMetrics.volume24h > 0
              ? `$${(latestMetrics.volume24h / 1000).toFixed(1)}K`
              : '—'
          }
          trend={volTrend}
          icon={<Activity size={14} />}
        />
        <MetricCard
          label="Participants"
          value={latestMetrics.participants ? latestMetrics.participants.toString() : '—'}
          trend={undefined}
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
              {(["7D", "30D", "90D"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    timeRange === range
                      ? "bg-[var(--brand-orange)] text-white"
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
          {err && (
            <div className="text-xs text-rose-600 mb-2">Chart load failed: {err}</div>
          )}
          {loading && (
            <div className="text-xs text-zinc-500 mb-2">Loading chart…</div>
          )}
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

        {/* Value Projection (7d/30d/90d) derived from TVL series */}
        {series.length > 1 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {(() => {
              const values = series.map((s) => s.tvl);
              const n = values.length;
              const lastVal = values[n - 1];
              const xs = Array.from({ length: n }, (_, i) => i + 1);
              const xMean = xs.reduce((a, b) => a + b, 0) / n;
              const yMean = values.reduce((a, b) => a + b, 0) / n;
              const num = xs.reduce((s, x, i) => s + (x - xMean) * (values[i] - yMean), 0);
              const den = xs.reduce((s, x) => s + (x - xMean) * (x - xMean), 0) || 1;
              const slope = num / den; // per-day approx
              // variance (not used for range display currently)
              // const varY = values.reduce((s, v) => s + (v - yMean) * (v - yMean), 0) / n;
              const horizons = [7, 30, 90] as const;
              return horizons.map((h) => {
                const expected = lastVal + slope * h;
                return (
                  <MetricCard
                    key={`proj-${h}`}
                    label={`Value Projection (${h}d)`}
                    value={`$${expected.toFixed(2)}M`}
                    trend={undefined}
                    icon={<Activity size={14} />}
                  />
                );
              });
            })()}
          </div>
        )}
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
  trend?: number;
  icon: React.ReactNode;
}) {
  const isPositive = typeof trend === 'number' ? trend > 0 : false;
  
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
        {typeof trend === 'number' ? (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </span>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        )}
      </div>
    </motion.div>
  );
}
