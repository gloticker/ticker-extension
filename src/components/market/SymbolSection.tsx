import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { useI18n } from '../../hooks/useI18n';
import { getSymbolImage, getDisplaySymbol } from '../../utils/symbolUtils';
import { vmin, fontSize } from '../../utils/responsive';

interface SymbolSectionProps {
    symbol: string;
}

export const SymbolSection = ({ symbol }: SymbolSectionProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();

    const translatedSymbol = getDisplaySymbol(symbol, language);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '35%',
            paddingLeft: vmin(12)
        }}>
            <div>
                <img
                    src={getSymbolImage(symbol)}
                    alt={symbol}
                    style={{
                        width: vmin(16),
                        height: vmin(16)
                    }}
                />
            </div>
            <span
                style={{
                    marginLeft: vmin(6),
                    fontSize: fontSize(14),
                    color: COLORS[theme].text.primary
                }}
            >
                {translatedSymbol}
            </span>
        </div>
    );
};
