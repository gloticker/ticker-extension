import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../constants/theme';
import { MarketData } from '../../types/market';

interface ChangeSectionProps {
    symbol: string;
    marketData: MarketData;
}

export const ChangeSection = ({ symbol, marketData }: ChangeSectionProps) => {
    const { theme } = useTheme();
    const formatChange = (value: string) => {
        const numValue = Number(value);
        if (numValue === 0) return "0.00";
        return numValue > 0 ? `+${value}` : value;
    };

    if (symbol === 'BTC.D') {
        return null;
    }

    return (
        <div className="absolute w-[40%] left-[60%] h-full">
            <div className="relative h-full">
                <span
                    className="absolute top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{
                        color: marketData.rating ? COLORS[theme].primary :
                            Number(marketData.change_percent) > 0 ? COLORS[theme].primary :
                                COLORS[theme].danger
                    }}
                >
                    {marketData.rating ? marketData.rating : formatChange(marketData.change_percent) + '%'}
                </span>
                <span
                    className="absolute bottom-0 text-[10px]"
                    style={{ color: COLORS[theme].text.secondary }}
                >
                    {formatChange(marketData.change)}
                </span>
            </div>
        </div>
    );
};
