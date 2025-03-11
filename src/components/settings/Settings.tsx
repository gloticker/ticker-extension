import { useState, useEffect } from 'react';
import { SettingsHeader } from './SettingsHeader';
import { SettingSection } from './SettingSection';
import { useTheme } from '../../hooks/useTheme';
import { useI18n } from '../../hooks/useI18n';
import { TRANSLATIONS } from '../../constants/i18n';
import { storage } from "../../utils/storage";

const ORDER_MAP = {
    Index: ['^IXIC', '^GSPC', '^DJI', '^RUT', '^TLT', '^VIX', 'Fear&Greed'],
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
    const [selectedSymbols, setSelectedSymbols] = useState<Record<string, string[]>>({
        Index: ORDER_MAP.Index,
        Stock: ORDER_MAP.Stock,
        Crypto: ORDER_MAP.Crypto,
        Forex: ORDER_MAP.Forex
    });

    const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
        Index: true,
        Stock: true,
        Crypto: true,
        Forex: true
    });

    const [lastSelectedState, setLastSelectedState] = useState<Record<string, string[]>>({
        Index: ORDER_MAP.Index,
        Stock: ORDER_MAP.Stock,
        Crypto: ORDER_MAP.Crypto,
        Forex: ORDER_MAP.Forex
    });

    const [isPriceChangeVisible, setIsPriceChangeVisible] = useState(true);

    useEffect(() => {
        const loadInitialState = async () => {
            const savedSymbols = await storage.get<Record<string, string[]>>('selectedSymbols');
            if (savedSymbols) {
                setSelectedSymbols(savedSymbols);
            }

            const savedSections = await storage.get<Record<string, boolean>>('activeSections');
            if (savedSections) {
                setActiveSections(savedSections);
            }

            const savedLastState = await storage.get<Record<string, string[]>>('lastSelectedState');
            if (savedLastState) {
                setLastSelectedState(savedLastState);
            }

            const savedPriceChange = await storage.get<boolean>('isPriceChangeVisible');
            if (savedPriceChange !== null) {
                setIsPriceChangeVisible(savedPriceChange);
            }
        };

        loadInitialState();
    }, []);

    const handleSymbolToggle = async (section: string, symbol: string) => {
        if (!activeSections[section]) return;

        const newSelected = selectedSymbols[section].includes(symbol)
            ? selectedSymbols[section].filter(s => s !== symbol)
            : [...selectedSymbols[section], symbol];

        const newState = {
            ...selectedSymbols,
            [section]: newSelected
        };

        await storage.set('selectedSymbols', newState);
        setSelectedSymbols(newState);
        window.dispatchEvent(new Event('settingsChange'));
    };

    const handleSectionToggle = async (section: string) => {
        const newActiveState = {
            ...activeSections,
            [section]: !activeSections[section]
        };

        if (!newActiveState[section]) {
            const newLastSelectedState = {
                ...lastSelectedState,
                [section]: selectedSymbols[section]
            };
            await storage.set('lastSelectedState', newLastSelectedState);
            setLastSelectedState(newLastSelectedState);

            const newSelectedState = {
                ...selectedSymbols,
                [section]: []
            };
            await storage.set('selectedSymbols', newSelectedState);
            setSelectedSymbols(newSelectedState);
        } else {
            const newSelectedState = {
                ...selectedSymbols,
                [section]: lastSelectedState[section]
            };
            await storage.set('selectedSymbols', newSelectedState);
            setSelectedSymbols(newSelectedState);
        }

        await storage.set('activeSections', newActiveState);
        setActiveSections(newActiveState);
        window.dispatchEvent(new Event('settingsChange'));
    };

    const handlePriceChangeToggle = async () => {
        const newState = !isPriceChangeVisible;
        await storage.set('isPriceChangeVisible', newState);
        setIsPriceChangeVisible(newState);
        window.dispatchEvent(new Event('settingsChange'));
    };

    const languageValue = language === 'ko'
        ? `${TRANSLATIONS.ko.settings.Korean} | ${TRANSLATIONS.ko.settings.English}`
        : `${TRANSLATIONS.en.settings.Korean} | ${TRANSLATIONS.en.settings.English}`;

    const themeValue = language === 'ko'
        ? `${TRANSLATIONS.ko.settings.Light} | ${TRANSLATIONS.ko.settings.Dark}`
        : `${TRANSLATIONS.en.settings.Light} | ${TRANSLATIONS.en.settings.Dark}`;

    return (
        <div className="h-full flex flex-col items-center">
            <SettingsHeader onBackClick={onClose} />
            <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
                <div>
                    <SettingSection
                        title="Index"
                        symbols={ORDER_MAP.Index}
                        selectedSymbols={selectedSymbols.Index}
                        isActive={activeSections.Index}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Index')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Index', symbol)}
                        language={language}
                    />
                    <SettingSection
                        title="Stock"
                        symbols={ORDER_MAP.Stock}
                        selectedSymbols={selectedSymbols.Stock}
                        isActive={activeSections.Stock}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Stock')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Stock', symbol)}
                        language={language}
                    />
                    <SettingSection
                        title="Crypto"
                        symbols={ORDER_MAP.Crypto}
                        selectedSymbols={selectedSymbols.Crypto}
                        isActive={activeSections.Crypto}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Crypto')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Crypto', symbol)}
                        language={language}
                    />
                    <SettingSection
                        title="Forex"
                        symbols={ORDER_MAP.Forex}
                        selectedSymbols={selectedSymbols.Forex}
                        isActive={activeSections.Forex}
                        isToggle={true}
                        onToggle={() => handleSectionToggle('Forex')}
                        onSymbolToggle={(symbol) => handleSymbolToggle('Forex', symbol)}
                        language={language}
                    />
                    <SettingSection
                        title="Price Change"
                        isToggle={true}
                        isActive={isPriceChangeVisible}
                        onToggle={handlePriceChangeToggle}
                        language={language}
                    />
                    <SettingSection
                        title="Theme"
                        value={themeValue}
                        valueAlign="right"
                        isToggle={true}
                        isActive={theme === 'dark'}
                        onToggle={toggleTheme}
                        language={language}
                    />
                    <SettingSection
                        title="Language"
                        value={languageValue}
                        valueAlign="right"
                        isToggle={true}
                        isActive={language === 'en'}
                        onToggle={toggleLanguage}
                        language={language}
                    />
                </div>
            </div>
        </div>
    );
};
