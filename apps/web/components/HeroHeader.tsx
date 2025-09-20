"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  size?: "compact" | "standard" | "large";
  ctaText?: string;
  onCta?: () => void;
  className?: string;
  children?: React.ReactNode;
  pills?: React.ReactNode;
  kpis?: React.ReactNode;
};

const sizeToMinH: Record<NonNullable<Props["size"]>, string> = {
  compact: "min-h-[12vh]",
  standard: "min-h-[20vh]",
  large: "min-h-[25vh]",
};

export function HeroHeader({
  title,
  subtitle,
  size = "standard",
  ctaText,
  onCta,
  className,
  children,
  pills,
  kpis,
}: Props) {
  const reduceMotion = useReducedMotion();

  const containerClasses = [
    "graph-bg graph-density-normal",
    "relative isolate",
    sizeToMinH[size],
    "flex items-center",
    "text-center",
    className ?? "",
  ].join(" ");

  const titleAnim = reduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35 },
    };

  const subtitleAnim = reduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay: 0.05 },
    };

  const ctaAnim = reduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 4 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay: 0.1 },
    };

  return (
    <section className={containerClasses}>
      <div className="relative z-10 w-full">
        <div className="mx-auto max-w-3xl px-10 py-10 sm:py-4">
          <motion.h1
            className="font-display text-white text-4xl sm:text-5xl md:text-6xl
              tracking-tight"
            {...titleAnim}
          >
            {title}
          </motion.h1>
          {subtitle ? (
            <motion.p
              className="mt-1 text-neutral-200 text-base sm:text-lg"
              {...subtitleAnim}
            >
              {subtitle}
            </motion.p>
          ) : null}
          {ctaText ? (
            <motion.div className="mt-2" {...ctaAnim}>
              <button
                type="button"
                onClick={onCta}
                className={[
                  "inline-flex items-center justify-center",
                  "rounded-full px-5 py-2.5",
                  "bg-white/10 text-white backdrop-blur",
                  "ring-1 ring-white/30 hover:bg-white/15",
                  "transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
                ].join(" ")}
                aria-label={ctaText}
              >
                {ctaText}
              </button>
            </motion.div>
          ) : null}
        </div>

        {/* Chain filter pills */}
        {(pills || children) && (
          <motion.div
            className="relative z-10 w-full mt-1"
            initial={reduceMotion ? {} : { opacity: 0, y: 4 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? {}
                : { duration: 0.3, ease: "easeOut", delay: 0.15 }
            }
          >
            {pills || children}
          </motion.div>
        )}

        {/* KPI Bar */}
        {kpis && (
          <motion.div
            className="relative z-10 w-full mt-4"
            initial={reduceMotion ? {} : { opacity: 0, y: 6 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? {}
                : { duration: 0.3, ease: "easeOut", delay: 0.2 }
            }
          >
            {kpis}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default HeroHeader;
