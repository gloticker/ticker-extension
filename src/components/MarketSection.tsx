import { useEffect, useState, useCallback } from 'react';
import { marketService } from '../services/market';
import { MarketGroup } from './market/MarketGroup';
import { useMarketStream } from '../hooks/useMarketStream';
import { MarketData } from '../types/market';  // 타입 import

type MarketSnapshot = Record<string, MarketData>;
type MarketType = 'Index' | 'Stock' | 'Crypto' | 'Forex';

// 섹션별 고정 순서 정의
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

export const MarketSection = () => {
    const [allData, setAllData] = useState<MarketSnapshot[]>([]);
    const [chartData, setChartData] = useState<Record<string, Record<string, { close: string }>>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        Index: true,
        Stock: true,
        Crypto: true,
        Forex: true
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

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

    // 초기 데이터 로드
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

    // 데이터를 타입별로 그룹화하고 정해진 순서대로 정렬
    const sortedGroupedData = marketTypes.reduce((acc, type) => {
        const orderList = ORDER_MAP[type];
        acc[type] = orderList.reduce((sorted, symbol) => {
            if (combinedData[symbol]) {
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
                <MarketGroup
                    key={type}
                    type={type}
                    data={sortedGroupedData[type]}
                    chartData={chartData}
                    isExpanded={expandedSections[type]}
                    onToggle={() => toggleSection(type)}
                    isInitialLoad={isInitialLoad}
                />
            ))}
        </div>
    );
}; 
