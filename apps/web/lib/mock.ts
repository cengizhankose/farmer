export type ChainId = "stacks" | "ethereum" | "solana";

export const CHAINS: { id: ChainId; label: string; enabled: boolean }[] = [
  { id: "stacks", label: "Stacks", enabled: true },
  { id: "ethereum", label: "Ethereum", enabled: false },
  { id: "solana", label: "Solana", enabled: false }
];

export const RISK_COLORS: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Medium: "bg-amber-100 text-amber-700 border-amber-300",
  High: "bg-rose-100 text-rose-700 border-rose-300"
};

export type Opportunity = {
  id: string;
  protocol: string;
  pair: string;
  chain: ChainId;
  apr: number;
  apy: number;
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string;
  originalUrl: string;
  summary: string;
};

export const opportunities: Opportunity[] = [
  {
    id: "alex-stx-usda",
    protocol: "ALEX",
    pair: "STX/USDA",
    chain: "stacks",
    apr: 12.3,
    apy: 13.1,
    risk: "Low",
    tvlUsd: 1_250_000,
    rewardToken: "ALEX",
    lastUpdated: "5m",
    originalUrl: "https://app.alexgo.io/",
    summary: "Stable LP with deep liquidity and conservative parameters."
  },
  {
    id: "arkadiko-stx-diko",
    protocol: "Arkadiko",
    pair: "STX/DIKO",
    chain: "stacks",
    apr: 18.9,
    apy: 20.2,
    risk: "Medium",
    tvlUsd: 780_000,
    rewardToken: "DIKO",
    lastUpdated: "12m",
    originalUrl: "https://app.arkadiko.finance/",
    summary: "Yield with protocol rewards; moderate volatility expected."
  },
  {
    id: "eth-aave-usdc",
    protocol: "Aave",
    pair: "USDC",
    chain: "ethereum",
    apr: 3.1,
    apy: 3.2,
    risk: "Low",
    tvlUsd: 52_000_000,
    rewardToken: "AAVE",
    lastUpdated: "1h",
    originalUrl: "https://app.aave.com/",
    summary: "Preview for multichain support."
  },
  {
    id: "sol-jup-usdc",
    protocol: "Jupiter",
    pair: "USDC",
    chain: "solana",
    apr: 5.6,
    apy: 5.8,
    risk: "Medium",
    tvlUsd: 11_400_000,
    rewardToken: "JUP",
    lastUpdated: "2h",
    originalUrl: "https://jup.ag/",
    summary: "Preview for multichain support."
  }
];

export function getOpportunityById(id?: string | string[]) {
  if (!id) return undefined;
  const key = Array.isArray(id) ? id[0] : id;
  return opportunities.find((o) => o.id === key);
}

const LOCAL_KEY = "stacks_portfolio_mock";

export function addRecentRedirect(entry: any) {
  const prev = JSON.parse(globalThis.localStorage?.getItem(LOCAL_KEY) || "[]");
  const next = [entry, ...prev].slice(0, 25);
  globalThis.localStorage?.setItem(LOCAL_KEY, JSON.stringify(next));
  return next;
}

export function getRecentRedirects() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(LOCAL_KEY) || "[]");
  } catch (e) {
    return [] as any[];
  }
}

