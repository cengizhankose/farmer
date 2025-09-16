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

  return (
    <div className="relative">
      {/* Phantom spacer to drive scroll; stage remains fixed */}
      <div style={{ height: `${scenes.length * heightPerSceneVh}vh` }} />
      <div className="scroll-stage pointer-events-none fixed inset-0">
        {scenes.map((s) => {
          const span = Math.max(0.0001, s.end - s.start);
          const local = (progress - s.start) / span;
          const clamped = Math.min(1, Math.max(0, local));
          // Visible only when within [start, end] with gentle fade at edges
          const visible = clamped > 0 && clamped < 1;
          const edgeFade = Math.max(0, Math.min(1, Math.min(clamped * 2, (1 - clamped) * 2)));
          const style: React.CSSProperties = {
            opacity: visible ? edgeFade : 0,
            transition: "opacity 120ms linear",
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

