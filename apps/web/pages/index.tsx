import React from "react";
import { ScrollOrchestrator } from "@/components/ScrollOrchestrator";
import { Hero } from "@/components/landing/Hero";
import { WhoWhy } from "@/components/landing/WhoWhy";
import WhyUsInset from "@/components/sections/WhyUsInset";
import { Market } from "@/components/landing/Market";
import { Marquee } from "@/components/landing/Marquee";


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
                <Hero progress={p} />
              ),
            },
            {
              id: "why",
              start: 0.24,
              end: 0.60,
              theme: "dark",
              bg: 'var(--grad-why)',
              render: (p) => (<WhoWhy progress={p} />),
            },
            {
              id: "whyus",
              start: 0.60,
              end: 0.78,
              theme: "dark",
              bg: 'var(--grad-why)',
              render: () => (
                <div className="mx-auto flex h-full items-center px-4 sm:px-6 lg:px-8">
                  <WhyUsInset />
                </div>
              ),
            },
            {
              id: "market",
              start: 0.78,
              end: 0.93,
              theme: "dark",
              bg: 'var(--grad-market)',
              render: (p) => (<Market progress={p} />),
            },
            {
              id: "cards",
              start: 0.93,
              end: 1.0,
              theme: "dark",
              bg: 'var(--grad-why)',
              render: (p) => (<Marquee progress={p} />),
            },
          ]}
        />
      </div>
    </div>
  );
}
