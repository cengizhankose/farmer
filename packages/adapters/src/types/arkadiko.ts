export interface ArkadikoTicker {
  ticker_id: string;              // "STX_DIKO", "STX_USDA", etc.
  base_currency: string;          // Contract address
  target_currency: string;        // Contract address
  pool_id: string;                // Pool contract address
  last_price: number;
  base_volume: number;            // 24h volume in base currency
  target_volume: number;          // 24h volume in target currency
  base_price: number;             // Price of base currency in USD
  target_price: number;           // Price of target currency in USD
  liquidity_in_usd: number;       // TVL in USD
  high?: number | null;           // 24h high
  low?: number | null;            // 24h low
}

export interface ArkadikoPool {
  id: string;
  token_x_name: string;
  token_y_name: string;
  token_x_address: string;
  token_y_address: string;
  balance_x: string;
  balance_y: string;
  total_supply: string;
  swap_fee: string;
  protocol_fee: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArkadikoPrice {
  timestamp: number;
  price: number;
  volume_24h: number;
  market_cap?: number;
}

export interface ArkadikoPoolPrice {
  pool_id: string;
  timestamp: number;
  token_x_price: number;
  token_y_price: number;
  liquidity_usd: number;
  volume_24h: number;
}

export interface ArkadikoVaultData {
  vault_id: string;
  collateral_token: string;
  debt_token: string;
  collateral_amount: number;
  debt_amount: number;
  stability_fee: number;
  liquidation_ratio: number;
  current_ratio: number;
  created_at?: string;
  updated_at?: string;
}

export interface ArkadikoApiResponse {
  success: boolean;
  data: ArkadikoTicker[] | ArkadikoPool[] | ArkadikoVaultData[];
  message?: string;
  timestamp?: number;
}