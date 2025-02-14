import { create } from 'zustand';
import type { MarketData } from '../types/market';

interface MarketStore {
  markets: Record<string, MarketData>;
  updateMarket: (symbol: string, data: Partial<MarketData>) => void;
  setMarkets: (markets: Record<string, MarketData>) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  markets: {},
  updateMarket: (symbol, data) =>
    set((state) => ({
      markets: {
        ...state.markets,
        [symbol]: { ...state.markets[symbol], ...data },
      },
    })),
  setMarkets: (markets) => set({ markets }),
})); 