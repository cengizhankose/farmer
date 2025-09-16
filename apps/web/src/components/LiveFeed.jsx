import React, { useMemo } from "react";
import { Card } from "../components/ui/card.jsx";
import { opportunities } from "../mock.js";

/*
  LiveFeed
  - Tall card (3-4x previous height) with a masked continuous vertical feed
  - Uses duplicated list + CSS animation for infinite scroll
*/
export const LiveFeed = () => {
  const items = useMemo(() => {
    const base = opportunities.filter(o => o.chain === "stacks").map(o => ({
      title: `${o.protocol} — ${o.pair}`,
      sub: `${o.apr}% APR • ${o.apy}% APY • TVL $${(o.tvlUsd/1_000_000).toFixed(2)}M`,
      tag: o.risk,
    }));
    // pad to ensure smooth loop
    const extra = [
      { title: "Stacking DAO — STX", sub: "Yield strategy", tag: "Low" },
      { title: "Xverse — Wallet", sub: "Ecosystem", tag: "Low" },
      { title: "Restake — STX", sub: "Compounding", tag: "Med" },
      { title: "PlanBetter — Tools", sub: "Planning", tag: "Low" },
      { title: "Fast Pool v2 — STX", sub: "Liquidity", tag: "Med" },
      { title: "Fast Pool — STX", sub: "Liquidity", tag: "Med" },
    ];
    return [...base, ...extra];
  }, []);

  return (
    <Card className="relative h-[520px] overflow-hidden rounded-3xl border border-zinc-900/10 bg-white/55 p-0 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:h-[680px]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,1),rgba(255,255,255,0)_18%,rgba(255,255,255,0)_82%,rgba(255,255,255,1))]" />
      <div className="livefeed animate-liveFeed">
        {[...items, ...items].map((it, i) => (
          <div key={i} className="flex items-center justify-between border-b border-zinc-900/5 px-5 py-4">
            <div>
              <div className="font-medium text-zinc-900">{it.title}</div>
              <div className="text-xs text-zinc-500">{it.sub}</div>
            </div>
            <div className="rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs text-orange-700">{it.tag}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LiveFeed;