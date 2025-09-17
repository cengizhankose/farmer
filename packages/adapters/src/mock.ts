import { aprToApy, type Opportunity } from "@shared/core";

export const mockAdapter = {
  async list(): Promise<Opportunity[]> {
    const apr = 0.12;
    return [
      {
        id: "alex:stx-usda",
        chain: "stacks",
        protocol: "ALEX",
        pool: "STX/USDA",
        tokens: ["STX", "USDA"],
        apr,
        apy: aprToApy(apr),
        rewardToken: "ALEX",
        tvlUsd: 1200000,
        risk: "med",
        source: "api",
        lastUpdated: Date.now()
      },
      {
        id: "arkadiko:diko-stx",
        chain: "stacks",
        protocol: "Arkadiko",
        pool: "DIKO/STX",
        tokens: ["DIKO", "STX"],
        apr: 0.18,
        apy: aprToApy(0.18),
        rewardToken: "DIKO",
        tvlUsd: 850000,
        risk: "med",
        source: "api",
        lastUpdated: Date.now()
      }
    ];
  },
  async detail(id: string): Promise<Opportunity> {
    const items = await this.list();
    const item = items.find((o) => o.id === id);
    if (!item) throw new Error(`Opportunity not found: ${id}`);
    return item;
  }
};