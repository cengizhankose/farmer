import React from "react";
import Link from "next/link";
import { ScrollOrchestrator } from "@/components/ScrollOrchestrator";
import { CardsGrid } from "@/components/Cards";
import { colors, buttonColors } from "../lib/colors";

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "secondary" | "default";
  }
) {
  const { className = "", variant = "default", ...rest } = props;
  const base =
    "inline-flex items-center justify-center rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-12 px-6";
  const variants: Record<string, string> = {
    default: `bg-[${buttonColors.primary.bg}] text-[${buttonColors.primary.text}] hover:bg-[${buttonColors.primary.hover}]`,
    outline: `border border-[${buttonColors.outline.border}] bg-[${buttonColors.outline.bg}] text-[${colors.zinc[900]}] hover:bg-[${buttonColors.outline.hover}]`,
    secondary: `bg-[${buttonColors.secondary.bg}] text-[${buttonColors.secondary.text}] hover:bg-[${buttonColors.secondary.hover}]`,
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest} />
  );
}

export default function Landing() {
  const whyItems = [
    {
      title: "Solution‑oriented development",
      subtitle: "Delivering pragmatic, resilient features for real users",
    },
    {
      title: "Market environment",
      subtitle: "Built with awareness of liquidity, risk, and opportunity",
    },
    {
      title: "Transparent payment",
      subtitle: "Clear fees and on‑chain paths — no hidden costs",
    },
    {
      title: "Sales",
      subtitle: "Value‑first communication with measurable outcomes",
    },
  ];

  return (
    <div className="relative">
      <div
        style={{
          background: `var(--scene-bg, ${colors.gradients.sceneBg})`,
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
              bg: colors.gradients.orangeToBlack,
              render: (p) => (
                <section className="relative h-full">
                  <div className="mx-auto flex h-full items-center max-w-7xl px-6">
                    <div className="relative w-full overflow-hidden rounded-[28px] bg-white/10 p-12 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-16">
                      <div
                        className={`absolute -left-16 -top-16 h-96 w-96 rounded-full bg-[${colors.radial.orangeGlow}]`}
                      />
                      <div
                        className={`absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[${colors.radial.darkGlow}]`}
                      />

                      <div
                        className="relative grid grid-cols-1 items-start gap-10 md:grid-cols-2"
                        style={{
                          transform: `translateY(${p * 10}px)`,
                          transition: "transform 120ms linear",
                        }}
                      >
                        <div>
                          <h1 className="font-display text-5xl font-semibold leading-tight text-white md:text-6xl">
                            Build yield on Stacks — beautifully
                          </h1>
                          <ul className="mt-6 space-y-3 text-[15px] text-white/80">
                            <li>• Curated opportunities: ALEX & Arkadiko</li>
                            <li>• Clear APR/APY, TVL, and risk</li>
                            <li>
                              • Deposit now (A) — one‑click router (B) soon
                            </li>
                          </ul>
                          <div className="mt-10 flex flex-wrap gap-4">
                            <Link href="/opportunities">
                              <Button
                                className="text-white hover:opacity-90"
                                style={{ backgroundColor: colors.orange[50] }}
                              >
                                Explore opportunities
                              </Button>
                            </Link>
                            <Link href="/portfolio">
                              <Button
                                variant="outline"
                                className="border-white bg-white text-zinc-900 hover:bg-gray-50"
                              >
                                View portfolio
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <div className="relative">
                          <div
                            className={`h-80 w-full rounded-2xl bg-gradient-to-b from-[${colors.white[60]}] to-[${colors.zinc[100]}]/60`}
                          />
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
              bg: colors.gradients.blackToAmber,
              render: (p) => (
                <section className="h-full">
                  <div className="mx-auto flex h-full max-w-7xl items-center px-6">
                    <div
                      className="w-full"
                      style={{
                        transform: `translateY(${(1 - p) * 20 - 10}px)`,
                        transition: "transform 120ms linear",
                      }}
                    >
                      <div className="mb-8">
                        <div className="text-sm uppercase tracking-wide text-white/70">
                          Who Are We?
                        </div>
                        <h2 className="mt-1 font-display text-3xl text-white">
                          Why Us
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {whyItems.map((it, i) => (
                          <div
                            key={i}
                            className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl"
                          >
                            <div className="font-display text-lg text-white">
                              {it.title}
                            </div>
                            <div className="mt-1 text-sm text-white/90">
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
              id: "cards",
              start: 0.66,
              end: 1.0,
              theme: "dark",
              bg: colors.gradients.brownToBlack,
              render: (p) => (
                <section className="h-full">
                  <div className="mx-auto flex h-full max-w-7xl items-center px-6">
                    <div
                      className="w-full"
                      style={{
                        transform: `translateY(${(1 - p) * 20}px)`,
                        transition: "transform 120ms linear",
                      }}
                    >
                      <CardsGrid progress={p} />
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
