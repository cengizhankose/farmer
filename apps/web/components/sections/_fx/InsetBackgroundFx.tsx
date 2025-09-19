"use client";

import React, { useMemo } from "react";

type Props = {
  parallax?: { x: number; y: number };
  reduceMotion?: boolean;
  className?: string;
};

export function InsetBackgroundFx({ parallax, reduceMotion = false, className }: Props) {
  const p = parallax ?? { x: 0, y: 0 };

  const fogTransformA = useMemo(() => {
    const x = Math.max(-6, Math.min(6, p.x * 0.06));
    const y = Math.max(-6, Math.min(6, p.y * 0.06));
    return `translate3d(${x}px, ${y}px, 0)`;
  }, [p.x, p.y]);

  const fogTransformB = useMemo(() => {
    const x = Math.max(-6, Math.min(6, p.x * -0.05));
    const y = Math.max(-6, Math.min(6, p.y * 0.05));
    return `translate3d(${x}px, ${y}px, 0)`;
  }, [p.x, p.y]);

  return (
    <div className={"absolute inset-0 pointer-events-none " + (className ?? "")} aria-hidden="true">
      {/* Subtle grid layer */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 24px)",
          backgroundBlendMode: "overlay",
        }}
      />

      {/* Very light noise via SVG feTurbulence */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={4} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Fog blobs with slow drift + tiny parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={[
            "absolute -top-20 -left-16 h-72 w-72 rounded-full",
            "bg-[radial-gradient(closest-side,rgba(255,122,26,0.18),transparent_70%)]",
            reduceMotion ? "" : "animate-fog-drift-a",
          ].join(" ")}
          style={{ filter: "blur(40px)", transform: reduceMotion ? undefined : fogTransformA }}
        />
        <div
          className={[
            "absolute -bottom-24 -right-10 h-80 w-80 rounded-full",
            "bg-[radial-gradient(closest-side,rgba(107,179,255,0.14),transparent_70%)]",
            reduceMotion ? "" : "animate-fog-drift-b",
          ].join(" ")}
          style={{ filter: "blur(52px)", transform: reduceMotion ? undefined : fogTransformB }}
        />
      </div>

      {/* Diagonal sweep highlight (disabled on PRM) */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -inset-x-1/2 inset-y-0 rotate-[30deg] opacity-0 will-change-transform"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.10) 70%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes fog-drift-a {
          0% { transform: translate3d(-4px, 0, 0); }
          50% { transform: translate3d(4px, -2px, 0); }
          100% { transform: translate3d(-4px, 0, 0); }
        }
        @keyframes fog-drift-b {
          0% { transform: translate3d(0, 2px, 0); }
          50% { transform: translate3d(-3px, -2px, 0); }
          100% { transform: translate3d(0, 2px, 0); }
        }
        .animate-fog-drift-a { animation: fog-drift-a 14s ease-in-out infinite; }
        .animate-fog-drift-b { animation: fog-drift-b 16s ease-in-out infinite; }
        @keyframes sweep {
          0% { transform: translateX(-60%) rotate(30deg); opacity: 0; }
          8% { opacity: 1; }
          40% { transform: translateX(60%) rotate(30deg); opacity: 0; }
          100% { transform: translateX(60%) rotate(30deg); opacity: 0; }
        }
        :global(.inset-sweep .rotate-\[30deg\]) { animation: sweep 12s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default InsetBackgroundFx;

