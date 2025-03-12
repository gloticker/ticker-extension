import { useEffect, useState, useCallback, useRef } from 'react';
import { marketService } from '../services/market';
import { MarketGroup } from './market/MarketGroup';
import { useMarketStream } from '../hooks/useMarketStream';
import { MarketData } from '../types/market';
import { storage } from "../utils/storage";
import { vmin } from "../utils/responsive";

type MarketSnapshot = Record<string, MarketData>;
type MarketType = 'Index' | 'Stock' | 'Crypto' | 'Forex';

const ORDER_MAP = {
    Index: ['^IXIC', '^GSPC', '^DJI', '^RUT', '^TLT', '^VIX', 'Fear&Greed'],
    Stock: ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'],
    Crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BTC.D', 'TOTAL3'],
    Forex: ['KRW=X', 'EURKRW=X', 'CNYKRW=X', 'JPYKRW=X']
};

const marketTypes: MarketType[] = ['Index', 'Stock', 'Crypto', 'Forex'];

type ChartDataItem = {
    symbol: string;
    chart_data: Record<string, { close: string }>;
};

const SETTINGS_CHANGE_EVENT = 'settingsChange';

export const MarketSection = () => {
    const [allData, setAllData] = useState<MarketSnapshot[]>([]);
    const [chartData, setChartData] = useState<Record<string, Record<string, { close: string }>>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        Index: true,
        Stock: true,
        Crypto: true,
        Forex: true
    });

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

    useEffect(() => {
        const loadInitialState = async () => {
            const savedExpandedSections = await storage.get<Record<string, boolean>>('expandedSections');
            if (savedExpandedSections) {
                setExpandedSections(savedExpandedSections);
            }

            const savedSelectedSymbols = await storage.get<Record<string, string[]>>('selectedSymbols');
            if (savedSelectedSymbols) {
                setSelectedSymbols(savedSelectedSymbols);
            }

            const savedActiveSections = await storage.get<Record<string, boolean>>('activeSections');
            if (savedActiveSections) {
                setActiveSections(savedActiveSections);
            }
        };

        loadInitialState();
    }, []);

    const isInitialDataLoadedRef = useRef(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

    // Settings 상태 변경 감지
    useEffect(() => {
        const handleSettingsChange = async () => {
            const activeData = await storage.get<Record<string, boolean>>('activeSections');
            const symbolsData = await storage.get<Record<string, string[]>>('selectedSymbols');

            if (activeData) {
                setActiveSections(activeData);
            }
            if (symbolsData) {
                setSelectedSymbols(symbolsData);
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
        storage.set('expandedSections', expandedSections);
    }, [expandedSections]);

    const handleMarketData = useCallback((newData: Record<string, MarketData>) => {
        setAllData(prev => {
            if (!isInitialDataLoadedRef.current || prev.length === 0) return prev;

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
                    change_percent: data.change_percent,
                    market_cap: data.market_cap || lastSnapshot[symbol]?.market_cap
                };
            });

            return [...prev.slice(0, -1), lastSnapshot];
        });
    }, []);

    useEffect(() => {
        isInitialDataLoadedRef.current = isInitialDataLoaded;
    }, [isInitialDataLoaded]);

    useMarketStream(handleMarketData);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                // 먼저 캐시된 스냅샷 확인
                const cachedSnapshot = await marketService.getSnapshotFromCache();
                const [snapshotResponse, chartResponse] = await Promise.all([
                    cachedSnapshot || marketService.getSnapshot(), // 캐시가 없을 때만 새로운 스냅샷 요청
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: vmin(288),
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: `0 ${vmin(16)}px`
        }}>
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