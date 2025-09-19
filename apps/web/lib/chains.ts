export type ChainId = "stacks" | "ethereum" | "solana";

export const CHAINS: { id: ChainId; label: string; enabled: boolean }[] = [
  { id: "stacks", label: "Stacks", enabled: true },
  { id: "ethereum", label: "Ethereum", enabled: false },
  { id: "solana", label: "Solana", enabled: false }
];

