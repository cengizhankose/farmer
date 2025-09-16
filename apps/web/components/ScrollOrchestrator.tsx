"use client";
import React from "react";

type Scene = {
  id: string;
  /** 0..1 global start */
  start: number;
  /** 0..1 global end */
  end: number;
  /** render with local progress [0..1] */
  render: (progress: number) => React.ReactNode;
  /** CSS background (e.g., gradient) applied to full scene */
  bg?: string;
  /** Header theme hint for this scene */
  theme?: "dark" | "light";
};

export function ScrollOrchestrator({ scenes, heightPerSceneVh = 120 }: { scenes: Scene[]; heightPerSceneVh?: number }) {
  const [progress, setProgress] = React.useState(0); // 0..1
  const totalHeightRef = React.useRef(0);

  React.useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, totalHeightRef.current - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setProgress(p);
    };
    const onResize = () => {
      totalHeightRef.current = Math.round((scenes.length * heightPerSceneVh * window.innerHeight) / 100);
      onScroll();
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [scenes.length, heightPerSceneVh]);

  // Update header theme according to active scene
  React.useEffect(() => {
    const active = scenes.find((s) => progress >= s.start && progress < s.end);
    const theme = active?.theme;
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme);
    return () => {
      root.removeAttribute("data-theme");
    };
  }, [progress, scenes]);

  return (
    <div className="relative">
      {/* Phantom spacer to drive scroll; stage remains fixed */}
      <div style={{ height: `${scenes.length * heightPerSceneVh}vh` }} />
      <div className="scroll-stage pointer-events-none fixed inset-0">
        {scenes.map((s) => {
          const span = Math.max(0.0001, s.end - s.start);
          const local = (progress - s.start) / span;
          const clamped = Math.min(1, Math.max(0, local));
          // Plateau visibility: ramp in first 20%, hold, ramp out last 20%
          const edge = 0.2;
          let opacity = 0;
          if (clamped > 0 && clamped < 1) {
            if (clamped < edge) opacity = clamped / edge;
            else if (clamped > 1 - edge) opacity = (1 - clamped) / edge;
            else opacity = 1;
          }
          // Blur only near edges; crisp on plateau
          const blurMax = 8;
          let blur = 0;
          if (clamped > 0 && clamped < edge) blur = ((edge - clamped) / edge) * blurMax;
          else if (clamped > 1 - edge && clamped < 1) blur = ((clamped - (1 - edge)) / edge) * blurMax;

          const style: React.CSSProperties = {
            opacity,
            transition: "opacity 120ms linear, filter 120ms linear",
            filter: blur ? `blur(${blur.toFixed(2)}px)` : undefined,
            background: s.bg,
          };
          return (
            <div key={s.id} className="absolute inset-0" style={style}>
              <div className="h-full w-full pointer-events-auto">
                {s.render(clamped)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
