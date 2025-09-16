import React from "react";
import Link from "next/link";
import { ScrollOrchestrator } from "@/components/ScrollOrchestrator";

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "secondary" | "default" }
) {
  const { className = "", variant = "default", ...rest } = props;
  const base = "inline-flex items-center justify-center rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-12 px-6";
  const variants: Record<string, string> = {
    default: "bg-orange-600 text-white hover:bg-orange-700",
    outline: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

export default function Landing() {
  const whyItems = [
    { kicker: "Trust & Simplicity", title: "Non-custodial from day zero", body: "We route you to ALEX and Arkadiko directly. No hidden custody, no lock‑ins — clarity over complexity." },
    { kicker: "Signal over noise", title: "Normalized APR/APY across adapters", body: "One consistent view: APR, APY, TVL, and risk. Fast decisions without sacrificing depth." },
    { kicker: "Ready to scale", title: "Router (B) and multi‑chain on the way", body: "Canary testnet tx, allowance flow, explorer links — then Ethereum and Solana with disabled previews today." },
    { kicker: "UX craft", title: "Calm visuals, strong typography", body: "Bold yet elegant: high-contrast anthracite + orange with glass surfaces." },
    { kicker: "Secure by design", title: "Wallet-first architecture", body: "Leather connect, chain guard banner, read‑only fallback — safe by default." },
    { kicker: "Data forward", title: "Freshness & risk cues", body: "Badges for last update and risk. Stale data warnings in the roadmap." },
  ];

  return (
    <div className="relative">
      <ScrollOrchestrator
        heightPerSceneVh={120}
        scenes={[
          {
            id: "hero",
            start: 0.0,
            end: 0.28,
            theme: "dark",
            bg: "linear-gradient(to right, #ff7d27, #0a0a0a)",
            render: (p) => (
              <section className="relative h-full">
                <div className="mx-auto flex h-full items-center max-w-7xl px-6">
                  <div className="relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-12 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-16">
                    <div className="absolute -left-16 -top-16 h-96 w-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,125,39,0.22),transparent_60%)]" />
                    <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(15,16,18,0.18),transparent_60%)]" />

                    <div className="relative grid grid-cols-1 items-start gap-10 md:grid-cols-2" style={{ transform: `translateY(${p * 10}px)`, transition: "transform 120ms linear" }}>
                      <div>
                        <h1 className="font-display text-5xl font-semibold leading-tight text-white md:text-6xl">Build yield on Stacks — beautifully</h1>
                        <ul className="mt-6 space-y-3 text-[15px] text-white/80">
                          <li>• Curated opportunities: ALEX & Arkadiko</li>
                          <li>• Clear APR/APY, TVL, and risk</li>
                          <li>• Deposit now (A) — one‑click router (B) soon</li>
                        </ul>
                        <div className="mt-10 flex flex-wrap gap-4">
                          <Link href="/opportunities"><Button>Explore opportunities</Button></Link>
                          <Link href="/portfolio"><Button variant="outline">View portfolio</Button></Link>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-80 w-full rounded-2xl bg-gradient-to-b from-white/60 to-zinc-100/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ),
          },
          {
            id: "why",
            start: 0.28,
            end: 0.56,
            theme: "dark",
            bg: "linear-gradient(to right, #0a0a0a, #f5f0e6)",
            render: (p) => (
              <section className="h-full">
                <div className="mx-auto flex h-full max-w-7xl items-center px-6">
                  <div className="w-full" style={{ transform: `translateY(${(1 - p) * 20 - 10}px)`, transition: "transform 120ms linear" }}>
                    <div className="mb-8">
                      <div className="text-sm uppercase tracking-wide text-white/70">Who Are We?</div>
                      <h2 className="mt-1 font-display text-3xl text-white">Why Us</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {whyItems.map((it, i) => (
                        <div key={i} className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                          <div className="text-xs uppercase tracking-wide text-white/70">{it.kicker}</div>
                          <div className="mt-1 text-lg font-medium text-white">{it.title}</div>
                          <div className="mt-2 text-sm text-white/80">{it.body}</div>
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
            start: 0.56,
            end: 0.84,
            theme: "dark",
            bg: "linear-gradient(to right, #f5f0e6, #1c1d1f)",
            render: (p) => (
              <section className="h-full">
                <div className="mx-auto flex h-full max-w-7xl items-center px-6">
                  <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-10 text-center text-sm text-white/80 backdrop-blur-xl" style={{ transform: `translateY(${(1 - p) * 20}px)`, transition: "transform 120ms linear" }}>
                    Flowing cards section (visual only) — preserved look & spacing
                  </div>
                </div>
              </section>
            ),
          },
        ]}
      />
    </div>
  );
}
