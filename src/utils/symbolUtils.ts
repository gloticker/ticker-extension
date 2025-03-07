import { TRANSLATIONS } from "../constants/i18n";
type Language = keyof typeof TRANSLATIONS;
type SymbolKey = keyof (typeof TRANSLATIONS)["ko"]["symbols"];

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

export const getDisplaySymbol = (symbol: string, language: Language = "en") => {
  // 심볼 변환 매핑
  const symbolMap: Record<string, string> = {
    "^IXIC": "IXIC",
    "^GSPC": "GSPC",
    "^RUT": "RUT",
    "^TLT": "TLT",
    "^VIX": "VIX",
    "Fear&Greed": "F&G",
    "BTC-USD": "BTC",
    "ETH-USD": "ETH",
    "SOL-USD": "SOL",
    "KRW=X": "USD",
    "EURKRW=X": "EUR",
    "CNYKRW=X": "CNY",
    "JPYKRW=X": "JPY",
  };

  // 변환된 심볼
  const convertedSymbol = symbolMap[symbol] || symbol;

  // 영어면 변환된 심볼만 반환
  if (language === "en") return convertedSymbol;

  // 한글이면 번역 적용
  return TRANSLATIONS.ko.symbols[convertedSymbol as SymbolKey] || convertedSymbol;
};
