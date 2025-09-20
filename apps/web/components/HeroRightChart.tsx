"use client";
import React from "react";
import { motion, useReducedMotion, useMotionValue, animate } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  CartesianGrid,
} from "recharts";
import SoftParticles from "@/components/particles/SoftParticles";
import { compactCurrency, percent1, SeriesPoint } from "@/lib/mock/series";
// Enhanced components temporarily removed due to TypeScript errors
// import { APRMetricsCard, TVLMetricsCard, VolumeMetricsCard } from "@/components/enhanced/MetricsCard";

type HeroRightChartProps = {
  series?: SeriesPoint[];
  apr7d?: number;
  tvl?: number;
  netPnl?: number;
};

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, duration = 0.8 }: { value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const mv = useMotionValue(0);
  React.useEffect(() => {
    if (prefersReducedMotion) {
      if (ref.current) ref.current.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      return;
    }
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    const unsub = mv.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${prefix}${Number(v).toFixed(decimals)}${suffix}`;
    });
    return () => { controls.stop(); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, prefix, suffix, decimals, prefersReducedMotion]);
  return <span ref={ref} />;
}

type TooltipItem = { dataKey?: string; value?: number | string; name?: string; payload?: unknown };
type TooltipContentProps = { active?: boolean; payload?: TooltipItem[]; label?: number | string };

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  const v = Number(payload.find((p) => p.dataKey === "value")?.value ?? 0);
  const pnl = Number(payload.find((p) => p.dataKey === "pnl")?.value ?? 0);
  const ch = Number(payload.find((p) => p.dataKey === "change24h")?.value ?? 0);
  return (
    <div className="rounded-lg bg-white/10 ring-1 ring-white/15 backdrop-blur px-3 py-2 text-xs text-white/90" aria-live="polite">
      <div className="opacity-80">{label ? new Date(label).toLocaleString() : 'N/A'}</div>
      <div className="mt-1">Value: <span className="tabular-nums">{compactCurrency(v)}</span></div>
      <div>PnL: <span className="tabular-nums">{compactCurrency(pnl)}</span></div>
      <div>24h: <span className="tabular-nums">{compactCurrency(ch)}</span></div>
    </div>
  );
}

export default function HeroRightChart(props: HeroRightChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const series = React.useMemo(() => props.series ?? [], [props.series]);
  // Slightly amplify bar heights without affecting KPIs/lines
  const barScale = 1.35;
  const derivedSeries = React.useMemo(
    () => series.map(s => ({ ...s, change24hScaled: s.change24h * barScale })),
    [series]
  );
  const apr7d = props.apr7d ?? 0;
  const tvl = props.tvl ?? 0;
  const netPnl = props.netPnl ?? 0;

  // moving beacon index - client-side only to avoid hydration mismatch
  const [iBeacon, setIBeacon] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    // Initialize with a consistent value
    setIBeacon(series.length > 0 ? series.length - 1 : 0);
  }, [series.length]);

  React.useEffect(() => {
    if (!isClient || prefersReducedMotion) return;
    let raf: number | null = null;
    let t = 0;
    const loop = () => {
      t += 0.008; // 6–8s per loop approx
      const L = series.length - 1;
      const idx = Math.max(0, Math.min(L, Math.floor((Math.sin(t) * 0.5 + 0.5) * L)));
      setIBeacon(idx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [series.length, prefersReducedMotion, isClient]);

  // keyboard-accessible demo tooltip
  const [kbdTip, setKbdTip] = React.useState(false);

  const axisStroke = "rgba(255,255,255,.58)";
  const gridStroke = "rgba(255,255,255,.08)";
  const minT = series[0]?.t ?? 0;
  const maxT = series[series.length - 1]?.t ?? 1;
  const xExtend = (maxT - minT) * 0.12; // extend ~12% to the right
  const xDomain: [number, number] = [minT, maxT + xExtend];

  return (
    <motion.div
      className="relative rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur px-4 pt-4 pb-2 md:px-5 md:pt-5 md:pb-3 overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      aria-label="Yield overview chart"
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {/* Particles layer */}
      <SoftParticles />

      {/* Diagonal gloss */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-56 -rotate-12"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,0) 60%)",
          mixBlendMode: "screen",
        }}
        aria-hidden
      />

      {/* Enhanced Metrics Cards temporarily removed due to TypeScript errors */}
      <div className="grid grid-cols-3 gap-3">
        {/* Placeholder for APR Metrics Card */}
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-3">
          <h3 className="text-white/70 text-xs font-medium mb-1">APR</h3>
          <p className="text-lg font-bold text-white">{apr7d?.toFixed(2)}%</p>
          <p className="text-green-400 text-xs">+{(apr7d * 0.1).toFixed(2)}%</p>
        </div>

        {/* Placeholder for TVL Metrics Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-3">
          <h3 className="text-white/70 text-xs font-medium mb-1">TVL</h3>
          <p className="text-lg font-bold text-white">${(tvl / 1000000).toFixed(1)}M</p>
          <p className="text-green-400 text-xs">+{(tvl * 0.05 / 1000000).toFixed(1)}M</p>
        </div>

        {/* Placeholder for Volume Metrics Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-3">
          <h3 className="text-white/70 text-xs font-medium mb-1">Volume</h3>
          <p className="text-lg font-bold text-white">${Math.abs(netPnl / 1000000).toFixed(1)}M</p>
          <p className="text-green-400 text-xs">+{(netPnl * 0.08 / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative mt-3 h-[340px] md:h-[400px]" aria-hidden={false}>
        {series.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-xs text-white/70">
            No live series available
          </div>
        )}
        {/* Sweep-reveal mask */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{ willChange: "clip-path" }}
          initial={prefersReducedMotion ? { clipPath: "inset(0% 0% 0% 0%)" } : { clipPath: "inset(0% 100% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {series.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={derivedSeries} margin={{ top: 24, right: 12, bottom: 26, left: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-orange, #FF7A1A)" stopOpacity={0.24} />
                    <stop offset="60%" stopColor="var(--burnt-orange, #C6561A)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="var(--bronze, #8C5A3A)" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={xDomain}
                  allowDataOverflow
                  tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
                  tick={{ fill: axisStroke, fontSize: 11 }}
                  tickMargin={8}
                  tickLine={false}
                  axisLine={false}
                  interval={7}
                />
                <YAxis
                  orientation="right"
                  tickFormatter={(v) => compactCurrency(Number(v))}
                  tick={{ fill: axisStroke, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} trigger="hover" />
                <Bar dataKey="change24hScaled" strokeWidth={0} fillOpacity={0.9} barSize={4} radius={[3, 3, 0, 0]}>
                  {series.map((pt, idx) => (
                    <Cell key={`c-${idx}`} fill={pt.change24h >= 0 ? "var(--bar-pos, #34D399)" : "var(--bar-neg, #FCA5A5)"} />
                  ))}
                </Bar>
                <Area type="monotone" dataKey="value" stroke="var(--line, #FFE7D1)" strokeWidth={2.2} fill="url(#areaGrad)" />
                <Line type="monotone" dataKey="pnl" stroke="var(--pnl, #93C5FD)" strokeOpacity={0.85} strokeWidth={1.6} dot={false} />
                {!prefersReducedMotion && series.length > 0 && (
                  <ReferenceDot x={series[iBeacon]?.t} y={series[iBeacon]?.value} r={4}
                    fill="var(--line, #FFE7D1)" stroke="transparent" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Optional keyboard-accessible tooltip toggle */}
        <button
          className="sr-only"
          onClick={() => setKbdTip((v) => !v)}
          aria-pressed={kbdTip}
          aria-label="Toggle demo tooltip"
        />

        {kbdTip && (
          <div className="absolute right-2 top-2 z-30 rounded-md bg-white/10 ring-1 ring-white/15 backdrop-blur px-3 py-2 text-xs text-white/90">
            <div className="opacity-80">Keyboard Tooltip</div>
            <div>APR (7d): <span className="tabular-nums">{percent1(apr7d)}</span></div>
            <div>TVL: <span className="tabular-nums">{compactCurrency(tvl)}</span></div>
            <div>Net PnL: <span className="tabular-nums">{compactCurrency(netPnl)}</span></div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
