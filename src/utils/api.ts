import { MarketType } from "../types/market";

interface BinanceKline {
  0: number; // Open time
  1: string; // Open price
  2: string; // High price
  3: string; // Low price
  4: string; // Close price
  // ... 나머지 필드는 사용하지 않으므로 생략
}

export async function fetchHistoricalData(symbol: string, type: MarketType) {
  try {
    // BTC.D는 즉시 빈 배열 반환
    if (symbol === "BTC.D") {
      return [];
    }

    if (type === "CRYPTO") {
      // Binance API for crypto
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol.replace(
          "-USD",
          "USDT"
        )}&interval=5m&limit=288`
      );
      const data = await response.json();
      return data.map((candle: BinanceKline) => ({
        time: new Date(candle[0]).toISOString(),
        value: parseFloat(candle[4]),
      }));
    } else {
      // Yahoo Finance API for stocks, indices, and forex
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d&includePrePost=true`
      );
      const data = await response.json();
      const timestamps = data.chart.result[0].timestamp;
      const prices = data.chart.result[0].indicators.quote[0].close;

      return timestamps.map((time: number, i: number) => ({
        time: new Date(time * 1000).toISOString(),
        value: prices[i] || prices[i - 1],
      }));
    }
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    return [];
  }
}
