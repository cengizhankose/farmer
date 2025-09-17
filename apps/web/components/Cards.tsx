"use client";
import React from "react";

// Horizontal marquee with two rows flowing in opposite directions.
// Card count reduced by half (12).
export const CardsGrid: React.FC<{ progress?: number }> = () => {
  const total = 12;
  const items = Array.from({ length: total }).map((_, i) => ({
    id: i,
    title: `Sample Card ${i + 1}`,
    subtitle: `Mock #${i + 1}`,
  }));

  const row1 = items.slice(0, Math.ceil(items.length / 2));
  const row2 = items.slice(Math.ceil(items.length / 2));

  const renderRow = (row: typeof items, direction: "left" | "right") => {
    // Duplicate content for seamless loop
    const doubled = [...row, ...row];
    const animClass = direction === "right" ? "animate-marquee-rev" : "animate-marquee";
    return (
      <div
        className="relative mb-4 flex overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className={`flex w-max ${animClass}`}>
          {doubled.map((it, idx) => (
            <div
              key={`${it.id}-${idx}`}
              className="flow-card relative mr-4 last:mr-0 w-[260px] shrink-0 rounded-xl bg-white/10 p-4 text-left text-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="text-xs text-white/60">{it.subtitle}</div>
              <div className="mt-1 font-display text-lg text-white">{it.title}</div>
              <div className="mt-2 h-20 rounded-md bg-gradient-to-b from-white/30 to-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden">
      {renderRow(row1, "left")}
      {renderRow(row2, "right")}
    </div>
  );
};
