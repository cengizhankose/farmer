"use client";
import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
// Local type definitions
type RedirectEntry = {
  id: string;
  protocol: string;
  pair: string;
  apr: number;
  amount: number;
  days: number;
  ts: number;
  chain: string;
  txid?: string;
  action?: "Deposit" | "Withdraw";
};
import { colors } from "@/lib/colors";

function calc(rows: RedirectEntry[]) {
  const deposited = rows.reduce((a, r) => a + r.amount, 0);
  const est = rows.reduce((a, r) => a + r.amount * (r.apr / 100) * (r.days / 365), 0);
  const total = deposited + est;
  const pnl = total - deposited;
  const pct = deposited ? (pnl / deposited) * 100 : 0;
  return { deposited, total, pnl, pct };
}

export const HeaderMetrics: React.FC<{ rows: RedirectEntry[] }>
  = ({ rows }) => {
    const { total, pnl, pct } = React.useMemo(() => calc(rows), [rows]);
    const data = React.useMemo(() => {
      const base = Math.max(pnl, 0.01);
      return Array.from({ length: 7 }).map((_, i) => ({ x: i, y: Number((base + Math.sin(i) * base * 0.15).toFixed(2)) }));
    }, [pnl]);
    const positive = pnl >= 0;

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        <div className="rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-4 md:p-6" style={{ transform: 'scaleY(1.05)' }}>
          <div className={`text-xs text-[${colors.zinc[500]}]`}>Total Portfolio Value</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-900">
            <CountUp end={total} decimals={2} prefix="$" duration={1} />
          </div>
        </div>
        <div className="rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-4 md:p-6" style={{ transform: 'scaleY(1.05)' }}>
          <div className={`text-xs text-[${colors.zinc[500]}]`}>Net PnL</div>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            <span className={positive ? "text-emerald-600" : "text-rose-600"}>
              <CountUp end={pnl} decimals={2} prefix="$" duration={1} />
            </span>
            <span className={`text-sm ${positive ? "text-emerald-600" : "text-rose-600"}`}>
              (<CountUp end={pct} decimals={2} suffix="%" duration={1} />)
            </span>
            {positive ? <TrendingUp size={18} className="text-emerald-600" /> : <TrendingDown size={18} className="text-rose-600" />}
          </div>
        </div>
        <div className="rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-4 md:p-6" style={{ transform: 'scaleY(1.05)' }}>
          <div className={`text-xs text-[${colors.zinc[500]}]`}>24h Change</div>
          <div className="mt-1 h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g24" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="y" stroke="#2563eb" strokeWidth={2} fill="url(#g24)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  };

