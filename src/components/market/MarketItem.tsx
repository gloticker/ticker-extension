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
import { vmin, fontSize } from '../../utils/responsive';

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
    const isDelayedData = symbol === '^RUT' || symbol === '^VIX';

    return (
        <div
            style={{
                width: '100%',
                maxWidth: vmin(266),
                height: vmin(40),
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'flex',
                alignItems: 'center',
                marginBottom: vmin(10),
                position: 'relative',
                borderRadius: vmin(10),
                transition: 'colors 300ms',
                backgroundColor: isFlashing
                    ? `${COLORS[theme].primary}10`
                    : COLORS[theme].surface,
                cursor: 'pointer'
            }}
            onClick={() => window.open(symbolInfo.link, '_blank')}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: vmin(12),
                width: '35%'
            }}>
                <img
                    src={getSymbolImage(symbol)}
                    alt={symbol}
                    style={{
                        width: vmin(16),
                        height: vmin(16)
                    }}
                />
                <span
                    style={{
                        marginLeft: vmin(6),
                        fontSize: symbolInfo.displayName.length > 6 ? fontSize(9) : fontSize(12),
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
                    className="group"
                    style={{
                        position: 'absolute',
                        left: vmin(73),
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        fontSize: fontSize(9),
                        color: COLORS[theme].text.secondary,
                        backgroundColor: COLORS[theme].surface,
                        padding: `0 ${vmin(2)}px`,
                        fontWeight: 400
                    }}
                >
                    D
                    <span
                        className="invisible group-hover:visible"
                        style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bottom: '100%',
                            padding: `${vmin(4)}px ${vmin(8)}px`,
                            fontSize: fontSize(10),
                            whiteSpace: 'nowrap',
                            color: COLORS[theme].text.secondary
                        }}
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
                <div style={{
                    position: 'absolute',
                    right: vmin(12),
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 500,
                    overflow: 'visible'
                }}>
                    <div style={{ position: 'relative', overflow: 'visible' }}>
                        {symbol === 'TOTAL3' ? (
                            <div style={{
                                width: vmin(40),
                                height: vmin(20),
                                position: 'relative'
                            }}>
                                {isDetailsVisible && (
                                    <span
                                        style={{
                                            fontSize: fontSize(10),
                                            color: COLORS[theme].text.primary,
                                            fontWeight: 200,
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
                                    width={40}
                                    height={20}
                                />
                                {isDetailsVisible && marketData.market_cap && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            fontSize: fontSize(10),
                                            bottom: vmin(-10),
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