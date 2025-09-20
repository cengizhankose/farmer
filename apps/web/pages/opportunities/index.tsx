"use client";
import React from "react";
import { Logger } from "@/lib/adapters/real";
import { AlertTriangle } from "lucide-react";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import AnimatedFilterBar from "@/components/AnimatedFilterBar";
// import { SkeletonGrid } from "@/components/opportunities/SkeletonGrid";
import { EmptyState } from "@/components/opportunities/EmptyState";
import HeroHeader from "@/components/HeroHeader";
import HeroKpiBar from "@/components/HeroKpiBar";
// Removed chain filter pills - only Stacks for now
import OpportunityCardPlaceholder from "@/components/OpportunityCardPlaceholder";
// Enhanced components temporarily removed due to TypeScript errors
// import { ChartTimeSelector } from "@/components/enhanced/TimeSelector";

type CardOpportunity = {
  id: string;
  protocol: string;
  pair: string;
  chain: string;
  apr: number; // percent
  apy: number; // percent
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string; // label like 5m, 2h
  originalUrl: string;
  summary: string;
  source?: "live" | "demo";
};

export default function OpportunitiesPage() {
  const [query, setQuery] = React.useState("");
  const [risk, setRisk] = React.useState<"all" | "Low" | "Medium" | "High">("all");
  // const [chain] = React.useState<"stacks">("stacks"); // Only Stacks for now - unused
  const [sort, setSort] = React.useState<{ key: keyof CardOpportunity; dir: "asc" | "desc" }>({
    key: "apr",
    dir: "desc",
  });
  const [timeframe, setTimeframe] = React.useState<"7D" | "30D" | "90D">("7D");
  const [loading, setLoading] = React.useState(true);
  const [opportunities, setOpportunities] = React.useState<CardOpportunity[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [, setStats] = React.useState({ avgApr7d: 0, totalTvlUsd: 0, results: 0 });

  // Load opportunities data from real APIs only
  React.useEffect(() => {
    let mounted = true;

    async function loadRealData() {
      try {
        setLoading(true);
        setError(null);

        Logger.info('🚀 Loading opportunities via API bridge (/api/opportunities)...');

        const resp = await fetch('/api/opportunities');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const realOpportunities: CardOpportunity[] = (json.items || []).map((it: CardOpportunity) => ({ ...it, source: 'live' }));

        // Basic stats (client-side)
        const realStats = {
          avgApr7d: realOpportunities.length ? realOpportunities.reduce((a, o) => a + o.apr, 0) / realOpportunities.length : 0,
          totalTvlUsd: realOpportunities.reduce((a, o) => a + o.tvlUsd, 0),
          results: realOpportunities.length,
        };

        if (!mounted) return;

        Logger.info(`✅ Loaded ${realOpportunities.length} opportunities from REAL APIs`);
        Logger.info(`📊 Stats: ${realStats.avgApr7d.toFixed(1)}% avg APR, $${(realStats.totalTvlUsd / 1_000_000).toFixed(1)}M TVL`);

        setOpportunities(realOpportunities);
        setStats(realStats);

      } catch (error) {
        Logger.error('❌ FAILED to load real data - this should not happen in production!', error);
        setError(`Real data loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setOpportunities([]);
        setStats({ avgApr7d: 0, totalTvlUsd: 0, results: 0 });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRealData();

    return () => {
      mounted = false;
    };
  }, [setLoading, setStats]);

  const filtered = React.useMemo(() => {
    Logger.debug(`🔍 Filtering ${opportunities.length} opportunities with query='${query}', risk='${risk}'`);

    const result = opportunities.filter((o) => {
      // Only Stacks chain for now
      if (o.chain !== "stacks") return false;

      // Risk filter
      if (risk !== "all" && o.risk !== risk) return false;

      // Search query
      if (query) {
        const q = query.toLowerCase();
        return (
          o.protocol.toLowerCase().includes(q) ||
          o.pair.toLowerCase().includes(q)
        );
      }
      return true;
    });

    Logger.debug(`✅ Filtered to ${result.length} opportunities`);
    return result;
  }, [opportunities, query, risk]);

  const sorted = React.useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const rankRisk = (r: string) => (r === "Low" ? 1 : r === "Medium" ? 2 : 3);

    const result = [...filtered].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let va: any, vb: any;

      if (sort.key === "risk") {
        va = rankRisk(a.risk);
        vb = rankRisk(b.risk);
      } else {
        va = a[sort.key as keyof CardOpportunity];
        vb = b[sort.key as keyof CardOpportunity];
      }

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    Logger.debug(`📈 Sorted ${result.length} opportunities by ${sort.key} ${sort.dir}`);
    return result;
  }, [filtered, sort]);

  // Update displayed stats based on filtered results
  const displayStats = React.useMemo(() => {
    const count = filtered.length;
    const avgAPR = count ? filtered.reduce((a, o) => a + o.apr, 0) / count : 0; // Already percent
    const sumTVL = filtered.reduce((a, o) => a + o.tvlUsd, 0);

    Logger.debug(`📊 Display stats: count=${count}, avgAPR=${avgAPR.toFixed(1)}%, totalTVL=$${(sumTVL / 1_000_000).toFixed(1)}M`);

    return {
      avgApr7d: avgAPR,
      totalTvlUsd: sumTVL,
      results: count
    };
  }, [filtered]);

  // Currently only Stacks is supported
  // const chainEnabled = chain === "stacks"; // Unused for now

  return (
    <main>
      <HeroHeader
        title="Explore Yield Opportunities"
        subtitle="Find the best APR/APY on Stacks. Multichain coming soon."
        size="standard"
        // No chain pills needed - only Stacks for now
        kpis={
          <HeroKpiBar
            kpis={displayStats}
          />
        }
      />
      <AnimatedFilterBar
        defaultRisk={risk === "Medium" ? "medium" : (risk === "High" ? "high" : (risk === "Low" ? "low" : "all"))}
        defaultSort={`${sort.key === "tvlUsd" ? "tvl" : sort.key}-${sort.dir}` as "apr-desc" | "apr-asc" | "apy-desc" | "apy-asc" | "tvl-desc" | "tvl-asc" | "risk-desc" | "risk-asc"}
        query={query}
        onQueryChange={(q) => {
          Logger.debug(`🔍 Search query changed: '${q}'`);
          setQuery(q);
        }}
        onRiskChange={(r) => {
          Logger.debug(`🎯 Risk filter changed: '${r}'`);
          const mapped = r === 'medium' ? 'Medium' : r === 'high' ? 'High' : r === 'low' ? 'Low' : 'all';
          setRisk(mapped as typeof risk);
        }}
        onSortChange={(s) => {
          const [sortKey, dir] = s.split("-") as [string, "asc" | "desc"];
          const key = (sortKey === "tvl" ? "tvlUsd" : sortKey) as keyof CardOpportunity;
          Logger.debug(`📈 Sort changed: ${key} ${dir}`);
          setSort({ key, dir });
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">

        {/* Real Data Status Indicator */}
        {!error && !loading && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  🚀 Live Data Active
                </p>
                <p className="text-sm text-green-700">
                  Real-time data from DeFiLlama API and Arkadiko Protocol • Updated every 5 minutes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Indicator */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  ❌ Real Data Loading Failed
                </p>
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <OpportunityCardPlaceholder key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            onReset={() => {
              Logger.info("🔄 Resetting all filters to default values");
              setQuery("");
              setRisk("all");
              setSort({ key: "apr", dir: "desc" });
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((o, index) => {
              Logger.debug(`🃏 Rendering opportunity ${index + 1}/${sorted.length}: ${o.protocol} - ${o.pair}`);
              return (
                <OpportunityCard
                  key={o.id}
                  data={o}
                  disabled={false} // All Stacks opportunities are enabled
                />
              );
            })}
          </div>
        )}

        {/* Bottom info/debug note removed per request */}
      </section>
    </main>
  );
}
