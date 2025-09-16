/*
  Frontend-only mock data for Opportunities and Portfolio.
  Backend integration will replace this later. Keep all API-like data flows here.
*/

export const CHAINS = [
  { id: "stacks", label: "Stacks", enabled: true },
  { id: "ethereum", label: "Ethereum", enabled: false },
  { id: "solana", label: "Solana", enabled: false },
];

export const RISK_COLORS = {
  Low: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Medium: "bg-amber-100 text-amber-700 border-amber-300",
  High: "bg-rose-100 text-rose-700 border-rose-300",
};

export const opportunities = [
  {
    id: "alex-stx-usda",
    protocol: "ALEX",
    pair: "STX/USDA",
    chain: "stacks",
    apr: 12.3,
    apy: 13.1,
    risk: "Low",
    tvlUsd: 1250000,
    rewardToken: "ALEX",
    lastUpdated: "5m",
    originalUrl: "https://app.alexgo.io/",
    summary: "Stable LP with deep liquidity and conservative parameters.",
  },
  {
    id: "arkadiko-stx-diko",
    protocol: "Arkadiko",
    pair: "STX/DIKO",
    chain: "stacks",
    apr: 18.9,
    apy: 20.2,
    risk: "Medium",
    tvlUsd: 780000,
    rewardToken: "DIKO",
    lastUpdated: "12m",
    originalUrl: "https://app.arkadiko.finance/",
    summary: "Yield with protocol rewards; moderate volatility expected.",
  },
  {
    id: "eth-aave-usdc",
    protocol: "Aave",
    pair: "USDC",
    chain: "ethereum",
    apr: 3.1,
    apy: 3.2,
    risk: "Low",
    tvlUsd: 52000000,
    rewardToken: "AAVE",
    lastUpdated: "1h",
    originalUrl: "https://app.aave.com/",
    summary: "Preview for multichain support.",
  },
  {
    id: "sol-jup-usdc",
    protocol: "Jupiter",
    pair: "USDC",
    chain: "solana",
    apr: 5.6,
    apy: 5.8,
    risk: "Medium",
    tvlUsd: 11400000,
    rewardToken: "JUP",
    lastUpdated: "2h",
    originalUrl: "https://jup.ag/",
    summary: "Preview for multichain support.",
  },
];

export function getOpportunityById(id) {
  return opportunities.find((o) => o.id === id);
}

// Local-only portfolio entries (recent redirects + canary
// This is a front-end mock; it will be replaced by backend later
const LOCAL_KEY = "stacks_portfolio_mock";

export function addRecentRedirect(entry) {
  const prev = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  const next = [entry, ...prev].slice(0, 25);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  return next;
}

export function getRecentRedirects() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch (e) {
    return [];
  }
}