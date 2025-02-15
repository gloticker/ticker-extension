import { useEffect } from "react";
import { useMarketStore } from "../stores/marketStore";
import { ALL_SYMBOLS } from "../constants/websocket";
import type { MarketData, MarketInfo, MarketType } from "../types/market";

export const useMarketData = () => {
  const { markets, setMarkets } = useMarketStore();

  useEffect(() => {
    // 초기 데이터 로드
    chrome.storage.local.get(Object.keys(ALL_SYMBOLS), (result) => {
      const initialMarkets: Record<string, MarketData> = {};

      Object.entries(ALL_SYMBOLS as Record<string, MarketInfo>).forEach(([symbol, info]) => {
        initialMarkets[symbol] = {
          symbol,
          name: info.name,
          type: info.type as MarketType,
          price: 0,
          change: 0,
          changePercent: 0,
          lastUpdated: new Date(),
          ...result[symbol],
        };
      });

      setMarkets(initialMarkets);
    });

    // 스토리지 변경 감지
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      Object.entries(changes).forEach(([symbol, { newValue }]) => {
        if (newValue && symbol in ALL_SYMBOLS) {
          useMarketStore.getState().updateMarket(symbol, newValue);
        }
      });
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, [setMarkets]);

  return markets;
};
