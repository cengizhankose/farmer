export function formatUSD(n: number, opts: Intl.NumberFormatOptions = {}) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, ...opts }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function formatTVL(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

export function relativeTimeFromMinutes(label: string) {
  // naive mapping e.g. "5m", "1h", "2h"
  return label;
}

