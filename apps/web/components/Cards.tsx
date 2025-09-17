"use client";
import React from "react";
import Script from "next/script";

export const CardsGrid: React.FC<{ progress?: number }> = ({ progress = 0 }) => {
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const [gsapReady, setGsapReady] = React.useState(false);
  const total = 25;
  const clamped = Math.max(0, Math.min(1, progress));
  const visibleCount = Math.max(0, Math.min(total, Math.round(clamped * total)));
  const prevCountRef = React.useRef(0);

  React.useEffect(() => {
    const gsap: any = (typeof window !== "undefined" && (window as any).gsap) || null;
    if (!gsap) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".flow-card");
      if (!items.length) return;

      // Intro appear
      gsap.fromTo(
        items,
        { y: 18, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power1.out", stagger: 0.02 }
      );

      // 60-degree diagonal flow (approximate). Angle = 60deg
      const angle = (60 * Math.PI) / 180;
      const amp = 32; // px amplitude
      const dx = Math.cos(angle) * amp; // ~16
      const dy = Math.sin(angle) * amp; // ~27.7
      gsap.to(items, {
        x: dx,
        y: dy,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.06, yoyo: true },
      });

      // Click-to-zoom (2x) via matchMedia
      const mm = gsap.matchMedia(gridRef);
      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          fine: "(hover: hover) and (pointer: fine)",
          coarse: "(pointer: coarse)",
        },
        (context: any) => {
          const { reduceMotion } = context.conditions;
          const cleaners: Array<() => void> = [];

          let current: HTMLElement | null = null;
          const zoomIn = (el: HTMLElement) => {
            if (current && current !== el) {
              gsap.to(current, {
                scale: 1,
                zIndex: 1,
                duration: reduceMotion ? 0 : 0.2,
                ease: "power2.out",
              });
            }
            current = el;
            gsap.to(el, {
              scale: 2,
              zIndex: 30,
              duration: reduceMotion ? 0 : 0.25,
              ease: "power2.out",
            });
          };
          const zoomOut = (el: HTMLElement) => {
            gsap.to(el, {
              scale: 1,
              zIndex: 1,
              duration: reduceMotion ? 0 : 0.2,
              ease: "power2.out",
            });
            if (current === el) current = null;
          };

          items.forEach((el) => {
            el.style.willChange = "transform";
            el.style.transformOrigin = "center center";
            const onClick = (e: Event) => {
              e.stopPropagation();
              if (current === el) zoomOut(el);
              else zoomIn(el);
            };
            el.addEventListener("click", onClick as EventListener);
            cleaners.push(() => el.removeEventListener("click", onClick as EventListener));
          });

          const onDocClick = (e: MouseEvent) => {
            if (!current) return;
            const target = e.target as Node;
            if (current.contains(target)) return;
            // If clicked inside any other card, its handler will run first and set current, so this guard is enough
            zoomOut(current);
          };
          document.addEventListener("click", onDocClick, true);
          cleaners.push(() => document.removeEventListener("click", onDocClick, true));

          return () => cleaners.forEach((fn) => fn());
        }
      );

      return () => mm.revert();
    }, gridRef);
    return () => ctx.revert();
  }, [gsapReady]);

  // Progressive reveal: animate newly-visible items when visibleCount increases
  React.useEffect(() => {
    const gsap: any = (typeof window !== "undefined" && (window as any).gsap) || null;
    if (!gsap) return;
    const start = prevCountRef.current;
    const end = visibleCount;
    if (end > start) {
      const toShow = [] as HTMLElement[];
      for (let i = start; i < end; i++) {
        const el = gridRef.current?.querySelector(`.flow-card[data-idx='${i}']`) as HTMLElement | null;
        if (el) toShow.push(el);
      }
      if (toShow.length) {
        gsap.fromTo(
          toShow,
          { opacity: 0, scale: 0.96, y: 12 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power1.out", stagger: 0.03 }
        );
      }
    }
    prevCountRef.current = visibleCount;
  }, [visibleCount]);

  const cards = Array.from({ length: total }).map((_, i) => (
    <div
      key={i}
      className="flow-card relative rounded-xl border border-white/15 bg-white/10 p-4 text-left text-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
      data-idx={i}
      style={{ opacity: i < visibleCount ? 1 : 0, transform: i < visibleCount ? undefined : "translateY(12px) scale(0.96)" }}
    >
      <div className="text-xs text-white/60">Mock #{i + 1}</div>
      <div className="mt-1 font-display text-lg text-white">Sample Card</div>
      <div className="mt-2 h-20 rounded-md bg-gradient-to-b from-white/30 to-white/10" />
    </div>
  ));

  return (
    <div ref={gridRef} className="relative">
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"
        strategy="afterInteractive"
        onLoad={() => setGsapReady(true)}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards}
      </div>
    </div>
  );
};
