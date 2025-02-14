export interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export type MarketType = "STOCK" | "CRYPTO" | "INDEX" | "FOREX";

export interface MarketData {
  symbol: string;
  name: string;
  type: MarketType;
  price: number; // 현재 표시할 가격
  dayStartPrice?: number; // UTC 00:00 기준 시작가 추가
  regularMarketPrice?: number; // 정규장 가격
  preMarketPrice?: number; // 프리마켓 가격
  postMarketPrice?: number; // 애프터마켓 가격
  previousClose?: number; // 전일 종가
  change: number;
  changePercent: number;
  lastUpdated: Date;
  marketState?: "PRE" | "REGULAR" | "POST" | "CLOSED";
}

export interface WebSocketMessage {
  type: string;
  data: Record<string, unknown>;
}

export interface MarketInfo {
  name: string;
  type: string;
}
