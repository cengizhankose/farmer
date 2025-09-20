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
  logoUrl?: string;
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
        console.log("🚀 ~ load ~ resp:", resp)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const ops: CardOpportunity[] = Array.isArray(json.items) ? json.items : [];
        console.log("🚀 ~ load ~ ops:", ops)

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
            // Always use local Arkadiko logo to avoid broken/blank logos
            logoUrl: o.protocol.toLowerCase() === 'arkadiko'
              ? '/logos/arkadiko.svg'
              : (o as unknown as { logoUrl?: string }).logoUrl,
            apr: Number(o.apr),
            apy: Number(o.apy),
            tvl: Math.round((o.tvlUsd / 1_000_000) * 10) / 10,
            lastUpdated: o.lastUpdated,
            source: o.source || 'live',
          };
        });

        if (!mounted) return;
        setItems(mapped);
      } catch {
        if (!mounted) return;
        // No mock fallback outside portfolio: render nothing on failure
        setItems([]);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const data = items || [];
  const row1 = data.slice(0, Math.ceil(data.length / 2));
  const row2 = data.slice(Math.ceil(data.length / 2));

  const renderRow = (row: CardItem[], direction: "left" | "right") => {
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
                  className="absolute grid place-items-center"
                  style={{
                    top: '-3px',
                    left: '-3px',
                    width: `46px`,
                    height: `46px`,
                    background: 'var(--badge-lilac)',
                    borderRadius: '18px 0px 18px 0px',
                    boxShadow: '0 4px 10px rgba(0,0,0,.06)',
                    overflow: 'hidden'
                  }}
                  title={it.protocol}
                  aria-hidden
                >
                  {it.protocol.toLowerCase() === 'arkadiko' ? (
                    // Force local Arkadiko logo (no letter fallback)
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/logos/arkadiko.svg"
                      alt="Arkadiko logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : it.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.logoUrl}
                      alt={it.protocol}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-sm md:text-base font-semibold" style={{ color: it.color }}>
                      {it.letter}
                    </span>
                  )}
                  {/* Chain mini-badge */}
                  {/* Chain mini-badge removed by request */}
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
                          decimals={2}
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
                          decimals={2}
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
                          decimals={2}
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
