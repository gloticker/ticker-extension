import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { useI18n } from '../../hooks/useI18n';
import { TRANSLATIONS } from '../../constants/i18n';

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
            className="w-[288px] h-10 px-4 mx-auto flex items-center justify-between text-xl mb-2.5 cursor-pointer"
            onClick={onToggle}
            style={{ color: COLORS[theme].text.primary }}
        >
            <span style={{
                fontWeight: 400,
                letterSpacing: '2px'
            }}>
                {translatedTitle}
            </span>
            <img
                src={`/images/icon/${isExpanded ? 'close' : 'open'}.svg`}
                alt={isExpanded ? 'close' : 'open'}
                style={{
                    filter: `brightness(${brightness})`
                }}
            />
        </div>
    );
};
