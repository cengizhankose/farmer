"use client";
import { useEffect, useState } from "react";
import CountUp from "react-countup";

type MiniSummaryProps = {
  total: number;
  pnl: number;
  chg24h: number;
};

export default function MiniSummary({ total, pnl, chg24h }: MiniSummaryProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById("portfolio-overview");
    if (!el) return;
    
    const io = new IntersectionObserver(
      ([entry]) => {
        // Only show when the element is completely out of view
        setShow(entry.intersectionRatio === 0);
      },
      { root: null, threshold: 0 }
    );
    
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!show) return null;

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-2 grid grid-cols-3 gap-3">
        <KPI label="Total">
          <CountUp end={total} prefix="$" separator="," duration={0.6} />
        </KPI>
        <KPI 
          label="Net PnL" 
          color={pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}
        >
          <CountUp 
            end={Math.abs(pnl)} 
            prefix={pnl >= 0 ? '+$' : '-$'} 
            separator="," 
            duration={0.6} 
          />
        </KPI>
        <KPI 
          label="24h Change"
          color={chg24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}
        >
          <CountUp 
            end={Math.abs(chg24h)} 
            prefix={chg24h >= 0 ? '+$' : '-$'} 
            separator="," 
            duration={0.6} 
          />
        </KPI>
      </div>
    </div>
  );
}

function KPI({ 
  label, 
  children, 
  color = 'text-neutral-900' 
}: { 
  label: string; 
  children: React.ReactNode; 
  color?: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className={`tabular-nums font-semibold ${color}`}>
        {children}
      </div>
    </div>
  );
}