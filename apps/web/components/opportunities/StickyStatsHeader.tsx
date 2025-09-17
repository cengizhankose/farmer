"use client";
import React from "react";
import { colors } from "@/lib/colors";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export const StickyStatsHeader: React.FC<{ count: number; avgAPR: number; sumTVL: number }>
  = ({ count, avgAPR, sumTVL }) => {
    const data = React.useMemo(() => {
      // generate small 7‑point series around avgAPR
      const base = avgAPR || 0;
      const arr = Array.from({ length: 7 }).map((_, i) => ({
        x: i,
        y: Number((base + Math.sin(i) * (base * 0.05)).toFixed(2)),
      }));
      return arr;
    }, [avgAPR]);

    return (
      <div className={`sticky top-20 z-20 mt-4 rounded-lg border border-[${colors.zinc[200]}] bg-[${colors.white.DEFAULT}]/80 p-3 backdrop-blur-xl`}
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className={`text-xs text-[${colors.zinc[500]}]`}>Avg APR (7d)</div>
            <div className={`text-lg font-semibold text-[${colors.zinc[900]}]`}>{avgAPR.toFixed(1)}%</div>
          </div>
          <div className="h-12 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="gApr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="y" stroke="#059669" strokeWidth={2} fill="url(#gApr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <div className={`text-xs text-[${colors.zinc[500]}]`}>Total TVL</div>
            <div className={`text-lg font-semibold text-[${colors.zinc[900]}]`}>${(sumTVL/1_000_000).toFixed(2)}M</div>
          </div>
          <div className="flex-1">
            <div className={`text-xs text-[${colors.zinc[500]}]`}>Results</div>
            <div className={`text-lg font-semibold text-[${colors.zinc[900]}]`}>{count}</div>
          </div>
        </div>
      </div>
    );
  };

