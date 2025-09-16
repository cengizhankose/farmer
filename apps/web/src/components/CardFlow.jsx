import React, { useMemo } from "react";
import { Card } from "../components/ui/card.jsx";

/*
  CardFlow section
  - Anthracite area with artistic lines
  - 40 flowing cards in two opposite marquees for uninterrupted motion
*/
export const CardFlow = () => {
  const names = useMemo(
    () => [
      "Stacking DAO","Xverse","Restake","PlanBetter","Fast Pool v2","Fast Pool","ALEX","Arkadiko","StacksBridge","Hiro","Leather","Supra","Gamma","Mechanism","Ryder","OKX","Magic","LayerTree","CityCoins","LNS","Clarity","PoxLite","SigOrder","Marbling","Torq","Den","Rumi","Zest","Diag","MinerX","Hermes","Trevi","Athen","Agora","Signer","BNS","Cycle","Blink","Forge","Anchor",
    ],
    []
  );

  const Row = ({ reverse = false }) => (
    <div className={`flex shrink-0 items-center gap-3 ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`}>
      {[...names, ...names].map((n, i) => (
        <Card key={`${n}-${i}`} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
          {n}
        </Card>
      ))}
    </div>
  );

  return (
    <section className="relative mt-16 bg-[#0f1012] py-16 text-white">
      {/* Artistic lines */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_300px_at_20%_10%,rgba(255,125,39,0.20),transparent_60%),radial-gradient(500px_200px_at_80%_70%,rgba(255,125,39,0.12),transparent_60%),repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_90px),repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_72px)]" />

      <div className="mx-auto max-w-[1200px] overflow-hidden px-6">
        <Row />
        <Row reverse />
        <Row />
      </div>
    </section>
  );
};

export default CardFlow;