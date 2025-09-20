"use client";
import React, { useEffect, useState } from "react";

type Particle = { x: number; y: number; r: number; a: number; vy: number; ax: number; life: number; maxLife: number };

export default function SoftParticles({ className = "" }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side only execution
  useEffect(() => {
    setIsClient(true);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const resize = React.useCallback(() => {
    // Only run on client side
    if (!isClient) return;

    const c = ref.current; if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.floor(c.clientWidth * dpr);
    c.height = Math.floor(c.clientHeight * dpr);
  }, [isClient]);

  const spawn = React.useCallback((w: number, h: number) => {
    const count = 14;
    const arr: Particle[] = [];
    // Use seeded random for consistent particle generation
    const seed = w * h + count;
    let randomState = seed;

    const seededRandom = () => {
      randomState = (randomState * 9301 + 49297) % 233280;
      return randomState / 233280;
    };

    for (let i = 0; i < count; i++) {
      arr.push({
        x: seededRandom() * w,
        y: seededRandom() * h,
        r: 20 + seededRandom() * 46,
        a: 0.08 + seededRandom() * 0.1,
        vy: 4 + seededRandom() * 10,
        ax: (seededRandom() - 0.5) * 0.15,
        life: seededRandom() * 3,
        maxLife: 6 + seededRandom() * 8,
      });
    }
    particlesRef.current = arr;
  }, []);

  React.useEffect(() => {
    // Only run on client side
    if (!isClient) return;

    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let last = performance.now();

    const onResize = () => { resize(); spawn(c.clientWidth, c.clientHeight); };
    onResize();
    window.addEventListener("resize", onResize);

    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min(1 / 30, (t - last) / 1000); // clamp ~30fps
      last = t;
      if (typeof document !== 'undefined' && document.hidden) return; // pause when hidden

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.width; const h = c.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particlesRef.current) {
        // update
        p.y -= p.vy * dt * 12 * dpr;
        p.x += p.ax * dt * 12 * dpr;
        p.life += dt;
        if (p.y < -p.r * 2 || p.life > p.maxLife) {
          p.y = h + p.r * 2;
          // Use seeded random for consistency
          const seed = w + p.life;
          let randomState = seed;
          const seededRandom = () => {
            randomState = (randomState * 9301 + 49297) % 233280;
            return randomState / 233280;
          };
          p.x = seededRandom() * w;
          p.life = 0;
        }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.a;
        // draw soft circle
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * dpr);
        grad.addColorStop(0, `rgba(255,122,26,${alpha * 0.35})`);
        grad.addColorStop(1, `rgba(255,122,26,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resize, spawn, isClient]);

  return (
    <canvas
      ref={ref}
      className={`absolute inset-0 -z-10 opacity-75 ${className}`}
      aria-hidden="true"
    />
  );
}

