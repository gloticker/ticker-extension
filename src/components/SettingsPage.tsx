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

            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto scrollbar-hide">
                {/* INDEX */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="category-INDEX"
                            checked={settings.categories.INDEX}
                            onChange={() => toggleCategory('INDEX')}
                            className="w-4 h-4"
                        />
                        <label htmlFor="category-INDEX" className="font-medium">
                            INDEX
                        </label>
                    </div>
                    <div className="ml-6 space-y-2">
                        {symbolsByCategory.INDEX.map(symbol => (
                            <div key={symbol} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`symbol-${symbol}`}
                                    checked={settings.symbols[symbol]}
                                    onChange={() => toggleSymbol(symbol)}
                                    disabled={!settings.categories.INDEX}
                                    className="w-4 h-4 disabled:opacity-50"
                                />
                                <label
                                    htmlFor={`symbol-${symbol}`}
                                    className={`${!settings.categories.INDEX ? 'text-gray-500 line-through' : ''}`}
                                >
                                    {ALL_SYMBOLS[symbol].name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STOCK */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="category-STOCK"
                            checked={settings.categories.STOCK}
                            onChange={() => toggleCategory('STOCK')}
                            className="w-4 h-4"
                        />
                        <label htmlFor="category-STOCK" className="font-medium">
                            STOCK
                        </label>
                    </div>
                    <div className="ml-6 space-y-2">
                        {symbolsByCategory.STOCK.map(symbol => (
                            <div key={symbol} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`symbol-${symbol}`}
                                    checked={settings.symbols[symbol]}
                                    onChange={() => toggleSymbol(symbol)}
                                    disabled={!settings.categories.STOCK}
                                    className="w-4 h-4 disabled:opacity-50"
                                />
                                <label
                                    htmlFor={`symbol-${symbol}`}
                                    className={`${!settings.categories.STOCK ? 'text-gray-500 line-through' : ''}`}
                                >
                                    {ALL_SYMBOLS[symbol].name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CRYPTO */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="category-CRYPTO"
                            checked={settings.categories.CRYPTO}
                            onChange={() => toggleCategory('CRYPTO')}
                            className="w-4 h-4"
                        />
                        <label htmlFor="category-CRYPTO" className="font-medium">
                            CRYPTO
                        </label>
                    </div>
                    <div className="ml-6 space-y-2">
                        {symbolsByCategory.CRYPTO.map(symbol => (
                            <div key={symbol} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`symbol-${symbol}`}
                                    checked={settings.symbols[symbol]}
                                    onChange={() => toggleSymbol(symbol)}
                                    disabled={!settings.categories.CRYPTO}
                                    className="w-4 h-4 disabled:opacity-50"
                                />
                                <label
                                    htmlFor={`symbol-${symbol}`}
                                    className={`${!settings.categories.CRYPTO ? 'text-gray-500 line-through' : ''}`}
                                >
                                    {ALL_SYMBOLS[symbol].name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOREX */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="category-FOREX"
                            checked={settings.categories.FOREX}
                            onChange={() => toggleCategory('FOREX')}
                            className="w-4 h-4"
                        />
                        <label htmlFor="category-FOREX" className="font-medium">
                            FOREX
                        </label>
                    </div>
                    <div className="ml-6 space-y-2">
                        {symbolsByCategory.FOREX.map(symbol => (
                            <div key={symbol} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`symbol-${symbol}`}
                                    checked={settings.symbols[symbol]}
                                    onChange={() => toggleSymbol(symbol)}
                                    disabled={!settings.categories.FOREX}
                                    className="w-4 h-4 disabled:opacity-50"
                                />
                                <label
                                    htmlFor={`symbol-${symbol}`}
                                    className={`${!settings.categories.FOREX ? 'text-gray-500 line-through' : ''}`}
                                >
                                    {ALL_SYMBOLS[symbol].name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}; 