"use client";
import React from "react";
import { useRouter } from "next/router";
import CountUp from "react-countup";
import { protocolLogo } from "@/lib/logos";

// Horizontal marquee with two rows flowing in opposite directions.
// Card count reduced by half (12).
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

type CardItem = {
  id: string | number;
  routeId: string;
  protocol: string;
  pair: string;
  risk: "Low" | "Medium" | "High";
  color: string;
  letter: string;
  apr: number;
  apy: number;
  tvl: number; // in millions
  lastUpdated?: string;
  source?: "live" | "demo";
};

export const CardsGrid: React.FC<{ progress?: number }> = ({ progress = 0 }) => {
  const router = useRouter();
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const [items, setItems] = React.useState<CardItem[] | null>(null);
  const total = 12;
  
  // Trigger animation only once when cards become visible (progress > 0.1)
  React.useEffect(() => {
    if (progress > 0.1 && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [progress, hasAnimated]);

  // Load real opportunities for marquee (top N)
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const resp = await fetch('/api/opportunities');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const ops: CardOpportunity[] = Array.isArray(json.items) ? json.items : [];

        // Prefer top by TVL, then APR
        const top = ops
          .filter((o) => o.chain === 'stacks')
          .sort((a, b) => {
            const tvlDiff = b.tvlUsd - a.tvlUsd;
            if (tvlDiff !== 0) return tvlDiff;
            return b.apr - a.apr;
          })
          .slice(0, total);

        const mapped: CardItem[] = top.map((o, i) => {
          const logo = protocolLogo(o.protocol);
          return {
            id: o.id || i,
            routeId: o.id,
            protocol: o.protocol,
            pair: o.pair,
            risk: o.risk,
            color: logo.fg,
            letter: logo.letter,
            apr: Number(o.apr.toFixed(1)),
            apy: Number(o.apy.toFixed(1)),
            tvl: Math.round((o.tvlUsd / 1_000_000) * 10) / 10,
            lastUpdated: o.lastUpdated,
            source: o.source || 'live',
          };
        });

        if (!mounted) return;
        setItems(mapped);
      } catch (_e) {
        // Fallback to a static set if API fails
        if (!mounted) return;
        const protocols = ["ALEX", "Arkadiko", "Bitflow", "StackSwap"];
        const pairs = ["STX/USDA", "STX/DIKO", "STX/ALEX", "USDA/ALEX"];
        const risks: Array<CardItem["risk"]> = ["Low", "Medium", "High"];
        const staticAPRs = [12.3, 8.7, 15.2, 11.5, 9.8, 13.1, 10.4, 16.7, 14.2, 7.9, 11.8, 13.5];
        const staticAPYs = [13.1, 9.2, 16.8, 12.3, 10.5, 14.7, 11.1, 18.2, 15.6, 8.4, 12.8, 14.9];
        const staticTVLs = [1.2, 0.8, 2.1, 1.5, 0.9, 1.7, 1.1, 2.3, 1.9, 0.7, 1.4, 1.8];
        const fallback: CardItem[] = Array.from({ length: total }).map((_, i) => {
          const protocol = protocols[i % protocols.length];
          const pair = pairs[i % pairs.length];
          const risk = risks[i % risks.length];
          const logo = protocolLogo(protocol);
          return {
            id: i,
            routeId: i % 2 === 0 ? "alex-stx-usda" : "arkadiko-stx-diko",
            protocol,
            pair,
            risk,
            color: logo.fg,
            letter: logo.letter,
            apr: staticAPRs[i],
            apy: staticAPYs[i],
            tvl: staticTVLs[i],
            lastUpdated: '5m',
            source: 'demo',
          };
        });
        setItems(fallback);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const data = items || [];
  const row1 = data.slice(0, Math.ceil(data.length / 2));
  const row2 = data.slice(Math.ceil(data.length / 2));

  const renderRow = (row: typeof items, direction: "left" | "right") => {
    // Duplicate content for seamless loop
    const doubled = [...row, ...row];
    const animClass = direction === "right" ? "animate-marquee-rev" : "animate-marquee";
    return (
      <div
        className="relative mb-8 flex overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className={`flex w-max ${animClass}`}>
          {doubled.map((it, idx) => {
            const riskColors = {
              Low: "bg-emerald-100 text-emerald-800",
              Medium: "bg-amber-100 text-amber-900",
              High: "bg-rose-100 text-rose-800",
            };
            
            return (
              <div
                key={`${it.id}-${idx}`}
                className="flow-card group relative mr-4 last:mr-0 w-[280px] shrink-0 rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] shadow-sm p-5 md:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Curved corner logo badge */}
                <div
                  className="absolute -top-3 -left-3 h-12 w-12 md:h-14 md:w-14 grid place-items-center"
                  style={{ 
                    background: 'var(--badge-lilac)', 
                    borderRadius: '16px',
                    boxShadow: '0 4px 10px rgba(0,0,0,.06)',
                  }}
                  title={it.protocol}
                  aria-hidden
                >
                  <span className="text-sm md:text-base font-semibold" style={{ color: it.color }}>
                    {it.letter}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="ml-6">
                    <div className="text-sm font-semibold text-zinc-600">
                      {it.protocol}
                    </div>
                    <div className="mt-1 text-base md:text-lg font-bold text-zinc-900">
                      {it.pair}
                    </div>
                  </div>
                  <div className={`${riskColors[it.risk as keyof typeof riskColors]} border-0 text-xs font-medium px-2 py-1 rounded-md`}>
                    {it.risk}
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">APR</div>
                    <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
                      {hasAnimated ? (
                        <CountUp 
                          end={it.apr} 
                          duration={1.2} 
                          decimals={1}
                          suffix="%" 
                          preserveValue
                        />
                      ) : (
                        `${it.apr}%`
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">APY</div>
                    <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
                      {hasAnimated ? (
                        <CountUp 
                          end={it.apy} 
                          duration={1.4} 
                          decimals={1}
                          suffix="%" 
                          preserveValue
                        />
                      ) : (
                        `${it.apy}%`
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">TVL</div>
                    <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
                      {hasAnimated ? (
                        <CountUp 
                          end={it.tvl} 
                          duration={1.6} 
                          decimals={1}
                          prefix="$"
                          suffix="M"
                          preserveValue
                        />
                      ) : (
                        `$${it.tvl}M`
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-600">
                  <div className="flex items-center gap-1">
                    <span>Last updated {it.lastUpdated || '5m'}</span>
                    <span className="text-zinc-400">·</span>
                    {it.source && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                        source: {it.source}
                      </span>
                    )}
                  </div>
                  <div className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                    Stacks
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    className="w-full text-white hover:bg-[var(--brand-orange-700)] transition-colors rounded-md py-2 px-4 text-sm font-medium"
                    style={{ backgroundColor: 'var(--brand-orange)' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/opportunities/${it.routeId}`);
                    }}
                  >
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden py-8">
      {renderRow(row1, "left")}
      {renderRow(row2, "right")}
    </div>
  );
};
