export const getAssetIcon = (symbol: string, type: string) => {
  switch (type) {
    case 'CRYPTO':
      if (symbol === 'BTC.D') return '';
      
      const cryptoIds: Record<string, string> = {
        'BTC-USD': '1',        // Bitcoin
        'ETH-USD': '1027',     // Ethereum
        'SOL-USD': '5426'      // Solana
      };
      return `https://s2.coinmarketcap.com/static/img/coins/64x64/${cryptoIds[symbol]}.png`;
      
    case 'STOCK':
      const companyDomains: Record<string, string> = {
        'AAPL': 'apple.com',
        'MSFT': 'microsoft.com',
        'GOOGL': 'google.com',
        'AMZN': 'amazon.com',
        'NVDA': 'nvidia.com',
        'TSLA': 'tesla.com'
      };
      return `https://www.google.com/s2/favicons?domain=${companyDomains[symbol]}&sz=64`;
      
    case 'INDEX':
      const indexDomains: Record<string, string> = {
        '^GSPC': 'spglobal.com',       // S&P 500
        '^IXIC': 'nasdaq.com',         // NASDAQ
        '^KS11': 'kind.krx.co.kr'           // KOSPI
      };
      return `https://www.google.com/s2/favicons?domain=${indexDomains[symbol]}&sz=64`;
      
    case 'FOREX':
      return '/icons/forex.png';  // 기본 환율 아이콘
      
    default:
      return '';
  }
}; 