"use client";

export type SeriesPoint = {
  t: number; // unix ms
  value: number;
  pnl: number;
  change24h: number;
};

// Generate consistent base timestamp to avoid hydration mismatch
function getConsistentBaseTimestamp(): number {
  // Use client-side only timestamp generation with consistent alignment
  if (typeof window === 'undefined') {
    // Server-side: use a fixed base timestamp
    return Math.floor(Date.now() / (12 * 60 * 60 * 1000)) * (12 * 60 * 60 * 1000);
  }
  // Client-side: use consistent alignment
  return Math.floor(Date.now() / (12 * 60 * 60 * 1000)) * (12 * 60 * 60 * 1000);
}

function sma(values: number[], window: number, idx: number) {
  const start = Math.max(0, idx - window + 1);
  const slice = values.slice(start, idx + 1);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / slice.length;
}

// Geometric Brownian Motion series -> derive value, pnl, change24h
export function generateMockSeries(count = 60, seed = 42): SeriesPoint[] {
  // 60 points, 12h step ≈ 30 days
  // Use consistent base timestamp to avoid hydration mismatch
  const now = getConsistentBaseTimestamp();
  const dt = 12 * 60 * 60 * 1000; // 12h in ms
  const mu = 0.0008; // drift
  const sigma = 0.12; // volatility

  // seeded RNG - consistent across server/client
  let s = seed >>> 0;
  const rand = () => {
    // xorshift32
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) / 0xffffffff);
  };
  const randn = () => {
    // Box-Muller
    const u = Math.max(1e-9, rand());
    const v = Math.max(1e-9, rand());
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  // price path via GBM
  const price: number[] = new Array(count);
  price[0] = 100;
  for (let i = 1; i < count; i++) {
    const dW = randn();
    const step = Math.exp((mu - 0.5 * sigma * sigma) * 1 + sigma * Math.sqrt(1) * dW);
    price[i] = Math.max(1, price[i - 1] * step);
  }

  // Accumulated value to make a smooth area trend
  const value: number[] = new Array(count);
  value[0] = price[0];
  for (let i = 1; i < count; i++) {
    value[i] = value[i - 1] + price[i];
  }

  // PnL as value - SMA(value, 10)
  const pnl: number[] = value.map((_, i) => value[i] - sma(value, 10, i));

  // 24h change as value[t] - value[t-2] (2 steps ~ 24h)
  const change24h: number[] = value.map((v, i) => (i >= 2 ? v - value[i - 2] : 0));

  const series: SeriesPoint[] = new Array(count);
  for (let i = 0; i < count; i++) {
    series[i] = {
      t: now - (count - 1 - i) * dt,
      value: value[i],
      pnl: pnl[i],
      change24h: change24h[i],
    };
  }
  return series;
}

export function kpiFromSeries(series: SeriesPoint[]) {
  const n = series.length;
  const last = series[n - 1]?.value ?? 0;
  const agoIdx = Math.max(0, n - 1 - 14); // ~7 days (14x 12h)
  const weekAgo = series[agoIdx]?.value ?? last;
  // approximate APR from 7d run-rate
  const apr7d = weekAgo > 0 ? ((last / weekAgo) - 1) * 52 : 0;
  // mock TVL: scale last value to a few millions
  const tvl = Math.max(1_200_000, Math.min(6_500_000, last * 120));
  const netPnl = series[n - 1]?.pnl ?? 0;
  return { apr7d, tvl, netPnl };
}

export function compactCurrency(num: number): string {
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    return `${sign}$${millions.toFixed(millions >= 100 ? 0 : millions >= 10 ? 1 : 2)}M`;
  }
  if (abs >= 1_000) {
    const thousands = abs / 1_000;
    return `${sign}$${thousands.toFixed(thousands >= 100 ? 0 : 1)}K`;
  }
  return `${sign}$${abs.toFixed(2)}`;
}

export function percent1(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

