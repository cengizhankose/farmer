import React from "react";
import Link from "next/link";
import { ScrollOrchestrator } from "@/components/ScrollOrchestrator";
import { CardsGrid } from "@/components/Cards";
import { motion } from "framer-motion";


export default function Landing() {
  return (
    <div className="relative">
      <div
        style={{
          background: 'var(--scene-bg, var(--grad-hero))',
        }}
      >
        <ScrollOrchestrator
          heightPerSceneVh={120}
          tailVh={30}
          scenes={[
            {
              id: "hero",
              start: 0.0,
              end: 0.24,
              theme: "dark",
              bg: 'var(--grad-hero)',
              render: (p) => (
                <section className="relative h-full">
                  <div className="mx-auto flex h-full items-center max-w-6xl px-6">
                    <div className="relative w-full overflow-hidden rounded-[28px] ring-1 ring-white/10 p-8 md:p-12 grad-breathe graph-bg noise-overlay">
                      <div
                        className="relative grid grid-cols-1 items-start gap-10 md:grid-cols-2"
                        style={{
                          transform: `translateY(${p * 10}px)`,
                          transition: "transform 120ms linear",
                        }}
                      >
                        <div>
                          <motion.h1
                            className="typo-h1-hero"
                            aria-label="Build yield on Stacks — beautifully"
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: { transition: { staggerChildren: 0.03 } },
                            }}
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
                              <motion.li key={i} className="typo-bullets" variants={{ hidden: { y: 8, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
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
                            Non-custodial flows — funds stay in your wallet. 
                            Smart-contract limits and per-tx caps protect users.
                          </div>
                          <div className="mt-6 flex flex-wrap gap-2">
                            <span className="typo-badge">Audited pools</span>
                            <span className="typo-badge">Non-custodial</span>
                            <span className="typo-badge">Per-tx cap</span>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="h-80 w-full rounded-2xl bg-white/10 ring-1 ring-white/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ),
            },
            {
              id: "why",
              start: 0.24,
              end: 0.66,
              theme: "dark",
              bg: 'var(--grad-why)',
              render: (p) => (
                <section className="h-full">
                  <div className="mx-auto flex h-full max-w-6xl items-center px-6">
                    <div
                      className="w-full"
                      style={{
                        transform: `translateY(${(1 - p) * 20 - 10}px)`,
                        transition: "transform 120ms linear",
                      }}
                    >
                      <div className="mb-8 text-center">
                        <div className="typo-eyebrow">
                          Who Are We?
                        </div>
                        <h2 className="typo-h2">
                          A pragmatic team building production-grade yield tooling
                        </h2>
                        <p className="typo-lead mt-4">
                          We build for users who care about returns and safety.
                        </p>
                        <p className="typo-body max-w-3xl mx-auto">
                          We are developers experienced in React, mobile (RN) and blockchain infrastructure. 
                          Our goal is to provide open and secure products that make capital efficient in DeFi. 
                          Security, transparency and user control are at the forefront of every decision.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12" role="list">
                        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/10">
                          <div className="typo-card-metric text-3xl mb-2">4</div>
                          <div className="typo-card-h">Core Engineers</div>
                          <div className="typo-card-p">Frontend, backend, smart-contract, UX specialists</div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/10">
                          <div className="typo-card-metric text-3xl mb-2">MVP→Prod</div>
                          <div className="typo-card-h">Track Record</div>
                          <div className="typo-card-p">Hackathon MVP to audited smart contracts</div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/10">
                          <div className="typo-card-metric text-3xl mb-2">24/7</div>
                          <div className="typo-card-h">Ops & Safety</div>
                          <div className="typo-card-p">Per-tx caps, unit tests, automated monitors</div>
                        </div>
                      </div>
                      
                      <div className="mb-8 text-center">
                        <div className="typo-eyebrow">
                          Why Choose Us
                        </div>
                        <h2 className="typo-h2">
                          Why Us
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {[
                          {
                            title: "Curated, not exhaustive",
                            subtitle: "Only solid, liquid and traceable opportunities — avoiding fuzzing and pump-and-dump risks."
                          },
                          {
                            title: "Transparent metrics",
                            subtitle: "See APR/APY, TVL, 24h volume, participant count and automatic risk score — the decision is entirely yours."
                          },
                          {
                            title: "Non-custodial by design",
                            subtitle: "Funds remain in your wallet; transactions redirect to the protocol with one click."
                          },
                          {
                            title: "Solution-oriented development",
                            subtitle: "Audit-ready contracts with unit tests, continuous monitoring, and developer-first UX."
                          }
                        ].map((it, i) => (
                          <div
                            key={i}
                            className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/10 hover:bg-white/15 transition-all hover:-translate-y-[2px]"
                          >
                            <div className="typo-card-h">
                              {it.title}
                            </div>
                            <div className="typo-card-p">
                              {it.subtitle}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ),
            },
            {
              id: "market",
              start: 0.66,
              end: 0.83,
              theme: "dark",
              bg: 'var(--grad-market)',
              render: (p) => (
                <section className="h-full">
                  <div className="mx-auto flex h-full max-w-6xl items-center px-6">
                    <div
                      className="w-full text-center"
                      style={{
                        transform: `translateY(${(1 - p) * 20}px)`,
                        transition: "transform 120ms linear",
                      }}
                    >
                      <div className="typo-eyebrow">
                        Market Environment
                      </div>
                      <h2 className="typo-h2">
                        Built with awareness of liquidity, risk, and opportunity
                      </h2>
                      <p className="typo-body max-w-3xl mx-auto mt-6">
                        High APR in DeFi is often illusory. We match high returns with solid liquidity, 
                        street-tested mechanics, and risk measurement. We've built an infrastructure that 
                        tracks the market and responds immediately to anomalies.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/10">
                          <h3 className="typo-card-h">Why TVL matters</h3>
                          <p className="typo-card-p">TVL → slippage & withdrawal safety</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/10">
                          <h3 className="typo-card-h">Why volume matters</h3>
                          <p className="typo-card-p">High turnover = easy entry/exit</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/10">
                          <h3 className="typo-card-h">Why risk scoring</h3>
                          <p className="typo-card-p">Risk explained with sub-metrics, not a single number</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ),
            },
            {
              id: "cards",
              start: 0.83,
              end: 1.0,
              theme: "dark",
              bg: 'var(--grad-why)',
              render: (p) => (
                <section className="h-full">
                  <div className="mx-auto flex h-full max-w-6xl items-center px-6">
                    <div
                      className="w-full"
                      style={{
                        transform: `translateY(${(1 - p) * 20}px)`,
                        transition: "transform 120ms linear",
                      }}
                    >
                      <div className="text-center mb-8">
                        <div className="typo-eyebrow">
                          Live Opportunities
                        </div>
                        <h2 className="typo-h2">
                          Real-time yield opportunities flowing through the ecosystem
                        </h2>
                      </div>
                      <div className="marquee-group"><CardsGrid progress={p} /></div>
                    </div>
                  </div>
                </section>
              ),
            },
          ]}
        />
        <div style={{ height: "16vh", background: "var(--scene-bg)" }} />
      </div>
    </div>
  );
}
