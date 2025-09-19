"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";
import { colors } from "@/lib/colors";
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
  logoUrl?: string;
};

interface OpportunityHeroProps {
  data: Opportunity;
}

export function OpportunityHero({ data }: OpportunityHeroProps) {
  const {
    protocol,
    pair,
    risk,
    chain,
    lastUpdated,
    apr,
    apy,
    tvlUsd,
    summary,
  } = data;
  // Note: Logo badge removed per request (no logo on detail page)

  const riskColors = {
    Low: {
      bg: "bg-emerald-50/20",
      text: "text-emerald-100",
      ring: "ring-emerald-300/30",
    },
    Medium: {
      bg: "bg-amber-50/20",
      text: "text-amber-100",
      ring: "ring-amber-300/30",
    },
    High: {
      bg: "bg-rose-50/20",
      text: "text-rose-100",
      ring: "ring-rose-300/30",
    },
  };

  const formatTVL = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <section className="graph-bg graph-density-normal relative isolate overflow-hidden rounded-3xl">
      {/* Gradient overlays */}
      <div
        className="absolute -left-24 -top-24 h-96 w-96 rounded-full"
        style={{ background: colors.radial.orangeGlow }}
      />
      <div
        className="absolute -bottom-16 -right-24 h-80 w-80 rounded-full"
        style={{ background: colors.radial.darkGlow }}
      />

      {/* Logo badge intentionally removed */}

      <div className="relative z-10 p-6 md:p-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-1.5 text-xs text-white/70 mb-4"
        >
          <Link
            href="/opportunities"
            className="hover:text-white transition-colors"
          >
            Opportunities
          </Link>
          <ChevronRight size={14} />
          <span className="text-white/90">{protocol}</span>
        </motion.nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="font-display text-3xl md:text-4xl tracking-tight text-white"
            >
              {protocol} — {pair}
            </motion.h1>
            {summary && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="mt-2 max-w-2xl text-sm text-white/80"
              >
                {summary}
              </motion.p>
            )}
          </div>

          {/* Chips */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
              <Shield size={12} />
              {chain}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 backdrop-blur ${
                riskColors[risk].bg
              } ${riskColors[risk].text} ${riskColors[risk].ring}`}
            >
              <AlertCircle size={12} />
              {risk} Risk
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs bg-white/10 text-white/70 ring-1 ring-white/10">
              <Clock size={12} />
              {lastUpdated}
            </span>
          </motion.div>
        </div>

        {/* KPI Strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <KpiCard label="APR" value={`${apr.toFixed(1)}%`} trend="+2.3%" />
          <KpiCard label="APY" value={`${apy.toFixed(1)}%`} />
          <KpiCard label="TVL" value={formatTVL(tvlUsd)} trend="+$1.2M" />
        </motion.div>
      </div>
    </section>
  );
}

function KpiCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-white/80">
          {label}
        </div>
        {trend && <span className="text-[10px] text-emerald-300">{trend}</span>}
      </div>
      <div className="mt-0.5 font-sans text-lg md:text-xl font-semibold tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}
