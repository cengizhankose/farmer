"use client";
import React from "react";

export function Market({ progress = 0 }: { progress?: number }) {
  return (
    <section className="h-full">
      <div className="mx-auto flex h-full max-w-6xl items-center px-6 pt-20">
        <div
          className="w-full text-center"
          style={{
            transform: `translateY(${(1 - progress) * 20}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <div className="typo-eyebrow">Market Environment</div>
          <h2 className="typo-h2">Built with awareness of liquidity, risk, and opportunity</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-3xl mx-auto mt-6">
            High APR in DeFi is often illusory. We match high returns with solid liquidity,
            street-tested mechanics, and risk measurement. We've built an infrastructure that
            tracks the market and responds immediately to anomalies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="rounded-2xl card-market p-6">
              <h3 className="typo-card-h">Why TVL matters</h3>
              <p className="typo-card-p">TVL → slippage & withdrawal safety</p>
            </div>
            <div className="rounded-2xl card-market p-6">
              <h3 className="typo-card-h">Why volume matters</h3>
              <p className="typo-card-p">High turnover = easy entry/exit</p>
            </div>
            <div className="rounded-2xl card-market p-6">
              <h3 className="typo-card-h">Why risk scoring</h3>
              <p className="typo-card-p">Risk explained with sub-metrics, not a single number</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
