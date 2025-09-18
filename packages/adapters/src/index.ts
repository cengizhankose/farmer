export * from "@shared/core";
export * from "./mock";
export { adapterManager, AdapterManager } from "./adapter-manager";
export { DefiLlamaAdapter } from "./protocols/defillama";
export { ArkadikoAdapter } from "./protocols/arkadiko";
export { AlexAdapter } from "./protocols/alex";

// Import adapterManager for backward compatibility
import { adapterManager } from "./adapter-manager";

// Backward compatibility
export const mockAdapterCompat = {
  list: () => adapterManager.getAllOpportunities(),
  detail: (id: string) => adapterManager.getOpportunityDetail(id),
};