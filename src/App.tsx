import { MarketSection } from './components/MarketSection';
import { useMarketData } from './hooks/useMarketData';

function App() {
  useMarketData();

  return (
    <div className="w-[300px] h-[600px] p-4 bg-slate-900 text-white overflow-y-auto scrollbar-hide">
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <h1 className="text-xl font-bold mb-4">inviticker</h1>

      <div className="space-y-2">
        <MarketSection title="INDEX" type="INDEX" />
        <MarketSection title="STOCK" type="STOCK" />
        <MarketSection title="CRYPTO" type="CRYPTO" />
        <MarketSection title="CURRENCY" type="FOREX" />
      </div>
    </div>
  );
}

export default App;
