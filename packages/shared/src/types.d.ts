export type Chain = "stacks" | "ethereum" | "solana";
export interface Opportunity {
    id: string;
    chain: Chain;
    protocol: string;
    pool: string;
    tokens: string[];
    apr: number;
    apy: number;
    rewardToken: string;
    tvlUsd: number;
    risk: "low" | "med" | "high";
    source: "api" | "mock";
    lastUpdated: number;
}
export interface ProtocolInfo {
    name: string;
    chain: Chain;
    baseUrl: string;
    description?: string;
}
export interface Adapter {
    list(): Promise<Opportunity[]>;
    detail(id: string): Promise<Opportunity>;
}
//# sourceMappingURL=types.d.ts.map