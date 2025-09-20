"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroRightChart from "@/components/HeroRightChart";
import { Badge } from "@/components/ui/primitives";
import { generateMockSeries, kpiFromSeries } from "@/lib/mock/series";

export function Hero({ progress = 0 }: { progress?: number }) {
  // Mock series for landing hero chart (deterministic seed for stability)
  const series = React.useMemo(() => generateMockSeries(60, 1337), []);
  const { apr7d, tvl, netPnl } = React.useMemo(() => kpiFromSeries(series), [series]);
  return (
    <section className="relative h-full">
      <div className="mx-auto flex h-full items-center max-w-6xl px-8 pt-20">
        <div className="relative w-full overflow-hidden rounded-[28px] ring-1 ring-white/10 px-8 py-16 md:py-18 grad-breathe graph-bg noise-overlay">
          <div
            className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            style={{
              transform: `translateY(${progress * 10}px)`,
              transition: "transform 120ms linear",
            }}
          >
            {/* Left column: H1, subcopy, badge, and actions */}
            <div>
              <motion.h1
                className="typo-h1-hero"
                aria-label="Build yield on Stacks — beautifully"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              >
                {"Build yield on Stacks — beautifully".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={{ 
                      hidden: { y: 8, opacity: 0 }, 
                      visible: { y: 0, opacity: 1 } 
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p
                className="text-white/85 text-lg leading-relaxed mt-6"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                Curated, detailed yield analysis. Clear data and instant risk scoring
              </motion.p>

              <motion.div
                className="mt-4"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Badge variant="outline" className="uppercase tracking-wide text-white border-white/30">one click deposit</Badge>
              </motion.div>

              <motion.div
                className="mt-8 flex flex-wrap gap-4"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="/opportunities"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium bg-[var(--brand-orange)] text-white typo-focus"
                  aria-label="Explore yield opportunities"
                >
                  Explore opportunities →
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium bg-white/10 text-white ring-1 ring-white/20 typo-focus"
                  aria-label="View your portfolio"
                >
                  View portfolio →
                </Link>
              </motion.div>

              <div className="typo-microcopy mt-4">
                Non-custodial flows — funds stay in your wallet. Smart-contract limits and per-tx caps protect users.
              </div>
            </div>
            
            {/* Right column: animated chart card */}
            <div className="relative pt-8">
              <HeroRightChart series={series} apr7d={apr7d} tvl={tvl} netPnl={netPnl} />
              <div id="token-dock" className="absolute right-4 top-4 h-[72px] w-[72px] rounded-xl bg-white/6 ring-1 ring-white/10 overflow-hidden z-10" aria-hidden></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
