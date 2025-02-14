interface SparklineChartProps {
  data: { time: string; value: number }[];
  width?: number;
  height?: number;
  isPositive: boolean;
}

export const SparklineChart = ({ data, width = 100, height = 23, isPositive }: SparklineChartProps) => {
  // 데이터 정규화
  const values = data.map(d => d.value).filter(v => !isNaN(v));  // NaN 값 제거
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;  // 0으로 나누는 것 방지

  // 패딩 추가
  const padding = range * 0.1;  // 10% 패딩
  const paddedMin = min - padding;
  const paddedMax = max + padding;
  const paddedRange = paddedMax - paddedMin;

  // 포인트 생성
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - paddedMin) / paddedRange) * height;
    return `${x},${y}`;
  }).filter(p => !p.includes('NaN')).join(' ');

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
        cy={height - ((data[data.length - 1]?.value - paddedMin) / paddedRange) * height}
        r="2"
        fill={isPositive ? '#037b4b' : '#d60a22'}
      />
    </svg>
  );
}; 