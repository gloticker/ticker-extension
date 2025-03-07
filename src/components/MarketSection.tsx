import { useEffect, useState, useCallback } from 'react';
import { marketService } from '../services/market';
import { MarketGroup } from './market/MarketGroup';
import { useMarketStream } from '../hooks/useMarketStream';
import { MarketData } from '../types/market';

type MarketSnapshot = Record<string, MarketData>;
type MarketType = 'Index' | 'Stock' | 'Crypto' | 'Forex';

const ORDER_MAP = {
    Index: ['^IXIC', '^GSPC', '^RUT', '^TLT', '^VIX', 'Fear&Greed'],
    Stock: ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'],
    Crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BTC.D'],
    Forex: ['KRW=X', 'EURKRW=X', 'CNYKRW=X', 'JPYKRW=X']
};

const marketTypes: MarketType[] = ['Index', 'Stock', 'Crypto', 'Forex'];

type ChartDataItem = {
    symbol: string;
    chart_data: Record<string, { close: string }>;
};

// 커스텀 이벤트 이름 정의
const SETTINGS_CHANGE_EVENT = 'settingsChange';

export const MarketSection = () => {
    const [allData, setAllData] = useState<MarketSnapshot[]>([]);
    const [chartData, setChartData] = useState<Record<string, Record<string, { close: string }>>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('expandedSections');
        return saved ? JSON.parse(saved) : {
            Index: true,
            Stock: true,
            Crypto: true,
            Forex: true
        };
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

    // Settings에서 관리하는 상태들 가져오기
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

    // Settings 상태 변경 감지
    useEffect(() => {
        const handleSettingsChange = () => {
            const activeData = localStorage.getItem('activeSections');
            const symbolsData = localStorage.getItem('selectedSymbols');

            if (activeData) {
                setActiveSections(JSON.parse(activeData));
            }
            if (symbolsData) {
                setSelectedSymbols(JSON.parse(symbolsData));
            }
        };

        // 커스텀 이벤트 리스너 등록
        window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);

        // storage 이벤트도 함께 유지 (다른 탭/창 동기화용)
        window.addEventListener('storage', handleSettingsChange);

        return () => {
            window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
            window.removeEventListener('storage', handleSettingsChange);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('expandedSections', JSON.stringify(expandedSections));
    }, [expandedSections]);

    const handleMarketData = useCallback((newData: Record<string, MarketData>) => {
        if (!isInitialDataLoaded) return;

        setAllData(prev => {
            const lastSnapshot = { ...prev[prev.length - 1] };
            Object.entries(newData).forEach(([symbol, data]) => {
                lastSnapshot[symbol] = {
                    ...lastSnapshot[symbol],
                    value: data.value,
                    score: data.score,
                    rate: data.rate,
                    rating: data.rating,
                    current_value: data.current_value,
                    current_price: data.current_price,
                    otc_price: data.otc_price,
                    change: data.change,
                    change_percent: data.change_percent
                };
            });

            return [...prev.slice(0, -1), lastSnapshot];
        });
    }, [isInitialDataLoaded]);

    useMarketStream(handleMarketData);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const [snapshotResponse, chartResponse] = await Promise.all([
                    marketService.getSnapshot(),
                    marketService.getChartData()
                ]);

                if (mounted) {
                    setAllData(snapshotResponse);
                    const formattedChartData = chartResponse.reduce((acc: Record<string, Record<string, { close: string }>>, item: ChartDataItem) => {
                        acc[item.symbol] = item.chart_data;
                        return acc;
                    }, {});

                    setChartData(formattedChartData);
                    setIsInitialLoad(false);
                    setIsInitialDataLoaded(true);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, []);

    if (!allData.length) return <div>Loading...</div>;

    const combinedData = allData.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    // 활성화된 섹션과 선택된 심볼만 표시
    const sortedGroupedData = marketTypes.reduce((acc, type) => {
        if (!activeSections[type]) {
            acc[type] = {};
            return acc;
        }

        const orderList = ORDER_MAP[type];
        acc[type] = orderList.reduce((sorted, symbol) => {
            if (combinedData[symbol] && selectedSymbols[type].includes(symbol)) {
                sorted[symbol] = combinedData[symbol];
            }
            return sorted;
        }, {} as Record<string, MarketData>);
        return acc;
    }, {} as Record<MarketType, Record<string, MarketData>>);

    const toggleSection = (type: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    return (
        <div className="flex flex-col w-full">
            {marketTypes.map((type) => (
                // 활성화된 섹션만 렌더링
                activeSections[type] && (
                    <MarketGroup
                        key={type}
                        type={type}
                        data={sortedGroupedData[type]}
                        chartData={chartData}
                        isExpanded={expandedSections[type]}
                        onToggle={() => toggleSection(type)}
                        isInitialLoad={isInitialLoad}
                    />
                )
            ))}
        </div>
    );
};