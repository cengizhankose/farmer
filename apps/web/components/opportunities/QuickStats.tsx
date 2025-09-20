"use client";
import React from "react";
import { colors } from "@/lib/colors";
import { formatTVL } from "@/lib/format";

export const QuickStats: React.FC<{ count: number; avgAPR: number; sumTVL: number }>
  = ({ count, avgAPR, sumTVL }) => (
    <div className={`mt-4 grid grid-cols-1 gap-3 rounded-lg border border-[${colors.zinc[200]}] bg-[${colors.zinc[50]}] p-3 text-sm text-[${colors.zinc[700]}] md:grid-cols-3`}>
      <div><span className="font-medium text-zinc-900">{count}</span> results</div>
      <div>Avg. APR: <span className="font-medium text-zinc-900">{avgAPR.toFixed(1)}%</span></div>
      <div>Total TVL: <span className="font-medium text-zinc-900">{formatTVL(sumTVL)}</span></div>
    </div>
  );

