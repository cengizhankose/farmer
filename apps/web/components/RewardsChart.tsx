"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "react-countup";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import clsx from "clsx";

// ---- demo data generator (replace with real) ----
type Point = { date: string; ALEX: number; DIKO: number; OTHER?: number };

// Seeded random number generator for consistent data generation
function createSeededRandom(seed: number) {
  let state = seed;
  return function() {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

function genData(days = 30, seed?: number): Point[] {
  const out: Point[] = [];
  let a = 40, d = 18, o = 8;

  // Use consistent seed for reproducible data
  const consistentSeed = seed || Math.floor(Date.now() / (24 * 3600 * 1000));
  const random = createSeededRandom(consistentSeed);

  // Use consistent base date to avoid hydration mismatch
  const baseDate = new Date(Math.floor(Date.now() / (24 * 3600 * 1000)) * (24 * 3600 * 1000));

  for (let i = days - 1; i >= 0; i--) {
    // küçük dalgalanmalar (demo) - use seeded random
    a = Math.max(0, a + (random() - 0.45) * 6);
    d = Math.max(0, d + (random() - 0.5) * 3);
    o = Math.max(0, o + (random() - 0.55) * 4);
    const dt = new Date(baseDate.getTime() - i * 24 * 3600 * 1000);
    out.push({
      date: dt.toISOString().slice(0, 10),
      ALEX: parseFloat(a.toFixed(2)),
      DIKO: parseFloat(d.toFixed(2)),
      OTHER: parseFloat(o.toFixed(2)),
    });
  }
  return out;
}

// ---- utils ----
function sumRow(p: Point) {
  return (p.ALEX ?? 0) + (p.DIKO ?? 0) + (p.OTHER ?? 0);
}
function usd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

type RewardsChartProps = {
  dataWeekly?: Point[]; // 7–14 nokta
  dataMonthly?: Point[]; // 30–90 nokta
  tokens?: Array<"ALEX" | "DIKO" | "OTHER">;
  className?: string;
};

export default function RewardsChart({
  dataWeekly,
  dataMonthly,
  tokens = ["ALEX", "DIKO", "OTHER"],
  className,
}: RewardsChartProps) {
  const [range, setRange] = useState<"7D" | "30D">("30D");
  const reduceMotion = useReducedMotion();

  // demo fallback
  const weekly = dataWeekly ?? genData(7);
  const monthly = dataMonthly ?? genData(30);
  const data = range === "7D" ? weekly : monthly;

  const totalRewards = useMemo(
    () => data.reduce((acc, p) => acc + sumRow(p), 0),
    [data]
  );

  // skeleton simulate (remove when real fetch)
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(false);
  }, [range]);

  return (
    <motion.section
      initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        "rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-4 md:p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg md:text-xl text-neutral-900">
            Rewards Hub
          </h3>
          <p className="text-sm text-neutral-600">
            Token distribution and total accumulation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TimeBtn active={range === "7D"} onClick={() => setRange("7D")}>
            7D
          </TimeBtn>
          <TimeBtn active={range === "30D"} onClick={() => setRange("30D")}>
            30D
          </TimeBtn>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Total Rewards">
          <span className="tabular-nums">
            <CountUp end={totalRewards} duration={0.8} prefix="$" separator="," />
          </span>
        </Kpi>
        <Kpi label="Top Token">
          {topTokenLabel(data, tokens)}
        </Kpi>
        <Kpi label="Last Update" className="hidden md:block">
          {data.at(-1)?.date}
        </Kpi>
      </div>

      {/* Chart */}
      <div className="mt-4 h-[260px] md:h-[320px]">
        {loading ? (
          <div className="h-full animate-pulse rounded-2xl bg-white/60 ring-1 ring-black/5" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gALEX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C7BFF" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6C7BFF" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gDIKO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gOTHER" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(0,0,0,.55)", fontSize: 12 }}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => "$" + Intl.NumberFormat().format(v)}
                width={0}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(0,0,0,.55)", fontSize: 12 }}
              />

              <Tooltip
                content={<RewardsTooltip tokens={tokens} />}
                cursor={{ stroke: "rgba(0,0,0,.2)", strokeDasharray: 4 }}
              />

              <Legend
                verticalAlign="top"
                height={24}
                formatter={(v) => <span className="text-xs text-neutral-600">{v}</span>}
              />

              {/* stacked areas (animated) */}
              {tokens.includes("OTHER") && (
                <Area
                  type="monotone"
                  dataKey="OTHER"
                  stackId="1"
                  stroke="#F97316"
                  fill="url(#gOTHER)"
                  strokeWidth={2}
                  isAnimationActive={!reduceMotion}
                />
              )}
              {tokens.includes("DIKO") && (
                <Area
                  type="monotone"
                  dataKey="DIKO"
                  stackId="1"
                  stroke="#22C55E"
                  fill="url(#gDIKO)"
                  strokeWidth={2}
                  isAnimationActive={!reduceMotion}
                />
              )}
              {tokens.includes("ALEX") && (
                <Area
                  type="monotone"
                  dataKey="ALEX"
                  stackId="1"
                  stroke="#6C7BFF"
                  fill="url(#gALEX)"
                  strokeWidth={2}
                  isAnimationActive={!reduceMotion}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.section>
  );
}

// --- Subcomponents ---
function TimeBtn({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-3.5 py-1.5 text-sm ring-1 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400",
        active
          ? "bg-[var(--brand-orange)] text-white ring-[var(--brand-orange)]"
          : "bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-100"
      )}
      aria-pressed={!!active}
    >
      {children}
    </button>
  );
}

function Kpi({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-black/5",
        className
      )}
    >
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-0.5 font-sans text-base md:text-lg font-semibold text-neutral-900 tabular-nums">
        {children}
      </div>
    </div>
  );
}

function RewardsTooltip({
  active,
  payload,
  label,
  tokens = ["ALEX", "DIKO", "OTHER"],
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  tokens?: Array<"ALEX" | "DIKO" | "OTHER">;
}) {
  if (!active || !payload?.length) return null;
  const row = Object.fromEntries(payload.map((p) => [p.name, p.value]));
  const total =
    (row["ALEX"] ?? 0) + (row["DIKO"] ?? 0) + (row["OTHER"] ?? 0);

  const chips = [
    ["ALEX", "#6C7BFF"],
    ["DIKO", "#22C55E"],
    ["OTHER", "#F97316"],
  ] as const;

  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-black/5">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums">
        {usd(total)} <span className="text-neutral-500 font-normal">total</span>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {chips
          .filter(([t]) => tokens.includes(t as "ALEX" | "DIKO" | "OTHER"))
          .map(([t, c]) => (
            <div key={t} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: c }}
              />
              <span className="text-neutral-600">{t}</span>
              <span className="ml-auto font-semibold tabular-nums">
                {usd(row[t as keyof typeof row] ?? 0)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function topTokenLabel(data: Point[], tokens: string[]) {
  const totals: Record<string, number> = {};
  data.forEach((p) => {
    tokens.forEach((t) => (totals[t] = (totals[t] ?? 0) + (p[t as keyof Point] as number || 0)));
  });
  const best = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  if (!best) return "—";
  return `${best[0]} (${usd(best[1])})`;
}