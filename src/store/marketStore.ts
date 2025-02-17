import { create } from "zustand";
import { MarketData } from "../types/market";

type State = {
  markets: Record<string, MarketData>;
  updateMarket: (symbol: string, data: Partial<MarketData>) => void;
  setMarkets: (markets: Record<string, MarketData>) => void;
};

export const useMarketStore = create<State>((set) => ({
  markets: {},
  updateMarket: (symbol, data) =>
    set((state) => ({
      markets: { ...state.markets, [symbol]: { ...state.markets[symbol], ...data } },
    })),
  setMarkets: (markets) => set({ markets }),
}));
