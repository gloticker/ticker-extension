import { useTheme, COLORS } from '../../constants/theme';
import { MarketData } from '../../types/market';

interface PriceSectionProps {
    symbol: string;
    marketData: MarketData;
}

export const PriceSection = ({ symbol, marketData }: PriceSectionProps) => {
    const { theme } = useTheme();

    // 동일한 우선순위 적용
    const displayValue = symbol === 'BTC.D'
        ? marketData.value || '0'
        : (marketData.otc_price || marketData.current_price || marketData.current_value || marketData.rate || marketData.score || marketData.value || '0');

    return (
        <div className="absolute left-[35%] w-[30%] text-xs font-medium"
            style={{ color: COLORS[theme].text.primary }}
        >
            {displayValue}
        </div>
    );
};
