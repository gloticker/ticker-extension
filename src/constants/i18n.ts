import { createContext, useContext } from "react";

export const TRANSLATIONS = {
  ko: {
    sections: {
      Index: "지수",
      Stock: "주식",
      Crypto: "암호화폐",
      Forex: "환율",
    },
    stockSubtitle: "달러",
    cryptoSubtitle: "달러",
    forexSubtitle: "원화",
    detailsValue: {
      line1: "가격 변동",
      line2: "시가 총액",
    },
    symbols: {
      IXIC: "나스닥",
      GSPC: "S&P",
      DJI: "다우존스",
      RUT: "러셀",
      TLT: "국채",
      VIX: "변동성",
      "F&G": "공포탐욕",
      AAPL: "애플",
      NVDA: "엔비디아",
      MSFT: "마이크로소프트",
      AMZN: "아마존",
      GOOGL: "구글",
      META: "메타",
      TSLA: "테슬라",
      BTC: "비트코인",
      ETH: "이더리움",
      SOL: "솔라나",
      "BTC.D": "비트 도미넌스",
      "ALT.D": "알트 도미넌스",
      USD: "달러",
      EUR: "유로",
      CNY: "위안",
      JPY: "엔",
    },
    modals: {
      AIAnalysis: "AI 분석",
    },
    settings: {
      Theme: "테마",
      Details: "상세",
      Language: "언어",
      Light: "라이트",
      Dark: "다크",
      Korean: "한국어",
      English: "영어",
    },
    marketStatus: {
      pre: "프리 마켓",
      regular: "정규장",
      after: "애프터 마켓",
      closed: "장 종료",
    },
    delayed: "15분 지연",
  },
  en: {
    sections: {
      Index: "Index",
      Stock: "Stock",
      Crypto: "Crypto",
      Forex: "Forex",
    },
    stockSubtitle: "USD",
    cryptoSubtitle: "USD",
    forexSubtitle: "KRW",
    detailsValue: {
      line1: "Price Change",
      line2: "Market Capital",
    },
    symbols: {
      IXIC: "IXIC",
      GSPC: "GSPC",
      DJI: "DJI",
      RUT: "RUT",
      TLT: "TLT",
      VIX: "VIX",
      "F&G": "F&G",
      AAPL: "AAPL",
      NVDA: "NVDA",
      MSFT: "MSFT",
      AMZN: "AMZN",
      GOOGL: "GOOGL",
      META: "META",
      TSLA: "TSLA",
      BTC: "BTC",
      ETH: "ETH",
      SOL: "SOL",
      "BTC.D": "BTC.D",
      "ALT.D": "ALT.D",
      USD: "USD",
      EUR: "EUR",
      CNY: "CNY",
      JPY: "JPY",
    },
    modals: {
      AIAnalysis: "AI Analysis",
    },
    settings: {
      Theme: "Theme",
      Details: "Details",
      Language: "Language",
      Light: "Light",
      Dark: "Dark",
      Korean: "Korean",
      English: "English",
    },
    marketStatus: {
      pre: "Pre-Market",
      regular: "Market Opened",
      after: "After-Market",
      closed: "Market Closed",
    },
    delayed: "15m delayed",
  },
} as const;

export type Language = "ko" | "en";

export interface I18nContextType {
  language: Language;
  toggleLanguage: () => void;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within a I18nProvider");
  }
  return context;
};
