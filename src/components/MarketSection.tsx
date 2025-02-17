import { useEffect, useState } from 'react';
import { MarketItem } from './MarketItem';
import { useMarketStore } from '../store/marketStore';
import { MarketType } from '../types/market';
import { MARKET_SYMBOLS } from '../constants/websocket';

interface MarketSectionProps {
  title: string;
  type: MarketType;
}

export const MarketSection = ({ title, type }: MarketSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [displaySettings, setDisplaySettings] = useState<{
    categories: Record<MarketType, boolean>;
    symbols: Record<string, boolean>;
  } | null>(null);

  const markets = useMarketStore(state => state.markets);

  // 타입에 따른 MARKET_SYMBOLS 키 매핑
  const sectionKey = {
    'INDEX': 'INDICES',
    'STOCK': 'STOCKS',
    'CRYPTO': 'CRYPTO',
    'FOREX': 'FOREX'
  }[type];

  useEffect(() => {
    const loadSettings = () => {
      chrome.storage.local.get(['displaySettings', `section_${type}_expanded`], (result) => {
        setDisplaySettings(result.displaySettings);
        setIsExpanded(result[`section_${type}_expanded`] ?? true);
      });
    };

    loadSettings();

    // storage 변경 감지 리스너
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      // displaySettings 변경 감지
      if (changes.displaySettings) {
        setDisplaySettings(changes.displaySettings.newValue);
      }

      // 마켓 데이터 변경 감지
      const marketChanges = Object.keys(changes).filter(key =>
        MARKET_SYMBOLS[sectionKey]?.[key]
      );

      if (marketChanges.length > 0) {
        const store = useMarketStore.getState();
        const updatedMarkets = { ...store.markets };
        marketChanges.forEach(symbol => {
          updatedMarkets[symbol] = changes[symbol].newValue;
        });
        store.setMarkets(updatedMarkets);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [type, sectionKey]);

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    chrome.storage.local.set({ [`section_${type}_expanded`]: newState });
  };

  // MARKET_SYMBOLS에서 해당 타입의 심볼 순서 가져오기
  const orderedSymbols = Object.keys(MARKET_SYMBOLS[sectionKey] || {});

  const filteredMarkets = orderedSymbols
    .filter(symbol => {
      const market = markets[symbol];
      if (!market) return false;
      if (!displaySettings) return true;
      return displaySettings.categories[type] &&
        (displaySettings.symbols[symbol] ?? true);
    })
    .map(symbol => markets[symbol]);

  if (!displaySettings?.categories[type]) return null;

  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between py-2 hover:bg-slate-800/50 transition-colors"
      >
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-gray-400">
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="space-y-2 py-2">
          {filteredMarkets.map(market => (
            <MarketItem key={market.symbol} data={market} />
          ))}
        </div>
      </div>
    </div>
  );
}; 