import React from "react";
import { opportunities, CHAINS, RISK_COLORS } from "../mock.js";
import { Card } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.jsx";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";

export default function Opportunities() {
  const [query, setQuery] = React.useState("");
  const [risk, setRisk] = React.useState("all");
  const [chain, setChain] = React.useState("stacks");
  const navigate = useNavigate();

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

  const chainObj = CHAINS.find((c) => c.id === chain);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[Sora] text-2xl text-zinc-900">Opportunities</h1>
          <p className="mt-2 max-w-2xl text-zinc-600">
            Normalized APR/APY, risk labels, and freshness. Multi-chain preview clearly disabled.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            placeholder="Search protocol or pair"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risks</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Tabs value={chain} onValueChange={setChain}>
          <TabsList>
            {CHAINS.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>{c.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {!chainObj?.enabled && (
        <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
          <span className="font-medium">Preview:</span> {chainObj?.label} support is coming soon. Cards are disabled.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {filtered.map((o) => {
          const disabled = !CHAINS.find((c) => c.id === o.chain)?.enabled;
          return (
            <Card key={o.id} className={`relative overflow-hidden border-white/40 bg-white/60 p-5 backdrop-blur-2xl ${disabled ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-500">{o.protocol}</div>
                  <div className="mt-1 text-lg font-medium text-zinc-900">{o.pair}</div>
                </div>
                <Badge className={`${RISK_COLORS[o.risk]} border`}>{o.risk}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div><div className="text-zinc-500">APR</div><div className="text-zinc-900">{o.apr}%</div></div>
                <div><div className="text-zinc-500">APY</div><div className="text-zinc-900">{o.apy}%</div></div>
                <div><div className="text-zinc-500">TVL</div><div className="text-zinc-900">${(o.tvlUsd/1_000_000).toFixed(2)}M</div></div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <div>Last updated {o.lastUpdated}</div>
                <div className="rounded-full bg-zinc-100 px-2 py-0.5">{o.chain}</div>
              </div>

              <div className="mt-5">
                {disabled ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button disabled variant="secondary" className="w-full">
                            View details
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Coming soon on {CHAINS.find(c=>c.id===o.chain)?.label}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => navigate(`/opportunities/${o.id}`)}>
                    View details
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 flex items-start gap-2 text-xs text-zinc-600">
        <Info size={14} />
        <p>
          NFA. Data is mocked for demo. Actual adapter-backed data and router (B) integration coming next.
        </p>
      </div>
    </div>
  );
}