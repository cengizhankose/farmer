"use client";
import React from "react";

type Particle = { x: number; y: number; r: number; a: number; vy: number; ax: number; life: number; maxLife: number };

export default function SoftParticles({ className = "" }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const particlesRef = React.useRef<Particle[]>([]);

  const resize = React.useCallback(() => {
    const c = ref.current; if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.floor(c.clientWidth * dpr);
    c.height = Math.floor(c.clientHeight * dpr);
  }, []);

  const spawn = React.useCallback((w: number, h: number) => {
    const count = 14;
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 20 + Math.random() * 46,
        a: 0.08 + Math.random() * 0.1,
        vy: 4 + Math.random() * 10,
        ax: (Math.random() - 0.5) * 0.15,
        life: Math.random() * 3,
        maxLife: 6 + Math.random() * 8,
      });
    }
    particlesRef.current = arr;
  }, []);

  React.useEffect(() => {
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
      if (document.hidden) return; // pause when hidden

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
          p.x = Math.random() * w;
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
  }, [resize, spawn]);

  return (
    <canvas
      ref={ref}
      className={`absolute inset-0 -z-10 opacity-75 ${className}`}
      aria-hidden="true"
    />
  );
}

