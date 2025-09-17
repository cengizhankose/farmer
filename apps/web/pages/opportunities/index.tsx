"use client";
import React from "react";
import { useRouter } from "next/router";
import { opportunities, CHAINS, type ChainId } from "@/lib/mock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { Info } from "lucide-react";
import { colors } from "../../lib/colors";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import {
  MarketFilters,
  type RiskFilter,
  type SortDir,
  type SortKey,
} from "@/components/opportunities/MarketFilters";
import { QuickStats } from "@/components/opportunities/QuickStats";
import { SkeletonGrid } from "@/components/opportunities/SkeletonGrid";
import { EmptyState } from "@/components/opportunities/EmptyState";
import { StickyStatsHeader } from "@/components/opportunities/StickyStatsHeader";

export default function OpportunitiesPage() {
  const [query, setQuery] = React.useState("");
  const [risk, setRisk] = React.useState<RiskFilter>("all");
  const [chain, setChain] = React.useState<ChainId>("stacks");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({
    key: "apr",
    dir: "desc",
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    return opportunities.filter((o) => {
      if (chain && o.chain !== chain) return false;
      if (risk !== "all" && o.risk !== risk) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          o.protocol.toLowerCase().includes(q) ||
          o.pair.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, risk, chain]);

  const sorted = React.useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const rankRisk = (r: string) => (r === "Low" ? 1 : r === "Medium" ? 2 : 3);
    return [...filtered].sort((a, b) => {
      const va = sort.key === "risk" ? rankRisk(a.risk) : (a as any)[sort.key];
      const vb = sort.key === "risk" ? rankRisk(b.risk) : (b as any)[sort.key];
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, sort]);

  const stats = React.useMemo(() => {
    const count = filtered.length;
    const avgAPR = count ? filtered.reduce((a, o) => a + o.apr, 0) / count : 0;
    const sumTVL = filtered.reduce((a, o) => a + o.tvlUsd, 0);
    return { count, avgAPR, sumTVL };
  }, [filtered]);

  const chainObj = CHAINS.find((c) => c.id === chain);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1
              className={`font-[Sora] text-3xl font-semibold text-[${colors.zinc[900]}]`}
            >
              Explore opportunities
            </h1>
            <p className={`mt-2 max-w-2xl text-[${colors.zinc[600]}]`}>
              Normalized APR/APY with risk labels and freshness. Multichain
              preview is visible but disabled.
            </p>
          </div>
          <MarketFilters
            query={query}
            setQuery={setQuery}
            risk={risk}
            setRisk={setRisk}
            sort={sort}
            setSort={setSort}
          />
        </div>

        <div className="mt-6">
          <Tabs value={chain} onValueChange={(v) => setChain(v as ChainId)}>
            <TabsList>
              {CHAINS.map((c) => (
                <TabsTrigger
                  key={c.id}
                  value={c.id}
                  onSelect={(v) => setChain(v as ChainId)}
                >
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {!chainObj?.enabled && (
          <div
            className={`mt-4 rounded-md border border-[${colors.zinc[200]}] bg-[${colors.zinc[50]}] p-3 text-sm text-[${colors.zinc[700]}]`}
          >
            <span className="font-medium">Preview:</span> {chainObj?.label}{" "}
            support is coming soon. Cards are disabled.
          </div>
        )}

        <StickyStatsHeader count={stats.count} avgAPR={stats.avgAPR} sumTVL={stats.sumTVL} />
        <QuickStats
          count={stats.count}
          avgAPR={stats.avgAPR}
          sumTVL={stats.sumTVL}
        />

        {loading ? (
          <SkeletonGrid count={6} />
        ) : sorted.length === 0 ? (
          <EmptyState
            onReset={() => {
              setQuery("");
              setRisk("all");
              setSort({ key: "apr", dir: "desc" });
            }}
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((o) => {
              const disabled = !CHAINS.find((c) => c.id === o.chain)?.enabled;
              return (
                <OpportunityCard key={o.id} data={o} disabled={disabled} />
              );
            })}
          </div>
        )}

        <div className="mt-10 flex items-start gap-2 text-xs text-zinc-600">
          <Info size={14} />
          <p>
            NFA. Data is mocked for demo. Actual adapter-backed data and router
            (B) integration coming next.
          </p>
        </div>
      </div>
    </div>
  );
}
