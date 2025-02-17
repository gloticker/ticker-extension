import { useState, useEffect } from 'react';
import { MarketSection } from './components/MarketSection';
import { SettingsPage } from './components/SettingsPage';
import { useMarketStore } from './store/marketStore';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const setMarkets = useMarketStore(state => state.setMarkets);

  // 마켓 데이터 로드
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const result = await chrome.storage.local.get(null);
        const marketData = Object.entries(result)
          .filter(([key]) => key !== 'displaySettings')
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value
          }), {});

        console.log('Loaded market data:', marketData);
        setMarkets(marketData);
      } catch (error) {
        console.error('Failed to load market data:', error);
      }
    };

    loadMarketData();
  }, [setMarkets]);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        port.postMessage({ type: "CHECK_CONNECTIONS" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      port.disconnect();
    };
  }, []);

  return (
    <div className="w-[300px] h-[600px] bg-slate-900 text-white overflow-hidden">
      <div className="relative w-full h-full">
        <div
          className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-[-100%]' : 'translate-x-0'
            }`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">inviticker</h1>
              <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white">
                <img src="images/setting.svg" alt="Settings" className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                <MarketSection title="INDEX" type="INDEX" />
                <MarketSection title="STOCK" type="STOCK" />
                <MarketSection title="CRYPTO" type="CRYPTO" />
                <MarketSection title="CURRENCY" type="FOREX" />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-0' : 'translate-x-[100%]'
            }`}
        >
          <SettingsPage onClose={() => setShowSettings(false)} />
        </div>
      </div>
    </div>
  );
}

export default App;
