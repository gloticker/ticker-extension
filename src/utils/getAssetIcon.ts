const cryptoIds: Record<string, string> = {
  "BTC-USD": "1", // Bitcoin
  "ETH-USD": "1027", // Ethereum
  "SOL-USD": "5426", // Solana
};

const companyDomains: Record<string, string> = {
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  AMZN: "amazon.com",
  NVDA: "nvidia.com",
  TSLA: "tesla.com",
};

const indexDomains: Record<string, string> = {
  "^GSPC": "spglobal.com", // S&P 500
  "^IXIC": "nasdaq.com", // NASDAQ
  "^KS11": "kind.krx.co.kr", // KOSPI
  "^VIX": "www.cboe.com", // CBOE VIX
  "FEAR.GREED": "money.cnn.com", // CNN Fear & Greed
};

const getCryptoId = (symbol: string) => cryptoIds[symbol];
const getStockDomain = (symbol: string) => companyDomains[symbol];
const getIndexDomain = (symbol: string) => indexDomains[symbol];

export const getAssetIcon = (symbol: string, type: string) => {
  switch (type) {
    case "CRYPTO":
      if (symbol === "BTC.D") {
        return `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`;
      }
      return `https://s2.coinmarketcap.com/static/img/coins/64x64/${getCryptoId(symbol)}.png`;

    case "STOCK":
      return `https://www.google.com/s2/favicons?domain=${getStockDomain(symbol)}&sz=64`;

    case "INDEX":
      return `https://www.google.com/s2/favicons?domain=${getIndexDomain(symbol)}&sz=64`;

    case "FOREX":
      // KRW=X는 USD/KRW를 의미
      if (symbol === "KRW=X") {
        return "https://flagcdn.com/w80/us.png"; // 미국
      }
      // EURKRW=X, CNYKRW=X, JPYKRW=X 처리
      if (symbol.includes("KRW=X")) {
        const baseCurrency = symbol.replace("KRW=X", "").toLowerCase();
        switch (baseCurrency) {
          case "eur":
            return "https://flagcdn.com/w80/eu.png"; // 유럽연합
          case "cny":
            return "https://flagcdn.com/w80/cn.png"; // 중국
          case "jpy":
            return "https://flagcdn.com/w80/jp.png"; // 일본
          default:
            return "";
        }
      }
      return "";

    default:
      return "";
  }
};
