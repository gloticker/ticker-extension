import { useState, useEffect } from 'react';
import { ALL_SYMBOLS } from '../constants/websocket';
import { MarketType } from '../types/market';

interface SettingsProps {
    onClose: () => void;
}

export const SettingsPage = ({ onClose }: SettingsProps) => {
    const [settings, setSettings] = useState<{
        categories: Record<MarketType, boolean>;
        symbols: Record<string, boolean>;
    }>({
        categories: {
            INDEX: true,
            STOCK: true,
            CRYPTO: true,
            FOREX: true,
        },
        symbols: Object.keys(ALL_SYMBOLS).reduce((acc, symbol) => ({
            ...acc,
            [symbol]: true
        }), {})
    });

    // 설정 불러오기
    useEffect(() => {
        chrome.storage.local.get(['displaySettings'], (result) => {
            if (result.displaySettings) {
                setSettings(result.displaySettings);
            } else {
                // 초기 설정이 없으면 기본값을 저장
                chrome.storage.local.set({ displaySettings: settings });
            }
        });
    }, [settings]);

    // 설정 저장
    const saveSettings = (newSettings: typeof settings) => {
        setSettings(newSettings);
        chrome.storage.local.set({ displaySettings: newSettings });
    };

    // 카테고리 토글
    const toggleCategory = (category: MarketType) => {
        const newSettings = {
            ...settings,
            categories: {
                ...settings.categories,
                [category]: !settings.categories[category]
            }
        };
        saveSettings(newSettings);
    };

    // 심볼 토글
    const toggleSymbol = (symbol: string) => {
        const newSettings = {
            ...settings,
            symbols: {
                ...settings.symbols,
                [symbol]: !settings.symbols[symbol]
            }
        };
        saveSettings(newSettings);
    };

    // 카테고리별 심볼 그룹화
    const symbolsByCategory = Object.entries(ALL_SYMBOLS).reduce((acc, [symbol, info]) => {
        if (!acc[info.type as MarketType]) {
            acc[info.type as MarketType] = [];
        }
        acc[info.type as MarketType].push(symbol);
        return acc;
    }, {} as Record<MarketType, string[]>);

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Settings</h1>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <img src="images/close.svg" alt="Close" className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                {Object.entries(symbolsByCategory).map(([category, symbols]) => (
                    <div key={category} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={`category-${category}`}
                                checked={settings.categories[category as MarketType]}
                                onChange={() => toggleCategory(category as MarketType)}
                                className="w-4 h-4"
                            />
                            <label htmlFor={`category-${category}`} className="font-medium">
                                {category}
                            </label>
                        </div>

                        <div className="ml-6 space-y-2">
                            {symbols.map(symbol => (
                                <div key={symbol} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`symbol-${symbol}`}
                                        checked={settings.symbols[symbol]}
                                        onChange={() => toggleSymbol(symbol)}
                                        disabled={!settings.categories[category as MarketType]}
                                        className="w-4 h-4 disabled:opacity-50"
                                    />
                                    <label
                                        htmlFor={`symbol-${symbol}`}
                                        className={`${!settings.categories[category as MarketType] ?
                                            'text-gray-500 line-through' : ''}`}
                                    >
                                        {ALL_SYMBOLS[symbol].name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 