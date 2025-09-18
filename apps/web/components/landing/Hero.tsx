"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero({ progress = 0 }: { progress?: number }) {
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
            {/* Left column: H1 and subhead only */}
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
                Curated, verified yield opportunities. Clear APR/APY, transparent TVL, and instant risk scoring — review, decide, and deposit in one click.
              </motion.p>
            </div>
            
            {/* Right column: bullets, buttons, badges with top spacing */}
            <div className="relative pt-8">
              {/* Token dock placeholder */}
              <div id="token-dock" className="absolute right-4 top-4 h-[88px] w-[88px] rounded-xl bg-white/6 ring-1 ring-white/10 overflow-hidden z-10"></div>
              
              <motion.ul
                className="space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              >
                {[
                  "Curated opportunities: Hand-picked, audited pools (ALEX & Arkadiko)",
                  "Transparent metrics: APR/APY, TVL, instant risk score — no hidden variables",
                  "Deposit now (A): One-click; router (B) soon — non-custodial",
                ].map((txt, i) => (
                  <motion.li
                    key={i}
                    className="typo-bullets"
                    variants={{ hidden: { y: 8, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  >
                    <span className="text-orange-400">•</span>
                    <span>{txt}</span>
                  </motion.li>
                ))}
              </motion.ul>
              
              <motion.div
                className="mt-10 flex flex-wrap gap-4"
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
              
              <div className="typo-microcopy">
                Non-custodial flows — funds stay in your wallet. Smart-contract limits and per-tx caps protect users.
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="typo-badge">Audited pools</span>
                <span className="typo-badge">Non-custodial</span>
                <span className="typo-badge">Per-tx cap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
