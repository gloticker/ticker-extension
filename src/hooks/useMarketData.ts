import { useEffect } from 'react';
import { useMarketStore } from '../stores/marketStore';
import { ALL_SYMBOLS } from '../constants/websocket';
import type { MarketData, MarketInfo, MarketType } from '../types/market';

export const useMarketData = () => {
  const { markets, setMarkets } = useMarketStore();

  useEffect(() => {
    console.log('useMarketData effect running');

    // 초기 데이터 로드
    chrome.storage.local.get(Object.keys(ALL_SYMBOLS), (result) => {
      console.log('Initial storage data:', result);
      
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

      console.log('Setting initial markets:', initialMarkets);
      setMarkets(initialMarkets);
    });

    // 스토리지 변경 감지
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      console.log('Storage changes detected:', changes);
      console.log('Current markets:', markets);
      
      Object.entries(changes).forEach(([symbol, { newValue, oldValue }]) => {
        console.log(`Updating ${symbol}:`, { old: oldValue, new: newValue });
        if (newValue && symbol in ALL_SYMBOLS) {
          useMarketStore.getState().updateMarket(symbol, newValue);
        }
      });
      
      console.log('Updated markets:', useMarketStore.getState().markets);
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, [setMarkets]);

  return markets;
};
