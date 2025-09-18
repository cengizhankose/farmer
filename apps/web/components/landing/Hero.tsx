"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero({ progress = 0 }: { progress?: number }) {
  return (
    <section className="relative h-full">
      <div className="mx-auto flex h-full items-center max-w-6xl px-6">
        <div className="relative w-full overflow-hidden rounded-[28px] ring-1 ring-white/10 p-8 md:p-12 grad-breathe graph-bg noise-overlay">
          <div
            className="relative grid grid-cols-1 items-start gap-10 md:grid-cols-2"
            style={{
              transform: `translateY(${progress * 10}px)`,
              transition: "transform 120ms linear",
            }}
          >
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
                    variants={{ hidden: { y: 8, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p
                className="typo-subhead mt-6"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                Curated, verified, and carefully selected yield opportunities.
                Clear APR/APY, transparent TVL and risk scoring to quickly review,
                decide, and deposit with one click.
              </motion.p>
              <motion.ul
                className="mt-8 space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {[
                  "Curated opportunities: Hand-picked, audited pools like ALEX & Arkadiko",
                  "Clear metrics: APR/APY, TVL and instant risk score — no hidden variables",
                  "Deposit now (A) — router (B) soon: One-click deposit; non-custodial routing coming",
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
                  className="typo-btn-primary typo-focus"
                  aria-label="Explore yield opportunities"
                >
                  Explore opportunities →
                </Link>
                <Link
                  href="/portfolio"
                  className="typo-btn-secondary typo-focus"
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
            <div className="relative flex flex-col items-center justify-center gap-6">
              <div className="h-64 w-full rounded-2xl bg-white/10 ring-1 ring-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
