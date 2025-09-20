"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer, ComposedChart, Area, Line, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import CountUp from "react-countup";
import clsx from "clsx";

type Row = { t: string; total: number; pnl: number; chg24h: number };

function demo(rows = 30): Row[] {
  const out: Row[] = [];
  let total = 100000, pnl = 0;
  // Use fixed base date to avoid hydration mismatch
  const baseDate = new Date(Math.floor(Date.now() / 86400000) * 86400000);
  for (let i = rows - 1; i >= 0; i--) {
    const dt = new Date(baseDate.getTime() - i * 86400000);
    const r = (Math.random() - 0.45) * 0.02; // ±2%
    const change = total * r;
    total = Math.max(2000, total + change);
    pnl += change * 0.4; // pnlin daha sönük artışı
    out.push({
      t: dt.toISOString().slice(0, 10),
      total: Math.round(total),
      pnl: Math.round(pnl),
      chg24h: Math.round(change),
    });
  }
  return out;
}

export default function PortfolioOverviewChart({
  data,
  className,
  period = "30D",
}: {
  data?: Row[];
  className?: string;
  period?: "24H" | "7D" | "30D";
}) {
  // Generate demo data based on period
  const periodDays = period === "24H" ? 1 : period === "7D" ? 7 : 30;
  const chartData = data || demo(periodDays);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState({
    total: true,
    pnl: true,
    chg24h: true,
  });

  const kpis = useMemo(() => {
    const last = chartData.at(-1)!;
    const first = chartData[0]!;
    const periodLabel = period === "24H" ? "24h" : period === "7D" ? "7D" : "30D";
    return {
      total: last.total,
      pnl: last.pnl,
      change24h: last.chg24h,
      changePct: ((last.total - first.total) / first.total) * 100,
      periodLabel,
    };
  }, [chartData, period]);

  return (
    <motion.section
      id="portfolio-overview"
      initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={clsx(
        "rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-4 md:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg md:text-xl text-neutral-900">Portfolio Overview</h3>
          <p className="text-sm text-neutral-600">Total Value, Net PnL ve 24h Change</p>
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            label="Total"
            color="#FF6A00"
            active={visible.total}
            onChange={(v) => setVisible((s) => ({ ...s, total: v }))}
          />
          <Toggle
            label="Net PnL"
            color="#6C7BFF"
            active={visible.pnl}
            onChange={(v) => setVisible((s) => ({ ...s, pnl: v }))}
          />
          <Toggle
            label="24h Change"
            color="#10B981"
            active={visible.chg24h}
            onChange={(v) => setVisible((s) => ({ ...s, chg24h: v }))}
          />
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <Kpi label="Total Portfolio">
          <CountUp end={kpis.total} duration={0.8} prefix="$" separator="," />
        </Kpi>
        <Kpi label="Net PnL">
          <span className={kpis.pnl >= 0 ? "text-emerald-600" : "text-rose-600"}>
            <CountUp end={kpis.pnl} duration={0.8} prefix={kpis.pnl>=0?"+$":"-$"} separator="," />
          </span>
        </Kpi>
        <Kpi label={`${kpis.periodLabel} %`}>
          <CountUp end={kpis.changePct} decimals={2} duration={0.8} suffix="%" />
        </Kpi>
      </div>

      <div className="mt-4 h-[300px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6A00" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#FF6A00" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "rgba(0,0,0,.55)", fontSize: 12 }} tickMargin={8} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => "$" + Intl.NumberFormat().format(v)} width={0} axisLine={false} tickLine={false} tick={{ fill: "rgba(0,0,0,.55)", fontSize: 12 }} />
            <Tooltip content={<Tip />} />
            <Legend
              verticalAlign="top"
              height={24}
              formatter={(val) => <span className="text-xs text-neutral-600">{val}</span>}
            />

            {/* 24h change bars */}
            {visible.chg24h && (
              <Bar dataKey="chg24h" name="24h Change" fill="#10B981" opacity={0.35} isAnimationActive={!reduceMotion} />
            )}
            {/* Total value area */}
            {visible.total && (
              <Area
                type="monotone"
                dataKey="total"
                name="Total Value"
                stroke="#FF6A00"
                fill="url(#gTotal)"
                strokeWidth={2}
                isAnimationActive={!reduceMotion}
              />
            )}
            {/* Net PnL line */}
            {visible.pnl && (
              <Line
                type="monotone"
                dataKey="pnl"
                name="Net PnL"
                stroke="#6C7BFF"
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={!reduceMotion}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

function Kpi({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-black/5">
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-0.5 font-sans text-base md:text-lg font-semibold text-neutral-900 tabular-nums">
        {children}
      </div>
    </div>
  );
}

function Toggle({
  label, color, active, onChange,
}: { label: string; color: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={clsx(
        "rounded-full px-3.5 py-1.5 text-sm ring-1 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400",
        active
          ? "text-white"
          : "bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-100"
      )}
      style={active ? { background: color, borderColor: color } : {}}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const row: Record<string, number> = {};
  payload.forEach((p) => (row[p.dataKey] = p.value));
  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-black/5">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 grid grid-cols-1 gap-1 text-sm">
        {"total" in row && <div><b>Total:</b> ${Intl.NumberFormat().format(row.total)}</div>}
        {"pnl" in row && <div><b>Net PnL:</b> ${Intl.NumberFormat().format(row.pnl)}</div>}
        {"chg24h" in row && <div><b>24h Change:</b> ${Intl.NumberFormat().format(row.chg24h)}</div>}
      </div>
    </div>
  );
}