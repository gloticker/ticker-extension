import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { MarketData } from '../../types/market';
import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';

interface ChangeSectionProps {
    symbol: string;
    marketData: MarketData;
}

const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const ChangeSection = ({ symbol, marketData }: ChangeSectionProps) => {
    const { theme } = useTheme();
    const [isPriceChangeVisible, setIsPriceChangeVisible] = useState(true);

    useEffect(() => {
        const loadPriceChangeVisible = async () => {
            const saved = await storage.get<boolean>('isPriceChangeVisible');
            if (saved !== null) {
                setIsPriceChangeVisible(saved);
            }
        };
        loadPriceChangeVisible();
    }, []);

    useEffect(() => {
        const handleSettingsChange = async () => {
            const saved = await storage.get<boolean>('isPriceChangeVisible');
            if (saved !== null) {
                setIsPriceChangeVisible(saved);
            }
        };

        window.addEventListener('settingsChange', handleSettingsChange);
        return () => window.removeEventListener('settingsChange', handleSettingsChange);
    }, []);

    const formatChange = (value: string) => {
        const numValue = Number(value);
        if (numValue === 0) return "0.00";
        const formattedValue = formatter.format(Math.abs(numValue));
        return numValue > 0 ? `+${formattedValue}` : `-${formattedValue}`;
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
                {!marketData.rating && isPriceChangeVisible && (
                    <span
                        className="absolute bottom-0 text-[10px]"
                        style={{ color: COLORS[theme].text.secondary }}
                    >
                        {formatChange(String(marketData.change))}
                    </span>
                )}
            </div>
        </div>
    );
};
