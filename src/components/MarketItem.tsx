import { useEffect, useState } from 'react';
import { MarketData } from '../types/market';
import { SparklineChart } from './SparklineChart';
import { fetchHistoricalData } from '../utils/api';
import { getAssetIcon } from '../utils/getAssetIcon';

interface MarketItemProps {
  data: MarketData;
}

export const MarketItem = ({ data }: MarketItemProps) => {
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isPositive = data.change >= 0;
  const changeClass = isPositive ? "text-green-500" : "text-red-500";
  const marketStateText = data.type === "STOCK" || data.type === "INDEX"
    ? { PRE: "", POST: "", REGULAR: "", CLOSED: "" }[data.marketState || "CLOSED"]
    : "";

  const formatNumber = (num: number) => num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (data.symbol === "FEAR.GREED" || data.symbol === "BTC.D") {
        setChartData([]);
        return;
      }

      setIsLoading(true);
      try {
        const history = await fetchHistoricalData(data.symbol, data.type);
        if (Array.isArray(history) &&
          history.length > 0 &&
          history.every(item =>
            item &&
            typeof item.time === 'string' &&
            typeof item.value === 'number' &&
            !isNaN(item.value)
          )) {
          setChartData(history);
        } else {
          setChartData([]);
        }
      } catch {
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [data.symbol, data.type]);

  // 장외 거래 가격 변동 계산 (주식과 지수에만)
  const getPrePostChange = () => {
    if (data.type !== 'STOCK' && data.type !== 'INDEX') return '';

    if (data.marketState === 'PRE' && data.preMarketPrice && data.previousClose) {
      const change = data.preMarketPrice - data.previousClose;
      return `(${change >= 0 ? '+' : ''}${formatNumber(change / data.previousClose * 100)}%)`;
    }
    if (data.marketState === 'POST' && data.postMarketPrice && data.regularMarketPrice) {
      const change = data.postMarketPrice - data.regularMarketPrice;
      return `(${change >= 0 ? '+' : ''}${formatNumber(change / data.regularMarketPrice * 100)}%)`;
    }
    return '';
  };

  const getMarketUrl = (symbol: string, type: string) => {
    switch (type) {
      case "CRYPTO":
        if (symbol === "BTC.D") {
          return "https://coinmarketcap.com/charts/";
        }
        return `https://www.binance.com/en/trade/${symbol.replace("-USD", "USDT")}`;

      case "INDEX":
        if (symbol === "FEAR.GREED") {
          return "https://edition.cnn.com/markets/fear-and-greed";
        }
        return `https://finance.yahoo.com/quote/${symbol}`;

      default:
        return `https://finance.yahoo.com/quote/${symbol}`;
    }
  };

  return (
    <div
      className="flex justify-between items-center p-2 hover:bg-slate-800 rounded cursor-pointer"
      onClick={() => {
        const url = getMarketUrl(data.symbol, data.type);
        if (url) window.open(url, "_blank");
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <img
            src={getAssetIcon(data.symbol, data.type)}
            alt={data.name}
            className="w-4 h-4 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs">
              {data.price ? formatNumber(data.price) : "0.00"}
            </span>
            {marketStateText && (
              <span className="text-xs text-gray-400">
                {marketStateText} {getPrePostChange()}
              </span>
            )}
          </div>
          <div className="w-10 h-4 flex items-center justify-center">
            {isLoading ? (
              <span className="text-xs text-gray-400">...</span>
            ) : data.symbol !== "FEAR.GREED" && data.symbol !== "BTC.D" && chartData.length > 0 ? (
              <SparklineChart data={chartData} isPositive={data.change >= 0} />
            ) : data.symbol === "FEAR.GREED" && data.rating && (
              <span className="text-xs text-gray-400">({data.rating})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${changeClass}`}>
            {data.change ? (
              `${isPositive ? '+' : ''}${formatNumber(data.change)}`
            ) : '+0.00'}
          </span>
          <span className={`text-xs ${changeClass}`}>
            {data.changePercent ? (
              `${isPositive ? '+' : ''}${formatNumber(data.changePercent)}%`
            ) : '+0.00%'}
          </span>
        </div>
      </div>
    </div>
  );
};
