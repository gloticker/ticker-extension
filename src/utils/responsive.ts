// viewport width 기준 반응형 크기 (높이의 50% 비율)
export const vw = (px: number) => `${(px / 300) * 50}vh`;

// viewport height 기준 반응형 크기
export const vh = (px: number) => `${(px / 600) * 100}vh`;

// viewport의 작은 쪽 기준 반응형 크기
export const vmin = (px: number) => `${(px / 300) * 50}vh`;

// rem 변환 (기본 16px 기준)
export const rem = (px: number) => `${px / 16}rem`;

// 반응형 마진/패딩
export const space = (px: number) => vmin(px);

// 반응형 폰트 크기
export const fontSize = (px: number) => vmin(px);
