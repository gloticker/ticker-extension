import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { getSymbolImage } from '../../utils/symbolUtils';
import { TRANSLATIONS } from '../../constants/i18n';
import { useState, useEffect } from 'react';
import { vmin, fontSize } from '../../utils/responsive';

interface SettingSectionProps {
    title: string;
    symbols?: string[];
    selectedSymbols?: string[];
    value?: string;
    isToggle?: boolean;
    isActive?: boolean;
    titleSize?: string;
    onToggle?: () => void;
    onSymbolToggle?: (symbol: string) => void;
    language: string;
}

export const SettingSection = ({
    title,
    symbols = [],
    selectedSymbols = [],
    value,
    isToggle = false,
    isActive = true,
    onToggle,
    onSymbolToggle,
    language
}: SettingSectionProps) => {
    const { theme } = useTheme();
    const [isValueFading, setIsValueFading] = useState(false);
    const [isTitleFading, setIsTitleFading] = useState(false);
    const [displayValue, setDisplayValue] = useState(value);
    const [displayTitle, setDisplayTitle] = useState('');

    const translatedTitle = TRANSLATIONS[language as keyof typeof TRANSLATIONS].settings[title as keyof typeof TRANSLATIONS.ko.settings]
        || TRANSLATIONS[language as keyof typeof TRANSLATIONS].sections[title as keyof typeof TRANSLATIONS.ko.sections]
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

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        }
    };

    return (
        <div style={{ marginBottom: vmin(10) }}>
            <div
                style={{
                    width: '100%',
                    maxWidth: vmin(266),
                    height: vmin(40),
                    padding: `0 ${vmin(12)}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: COLORS[theme].text.primary
                }}
            >
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span
                        style={{
                            transition: 'opacity 150ms',
                            display: 'inline-block',
                            width: vmin(80),
                            fontSize: fontSize(20),
                            opacity: isTitleFading ? 0 : 1,
                            fontWeight: 400,
                            letterSpacing: '2px'
                        }}
                    >
                        {displayTitle || translatedTitle}
                    </span>
                    {(title === 'Forex' || title === 'Stock' || title === 'Crypto') && (
                        <span
                            style={{
                                fontSize: fontSize(10),
                                color: COLORS[theme].text.secondary,
                                opacity: isTitleFading ? 0 : 1,
                                fontWeight: 400,
                                letterSpacing: '1px'
                            }}
                        >
                            ({title === 'Forex'
                                ? TRANSLATIONS[language as keyof typeof TRANSLATIONS].forexSubtitle
                                : title === 'Stock'
                                    ? TRANSLATIONS[language as keyof typeof TRANSLATIONS].stockSubtitle
                                    : TRANSLATIONS[language as keyof typeof TRANSLATIONS].cryptoSubtitle})
                        </span>
                    )}
                </div>
                {value ? (
                    <span
                        style={{
                            transition: 'opacity 150ms',
                            fontSize: fontSize(10),
                            whiteSpace: 'pre-line',
                            lineHeight: 1.5,
                            flex: 1,
                            textAlign: 'right',
                            color: COLORS[theme].text.secondary,
                            opacity: isValueFading ? 0 : 1,
                            fontWeight: 400,
                            letterSpacing: '1px',
                            marginRight: vmin(8),
                            marginLeft: (title === 'Details' || title === 'Theme' || title === 'Language') ? vmin(30) : undefined
                        }}
                    >
                        {displayValue}
                    </span>
                ) : null}
                {isToggle && (
                    <div
                        style={{
                            width: vmin(40),
                            height: vmin(20),
                            borderRadius: '9999px',
                            position: 'relative',
                            flexShrink: 0,
                            cursor: 'pointer',
                            backgroundColor: COLORS[theme].surface
                        }}
                        onClick={handleToggle}
                    >
                        <div
                            style={{
                                width: vmin(16),
                                height: vmin(16),
                                borderRadius: '9999px',
                                position: 'absolute',
                                top: vmin(2),
                                transition: 'transform 200ms ease-in-out',
                                transform: `translateX(${isActive ? vmin(22) : vmin(2)})`,
                                backgroundColor: isActive ? COLORS[theme].primary : COLORS[theme].text.secondary
                            }}
                        />
                    </div>
                )}
            </div>

            {symbols.length > 0 && (
                <div style={{ marginTop: vmin(8) }}>
                    <div
                        style={{
                            width: '100%',
                            maxWidth: vmin(266),
                            height: vmin(40),
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: vmin(16),
                            padding: `0 ${vmin(12)}`,
                            borderRadius: vmin(10),
                            backgroundColor: COLORS[theme].surface,
                            opacity: isActive ? 1 : 0.5
                        }}
                    >
                        {symbols.map(symbol => (
                            <button
                                key={symbol}
                                onClick={() => onSymbolToggle?.(symbol)}
                                style={{
                                    width: vmin(21),
                                    height: vmin(21),
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 200ms',
                                    opacity: selectedSymbols.includes(symbol) ? 1 : 0.3,
                                    border: `${vmin(1)} solid ${selectedSymbols.includes(symbol) ? COLORS[theme].primary : 'transparent'}`
                                }}
                                disabled={!isActive}
                            >
                                <img
                                    src={getSymbolImage(symbol)}
                                    alt={symbol}
                                    style={{
                                        width: vmin(21),
                                        height: vmin(21)
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
