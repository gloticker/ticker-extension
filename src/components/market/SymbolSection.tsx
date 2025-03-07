import { useTheme, COLORS } from '../../constants/theme';
import { useI18n } from '../../constants/i18n';
import { getSymbolImage, getDisplaySymbol } from '../../utils/symbolUtils';

interface SymbolSectionProps {
    symbol: string;
}

export const SymbolSection = ({ symbol }: SymbolSectionProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();

    const translatedSymbol = getDisplaySymbol(symbol, language);

    return (
        <div className="flex items-center w-[35%]">
            <div>
                <img
                    src={getSymbolImage(symbol)}
                    alt={symbol}
                    className="w-4 h-4"
                />
            </div>
            <span
                className="text-sm ml-[6px]"
                style={{ color: COLORS[theme].text.primary }}
            >
                {translatedSymbol}
            </span>
        </div>
    );
};
