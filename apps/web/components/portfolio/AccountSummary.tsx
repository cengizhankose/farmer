"use client";
import React from "react";
import { formatUSD } from "@/lib/format";
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

export const AccountSummary: React.FC<{ rows: RedirectEntry[] }> = ({ rows }) => {
  const total = rows.reduce((acc, r) => acc + r.amount, 0);
  const avgAPR = rows.length ? rows.reduce((a, r) => a + r.apr, 0) / rows.length : 0;
  const estTotal = rows.reduce((acc, r) => acc + r.amount * (r.apr / 100) * (r.days / 365), 0);

  return (
    <section className="mt-4 rounded-2xl bg-white/60 ring-1 ring-black/5 p-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
      <KPI label="Total Principal">{formatUSD(total)}</KPI>
      <KPI label="Weighted Avg. APR">{avgAPR.toFixed(1)}%</KPI>
      <KPI label="Estimated Total Return (30D)">{formatUSD(estTotal)}</KPI>
    </section>
  );
};

function KPI({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="tabular-nums font-semibold text-neutral-900">
        {children}
      </div>
    </div>
  );
}