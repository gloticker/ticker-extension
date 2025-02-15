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

export const getAssetIcon = (symbol: string, type: string) => {
  switch (type) {
    case "CRYPTO":
      if (symbol === "BTC.D") return "";
      return `https://s2.coinmarketcap.com/static/img/coins/64x64/${cryptoIds[symbol]}.png`;

    case "STOCK":
      return `https://www.google.com/s2/favicons?domain=${companyDomains[symbol]}&sz=64`;

    case "INDEX":
      return `https://www.google.com/s2/favicons?domain=${indexDomains[symbol]}&sz=64`;

    case "FOREX":
      return "";

    default:
      return "";
  }
};
