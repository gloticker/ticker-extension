export type MarketType = "Index" | "Stock" | "Crypto" | "Forex";

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_percent: string;
  volume?: number;
  high?: number;
  low?: number;
  value?: string;
  score?: string;
  rate?: string;
  rating?: string;
  current_value?: string;
  current_price?: string;
  otc_price?: string;
  market_cap?: string;
}

export interface MarketConfig {
  markets: string[];
  refreshInterval: number;
}

export interface MarketAnalysis {
  symbol: string;
  timestamp: string;
  technicalAnalysis: {
    trend: string;
    signals: {
      type: string;
      strength: number;
      description: string;
    }[];
  };
  fundamentalAnalysis: {
    summary: string;
    factors: {
      factor: string;
      impact: string;
      description: string;
    }[];
  };
}
