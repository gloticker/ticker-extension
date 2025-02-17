import type { MarketInfo, MarketType } from "../types/market";

export const MARKET_SYMBOLS: Record<string, Record<string, MarketInfo>> = {
  INDICES: {
    "^IXIC": { name: "NASDAQ", type: "INDEX" as MarketType },
    "^GSPC": { name: "S&P 500", type: "INDEX" as MarketType },
    "^KS11": { name: "KOSPI", type: "INDEX" as MarketType },
    "^VIX": { name: "VIX", type: "INDEX" as MarketType },
    "FEAR.GREED": { name: "Fear & Greed", type: "INDEX" as MarketType },
  },
  STOCKS: {
    AAPL: { name: "Apple", type: "STOCK" as MarketType },
    NVDA: { name: "NVIDIA", type: "STOCK" as MarketType },
    MSFT: { name: "Microsoft", type: "STOCK" as MarketType },
    AMZN: { name: "Amazon", type: "STOCK" as MarketType },
    GOOGL: { name: "Google", type: "STOCK" as MarketType },
    TSLA: { name: "Tesla", type: "STOCK" as MarketType },
  },
  CRYPTO: {
    "BTC-USD": { name: "Bitcoin", type: "CRYPTO" as MarketType },
    "ETH-USD": { name: "Ethereum", type: "CRYPTO" as MarketType },
    "SOL-USD": { name: "Solana", type: "CRYPTO" as MarketType },
    "BTC.D": { name: "BTC Dominance", type: "CRYPTO" as MarketType },
  },
  FOREX: {
    "KRW=X": { name: "USD/KRW", type: "FOREX" as MarketType },
    "EURKRW=X": { name: "EUR/KRW", type: "FOREX" as MarketType },
    "CNYKRW=X": { name: "CNY/KRW", type: "FOREX" as MarketType },
    "JPYKRW=X": { name: "JPY/KRW", type: "FOREX" as MarketType },
  },
} as const;

export const ALL_SYMBOLS: Record<string, MarketInfo> = Object.entries(MARKET_SYMBOLS).reduce(
  (acc, [, symbols]) => ({ ...acc, ...symbols }),
  {}
);
