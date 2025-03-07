import { useTheme, COLORS } from '../../constants/theme';
import { SparklineChart } from '../SparklineChart';
import type { MarketData } from '../../types/market';
import { getDisplaySymbol, getSymbolImage } from '../../utils/symbolUtils';
import { PriceSection } from './PriceSection';
import { ChangeSection } from './ChangeSection';
import { useState, useEffect } from 'react';

interface MarketItemProps {
    symbol: string;
    marketData: MarketData;
    chartData: Record<string, { close: string }>;
}

export const MarketItem = ({ symbol, marketData, chartData }: MarketItemProps) => {
    const { theme } = useTheme();
    const [isFlashing, setIsFlashing] = useState(false);
    const [latestValue, setLatestValue] = useState('');

    const newValue = symbol === 'BTC.D'
        ? marketData.value
        : (marketData.otc_price || marketData.current_price || marketData.current_value || marketData.rate || marketData.score || marketData.value);

    useEffect(() => {
        if (latestValue && latestValue !== newValue) {
            setIsFlashing(true);
            const timer = setTimeout(() => setIsFlashing(false), 400);
            return () => clearTimeout(timer);
        }
        setLatestValue(newValue || '');
    }, [newValue, latestValue]);

    return (
        <div
            className="w-full max-w-[266px] h-10 mx-auto flex items-center mb-2.5 relative rounded-[10px] transition-colors duration-300"
            style={{
                backgroundColor: isFlashing
                    ? `${COLORS[theme].primary}10`
                    : COLORS[theme].surface
            }}
        >
            <div className="flex items-center pl-3">
                <img
                    src={getSymbolImage(symbol)}
                    alt={symbol}
                    className="w-4 h-4"
                />
                <span
                    className="text-xs ml-1.5"
                    style={{ color: COLORS[theme].text.primary }}
                >
                    {getDisplaySymbol(symbol)}
                </span>
            </div>

            <PriceSection
                symbol={symbol}
                marketData={marketData}
            />

            {symbol !== 'BTC.D' && (
                <ChangeSection symbol={symbol} marketData={marketData} />
            )}

            {symbol !== 'Fear&Greed' && symbol !== 'BTC.D' && (
                <div className="absolute right-3">
                    <SparklineChart
                        data={chartData}
                        color={COLORS[theme].primary}
                        symbol={symbol}
                        marketData={marketData}
                    />
                </div>
            )}
        </div>
    );
}; 