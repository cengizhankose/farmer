import React, { useEffect, useRef, useState } from "react";
import { Card } from "../components/ui/card.jsx";

/*
  ThreadScroller (Pinned)
  - Section height: 300vh; Inner track is sticky (page feels fixed while scrolling)
  - Center vertical thread fills with scroll progress (orange accent)
  - 5-6 large cards reveal with smooth motion, 20% taller
  - Anthracite background
*/
export const ThreadScroller = ({ title = "Why Us", subtitle = "Who Are We?", items = [] }) => {
  const rootRef = useRef(null);
  const threadRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
      if (threadRef.current) threadRef.current.style.setProperty("--thread-progress", `${Math.round(p * 100)}%`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={rootRef} className="relative w-full bg-[#0e0f10] text-zinc-50" style={{ height: "300vh" }}>
      {/* Sticky track so the page looks fixed within this section */}
      <div className="sticky top-0 mx-auto flex h-screen max-w-7xl items-start gap-8 px-6 py-20">
        {/* Center thread */}
        <div className="relative hidden h-full w-2 md:block">
          <div ref={threadRef} className="thread-center h-full w-1 translate-x-1/2" />
        </div>

        {/* Content */}
        <div className="relative -mt-2 flex-1">
          <div className="mb-8">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          </div>

          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_20%_10%,rgba(255,125,39,0.12),transparent_60%),radial-gradient(400px_150px_at_90%_80%,rgba(255,125,39,0.06),transparent_60%)]" />

          <div className="grid grid-cols-1 gap-8">
            {items.map((it, idx) => (
              <Card
                key={idx}
                data-thread-card
                className={`thread-card relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl ${
                  idx % 2 === 0 ? "md:mr-24" : "md:ml-24"
                }`}
                style={{ minHeight: "calc(220px * 1.2)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-zinc-400">{it.kicker}</div>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-white">{it.title}</h3>
                  </div>
                  <div className="rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-xs text-orange-300">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>
                <p className="mt-4 max-w-3xl text-zinc-300">{it.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreadScroller;