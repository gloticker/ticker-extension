import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { MarketData } from '../../types/market';
import { fontSize } from '../../utils/responsive';

interface PriceSectionProps {
    symbol: string;
    marketData: MarketData;
}

const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const PriceSection = ({ symbol, marketData }: PriceSectionProps) => {
    const { theme } = useTheme();

    // 동일한 우선순위 적용
    const displayValue = symbol === 'BTC.D'
        ? marketData.value + ' %'
        : symbol === 'TOTAL3'
            ? marketData.value + ' %'
            : (marketData.otc_price || marketData.current_price || marketData.current_value || marketData.rate || marketData.score || marketData.value || '0');

    const formattedValue = symbol === 'TOTAL3' || symbol === 'BTC.D'
        ? displayValue
        : displayValue ? formatter.format(parseFloat(displayValue)) : '0.00';

    return (
        <div
            style={{
                position: 'absolute',
                left: '35%',
                width: '30%',
                fontSize: fontSize(12),
                color: COLORS[theme].text.primary,
                fontWeight: 200
            }}
        >
            {formattedValue}
        </div>
    );
};
