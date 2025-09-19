"use client";
import React from "react";
import InsetShowcase from "@/components/sections/InsetShowcase";

export function WhoWhy({ progress = 0 }: { progress?: number }) {
  return (
    <section className="h-full">
      <div className="mx-auto flex h-full items-center px-4 sm:px-6 lg:px-8 pt-20"
           style={{ transform: `translateY(${(1 - progress) * 20 - 10}px)`, transition: "transform 120ms linear" }}
      >
        <InsetShowcase
          className="w-full"
          kicker="Who Are We?"
          title="A pragmatic team building production-grade yield tooling"
          body="Built for yield. Built for trust. Built for speed. We're here to make your life easier and safer."
          rightSlot={(
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  metric: "2",
                  title: "Founders & Engineers",
                  desc: "Frontend + UI/UX — Backend + Smart Contract",
                },
                {
                  metric: "MVP → Prod",
                  title: "Hackathon → Global",
                  desc: "Born in hackathons, now scaling worldwide",
                },
                {
                  metric: "24/7",
                  title: "Built for Trust",
                  desc: "Deep analysis, risk scoring, instant & secure execution",
                },
              ].map((c, i) => (
                <div key={i} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
                  <div className="text-3xl font-semibold text-white mb-2">{c.metric}</div>
                  <div className="text-white font-medium">{c.title}</div>
                  <div className="text-white/80 text-sm mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
          )}
        />

        {null}
      </div>
    </section>
  );
}
