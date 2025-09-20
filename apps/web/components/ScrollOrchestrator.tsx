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

export function ScrollOrchestrator({
  scenes,
  heightPerSceneVh = 120,
  tailVh = 20,
}: {
  scenes: Scene[];
  heightPerSceneVh?: number;
  tailVh?: number;
}) {
  const [progress, setProgress] = React.useState(0); // 0..1
  const totalHeightRef = React.useRef(0);

  React.useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(
        1,
        totalHeightRef.current - window.innerHeight
      );
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setProgress(p);
    };
    const onResize = () => {
      totalHeightRef.current = Math.round(
        ((scenes.length * heightPerSceneVh + tailVh) * window.innerHeight) / 100
      );
      onScroll();
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [scenes.length, heightPerSceneVh, tailVh]);

  // Update header theme and a global CSS var for background (to avoid flicker)
  React.useEffect(() => {
    // Expose global page progress for UI sync (0..1)
    document.documentElement.style.setProperty(
      "--page-progress",
      String(progress)
    );
    const activeNow = scenes.find((s) => progress >= s.start && progress < s.end);
    const fallback = scenes.reduce((acc, s) => (progress >= s.start ? s : acc), scenes[0]);
    const scene = activeNow || fallback;
    const theme = scene?.theme;
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme);
    if (scene?.bg) root.style.setProperty("--scene-bg", scene.bg);
    return () => {
      root.removeAttribute("data-theme");
      root.style.removeProperty("--scene-bg");
    };
  }, [progress, scenes]);

  // Determine the active scene index (single interactive scene)
  const activeIndex = React.useMemo(() => {
    const idx = scenes.findIndex((s) => progress >= s.start && progress < s.end);
    if (idx !== -1) return idx;
    // fallback to the last scene whose start <= progress
    let last = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (progress >= scenes[i].start) last = i;
    }
    return last;
  }, [progress, scenes]);

  return (
    <div className="relative">
      {/* Phantom spacer to drive scroll; stage remains fixed */}
      <div
        style={{ height: `${scenes.length * heightPerSceneVh + tailVh}vh` }}
      />
      <div className="scroll-stage fixed inset-0 pointer-events-none">
        {scenes.map((s, i) => {
          const span = Math.max(0.0001, s.end - s.start);
          const local = (progress - s.start) / span;
          const clamped = Math.min(1, Math.max(0, local));
          // Plateau visibility: ramp in first 20%, hold, ramp out last 20%
          const edge = 0.06; // tighter in/out distance to reduce overlap
          let opacity = 0;
          if (clamped > 0 && clamped < 1) {
            if (clamped < edge) opacity = clamped / edge;
            else if (clamped > 1 - edge) opacity = (1 - clamped) / edge;
            else opacity = 1;
          }
          // Ensure first scene is fully visible on load (opacity only here)
          if (s.start === 0 && clamped <= 0.08) {
            opacity = 1;
          }
          
          // Only allow pointer events for the active scene
          const isInteractive = i === activeIndex;
          
          const style: React.CSSProperties = {
            opacity,
            transition: "opacity 120ms linear, filter 120ms linear",
            filter: undefined,
            background: s.bg,
            pointerEvents: isInteractive ? "auto" : "none",
            zIndex: isInteractive ? 10 : 0,
          };
          // Blur only near edges; crisp on plateau (compute after style base)
          const blurMax = 8;
          let blur = 0;
          if (clamped > 0 && clamped < edge)
            blur = ((edge - clamped) / edge) * blurMax;
          else if (clamped > 1 - edge && clamped < 1)
            blur = ((clamped - (1 - edge)) / edge) * blurMax;
          if (s.start === 0 && clamped <= 0.08) {
            // hold the first scene fully sharp at the very top
            blur = 0;
          }
          if (blur)
            (style as React.CSSProperties).filter = `blur(${blur.toFixed(
              2
            )}px)`;
          return (
            <div key={s.id} className="absolute inset-0" style={style}>
              {s.render(clamped)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
