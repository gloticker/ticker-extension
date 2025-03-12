// 기준 크기 설정
const BASE_WIDTH = 300; // 기본 팝업 너비
const BASE_HEIGHT = 600; // 기본 팝업 높이

// viewport width 기준 반응형 크기
export const vw = (px: number) => `${(px / BASE_WIDTH) * 100}vw`;

// viewport height 기준 반응형 크기
export const vh = (px: number) => `${(px / BASE_HEIGHT) * 100}vh`;

// viewport의 작은 쪽 기준 반응형 크기
export const vmin = (px: number) => `${(px / BASE_WIDTH) * 100}vmin`;

// rem 변환 (기본 16px 기준)
export const rem = (px: number) => `${px / 16}rem`;

// 반응형 마진/패딩
export const space = (px: number) => vmin(px);

// 반응형 폰트 크기
export const fontSize = (px: number) => vmin(px);
