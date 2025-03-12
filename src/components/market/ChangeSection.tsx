import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { MarketData } from '../../types/market';

interface ChangeSectionProps {
    symbol: string;
    marketData: MarketData;
    isDetailsVisible: boolean;
}

const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const ChangeSection = ({ symbol, marketData, isDetailsVisible }: ChangeSectionProps) => {
    const { theme } = useTheme();

    const formatChange = (value: string) => {
        const numValue = Number(value);
        if (numValue === 0) return "0.00";
        const formattedValue = formatter.format(Math.abs(numValue));
        return numValue > 0 ? `+${formattedValue}` : `-${formattedValue}`;
    };

    if (symbol === 'BTC.D') {
        return null;
    }

    if (symbol === 'TOTAL3') {
        return (
            <div className="absolute w-[40%] left-[60%] h-full">
                <div className="relative h-full">
                    <span
                        className="absolute top-1/2 -translate-y-1/2 text-xs font-medium"
                        style={{
                            color: Number(marketData.change_percent) > 0 ? COLORS[theme].primary : COLORS[theme].danger,
                            fontWeight: 200
                        }}
                    >
                        {Number(marketData.change_percent) > 0 ? '+' : ''}{marketData.change_percent}%
                    </span>
                    {isDetailsVisible && (
                        <span
                            className="absolute bottom-0 text-[10px]"
                            style={{
                                color: COLORS[theme].text.primary,
                                fontWeight: 200
                            }}
                        >
                            {!marketData.change.toString().startsWith('-') ? '+' : ''}{marketData.change}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    const color = marketData.rating ? COLORS[theme].primary :
        Number(marketData.change_percent) > 0 ? COLORS[theme].primary :
            COLORS[theme].danger;

    return (
        <div className="absolute w-[40%] left-[60%] h-full">
            <div className="relative h-full">
                {/* 변동률(%) */}
                <span
                    className="absolute top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{
                        color,
                        fontWeight: 200
                    }}
                >
                    {marketData.rating ? marketData.rating : formatChange(marketData.change_percent) + '%'}
                </span>

                {/* 가격 변동 */}
                {!marketData.rating && isDetailsVisible && (
                    <span
                        className="absolute bottom-0 text-[10px]"
                        style={{
                            color: COLORS[theme].text.primary,
                            fontWeight: 200
                        }}
                    >
                        {formatChange(String(marketData.change))}
                    </span>
                )}
            </div>
        </div>
    );
};
