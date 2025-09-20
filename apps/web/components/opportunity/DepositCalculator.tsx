"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid 
} from "recharts";
import {
  Calculator,
  ArrowUpRight,
  Info,
  DollarSign,
  Calendar,
  Percent,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
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
import { colors } from "@/lib/colors";

interface DepositCalculatorProps {
  data: Opportunity;
}

type CompoundFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually";

export function DepositCalculator({ data }: DepositCalculatorProps) {
  const [amount, setAmount] = useState(1000);
  const [days, setDays] = useState(90);
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFrequency>("Daily");
  const [isRouterMode, setIsRouterMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [projectionData, setProjectionData] = useState<Array<{ day: number; value: number; label: string }>>([]);

  // Calculate returns
  const calculateReturns = () => {
    const dailyRate = data.apr / 365 / 100;
    const simpleReturn = amount * dailyRate * days;
    
    // Compound frequency to periods per year
    const periodsPerYear: Record<CompoundFrequency, number> = {
      Daily: 365,
      Weekly: 52,
      Monthly: 12,
      Quarterly: 4,
      Annually: 1,
    };
    
    const n = periodsPerYear[compoundFrequency];
    const compoundedAmount = amount * Math.pow(1 + data.apr / 100 / n, (n * days) / 365);
    const compoundReturn = compoundedAmount - amount;
    
    return {
      simple: simpleReturn,
      compound: compoundReturn,
      final: compoundedAmount,
      effectiveAPY: ((compoundedAmount / amount - 1) * 365 / days) * 100
    };
  };

  // Generate projection data for chart
  useEffect(() => {
    const generateProjection = () => {
      const projData: Array<{ day: number; value: number; label: string }> = [];
      const intervals = Math.min(days, 30); // Max 30 points for performance
      const dayStep = Math.floor(days / intervals);
      
      for (let i = 0; i <= intervals; i++) {
        const currentDay = i * dayStep;
        const dailyRate = data.apr / 365 / 100;
        const value = amount * (1 + dailyRate * currentDay);
        
        projData.push({
          day: currentDay,
          value: Math.round(value * 100) / 100,
          label: `Day ${currentDay}`
        });
      }
      
      return projData;
    };
    
    setProjectionData(generateProjection());
  }, [amount, days, data.apr]);

  const returns = calculateReturns();

  const handleDeposit = async () => {
    if (isRouterMode) {
      toast.info("Router integration coming soon", {
        description: "One-click routing will be available in the next update"
      });
      return;
    }

    setShowSuccess(true);
    
    // Add to portfolio history (implementation would go here)
    console.log('Adding to portfolio:', {
      id: data.id,
      protocol: data.protocol,
      pair: data.pair,
      apr: data.apr,
      amount,
      days,
      ts: Date.now(),
      chain: data.chain
    });

    // Redirect after animation
    setTimeout(() => {
      window.open(data.originalUrl, "_blank");
      toast.success("Redirected to protocol", {
        description: `${data.protocol} opened in a new tab. Position added to your portfolio.`
      });
      setShowSuccess(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="sticky top-24 space-y-4"
    >
      {/* Main Calculator Card */}
      <div className="rounded-3xl border border-black/5 bg-white p-5 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="text-zinc-400" size={20} />
            <h4 className="font-display text-lg text-zinc-900">Deposit Calculator</h4>
          </div>
          
          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg bg-zinc-100 p-0.5">
            <button
              onClick={() => setIsRouterMode(false)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                !isRouterMode
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              Protocol
            </button>
            <button
              onClick={() => setIsRouterMode(true)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                isRouterMode
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              Router
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                <DollarSign size={12} />
                Amount (USD)
              </span>
              <span className="text-xs text-zinc-500">
                Principal investment
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-lg font-semibold tabular-nums ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                placeholder="1000"
                min={0}
                max={1000000}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs text-zinc-500">USD</span>
              </div>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="mt-2 flex gap-2">
              {[100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className="flex-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                <Calendar size={12} />
                Duration
              </span>
              <span className="text-xs font-semibold text-zinc-900 tabular-nums">
                {days} days
              </span>
            </label>
            <input
              type="range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-[var(--brand-orange)] range-orange"
              min={1}
              max={365}
              step={1}
              style={{
                background: `linear-gradient(to right, var(--brand-orange) 0%, var(--brand-orange) ${(days / 365) * 100}%, #e5e7eb ${(days / 365) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="mt-2 flex justify-between text-xs text-zinc-500">
              <span>1d</span>
              <span>90d</span>
              <span>180d</span>
              <span>365d</span>
            </div>
          </div>

          {/* Compound Frequency */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                <Percent size={12} />
                Compound Frequency
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Daily", "Weekly", "Monthly", "Quarterly", "Annually"] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setCompoundFrequency(freq)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    compoundFrequency === freq
                      ? "bg-[var(--brand-orange)] text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Returns Summary */}
          <div className="rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 ring-1 ring-zinc-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">Simple Return</span>
                <span className="font-semibold text-zinc-900 tabular-nums">
                  <CountUp
                    start={0}
                    end={returns.simple}
                    duration={0.8}
                    decimals={2}
                    prefix="$"
                    preserveValue
                  />
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 flex items-center gap-1">
                  Compound Return
                  <Info size={10} className="text-zinc-400" />
                </span>
                <span className="font-semibold text-emerald-600 tabular-nums">
                  <CountUp
                    start={0}
                    end={returns.compound}
                    duration={0.8}
                    decimals={2}
                    prefix="+$"
                    preserveValue
                  />
                </span>
              </div>
              
              <div className="h-px bg-zinc-200" />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-700">Final Amount</span>
                <span className="text-lg font-bold text-zinc-900 tabular-nums">
                  <CountUp
                    start={amount}
                    end={returns.final}
                    duration={0.8}
                    decimals={2}
                    prefix="$"
                    separator=","
                    preserveValue
                  />
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">Effective APY</span>
                <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                  {returns.effectiveAPY.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700"
              >
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Redirecting to {data.protocol}...</span>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleDeposit}
                disabled={isRouterMode}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isRouterMode
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-700)] shadow-sm"
                }`}
              >
                {isRouterMode ? (
                  <>
                    <AlertCircle size={16} />
                    Router Coming Soon
                  </>
                ) : (
                  <>
                    Go to {data.protocol}
                    <ArrowUpRight size={16} />
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Info Text */}
          <p className="text-xs text-zinc-500 text-center">
            {isRouterMode
              ? "One-click routing will handle the deposit for you"
              : `You'll be redirected to ${data.protocol}. Non-custodial.`}
          </p>
        </div>
      </div>

      {/* Projection Chart Card */}
      <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-zinc-400" size={16} />
          <h5 className="text-sm font-medium text-zinc-700">Value Projection</h5>
        </div>
        
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.emerald[600]} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={colors.emerald[600]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid stroke="rgba(0,0,0,.04)" strokeDasharray="0" vertical={false} />
              
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "rgba(0,0,0,.5)" }}
                tickFormatter={(value) => `${value}d`}
              />
              
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "rgba(0,0,0,.5)" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              
              <Tooltip
                content={({ active, payload }) =>
                  active && payload ? (
                    <div className="rounded-lg bg-white px-2 py-1 shadow-lg ring-1 ring-black/5">
                      <div className="text-xs text-zinc-600">{payload[0]?.payload?.label}</div>
                      <div className="text-xs font-semibold">${payload[0]?.value?.toLocaleString()}</div>
                    </div>
                  ) : null
                }
              />
              
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.emerald[600]}
                strokeWidth={2}
                fill="url(#projectionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}