import { useMarketStore } from '../stores/marketStore';
import { MarketItem } from './MarketItem';
import { MarketType } from '../types/market';

interface MarketListProps {
  type?: MarketType;
}

export const MarketList = ({ type }: MarketListProps) => {
  const markets = useMarketStore((state) => state.markets);

  const filteredMarkets = Object.values(markets).filter(
    (market) => !type || market.type === type
  );

  return (
    <div className="space-y-2">
      {filteredMarkets.map((market) => (
        <MarketItem key={market.symbol} data={market} />
      ))}
    </div>
  );
};
