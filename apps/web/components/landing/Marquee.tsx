"use client";
import React from "react";
import { CardsGrid } from "@/components/Cards";

export function Marquee({ progress = 0 }: { progress?: number }) {
  return (
    <section className="h-full">
      <div className="mx-auto flex h-full max-w-6xl items-center px-6 pt-20">
        <div
          className="w-full"
          style={{
            transform: `translateY(${(1 - progress) * 20}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <div className="text-center mb-8">
            <div className="typo-eyebrow">Live Opportunities</div>
            <h2 className="typo-h2">Real-time yield opportunities flowing through the ecosystem</h2>
          </div>
          <div className="marquee-group">
            <CardsGrid progress={progress} />
          </div>
        </div>
      </div>
    </section>
  );
}
