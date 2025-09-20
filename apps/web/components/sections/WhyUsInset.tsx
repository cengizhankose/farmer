"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import InsetBackgroundFx from "./_fx/InsetBackgroundFx";

// fade rise inline via initial/animate to satisfy TS types

// Badge animation helper (replaces variants function to satisfy TS types)
const badgeAnim = (i: number) => ({
  opacity: 1,
  y: 0,
  scale: 1,
  transition: { delay: i * 0.06, duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
      <path strokeWidth="1.8" d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  );
}

function LimitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
      <path d="M8 16l8-8" strokeWidth="1.8" />
    </svg>
  );
}

export default function WhyUsInset() {
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(rootRef, { amount: 0.3, once: true });

  // Subtle parallax for background fog; disabled on PRM
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setParallax({ x: e.clientX - cx, y: e.clientY - cy });
  }, [prefersReducedMotion]);
  const onMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    setParallax({ x: 0, y: 0 });
  }, [prefersReducedMotion]);

  const badges = useMemo(
    () => [
      { key: "audited", label: "Audited Pools", icon: null as React.ReactNode },
      { key: "noncustodial", label: "Non-custodial", icon: <ShieldIcon className="h-4 w-4" /> },
      { key: "pertx", label: "Per-tx Cap", icon: <LimitIcon className="h-4 w-4" /> },
    ],
    []
  );

  return (
    <section className="relative mx-auto max-w-[1200px]">
      <motion.div
        ref={(node: HTMLDivElement | null) => {
          rootRef.current = node;
          wrapRef.current = node;
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={[
          "relative overflow-hidden",
          "rounded-[36px] md:rounded-[44px] ring-1 ring-white/10",
          "bg-[linear-gradient(180deg,rgba(14,12,10,.92),rgba(14,12,10,.86))]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_40px_80px_rgba(0,0,0,.35)]",
          "will-change-transform",
        ].join(" ")}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        aria-labelledby="whyus-title"
      >
        <InsetBackgroundFx parallax={parallax} reduceMotion={!!prefersReducedMotion} className={!prefersReducedMotion ? "inset-sweep" : undefined} />

        <div className="relative px-6 md:px-10 py-10 md:py-14">
          {/* Top row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Why Us</div>
              <h2 id="whyus-title" className="mt-2 text-4xl md:text-5xl text-white tracking-tight font-semibold">
                Why Us
              </h2>
              <p className="mt-3 text-white/80 max-w-prose">
                We focus on clarity and safety: curated pools, transparent metrics, non-custodial flows, and developer-grade discipline.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-wrap items-center gap-3">
                {badges.map((b, i) => (
                  <motion.span
                    key={b.key}
                    className={[
                      "inline-flex items-center gap-2 rounded-full",
                      "bg-white/10 ring-1 ring-white/15 px-3 py-1.5 text-sm text-white/90 backdrop-blur",
                      "transition-all",
                      !prefersReducedMotion ? "hover:-translate-y-px hover:ring-white/25" : "",
                      !prefersReducedMotion ? "breath" : "",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20",
                    ].join(" ")}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={inView ? badgeAnim(i) : undefined}
                  >
                    {b.key === "audited" ? (
                      <span className="relative inline-flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
                      </span>
                    ) : (
                      <span className="text-white/80">{b.icon}</span>
                    )}
                    <span>{b.label}</span>
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          {/* Lower grid: 4 cards */}
          <motion.div
            className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7"
            initial="hidden"
            animate={inView ? "show" : undefined}
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {[
              {
                title: "Curated, not exhaustive",
                body:
                  "Only solid, liquid and traceable opportunities — avoiding fuzzing and pump-and-dump risks.",
              },
              {
                title: "Transparent metrics",
                body:
                  "See APR/APY, TVL, 24h volume, participant count and automatic risk score — the decision is entirely yours.",
              },
              {
                title: "Non-custodial by design",
                body: "Funds remain in your wallet; transactions redirect to the protocol with one click.",
              },
              {
                title: "Solution-oriented development",
                body:
                  "Audit-ready contracts with unit tests, continuous monitoring, and developer-first UX.",
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title + idx}
                className="group relative z-0 h-full rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md p-5 md:p-6 transition-transform overflow-hidden isolation-isolate"
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12, filter: "blur(2px)" }}
                animate={inView ? { opacity: 1, y: 0, filter: "blur(0)", transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } : undefined}
              >
                {/* Accent line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
                {/* Sweep highlight */}
                {!prefersReducedMotion && (
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <span
                      className="absolute -inset-y-4 -left-1/2 w-[60%] rotate-12 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                      style={{ transition: "transform 420ms ease", transform: "translateX(-30%)" }}
                    />
                  </span>
                )}

                <div className="relative">
                  <div className="text-white font-medium">{card.title}</div>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/80">{card.body}</p>
                </div>

                {/* Local hover style to move sweep across */}
                <style jsx>{`
                  .group:hover > span > span { transform: translateX(140%); }
                `}</style>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Local breathing keyframes for badges */}
      {!prefersReducedMotion && (
        <style jsx>{`
          @keyframes breath { 0%, 100% { opacity: 1 } 50% { opacity: 0.9 } }
          .breath { animation: breath 6s ease-in-out infinite; }
        `}</style>
      )}
    </section>
  );
}
