"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import InsetBackgroundFx from "./_fx/InsetBackgroundFx";
import { useSectionInView } from "./_fx/useSectionInView";
import type { CTA } from "./InsetShowcase";

type Block = { title: string; body?: string; ctas?: CTA[] };

type Props = {
  kicker?: string;
  title?: string;
  body?: string;
  blocks?: Block[]; // two stacked content blocks
  rightSlot?: React.ReactNode;
  className?: string;
};

export default function InsetShowcaseAlt({
  kicker = "How It Works",
  title = "Route yield, not custody.",
  body,
  blocks,
  rightSlot,
  className,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useSectionInView<HTMLDivElement>({ threshold: 0.3, once: true });

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

  const fadeUpCls = useMemo(() => (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"), [inView]);
  const fadeInCls = useMemo(() => (inView ? "opacity-100" : "opacity-0"), [inView]);

  const twoBlocks: Block[] = blocks?.length ? blocks.slice(0, 2) : [
    { title: "Router (A)", body: "Smartly splits deposits across venues with min-out protection and per-tx caps." },
    { title: "Risk Engine", body: "Real-time health checks, APY normalization, and transparent risk scoring." },
  ];

  return (
    <section className={"relative mx-auto max-w-[1200px] " + (className ?? "")} aria-label={title || kicker}>
      <motion.div
        ref={((node: HTMLDivElement | null) => {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (wrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        })}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={[
          "relative group rounded-3xl md:rounded-[48px] overflow-hidden",
          "ring-1 ring-white/10 transition-all transform",
          "shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_40px_80px_rgba(0,0,0,.35)]",
          "bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(255,122,26,.14),transparent),linear-gradient(180deg,#0B0E13,#0B0E13_30%,#0E0C0A)]",
          "md:min-h-[520px]",
          "hover:ring-white/20 group-hover:-translate-y-px",
          "will-change-transform",
        ].join(" ")}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <InsetBackgroundFx parallax={parallax} reduceMotion={!!prefersReducedMotion} className={!prefersReducedMotion ? "inset-sweep" : undefined} />

        <div className="relative grid grid-cols-12 gap-y-10 lg:gap-y-0 lg:gap-x-10 py-14 md:py-20">
          <div className="col-span-12 lg:col-span-6 py-0 px-6 md:px-10">
            {kicker && (
              <div className={["text-sm uppercase tracking-[.18em] text-white/60", prefersReducedMotion ? "" : fadeInCls, "transition-all duration-300"].join(" ")}>{kicker}</div>
            )}
            {title && (
              <h2 className={["mt-3 font-semibold text-white tracking-tight text-5xl md:text-6xl", prefersReducedMotion ? "" : fadeUpCls, "transition-all duration-300"].join(" ")}>{title}</h2>
            )}
            {body && (
              <p className={["mt-5 text-base md:text-lg text-white/80 max-w-prose", prefersReducedMotion ? "" : fadeUpCls, "transition-all duration-300"].join(" ")} style={{ transitionDelay: !prefersReducedMotion ? "70ms" : undefined }}>
                {body}
              </p>
            )}

            <div className="mt-8 grid gap-6">
              {twoBlocks.map((b, i) => (
                <div
                  key={i}
                  className={["rounded-2xl ring-1 ring-white/10 bg-white/5", "p-5 md:p-6", prefersReducedMotion ? "" : fadeUpCls, "transition-all duration-300"].join(" ")}
                  style={{ transitionDelay: !prefersReducedMotion ? `${70 * (i + 2)}ms` : undefined }}
                >
                  <h3 className="text-white text-xl md:text-2xl font-semibold tracking-tight">{b.title}</h3>
                  {b.body && <p className="mt-2 text-white/80 text-sm md:text-base">{b.body}</p>}
                  {b.ctas && b.ctas.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {b.ctas.map((cta, j) => (
                        <a
                          key={cta.href + j}
                          href={cta.href}
                          className={[
                            "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium",
                            cta.variant === "ghost"
                              ? "text-white/90 ring-1 ring-white/20 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40 focus-visible:ring-offset-black/20"
                              : "text-black bg-white hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30 focus-visible:ring-offset-white/10",
                            "transition-colors",
                          ].join(" ")}
                        >
                          {cta.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 p-6 md:p-10">
            <motion.div
              className="will-change-transform"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, filter: "blur(2px)" }}
              animate={inView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              {rightSlot ?? (
                <div className="h-[320px] md:h-[420px] rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur flex items-center justify-center text-white/70">
                  Secondary visual / chart
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
