export type ChainId = "stacks" | "ethereum" | "solana";

export const CHAINS: { id: ChainId; label: string; enabled: boolean }[] = [
  { id: "stacks", label: "Stacks", enabled: true },
  { id: "ethereum", label: "Ethereum", enabled: false },
  { id: "solana", label: "Solana", enabled: false }
];

import { riskColors } from "./colors";

export const RISK_COLORS: Record<string, string> = {
  Low: `bg-[${riskColors.Low.bg}] text-[${riskColors.Low.text}] border-[${riskColors.Low.border}]`,
  Medium: `bg-[${riskColors.Medium.bg}] text-[${riskColors.Medium.text}] border-[${riskColors.Medium.border}]`,
  High: `bg-[${riskColors.High.bg}] text-[${riskColors.High.text}] border-[${riskColors.High.border}]`
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

export type RedirectEntry = {
  id: string;
  protocol: string;
  pair: string;
  apr: number;
  amount: number;
  days: number;
  ts: number;
  chain: ChainId;
  txid?: string;
  action?: "Deposit" | "Withdraw";
};

function randomHex(len = 64) {
  const chars = "abcdef0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function addRecentRedirect(entry: RedirectEntry) {
  const prev = JSON.parse(globalThis.localStorage?.getItem(LOCAL_KEY) || "[]");
  const txid = entry.txid || `0x${randomHex(64)}`;
  const withTx = { action: "Deposit" as const, ...entry, txid };
  const next = [withTx, ...prev].slice(0, 25);
  globalThis.localStorage?.setItem(LOCAL_KEY, JSON.stringify(next));
  return next;
}

export function getRecentRedirects(): RedirectEntry[] {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [] as RedirectEntry[];
  }
}
