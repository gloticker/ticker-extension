import { MarketType } from '../types/market';

export async function fetchHistoricalData(symbol: string, type: MarketType) {
  try {
    if (type === 'CRYPTO' && !symbol.includes('BTC.D')) {
      // Binance API for crypto
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol.replace('-USD', 'USDT')}&interval=5m&limit=288`
      );
      const data = await response.json();
      return data.map((candle: any[]) => ({
        time: new Date(candle[0]).toISOString(),
        value: parseFloat(candle[4])
      }));
    } else if (type === 'CRYPTO' && symbol.includes('BTC.D')) {
      // CoinGecko API for BTC dominance
      const response = await fetch(
        'https://api.coingecko.com/api/v3/global/market_cap_chart?days=1'
      );
      const data = await response.json();
      return data.map((point: any) => ({
        time: new Date(point[0]).toISOString(),
        value: point[1]
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
        value: prices[i] || prices[i - 1]
      }));
    }
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    return [];
  }
} 