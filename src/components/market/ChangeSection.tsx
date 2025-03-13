import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { MarketData } from '../../types/market';
import { fontSize } from '../../utils/responsive';

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
            <div style={{
                position: 'absolute',
                width: '40%',
                left: '60%',
                height: '100%'
            }}>
                <div style={{ position: 'relative', height: '100%' }}>
                    {isDetailsVisible && (
                        <span
                            style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: fontSize(12),
                                color: Number(marketData.change_percent) > 0 ? COLORS[theme].primary : COLORS[theme].danger,
                                fontWeight: 200
                            }}
                        >
                            {Number(marketData.change_percent) > 0 ? '+' : ''}{marketData.change_percent}%
                        </span>
                    )}
                    {isDetailsVisible && (
                        <span
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                fontSize: fontSize(10),
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

    const changePercent = marketData.otc_price && marketData.otc_change_percent ? marketData.otc_change_percent : marketData.change_percent;
    const changeValue = marketData.otc_price && marketData.otc_change ? marketData.otc_change : String(marketData.change);

    const color = marketData.rating ? COLORS[theme].primary :
        Number(changePercent) > 0 ? COLORS[theme].primary :
            COLORS[theme].danger;

    return (
        <div style={{
            position: 'absolute',
            width: '40%',
            left: '60%',
            height: '100%'
        }}>
            <div style={{ position: 'relative', height: '100%' }}>
                {/* 변동률(%) */}
                <span
                    style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: fontSize(12),
                        color,
                        fontWeight: 200
                    }}
                >
                    {marketData.rating ? marketData.rating : formatChange(changePercent) + '%'}
                </span>

                {/* 가격 변동 */}
                {!marketData.rating && isDetailsVisible && (
                    <span
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            fontSize: fontSize(10),
                            color: COLORS[theme].text.primary,
                            fontWeight: 200
                        }}
                    >
                        {formatChange(changeValue)}
                    </span>
                )}
            </div>
        </div>
    );
};
