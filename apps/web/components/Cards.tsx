"use client";
import React from "react";
import CountUp from "react-countup";

// Horizontal marquee with two rows flowing in opposite directions.
// Card count reduced by half (12).
export const CardsGrid: React.FC<{ progress?: number }> = ({ progress = 0 }) => {
  const [hasAnimated, setHasAnimated] = React.useState(false);
  
  // Trigger animation only once when cards become visible (progress > 0.1)
  React.useEffect(() => {
    if (progress > 0.1 && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [progress, hasAnimated]);
  const total = 12;
  const items = React.useMemo(() => Array.from({ length: total }).map((_, i) => {
    const protocols = ["ALEX", "Arkadiko", "Bitflow", "StackSwap"];
    const pairs = ["STX/USDA", "STX/DIKO", "STX/ALEX", "USDA/ALEX"];
    const risks = ["Low", "Medium", "High"];
    const colors = ["#6C7BFF", "#22C55E", "#F97316", "#8B5CF6"];
    
    const protocol = protocols[i % protocols.length];
    const pair = pairs[i % pairs.length];
    const risk = risks[i % risks.length];
    const color = colors[i % colors.length];
    const letter = protocol[0];
    
    const aprValue = parseFloat((8 + Math.random() * 15).toFixed(1));
    const apyValue = parseFloat((9 + Math.random() * 18).toFixed(1));
    const tvlValue = parseFloat((0.5 + Math.random() * 2).toFixed(1));
    
    return {
      id: i,
      protocol,
      pair,
      risk,
      color,
      letter,
      apr: aprValue,
      apy: apyValue,
      tvl: tvlValue
    };
  }), []);

  const row1 = items.slice(0, Math.ceil(items.length / 2));
  const row2 = items.slice(Math.ceil(items.length / 2));

  const renderRow = (row: typeof items, direction: "left" | "right") => {
    // Duplicate content for seamless loop
    const doubled = [...row, ...row];
    const animClass = direction === "right" ? "animate-marquee-rev" : "animate-marquee";
    return (
      <div
        className="relative mb-4 flex overflow-hidden"
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
                className="flow-card group relative mr-4 last:mr-0 w-[280px] shrink-0 rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] shadow-sm p-5 md:p-6 transition hover:-translate-y-1 hover:shadow-md"
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
                    <span>Last updated 5m</span>
                    <span className="text-zinc-400">·</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                      source: demo
                    </span>
                  </div>
                  <div className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                    Stacks
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    className="w-full text-white hover:bg-[var(--brand-orange-700)] transition-colors rounded-md py-2 px-4 text-sm font-medium"
                    style={{ backgroundColor: 'var(--brand-orange)' }}
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
    <div className="relative overflow-hidden">
      {renderRow(row1, "left")}
      {renderRow(row2, "right")}
    </div>
  );
};
