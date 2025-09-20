"use client";
import React from "react";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { colors } from "@/lib/colors";

export type RiskFilter = "all" | "Low" | "Medium" | "High";

export type SortKey = "apr" | "apy" | "tvlUsd" | "risk";
export type SortDir = "asc" | "desc";

export const MarketFilters: React.FC<{
  query: string;
  setQuery: (v: string) => void;
  risk: RiskFilter;
  setRisk: (v: RiskFilter) => void;
  sort: { key: SortKey; dir: SortDir };
  setSort: (s: { key: SortKey; dir: SortDir }) => void;
}> = ({ query, setQuery, risk, setRisk, sort, setSort }) => {
  const [riskOpen, setRiskOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  const closeAll = () => { setRiskOpen(false); setSortOpen(false); };

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('[data-dropdown-root]')) {
        closeAll();
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:w-full">
      {/* Search left */}
      <div className="md:flex-1 md:max-w-xs">
        <Input placeholder="Search protocol or pair" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full" />
      </div>

      {/* Risk and Sort right */}
      <div className="flex gap-3">
        {/* Risk dropdown */}
        <div className="relative" data-dropdown-root>
          <Select value={risk}>
            <SelectTrigger className="w-full md:w-36" onClick={(e) => { e.stopPropagation(); setRiskOpen((v) => !v); setSortOpen(false); }}>
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            {riskOpen && (
              <div className="absolute z-50 mt-2 w-full">
                <SelectContent>
                  {(["all", "Low", "Medium", "High"] as RiskFilter[]).map((v) => (
                    <SelectItem key={v} value={v} onSelect={(val) => { setRisk(val as RiskFilter); setRiskOpen(false); }}>
                      {v === "all" ? "All risks" : v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </div>
            )}
          </Select>
        </div>

        {/* Sort dropdown */}
        <div className="relative" data-dropdown-root>
          <Select value={`${sort.key}:${sort.dir}`}>
            <SelectTrigger className="w-full md:w-40" onClick={(e) => { e.stopPropagation(); setSortOpen((v) => !v); setRiskOpen(false); }}>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            {sortOpen && (
              <div className="absolute z-50 mt-2 w-full">
                <SelectContent>
                  {([
                    ["apr", "APR"],
                    ["apy", "APY"],
                    ["tvlUsd", "TVL"],
                    ["risk", "Risk"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <div key={key} className="px-1">
                      <div className={`px-2 pb-1 pt-2 text-[${colors.zinc[500]}]`}>{label}</div>
                      <SelectItem value={`${key}:desc`} onSelect={() => { setSort({ key, dir: "desc" }); setSortOpen(false); }}>High → Low</SelectItem>
                      <SelectItem value={`${key}:asc`} onSelect={() => { setSort({ key, dir: "asc" }); setSortOpen(false); }}>Low → High</SelectItem>
                    </div>
                  ))}
                </SelectContent>
              </div>
            )}
          </Select>
        </div>
      </div>
    </div>
  );
};
