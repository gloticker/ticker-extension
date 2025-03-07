export type MarketType = "Index" | "Stock" | "Crypto" | "Forex";

export type MarketData = {
  current_price?: string;
  current_value?: string;
  market_cap?: string;
  change: string;
  change_percent: string;
  rate?: string;
  score?: string;
  rating?: string;
  value?: string;
  otc_price?: string | null;
};
