import { TRANSLATIONS } from "../constants/i18n";
type Language = keyof typeof TRANSLATIONS;
type SymbolKey = keyof (typeof TRANSLATIONS)["ko"]["symbols"];

interface SymbolInfo {
  displayName: string;
  link: string;
}

export const getSymbolInfo = (symbol: string, language: Language = "en"): SymbolInfo => {
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

  const convertedSymbol = symbolMap[symbol] || symbol;

  // 특수 케이스 링크 처리
  let link = `https://finance.yahoo.com/quote/${symbol}`;

  if (["BTC", "ETH", "SOL"].includes(convertedSymbol)) {
    link = `https://www.binance.com/en/trade/${convertedSymbol}_USDT`;
  } else if (convertedSymbol === "BTC.D") {
    link = "https://coinmarketcap.com/charts/bitcoin-dominance/";
  } else if (convertedSymbol === "F&G") {
    link = "https://edition.cnn.com/markets/fear-and-greed";
  }

  return {
    displayName:
      language === "en"
        ? convertedSymbol
        : TRANSLATIONS.ko.symbols[convertedSymbol as SymbolKey] || convertedSymbol,
    link,
  };
};

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

export const getDisplaySymbol = (symbol: string, language: Language = "en"): string => {
  return getSymbolInfo(symbol, language).displayName;
};
