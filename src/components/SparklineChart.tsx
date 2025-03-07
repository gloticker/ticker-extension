import { MarketData } from "../types/market";

interface SparklineChartProps {
    data: Record<string, { close: string }>;
    width?: number;
    height?: number;
    color: string;
    currentPrice?: string;
    symbol: string;
    marketData: MarketData;
}

export const SparklineChart = ({ data, width = 40, height = 20, color, symbol, marketData }: SparklineChartProps) => {
    // otc_price 우선 적용
    const latestPrice = symbol === 'BTC.D'
        ? marketData.value
        : (marketData.otc_price || marketData.current_price || marketData.current_value || marketData.rate || marketData.score || marketData.value);

    const values = [...Object.entries(data)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([, item]) => parseFloat(item.close))
    ];

    if (latestPrice) {
        values.push(parseFloat(latestPrice));
    }

    if (!data || Object.keys(data).length < 2) {
        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line
                    x1="0"
                    y1={height / 2}
                    x2={width}
                    y2={height / 2}
                    stroke={color}
                    strokeWidth="0.5"
                />
            </svg>
        );
    }

    try {
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (!isFinite(min) || !isFinite(max) || min === max) {
            return (
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <line
                        x1="0"
                        y1={height / 2}
                        x2={width}
                        y2={height / 2}
                        stroke={color}
                        strokeWidth="0.5"
                    />
                </svg>
            );
        }

        const padding = (max - min) * 0.1;
        const yMin = min - padding;
        const yMax = max + padding - yMin;

        const points = values
            .map((value, index) => {
                const x = (index / (values.length - 1)) * width;
                const y = height - ((value - yMin) / yMax) * height;
                return isFinite(x) && isFinite(y) ? `${x},${y}` : null;
            })
            .filter(Boolean)
            .join(" ");

        const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.1" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                <path
                    d={`M ${points} L ${width},${height} L 0,${height} Z`}
                    fill={`url(#${gradientId})`}
                />

                <path
                    d={`M ${points}`}
                    stroke={color}
                    strokeWidth="0.5"
                    fill="none"
                />
            </svg>
        );
    } catch (error) {
        console.error('Error rendering chart:', error);
        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line
                    x1="0"
                    y1={height / 2}
                    x2={width}
                    y2={height / 2}
                    stroke={color}
                    strokeWidth="0.5"
                />
            </svg>
        );
    }
}; 