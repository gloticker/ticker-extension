import { useTheme, COLORS } from '../../constants/theme';
import { getSymbolImage } from '../../utils/symbolUtils';
import { useI18n, TRANSLATIONS } from '../../constants/i18n';
import { useState, useEffect } from 'react';

interface SettingSectionProps {
    title: keyof typeof TRANSLATIONS.ko.settings | keyof typeof TRANSLATIONS.ko.sections;
    symbols?: string[];
    selectedSymbols?: string[];
    value?: string;
    isToggle?: boolean;
    isActive?: boolean;
    titleSize?: number;
    onToggle?: () => void;
    onSymbolToggle?: (symbol: string) => void;
    valueAlign?: 'right';
}

export const SettingSection = ({
    title,
    symbols = [],
    selectedSymbols = [],
    value,
    isToggle = false,
    isActive = true,
    titleSize,
    onToggle,
    onSymbolToggle,
    valueAlign,
}: SettingSectionProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();
    const [isValueFading, setIsValueFading] = useState(false);
    const [isTitleFading, setIsTitleFading] = useState(false);
    const [displayValue, setDisplayValue] = useState(value);
    const [displayTitle, setDisplayTitle] = useState('');

    const translatedTitle = TRANSLATIONS[language].settings[title as keyof typeof TRANSLATIONS.ko.settings]
        || TRANSLATIONS[language].sections[title as keyof typeof TRANSLATIONS.ko.sections]
        || title;

    useEffect(() => {
        if (value !== displayValue) {
            setIsValueFading(true);
            const timer = setTimeout(() => {
                setDisplayValue(value);
                setIsValueFading(false);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [value, displayValue]);

    useEffect(() => {
        setIsTitleFading(true);
        const timer = setTimeout(() => {
            setDisplayTitle(translatedTitle);
            setIsTitleFading(false);
        }, 150);
        return () => clearTimeout(timer);
    }, [translatedTitle]);

    return (
        <div className="mb-2.5">
            <div
                className="w-[288px] h-10 px-4 mx-auto flex items-center justify-between"
                style={{ color: COLORS[theme].text.primary }}
            >
                <span
                    className="transition-opacity duration-150"
                    style={{
                        fontSize: titleSize || 20,
                        flex: '0 0 auto',
                        opacity: isTitleFading ? 0 : 1,
                        fontWeight: 400
                    }}
                >
                    {displayTitle || translatedTitle}
                </span>
                {value ? (
                    <span
                        className={`flex-1 text-right ${valueAlign === 'right' ? 'mr-2' : ''} transition-opacity duration-150`}
                        style={{
                            color: COLORS[theme].text.secondary,
                            fontSize: '10px',
                            fontWeight: 400,
                            opacity: isValueFading ? 0 : 1
                        }}
                    >
                        {displayValue}
                    </span>
                ) : null}
                {isToggle && (
                    <div
                        className="w-[40px] h-[20px] rounded-full relative flex-shrink-0 cursor-pointer"
                        onClick={isToggle ? onToggle : undefined}
                        style={{ backgroundColor: COLORS[theme].surface }}
                    >
                        <div
                            className={`w-[16px] h-[16px] rounded-full absolute top-[2px] transition-transform duration-200 ease-in-out ${isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                            style={{
                                backgroundColor: isActive ? COLORS[theme].primary : COLORS[theme].text.secondary
                            }}
                        />
                    </div>
                )}
            </div>

            {symbols.length > 0 && (
                <div className="mt-2">
                    <div
                        className="w-full max-w-[266px] h-10 mx-auto flex items-center gap-4 rounded-[10px] px-3"
                        style={{
                            backgroundColor: COLORS[theme].surface,
                            opacity: isActive ? 1 : 0.5
                        }}
                    >
                        {symbols.map(symbol => (
                            <button
                                key={symbol}
                                onClick={() => onSymbolToggle?.(symbol)}
                                className={`w-[21px] h-[21px] rounded-full flex items-center justify-center transition-all duration-200 ${selectedSymbols.includes(symbol)
                                    ? `border opacity-100`
                                    : 'opacity-30 border border-transparent'
                                    }`}
                                style={{
                                    borderColor: selectedSymbols.includes(symbol) ? COLORS[theme].primary : 'transparent'
                                }}
                                disabled={!isActive}
                            >
                                <img
                                    src={getSymbolImage(symbol)}
                                    alt={symbol}
                                    className="w-[21px] h-[21px]"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
