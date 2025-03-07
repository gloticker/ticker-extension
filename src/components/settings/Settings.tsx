import { useState } from 'react';
import { SettingsHeader } from './SettingsHeader';
import { SettingSection } from './SettingSection';
import { useTheme } from '../../constants/theme';
import { useI18n, TRANSLATIONS } from '../../constants/i18n';

const ORDER_MAP = {
    Index: ['^IXIC', '^GSPC', '^RUT', '^TLT', '^VIX', 'Fear&Greed'],
    Stock: ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'],
    Crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BTC.D'],
    Forex: ['KRW=X', 'EURKRW=X', 'CNYKRW=X', 'JPYKRW=X']
};

interface SettingsProps {
    onClose: () => void;
}

export const Settings = ({ onClose }: SettingsProps) => {
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage } = useI18n();
    const [selectedSymbols, setSelectedSymbols] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem('selectedSymbols');
        return saved ? JSON.parse(saved) : {
            Index: ORDER_MAP.Index,
            Stock: ORDER_MAP.Stock,
            Crypto: ORDER_MAP.Crypto,
            Forex: ORDER_MAP.Forex
        };
    });

    const [activeSections, setActiveSections] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('activeSections');
        return saved ? JSON.parse(saved) : {
            Index: true,
            Stock: true,
            Crypto: true,
            Forex: true
        };
    });

    const [lastSelectedState, setLastSelectedState] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem('lastSelectedState');
        return saved ? JSON.parse(saved) : {
            Index: ORDER_MAP.Index,
            Stock: ORDER_MAP.Stock,
            Crypto: ORDER_MAP.Crypto,
            Forex: ORDER_MAP.Forex
        };
    });

    const handleSymbolToggle = (section: string, symbol: string) => {
        if (!activeSections[section]) return;

        setSelectedSymbols(prev => {
            const newSelected = prev[section].includes(symbol)
                ? prev[section].filter(s => s !== symbol)
                : [...prev[section], symbol];

            const newState = {
                ...prev,
                [section]: newSelected
            };

            localStorage.setItem('selectedSymbols', JSON.stringify(newState));
            window.dispatchEvent(new Event('settingsChange'));
            return newState;
        });
    };

    const handleSectionToggle = (section: string) => {
        setActiveSections(prev => {
            const newState = {
                ...prev,
                [section]: !prev[section]
            };

            if (!newState[section]) {
                setLastSelectedState(prev => ({
                    ...prev,
                    [section]: selectedSymbols[section]
                }));
                localStorage.setItem('lastSelectedState', JSON.stringify({
                    ...lastSelectedState,
                    [section]: selectedSymbols[section]
                }));

                setSelectedSymbols(prev => ({
                    ...prev,
                    [section]: []
                }));
            } else {
                setSelectedSymbols(prev => ({
                    ...prev,
                    [section]: lastSelectedState[section]
                }));
            }

            localStorage.setItem('activeSections', JSON.stringify(newState));
            localStorage.setItem('selectedSymbols', JSON.stringify({
                ...selectedSymbols,
                [section]: newState[section] ? lastSelectedState[section] : []
            }));
            window.dispatchEvent(new Event('settingsChange'));
            return newState;
        });
    };

    const languageValue = language === 'ko'
        ? `${TRANSLATIONS.ko.settings.Korean} | ${TRANSLATIONS.ko.settings.English}`
        : `${TRANSLATIONS.en.settings.Korean} | ${TRANSLATIONS.en.settings.English}`;

    const themeValue = language === 'ko'
        ? `${TRANSLATIONS.ko.settings.Light} | ${TRANSLATIONS.ko.settings.Dark}`
        : `${TRANSLATIONS.en.settings.Light} | ${TRANSLATIONS.en.settings.Dark}`;

    return (
        <div className="h-full flex flex-col">
            <SettingsHeader onBackClick={onClose} />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="space-y-2">
                    <SettingSection
                        title="Index"
                        symbols={ORDER_MAP.Index}
                        selectedSymbols={selectedSymbols.Index}
                        isActive={activeSections.Index}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Index')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Index', symbol)}
                    />
                    <SettingSection
                        title="Stock"
                        symbols={ORDER_MAP.Stock}
                        selectedSymbols={selectedSymbols.Stock}
                        isActive={activeSections.Stock}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Stock')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Stock', symbol)}
                    />
                    <SettingSection
                        title="Crypto"
                        symbols={ORDER_MAP.Crypto}
                        selectedSymbols={selectedSymbols.Crypto}
                        isActive={activeSections.Crypto}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Crypto')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Crypto', symbol)}
                    />
                    <SettingSection
                        title="Forex"
                        symbols={ORDER_MAP.Forex}
                        selectedSymbols={selectedSymbols.Forex}
                        isActive={activeSections.Forex}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Forex')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Forex', symbol)}
                    />
                    <SettingSection
                        title="Price Change"
                        isToggle={true}
                    />
                    <SettingSection
                        title="Theme"
                        value={themeValue}
                        valueAlign="right"
                        isToggle={true}
                        isActive={theme === 'dark'}
                        onToggle={toggleTheme}
                    />
                    <SettingSection
                        title="Language"
                        value={languageValue}
                        valueAlign="right"
                        isToggle={true}
                        isActive={language === 'en'}
                        onToggle={toggleLanguage}
                    />
                </div>
            </div>
        </div>
    );
};
