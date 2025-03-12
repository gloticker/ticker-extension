import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { useI18n } from '../../hooks/useI18n';
import { TRANSLATIONS } from '../../constants/i18n';
import { vmin, fontSize } from '../../utils/responsive';

interface MarketGroupHeaderProps {
    type: string;
    isExpanded: boolean;
    onToggle: () => void;
}

export const MarketGroupHeader = ({ type, isExpanded, onToggle }: MarketGroupHeaderProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();
    const translatedTitle = TRANSLATIONS[language].sections[type as keyof typeof TRANSLATIONS.ko.sections] || type;
    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

    return (
        <div
            onClick={onToggle}
            style={{
                width: '100%',
                maxWidth: vmin(266),
                height: vmin(40),
                padding: `0 ${vmin(12)}px`,
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: vmin(10),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                color: COLORS[theme].text.primary
            }}
        >
            <span style={{
                fontWeight: 400,
                letterSpacing: '2px',
                fontSize: fontSize(20)
            }}>
                {translatedTitle}
            </span>
            <div style={{
                width: vmin(20),
                height: vmin(20),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img
                    src={`/images/icon/${isExpanded ? 'close' : 'open'}.svg`}
                    alt={isExpanded ? 'close' : 'open'}
                    style={{
                        width: vmin(18),
                        height: vmin(18),
                        filter: `brightness(${brightness})`
                    }}
                />
            </div>
        </div>
    );
};
