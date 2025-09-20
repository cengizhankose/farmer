"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
// Temporarily removed enhanced components due to TypeScript errors
// import { APRMetricsCard, TVLMetricsCard, ParticipantMetricsCard } from "./enhanced/MetricsCard";

type Kpis = {
  avgApr7d: number;
  totalTvlUsd: number;
  results: number;
};

type Props = {
  kpis: Kpis;
};

export function HeroKpiBar({ kpis }: Props) {
  const reduceMotion = useReducedMotion();

  const fadeInAnim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      };

  // Simulate some changes for demo purposes
  const mockChange24h = {
    apr: 0.5, // 0.5% change in APR
    tvl: 2.3, // 2.3% change in TVL
    participants: 1.2 // 1.2% change in participants
  };

  return (
    <motion.div
      className="mx-auto max-w-5xl px-4"
      {...fadeInAnim}
    >
      {/* Enhanced components temporarily removed due to TypeScript errors */}
      <div className="bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-2xl px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Placeholder for APR Metrics Card */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-4">
            <h3 className="text-white/70 text-sm font-medium mb-1">Average APR</h3>
            <p className="text-2xl font-bold text-white">{(kpis.avgApr7d / 100).toFixed(2)}%</p>
            <p className="text-green-400 text-xs">+{mockChange24h.apr}%</p>
          </div>

          {/* Placeholder for TVL Metrics Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4">
            <h3 className="text-white/70 text-sm font-medium mb-1">Total TVL</h3>
            <p className="text-2xl font-bold text-white">${(kpis.totalTvlUsd / 1000000).toFixed(1)}M</p>
            <p className="text-green-400 text-xs">+{mockChange24h.tvl}%</p>
          </div>

          {/* Placeholder for Participants Metrics Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4">
            <h3 className="text-white/70 text-sm font-medium mb-1">Participants</h3>
            <p className="text-2xl font-bold text-white">{kpis.results}</p>
            <p className="text-green-400 text-xs">+{mockChange24h.participants}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HeroKpiBar;