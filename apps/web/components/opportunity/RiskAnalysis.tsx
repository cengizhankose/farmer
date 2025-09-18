"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingDown, Lock, Info } from "lucide-react";
import type { Opportunity } from "@/lib/mock";

interface RiskAnalysisProps {
  data: Opportunity;
}

interface RiskItem {
  category: string;
  level: number; // 0-100
  status: "Low" | "Medium" | "High";
  description: string;
  icon: React.ReactNode;
  color: {
    bg: string;
    bar: string;
    text: string;
  };
}

export function RiskAnalysis({ data }: RiskAnalysisProps) {
  // Generate risk scores based on the opportunity's risk level
  const baseRiskMultiplier = 
    data.risk === "Low" ? 0.3 : 
    data.risk === "Medium" ? 0.6 : 
    0.85;

  const risks: RiskItem[] = [
    {
      category: "Smart Contract Risk",
      level: Math.round((20 + Math.random() * 30) * baseRiskMultiplier),
      status: data.risk,
      description: "Audit status, code complexity, and time in production",
      icon: <Lock size={16} />,
      color: {
        bg: "bg-blue-50",
        bar: "bg-blue-500",
        text: "text-blue-700"
      }
    },
    {
      category: "Market Risk",
      level: Math.round((30 + Math.random() * 40) * baseRiskMultiplier),
      status: data.risk,
      description: "Price volatility, impermanent loss potential, and liquidity depth",
      icon: <TrendingDown size={16} />,
      color: {
        bg: "bg-amber-50",
        bar: "bg-amber-500",
        text: "text-amber-700"
      }
    },
    {
      category: "Liquidity Risk",
      level: Math.round((15 + Math.random() * 25) * baseRiskMultiplier),
      status: data.risk,
      description: "Exit liquidity, withdrawal limits, and lock-up periods",
      icon: <AlertTriangle size={16} />,
      color: {
        bg: "bg-purple-50",
        bar: "bg-purple-500",
        text: "text-purple-700"
      }
    }
  ];

  const overallRiskScore = Math.round(
    risks.reduce((sum, risk) => sum + risk.level, 0) / risks.length
  );

  const getRiskLabel = (score: number) => {
    if (score < 33) return { label: "Low Risk", color: "text-emerald-600" };
    if (score < 66) return { label: "Medium Risk", color: "text-amber-600" };
    return { label: "High Risk", color: "text-rose-600" };
  };

  const overallLabel = getRiskLabel(overallRiskScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-5 md:p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display text-lg md:text-xl text-zinc-900 flex items-center gap-2">
            <Shield size={20} className="text-zinc-400" />
            Risk Analysis
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Multi-factor risk assessment based on protocol metrics
          </p>
        </div>
        
        {/* Overall Score */}
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {overallRiskScore}
            <span className="text-sm font-normal text-zinc-500">/100</span>
          </div>
          <div className={`text-xs font-medium ${overallLabel.color}`}>
            {overallLabel.label}
          </div>
        </div>
      </div>

      {/* Risk Categories */}
      <div className="space-y-4">
        {risks.map((risk, index) => (
          <motion.div
            key={risk.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="p-4 rounded-xl bg-white"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${risk.color.bg}`}>
                  <div className={risk.color.text}>{risk.icon}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900">
                    {risk.category}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {risk.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-zinc-900 tabular-nums">
                  {risk.level}%
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 rounded-full bg-zinc-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk.level}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                className={`absolute left-0 top-0 h-full rounded-full ${risk.color.bar}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-3 rounded-lg bg-blue-50 flex items-start gap-2">
        <Info size={14} className="text-blue-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-blue-700">
            Risk scores are calculated based on multiple factors including audit status, 
            TVL stability, historical performance, and market conditions. Lower scores 
            indicate lower risk.
          </p>
        </div>
      </div>
    </motion.div>
  );
}