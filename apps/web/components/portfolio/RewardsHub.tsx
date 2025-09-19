"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from "recharts";
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

// Mock function - replace with actual data fetching logic
function getOpportunityById(id: string): Opportunity | undefined {
  // This is a placeholder - replace with actual implementation
  return {
    id,
    protocol: "Unknown",
    pair: "Unknown",
    chain: "stacks",
    apr: 0,
    apy: 0,
    risk: "Medium",
    tvlUsd: 0,
    rewardToken: "STX",
    lastUpdated: "Now",
    originalUrl: "",
    summary: ""
  };
}
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/primitives";

export const RewardsHub: React.FC<{ rows: RedirectEntry[] }>
  = ({ rows }) => {
    const data = React.useMemo(() => {
      const map = new Map<string, number>();
      for (const r of rows) {
        const opp = getOpportunityById(r.id);
        if (!opp) continue;
        const est = r.amount * (r.apr / 100) * (r.days / 365);
        map.set(opp.rewardToken, (map.get(opp.rewardToken) || 0) + est);
      }
      return Array.from(map.entries()).map(([token, value]) => ({ token, value: Number(value.toFixed(2)) }));
    }, [rows]);

    if (!data.length) return null;

    return (
      <div className="mt-8 rounded-xl border bg-white/80 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-900">Rewards Hub</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>
                  <Button disabled className="shadow-[0_0_12px_rgba(5,150,105,0.3)]">Claim</Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming Soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
              <XAxis dataKey="token" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <RTooltip />
              <Bar dataKey="value" fill="#059669" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

