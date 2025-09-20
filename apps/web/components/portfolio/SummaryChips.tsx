"use client";
import React from "react";
import { colors } from "@/lib/colors";
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

export const SummaryChips: React.FC<{ rows: RedirectEntry[] }>
  = ({ rows }) => {
    const total = rows.reduce((acc, r) => acc + r.amount, 0);
    const avgAPR = rows.length ? rows.reduce((a, r) => a + r.apr, 0) / rows.length : 0;
    const estTotal = rows.reduce((acc, r) => acc + r.amount * (r.apr / 100) * (r.days / 365), 0);
    const Chip = ({ label, value }: { label: string; value: string }) => (
      <div className={`rounded-md bg-[${colors.zinc[100]}] px-3 py-2 text-sm`} style={{ transform: 'scaleY(1.05)' }}>
        <div className={`text-[${colors.zinc[600]}]`}>{label}</div>
        <div className={`font-medium text-[${colors.zinc[900]}]`}>{value}</div>
      </div>
    );
    return (
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Chip label="Total Principal" value={formatUSD(total)} />
        <Chip label="Avg. APR" value={`${avgAPR.toFixed(1)}%`} />
        <Chip label="Estimated Total Return" value={formatUSD(estTotal)} />
      </div>
    );
  };

