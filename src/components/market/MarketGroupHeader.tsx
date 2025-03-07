import { useTheme, COLORS } from '../../constants/theme';
import { useI18n, TRANSLATIONS } from '../../constants/i18n';
import { useState, useEffect } from 'react';

interface MarketGroupHeaderProps {
    type: string;
    isExpanded: boolean;
    onToggle: () => void;
}

export const MarketGroupHeader = ({ type, isExpanded, onToggle }: MarketGroupHeaderProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();
    const [isTitleFading, setIsTitleFading] = useState(false);
    const [displayTitle, setDisplayTitle] = useState('');

    const translatedTitle = TRANSLATIONS[language].sections[type as keyof typeof TRANSLATIONS.ko.sections] || type;
    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

    useEffect(() => {
        setIsTitleFading(true);
        const timer = setTimeout(() => {
            setDisplayTitle(translatedTitle);
            setIsTitleFading(false);
        }, 150);
        return () => clearTimeout(timer);
    }, [translatedTitle]);

    return (
        <div
            className="w-full max-w-100 h-10 px-4 mx-auto flex items-center justify-between text-xl mb-2.5 cursor-pointer"
            onClick={onToggle}
            style={{ color: COLORS[theme].text.primary }}
        >
            <span
                className="transition-opacity duration-150"
                style={{ opacity: isTitleFading ? 0 : 1 }}
            >
                {displayTitle || translatedTitle}
            </span>
            <img
                src={`/images/icon/${isExpanded ? 'close' : 'open'}.svg`}
                alt={isExpanded ? 'close' : 'open'}
                className="mr-[5px]"
                style={{
                    filter: `brightness(${brightness})`
                }}
            />
        </div>
    );
};
