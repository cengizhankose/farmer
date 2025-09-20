"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingDown, Info, Activity, LineChart } from "lucide-react";
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

interface RiskAnalysisProps {
  data: Opportunity;
}

interface RiskItem {
  category: string;
  level: number; // 0-100, higher means higher risk
  status: "Low" | "Medium" | "High";
  description: string;
  icon: React.ReactNode;
  color: { bg: string; bar: string; text: string };
}

export function RiskAnalysis({ data }: RiskAnalysisProps) {
  // Fetch optional backend-enhanced metrics first
  const [enhanced, setEnhanced] = React.useState<{
    liquidity: number;
    stability: number;
    yield: number;
    concentration: number;
    momentum: number;
    total: number;
  } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function loadEnhanced() {
      try {
        const resp = await fetch(`/api/opportunities/${data.id}/enhanced`);
        if (!resp.ok) return; // fallback silently
        const json = await resp.json();
        const risk = json?.risk;
        if (!mounted || !risk) return;
        setEnhanced({
          liquidity: Number(risk.liquidity ?? 0),
          stability: Number(risk.stability ?? 0),
          yield: Number(risk.yield ?? 0),
          concentration: Number(risk.concentration ?? 0),
          momentum: Number(risk.momentum ?? 0),
          total: Number(risk.total ?? 0),
        });
      } catch {
        // ignore; heuristics will be used
      }
    }
    loadEnhanced();
    return () => { mounted = false; };
  }, [data.id]);

  // Fetch recent series to compute heuristic risk metrics if needed
  const [series, setSeries] = React.useState<Array<{ timestamp: number; tvlUsd: number; apy?: number; apr?: number; volume24h?: number }>>([]);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // no-op: internal loading state is not displayed
        const resp = await fetch(`/api/opportunities/${data.id}/chart?days=90`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const pts = Array.isArray(json.series) ? json.series : [];
        if (!mounted) return;
        setSeries(pts);
      } catch {
        setSeries([]);
      } finally {
        // no-op
      }
    }
    load();
    return () => { mounted = false; };
  }, [data.id]);

  // Helpers
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  const pct = (n: number) => Math.round(n * 100);
  const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const stdev = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    const v = mean(arr.map((x) => (x - m) * (x - m)));
    return Math.sqrt(v);
  };
  const slope = (arr: number[]) => {
    const n = arr.length;
    if (n < 2) return 0;
    const xs = Array.from({ length: n }, (_, i) => i + 1);
    const xMean = mean(xs);
    const yMean = mean(arr);
    const num = xs.reduce((s, x, i) => s + (x - xMean) * (arr[i] - yMean), 0);
    const den = xs.reduce((s, x) => s + (x - xMean) * (x - xMean), 0) || 1;
    return num / den;
  };
  const maxDrawdown = (arr: number[]) => {
    let peak = arr[0] || 0;
    let maxDD = 0;
    for (const v of arr) {
      peak = Math.max(peak, v);
      maxDD = Math.min(maxDD, (v - peak) / (peak || 1));
    }
    return Math.abs(maxDD); // 0..1
  };
  const herfindahl = (arr: number[]) => {
    const s = arr.reduce((a, b) => a + Math.max(b, 0), 0) || 1;
    return arr.reduce((a, v) => a + Math.pow(Math.max(v, 0) / s, 2), 0); // 1/N..1
  };

  // Build time-series vectors
  const tvlVec = series.map((p) => p.tvlUsd).filter((n) => Number.isFinite(n)) as number[];
  const apyVec = series.map((p) => (typeof p.apy === 'number' ? p.apy : typeof p.apr === 'number' ? p.apr : 0)).filter((n) => Number.isFinite(n)) as number[];
  const volVec = series.map((p) => p.volume24h ?? 0).filter((n) => Number.isFinite(n)) as number[];

  const latestTvl = tvlVec.length ? tvlVec[tvlVec.length - 1] : data.tvlUsd;
  const tvlMean = mean(tvlVec);
  const tvlVol = stdev(tvlVec);
  const tvlCv = tvlMean ? tvlVol / tvlMean : 0; // coefficient of variation
  const tvlSlope = slope(tvlVec);
  const tvlDD = maxDrawdown(tvlVec);

  const apyMean = mean(apyVec);
  const apyVol = stdev(apyVec);
  const apyCv = apyMean ? apyVol / Math.abs(apyMean) : 0;
  const apySlope = slope(apyVec);

  const volHerf = volVec.length ? herfindahl(volVec) : 1 / Math.max(1, volVec.length || 1);
  const turnover = tvlMean ? mean(volVec) / tvlMean : 0; // approx daily

  // Risk mappings (0..100 higher = higher risk)
  const liquidityRisk = (() => {
    const tvlRisk = 1 - clamp01(Math.log10((latestTvl || 1) + 1) / 7); // high TVL => low risk
    const turnoverRisk = clamp01(turnover); // higher turnover => higher risk of churn
    return pct(clamp01(0.7 * tvlRisk + 0.3 * turnoverRisk));
  })();

  const stabilityRisk = (() => {
    const volRisk = clamp01(tvlCv); // variability
    const ddRisk = clamp01(tvlDD);  // deep drawdowns
    return pct(clamp01(0.6 * volRisk + 0.4 * ddRisk));
  })();

  const yieldRisk = (() => {
    const volRisk = clamp01(apyCv);
    const trendBonus = apySlope > 0 ? -0.1 : 0.05; // improving yield reduces risk slightly
    return pct(clamp01(volRisk + trendBonus));
  })();

  const concentrationRisk = (() => {
    if (volVec.length < 5) return 55; // unknown → medium
    // Higher Herfindahl implies more concentrated volume flow
    const h = clamp01((volHerf - 0.1) / 0.9);
    return pct(h);
  })();

  const momentumRisk = (() => {
    // Negative momentum increases risk, positive reduces
    const m = tvlSlope;
    // Normalize slope by scale of TVL
    const norm = tvlMean ? m / (tvlMean || 1) : 0;
    const mapped = 0.5 - Math.max(-0.5, Math.min(0.5, norm * 200)); // heuristic
    return pct(clamp01(mapped));
  })();

  const toStatus = (score: number): RiskItem["status"] => (score < 33 ? "Low" : score < 66 ? "Medium" : "High");

  // Prefer backend-enhanced values when present
  const scores = enhanced ?? {
    liquidity: liquidityRisk,
    stability: stabilityRisk,
    yield: yieldRisk,
    concentration: concentrationRisk,
    momentum: momentumRisk,
    total: Math.round((liquidityRisk + stabilityRisk + yieldRisk + concentrationRisk + momentumRisk) / 5),
  };

  // Create seeded random for consistent risk scores
  const createSeededRandom = (seed: number) => {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  };

  // Use opportunity ID as seed for consistency
  const riskSeed = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = createSeededRandom(riskSeed);

  const risks: RiskItem[] = [
    {
      category: "Liquidity Risk",
      level: scores.liquidity,
      status: toStatus(scores.liquidity),
      description: "Exit depth and turnover vs TVL (derived from real series)",
      icon: <AlertTriangle size={16} />,
      color: { bg: "bg-purple-50", bar: "bg-purple-500", text: "text-purple-700" },
    },
    {
      category: "Stability Risk",
      level: scores.stability,
      status: toStatus(scores.stability),
      description: "TVL volatility and drawdown computed from historical data",
      icon: <TrendingDown size={16} />,
      color: { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-700" },
    },
    {
      category: "Yield Risk",
      level: scores.yield,
      status: toStatus(scores.yield),
      description: "APR/APY variability and trend of returns",
      icon: <LineChart size={16} />,
      color: { bg: "bg-blue-50", bar: "bg-blue-500", text: "text-blue-700" },
    },
    {
      category: "Concentration Risk",
      level: scores.concentration,
      status: toStatus(scores.concentration),
      description: "Volume distribution proxy (higher concentration = higher risk)",
      icon: <Shield size={16} />,
      color: { bg: "bg-rose-50", bar: "bg-rose-500", text: "text-rose-700" },
    },
    {
      category: "Momentum Risk",
      level: scores.momentum,
      status: toStatus(scores.momentum),
      description: "Recent TVL momentum; weakening momentum increases risk",
      icon: <Activity size={16} />,
      color: { bg: "bg-emerald-50", bar: "bg-emerald-500", text: "text-emerald-700" },
    },
  ];

  const overallRiskScore = scores.total ?? Math.round(risks.reduce((sum, r) => sum + r.level, 0) / (risks.length || 1));

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
            Risk scores are derived from real series: TVL volatility/drawdown, APR/APY volatility, 
            liquidity turnover, volume concentration and recent momentum. Lower scores indicate lower risk.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
