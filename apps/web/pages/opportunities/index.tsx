"use client";
import React from "react";
// import { useRouter } from "next/router";
import { opportunities, CHAINS, type ChainId } from "@/lib/mock";
import { Info } from "lucide-react";
import { colors } from "../../lib/colors";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import {
  type RiskFilter,
  type SortDir,
  type SortKey,
} from "@/components/opportunities/MarketFilters";
import AnimatedFilterBar from "@/components/AnimatedFilterBar";
// import { SkeletonGrid } from "@/components/opportunities/SkeletonGrid";
import { EmptyState } from "@/components/opportunities/EmptyState";
import HeroHeader from "@/components/HeroHeader";
import HeroKpiBar from "@/components/HeroKpiBar";
import ChainFilterPills, { type ChainKey } from "@/components/ChainFilterPills";
import OpportunityCardPlaceholder from "@/components/OpportunityCardPlaceholder";

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
      const va = sort.key === "risk" ? rankRisk(a.risk) : a[sort.key];
      const vb = sort.key === "risk" ? rankRisk(b.risk) : b[sort.key];
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

  const handleChainChange = (newChain: ChainKey) => {
    setChain(newChain as ChainId);
  };

  return (
    <main>
      <HeroHeader
        title="Explore Yield Opportunities"
        subtitle="Find the best APR/APY on Stacks. Multichain coming soon."
        size="standard"
        pills={
          <ChainFilterPills
            defaultChain={chain as ChainKey}
            onChange={handleChainChange}
            sticky={false}
          />
        }
        kpis={
          <HeroKpiBar
            kpis={{
              avgApr7d: stats.avgAPR,
              totalTvlUsd: stats.sumTVL,
              results: stats.count,
            }}
          />
        }
      />

      <AnimatedFilterBar
        defaultRisk={risk === "Low" ? "low" : risk === "Medium" ? "medium" : risk === "High" ? "high" : "all"}
        defaultSort={`${sort.key === "tvlUsd" ? "tvl" : sort.key}-${sort.dir}` as "apr-desc" | "apr-asc" | "apy-desc" | "apy-asc" | "tvl-desc" | "tvl-asc" | "risk-desc" | "risk-asc"}
        query={query}
        onQueryChange={setQuery}
        onRiskChange={(r) => {
          const riskMap = { "all": "all" as const, "low": "Low" as const, "medium": "Medium" as const, "high": "High" as const };
          setRisk(riskMap[r]);
        }}
        onSortChange={(s) => {
          const [sortKey, dir] = s.split("-") as [string, SortDir];
          const key = (sortKey === "tvl" ? "tvlUsd" : sortKey) as SortKey;
          setSort({ key, dir });
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">

        {!chainObj?.enabled && (
          <div
            className={`mb-6 rounded-md border border-[${colors.zinc[200]}] bg-[${colors.zinc[50]}] p-3 text-sm text-[${colors.zinc[700]}]`}
          >
            <span className="font-medium">Preview:</span> {chainObj?.label}{" "}
            support is coming soon. Cards are disabled.
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
              setQuery("");
              setRisk("all");
              setSort({ key: "apr", dir: "desc" });
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </main>
  );
}
