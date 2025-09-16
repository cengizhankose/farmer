import React from "react";
import { Button } from "../components/ui/button.jsx";
import { Card } from "../components/ui/card.jsx";
import { Link } from "react-router-dom";
import ThreadScroller from "../components/ThreadScroller.jsx";
import LiveFeed from "../components/LiveFeed.jsx";
import CardFlow from "../components/CardFlow.jsx";

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
      {/* Hero: Luxury container with stronger typography & larger CTAs */}
      <section className="relative border-b border-zinc-200/60 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="relative overflow-hidden rounded-[28px] border border-zinc-900/10 bg-white/55 p-12 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:p-16">
            <div className="absolute -left-16 -top-16 h-96 w-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,125,39,0.22),transparent_60%)]" />
            <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(15,16,18,0.18),transparent_60%)]" />

            <div className="relative grid grid-cols-1 items-start gap-10 md:grid-cols-2">
              <div>
                <h1 className="font-display text-5xl font-semibold leading-tight text-zinc-900 md:text-6xl">Build yield on Stacks — beautifully</h1>
                <ul className="mt-6 space-y-3 text-[15px] text-zinc-700">
                  <li>• Curated opportunities: ALEX & Arkadiko</li>
                  <li>• Clear APR/APY, TVL, and risk</li>
                  <li>• Deposit now (A) — one‑click router (B) soon</li>
                </ul>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link to="/opportunities">
                    <Button className="h-12 rounded-xl bg-orange-600 px-6 text-base text-white hover:bg-orange-700">Explore opportunities</Button>
                  </Link>
                  <Link to="/portfolio">
                    <Button variant="outline" className="h-12 rounded-xl border-zinc-300 px-6 text-base text-zinc-900 hover:bg-zinc-50">View portfolio</Button>
                  </Link>
                </div>
              </div>

              {/* Live vertical feed (3-4x taller) */}
              <div className="relative">
                <LiveFeed />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Why Us section */}
      <ThreadScroller title="Why Us" subtitle="Who Are We?" items={whyItems} />

      {/* Anthracite flowing cards section (40 cards continuous) */}
      <CardFlow />
    </div>
  );
}