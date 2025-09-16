import type { Opportunity } from "@/lib/mock";

export async function fetchArkadikoOpportunities(): Promise<Opportunity[]> {
  // TODO: replace with real adapter call
  const { opportunities } = await import("@/lib/mock");
  return opportunities.filter((o) => o.protocol === "Arkadiko");
}

