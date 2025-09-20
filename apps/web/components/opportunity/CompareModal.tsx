"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { X, ArrowLeftRight, TrendingUp, Shield, DollarSign } from "lucide-react";
import type { CompareItem } from "./CompareBar";
import { colors } from "@/lib/colors";
import { protocolLogo } from "@/lib/logos";

interface CompareModalProps {
  itemA: CompareItem;
  itemB: CompareItem;
  onClose: () => void;
}

type CompareSeries = Array<{ date: string; apr: number; tvl: number }>;

export function CompareModal({ itemA, itemB, onClose }: CompareModalProps) {
  const [swapped, setSwapped] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [leftSeries, setLeftSeries] = useState<CompareSeries>([]);
  const [rightSeries, setRightSeries] = useState<CompareSeries>([]);

  const left = swapped ? itemB : itemA;
  const right = swapped ? itemA : itemB;

  React.useEffect(() => {
    let mounted = true;
    async function load(id: string): Promise<CompareSeries> {
      const resp = await fetch(`/api/opportunities/${id}/chart?days=30`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const pts: Array<{ timestamp: number; tvlUsd: number; apy?: number; apr?: number }> = json.series || [];
      return pts.map((p) => ({
        date: new Date(p.timestamp).toISOString().slice(5, 10),
        apr: Number((p.apy ?? p.apr ?? 0).toFixed(2)),
        tvl: Math.round((p.tvlUsd / 1_000_000) * 100) / 100,
      }));
    }
    (async () => {
      try {
        const [l, r] = await Promise.all([load(left.id), load(right.id)]);
        if (!mounted) return;
        setLeftSeries(l);
        setRightSeries(r);
      } catch (e) {
        if (!mounted) return;
        setLeftSeries([]);
        setRightSeries([]);
      }
    })();
    return () => { mounted = false; };
  }, [left.id, right.id]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="font-display text-xl text-zinc-900">
              Compare Opportunities
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSwapped(!swapped)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                <ArrowLeftRight size={14} />
                Swap
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-zinc-200 max-h-[calc(85vh-80px)] overflow-y-auto">
            <ComparePanel
              item={left}
              series={leftSeries}
              side="left"
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
            <ComparePanel
              item={right}
              series={rightSeries}
              side="right"
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ComparePanelProps {
  item: CompareItem;
  series: Array<{ date: string; apr: number; tvl: number }>;
  side: "left" | "right";
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

function ComparePanel({ item, series, side, hoveredIndex, setHoveredIndex }: ComparePanelProps) {
  const logo = protocolLogo(item.protocol);
  const chartColor = side === "left" ? colors.orange[600] : "#6C7BFF";

  const riskColors = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex flex-col p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <>
          {item.protocol.toLowerCase() === 'arkadiko' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="h-12 w-12 rounded-xl grid place-items-center text-lg font-bold shadow-sm overflow-hidden"
              src="/logos/arkadiko.svg"
              alt="Arkadiko logo"
              style={{ objectFit: 'contain', padding: '4px' }}
            />
          ) : item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="h-12 w-12 rounded-xl grid place-items-center text-lg font-bold shadow-sm overflow-hidden"
              src={item.logoUrl}
              alt={`${item.protocol} logo`}
              style={{ objectFit: 'contain', padding: '4px' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            logo.letter
          )}
        </>
        <div className="flex-1">
          <h3 className="font-display text-lg text-zinc-900">
            {item.protocol} — {item.pair}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${riskColors[item.risk]}`}>
              <Shield size={10} />
              {item.risk} Risk
            </span>
            <span className="text-xs text-zinc-500">
              {item.chain}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <MetricCard
          label="APR"
          value={`${item.apr.toFixed(1)}%`}
          icon={<TrendingUp size={12} />}
          highlight
        />
        <MetricCard
          label="APY"
          value={`${item.apy.toFixed(1)}%`}
          icon={<TrendingUp size={12} />}
        />
        <MetricCard
          label="TVL"
          value={`$${(item.tvlUsd / 1000000).toFixed(2)}M`}
          icon={<DollarSign size={12} />}
        />
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        {series.length === 0 ? (
          <div className="text-xs text-zinc-500">No comparison data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={series}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              onMouseMove={(e) => {
                const event = e as { activeTooltipIndex?: number };
                setHoveredIndex(event?.activeTooltipIndex ?? null);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id={`gradient-${side}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(0,0,0,.04)" strokeDasharray="0" vertical={false} />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "rgba(0,0,0,.5)" }}
              />

              <YAxis
                yAxisId="tvl"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "rgba(0,0,0,.5)" }}
                tickFormatter={(value) => `$${value}M`}
              />

              <YAxis
                yAxisId="apr"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "rgba(0,0,0,.5)" }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                content={({ active, payload }) =>
                  active && payload ? (
                    <div className="rounded-lg bg-white px-2.5 py-1.5 shadow-lg ring-1 ring-black/5">
                      <div className="text-[10px] font-medium text-zinc-600">
                        {payload[0]?.payload?.date}
                      </div>
                      <div className="space-y-0.5 mt-1">
                        <div className="text-xs">
                          <span className="text-zinc-500">TVL:</span>{" "}
                          <span className="font-medium">${payload[0]?.value}M</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-zinc-500">APR:</span>{" "}
                          <span className="font-medium">{payload[1]?.value}%</span>
                        </div>
                      </div>
                    </div>
                  ) : null
                }
              />

              {/* Shared cursor line */}
              {hoveredIndex !== null && (
                <line
                  x1={0}
                  x2={0}
                  y1={0}
                  y2="100%"
                  stroke={chartColor}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
              )}

              <Area
                yAxisId="tvl"
                type="monotone"
                dataKey="tvl"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${side})`}
              />

              <Line
                yAxisId="apr"
                type="monotone"
                dataKey="apr"
                stroke={side === "left" ? "#0EA5E9" : "#22C55E"}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 p-3 rounded-lg bg-zinc-50">
        <div className="text-xs text-zinc-600 mb-1">Key Highlights</div>
        <ul className="space-y-1">
          <li className="text-xs text-zinc-700 flex items-start gap-1">
            <span className="text-emerald-600">•</span>
            Reward Token: {item.rewardToken}
          </li>
          <li className="text-xs text-zinc-700 flex items-start gap-1">
            <span className="text-emerald-600">•</span>
            Last Updated: {item.lastUpdated}
          </li>
          <li className="text-xs text-zinc-700 flex items-start gap-1">
            <span className="text-emerald-600">•</span>
            {item.summary}
          </li>
        </ul>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  highlight = false
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl px-3 py-2 ${highlight ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] uppercase tracking-wide ${highlight ? "text-white/80" : "text-zinc-500"}`}>
          {label}
        </span>
        <span className={highlight ? "text-white/60" : "text-zinc-400"}>
          {icon}
        </span>
      </div>
      <div className="text-sm font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}
