interface SparklineChartProps {
  data: { time: string; value: number }[];
  width?: number;
  height?: number;
  isPositive: boolean;
}

export const SparklineChart = ({ data, width = 100, height = 23, isPositive }: SparklineChartProps) => {
  // 데이터 유효성 검사 강화
  if (!data || !Array.isArray(data) || data.length === 0 || !data.every(item => item && typeof item.value === 'number')) {
    return <span className="text-xs text-gray-400">-</span>;
  }

  try {
    const values = data.map(item => item.value).filter(value => !isNaN(value) && isFinite(value));
    if (values.length === 0) {
      return <span className="text-xs text-gray-400">-</span>;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    // min과 max가 유효한 숫자인지 확인
    if (!isFinite(min) || !isFinite(max) || min === max) {
      return <span className="text-xs text-gray-400">-</span>;
    }

    const padding = (max - min) * 0.1;
    const yMin = min - padding;
    const yMax = max + padding - yMin;

    const points = data
      .map((item, index) => {
        if (!item || typeof item.value !== 'number') return null;
        const x = (index / (data.length - 1)) * width;
        const y = height - ((item.value - yMin) / yMax) * height;
        return isFinite(x) && isFinite(y) ? `${x},${y}` : null;
      })
      .filter(Boolean)
      .join(" ");

    if (!points) {
      return <span className="text-xs text-gray-400">-</span>;
    }

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`${isPositive ? '#037b4b' : '#d60a22'}8c`} />
            <stop offset="100%" stopColor={`${isPositive ? '#037b4b' : '#d60a22'}1a`} />
          </linearGradient>
        </defs>

        {/* 기준선 */}
        <path
          d={`M 0 ${height / 2} L ${width} ${height / 2}`}
          stroke="#464e56"
          strokeWidth="1"
          strokeDasharray="1 3"
          fill="none"
        />

        {/* 라인 */}
        <path
          d={`M ${points}`}
          stroke={isPositive ? '#037b4b' : '#d60a22'}
          strokeWidth="1"
          fill="none"
        />

        {/* 그라데이션 영역 */}
        <path
          d={`M ${points} L ${width},${height} L 0,${height} Z`}
          fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
          fillOpacity="0.3"
        />

        {/* 마지막 점 */}
        <circle
          cx={width}
          cy={height - ((data[data.length - 1]?.value - yMin) / yMax) * height}
          r="2"
          fill={isPositive ? '#037b4b' : '#d60a22'}
        />
      </svg>
    );
  } catch (error) {
    // 에러 로깅 제거
    return <span className="text-xs text-gray-400">-</span>;
  }
}; 