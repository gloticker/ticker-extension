import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { SparklineChart } from './SparklineChart';
import type { MarketData } from '../../types/market';
import { getSymbolImage, getSymbolInfo } from '../../utils/symbolUtils';
import { PriceSection } from './PriceSection';
import { ChangeSection } from './ChangeSection';
import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { TRANSLATIONS } from '../../constants/i18n';

interface MarketItemProps {
    symbol: string;
    marketData: MarketData;
    chartData: Record<string, { close: string }>;
    isDetailsVisible: boolean;
}

export const MarketItem = ({ symbol, marketData, chartData, isDetailsVisible }: MarketItemProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();
    const [isFlashing, setIsFlashing] = useState(false);
    const [latestValue, setLatestValue] = useState('');

    const newValue = symbol === 'TOTAL3'
        ? marketData.market_cap
        : symbol === 'BTC.D'
            ? marketData.value + ' %'
            : (marketData.otc_price || marketData.current_price || marketData.current_value || marketData.rate || marketData.score || marketData.value);

    useEffect(() => {
        if (latestValue && latestValue !== newValue) {
            setIsFlashing(true);
            const timer = setTimeout(() => setIsFlashing(false), 400);
            return () => clearTimeout(timer);
        }
        setLatestValue(newValue || '');
    }, [newValue, latestValue]);

    const symbolInfo = getSymbolInfo(symbol, language);
    const textSizeClass = symbolInfo.displayName.length > 6 ? 'text-[9px]' : 'text-xs';
    const isDelayedData = symbol === '^RUT' || symbol === '^VIX';

    return (
        <div
            className="w-full max-w-[266px] h-10 mx-auto flex items-center mb-2.5 relative rounded-[10px] transition-colors duration-300"
            onClick={() => window.open(symbolInfo.link, '_blank')}
            style={{
                backgroundColor: isFlashing
                    ? `${COLORS[theme].primary}10`
                    : COLORS[theme].surface,
                cursor: 'pointer'
            }}
        >
            <div className="flex items-center pl-3 w-[35%]">
                <img
                    src={getSymbolImage(symbol)}
                    alt={symbol}
                    className="w-4 h-4"
                />
                <span
                    className={`${textSizeClass} ml-1.5`}
                    style={{
                        color: COLORS[theme].text.primary,
                        fontWeight: 400,
                        letterSpacing: symbolInfo.displayName.length > 6 ? '0px' : '1px'
                    }}
                >
                    {symbolInfo.displayName}
                </span>
            </div>

            <PriceSection
                symbol={symbol}
                marketData={marketData}
            />
            {isDelayedData && (
                <span
                    className="absolute text-[9px] left-[73px] top-1/2 -translate-y-1/2 z-10 group"
                    style={{
                        color: COLORS[theme].text.secondary,
                        backgroundColor: COLORS[theme].surface,
                        padding: '0 2px',
                        fontWeight: 400
                    }}
                >
                    D
                    <span
                        className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-[60%] px-2 py-1 text-[10px] whitespace-nowrap"
                        style={{ color: COLORS[theme].text.secondary }}
                    >
                        {TRANSLATIONS[language].delayed}
                    </span>
                </span>
            )}

            <ChangeSection
                symbol={symbol}
                marketData={marketData}
                isDetailsVisible={isDetailsVisible}
            />

            {symbol !== 'Fear&Greed' && symbol !== 'BTC.D' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-medium" style={{ overflow: 'visible' }}>
                    <div className="relative" style={{ overflow: 'visible' }}>
                        {symbol === 'TOTAL3' ? (
                            <div style={{ width: '40px', height: '20px', position: 'relative' }}>
                                {isDetailsVisible && (
                                    <span
                                        style={{
                                            color: COLORS[theme].text.primary,
                                            fontWeight: 200,
                                            fontSize: '10px',
                                            whiteSpace: 'nowrap',
                                            position: 'absolute',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }}
                                    >
                                        {marketData.market_cap}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <>
                                <SparklineChart
                                    data={chartData}
                                    color={COLORS[theme].primary}
                                    symbol={symbol}
                                    marketData={marketData}
                                />
                                {isDetailsVisible && marketData.market_cap && (
                                    <span
                                        className="absolute text-[10px] -bottom-[10px]"
                                        style={{
                                            color: COLORS[theme].text.primary,
                                            fontWeight: 200,
                                            whiteSpace: 'nowrap',
                                            overflow: 'visible'
                                        }}
                                    >
                                        {marketData.market_cap}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}; 