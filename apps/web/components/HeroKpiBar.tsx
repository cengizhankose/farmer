"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Kpis = { 
  avgApr7d: number; 
  totalTvlUsd: number; 
  results: number; 
};

type Props = {
  kpis: Kpis;
};

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function HeroKpiBar({ kpis }: Props) {
  const reduceMotion = useReducedMotion();

  const kpiData = [
    {
      label: "Avg APR (7d)",
      value: `${kpis.avgApr7d.toFixed(1)}%`,
    },
    {
      label: "Total TVL",
      value: formatNumber(kpis.totalTvlUsd),
    },
    {
      label: "Results",
      value: kpis.results.toString(),
    },
  ];

  const fadeInAnim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      };

  return (
    <motion.div 
      className="mx-auto max-w-5xl px-4"
      {...fadeInAnim}
    >
      <div className="bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-2xl px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
          {kpiData.map((kpi) => (
            <div key={kpi.label} className="space-y-1">
              <div className="text-[11px] uppercase font-medium text-white/70 tracking-wide">
                {kpi.label}
              </div>
              <div className="text-base md:text-lg font-semibold text-white tabular-nums">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default HeroKpiBar;