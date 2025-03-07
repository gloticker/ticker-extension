import { TRANSLATIONS } from "../constants/i18n";

export const getSymbolImage = (symbol: string): string => {
  // 심볼 문자열 처리
  const processedSymbol = symbol
    .replace("^", "")
    .replace("=X", "")
    .replace("-USD", "")
    .replace("Fear&Greed", "F&G")
    .replace("BTC.D", "BTC") // BTC.D는 BTC 이미지 사용
    .replace("EURKRW", "EUR") // EURKRW -> EUR
    .replace("CNYKRW", "CNY") // CNYKRW -> CNY
    .replace("JPYKRW", "JPY") // JPYKRW -> JPY
    .replace("KRW", "USD") // KRW=X -> USD
    .replace("images/symbol/", "")
    .replace(".svg", "")
    .toUpperCase();

  // 이미지 경로 반환
  return `/images/symbol/${processedSymbol}.svg`;
};

export const getDisplaySymbol = (symbol: string, language: "ko" | "en" = "en"): string => {
  const processedSymbol = symbol
    .replace("^", "")
    .replace("=X", "")
    .replace("-USD", "")
    .replace("Fear&Greed", "F&G")
    .replace("EURKRW", "EUR")
    .replace("CNYKRW", "CNY")
    .replace("JPYKRW", "JPY")
    .replace("KRW", "USD");

  type SymbolKey = keyof (typeof TRANSLATIONS)["ko"]["symbols"] &
    keyof (typeof TRANSLATIONS)["en"]["symbols"];
  const translation = TRANSLATIONS[language].symbols[processedSymbol as SymbolKey];
  return translation || processedSymbol;
};
