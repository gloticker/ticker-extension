import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { MarketData } from '../../types/market';

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
        ? marketData.value || '0'
        : (marketData.otc_price || marketData.current_price || marketData.current_value || marketData.rate || marketData.score || marketData.value || '0');

    const formattedValue = displayValue ? formatter.format(parseFloat(displayValue)) : '0.00';

    return (
        <div className="absolute left-[35%] w-[30%] text-xs font-medium"
            style={{
                color: COLORS[theme].text.primary,
                fontWeight: 400
            }}
        >
            {formattedValue}
        </div>
    );
};
