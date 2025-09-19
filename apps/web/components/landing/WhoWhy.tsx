"use client";
import React from "react";
import { motion } from "framer-motion";

export function WhoWhy({ progress = 0 }: { progress?: number }) {
  return (
    <section className="h-full">
      <div className="mx-auto flex h-full max-w-6xl items-center px-6 pt-20">
        <div
          className="w-full"
          style={{
            transform: `translateY(${(1 - progress) * 20 - 10}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <div className="mb-5 text-center">
            <div className="typo-eyebrow">Who Are We?</div>
            <h2 className="typo-h2">
              A pragmatic team building production-grade yield tooling
            </h2>
            <p className="text-white/85 text-lg leading-relaxed mt-3">
              Built for yield. Built for trust. Built for speed.
            </p>
            <p className="text-white/80 text-base leading-relaxed max-w-3xl mx-auto">
              We're here to make your life easier and safer.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-9"
            role="list"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {[
              {
                metric: "2",
                title: "Founders & Engineers",
                desc: "Frontend + UI/UX — Backend + Smart Contract",
              },
              {
                metric: "MVP → Prod",
                title: "Hackathon → Global",
                desc: "Born in hackathons, now scaling worldwide",
              },
              {
                metric: "24/7",
                title: "Built for Trust",
                desc: "Deep analysis, risk scoring, instant & secure execution",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                className="rounded-2xl card-why p-6"
                variants={{
                  hidden: { y: 10, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <div className="typo-card-metric text-3xl mb-2">{c.metric}</div>
                <div className="typo-card-h">{c.title}</div>
                <div className="typo-card-p">{c.desc}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mb-5 text-center">
            <div className="typo-eyebrow">Why Choose Us</div>
            <h2 className="typo-h2">Why Us</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {[
              {
                title: "Curated, not exhaustive",
                subtitle:
                  "Only solid, liquid and traceable opportunities — avoiding fuzzing and pump-and-dump risks.",
              },
              {
                title: "Transparent metrics",
                subtitle:
                  "See APR/APY, TVL, 24h volume, participant count and automatic risk score — the decision is entirely yours.",
              },
              {
                title: "Non-custodial by design",
                subtitle:
                  "Funds remain in your wallet; transactions redirect to the protocol with one click.",
              },
              {
                title: "Solution-oriented development",
                subtitle:
                  "Audit-ready contracts with unit tests, continuous monitoring, and developer-first UX.",
              },
            ].map((it, i) => (
              <motion.div
                key={i}
                className="rounded-2xl card-why p-6"
                variants={{
                  hidden: { y: 10, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <div className="typo-card-h">{it.title}</div>
                <div className="typo-card-p">{it.subtitle}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
