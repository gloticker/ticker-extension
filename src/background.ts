/// <reference types="chrome"/>
import { ALL_SYMBOLS } from "./constants/websocket";
import type { MarketType } from "./types/market";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";

let binanceWs: WebSocket | null = null;
let isPopupOpen = false;
let updateInterval: NodeJS.Timeout | null = null;
let lastFearGreedUpdate: Date | null = null;

// WebSocket 연결 상태 관리를 위한 변수 추가
let wsReconnectTimeout: NodeJS.Timeout | null = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

// 미국 주식 시장 시간 (ET, Eastern Time 기준)
// Pre-Market: 4:00 AM - 9:30 AM ET
// Regular Market: 9:30 AM - 4:00 PM ET
// After Market: 4:00 PM - 8:00 PM ET

// 서머타임 여부 확인
function isDST() {
  const now = new Date();
  const january = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const july = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.min(january, july) !== now.getTimezoneOffset();
}

// 미국 시장 상태 확인
function getMarketState(symbol: string): "PRE" | "REGULAR" | "POST" | "CLOSED" {
  // 한국 주식/지수는 별도 처리
  if (symbol.includes("KS11") || symbol.includes("KRW")) {
    const now = new Date();
    // 한국 시간으로 변환 (UTC+9)
    const krTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const krHour = krTime.getUTCHours();
    const krMinute = krTime.getUTCMinutes();

    // 09:00 ~ 15:30 (점심시간 포함)
    return (krHour > 9 || (krHour === 9 && krMinute >= 0)) &&
      (krHour < 15 || (krHour === 15 && krMinute <= 30))
      ? "REGULAR"
      : "CLOSED";
  }

  const now = new Date();
  const isDSTActive = isDST();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();

  // 서머타임이면 UTC-4, 아니면 UTC-5 기준
  const offset = isDSTActive ? -4 : -5;
  const etHour = (utcHour + offset + 24) % 24;

  if ((etHour >= 4 && etHour < 9) || (etHour === 9 && utcMinute < 30)) {
    return "PRE"; // 프리마켓
  } else if ((etHour === 9 && utcMinute >= 30) || (etHour > 9 && etHour < 16)) {
    return "REGULAR"; // 정규장
  } else if (etHour >= 16 && etHour < 20) {
    return "POST"; // 애프터마켓
  } else {
    return "CLOSED"; // 장 종료
  }
}

// Yahoo Finance REST API로 데이터 가져오기
async function fetchYahooData(symbol: string) {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d&includePrePost=true`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
          Origin: chrome.runtime.getURL(""),
        },
      }
    );

    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      throw new Error("Invalid chart data");
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0] || { close: [] };

    // API의 marketState 대신 계산된 시장 상태 사용
    const marketState = getMarketState(symbol);
    let currentPrice = meta.regularMarketPrice;
    let change = 0;
    let changePercent = 0;

    // 프리마켓/애프터마켓 가격 계산
    if (marketState === "PRE" && quotes.close?.length > 0) {
      currentPrice = quotes.close[quotes.close.length - 1] || currentPrice;
      change = currentPrice - meta.previousClose;
      changePercent = (change / meta.previousClose) * 100;
    } else if (marketState === "POST" && quotes.close?.length > 0) {
      currentPrice = quotes.close[quotes.close.length - 1] || currentPrice;
      change = currentPrice - meta.regularMarketPrice;
      changePercent = (change / meta.regularMarketPrice) * 100;
    } else if (marketState === "REGULAR") {
      change = currentPrice - meta.previousClose;
      changePercent = (change / meta.previousClose) * 100;
    } else {
      // CLOSED 상태일 때 처리가 없음
      // 여기에 장 종료 시의 계산 로직 추가 필요
      change = currentPrice - meta.previousClose;
      changePercent = (change / meta.previousClose) * 100;
    }

    const marketData = {
      symbol,
      name: ALL_SYMBOLS[symbol].name,
      type: ALL_SYMBOLS[symbol].type as MarketType,
      price: currentPrice,
      regularMarketPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change,
      changePercent,
      marketState,
      lastUpdated: new Date(),
    };

    if (symbol === "^KS11") {
      if (marketState === "CLOSED") {
        marketData.price = marketData.regularMarketPrice;
      }

      if (marketData.regularMarketPrice && marketData.previousClose) {
        marketData.change = marketData.regularMarketPrice - marketData.previousClose;
        marketData.changePercent = (marketData.change / marketData.previousClose) * 100;
      }
    }

    return marketData;
  } catch (error) {
    console.error(`Failed to fetch Yahoo data for ${symbol}:`, error);
    return null;
  }
}

// 주식/지수/환율 데이터 업데이트
async function updateYahooMarkets() {
  try {
    const yahooSymbols = Object.entries(ALL_SYMBOLS)
      .filter(
        ([symbol, info]) =>
          (info.type === "INDEX" || info.type === "STOCK" || info.type === "FOREX") &&
          symbol !== "FEAR.GREED" // Fear & Greed Index 제외
      )
      .map(([symbol]) => symbol);

    const promises = yahooSymbols.map(fetchYahooData);
    const results = await Promise.all(promises);

    results.forEach((data) => {
      if (data) {
        chrome.storage.local.set({ [data.symbol]: data });
      }
    });
  } catch (error) {
    console.error("Failed to update Yahoo markets:", error);
  }
}

// BTC.D 데이터 처리 로직 수정
async function fetchBTCDominance() {
  try {
    const response = await fetch(
      "https://api.coinmarketcap.com/data-api/v3/global-metrics/quotes/latest"
    );
    const data = await response.json();

    if (data && data.data && data.data.btcDominance) {
      const btcDominance = {
        symbol: "BTC.D",
        name: "BTC.D",
        type: "CRYPTO",
        price: data.data.btcDominance,
        change: 0,
        changePercent: 0,
        lastUpdated: new Date().toISOString(),
      };

      chrome.storage.local.set({ "BTC.D": btcDominance });
    }
  } catch (error) {
    console.error("Failed to fetch BTC dominance:", error);
  }
}

async function fetchFearAndGreedIndex() {
  try {
    const response = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata");
    const data = await response.json();

    if (data && data.fear_and_greed && data.fear_and_greed.score) {
      const score = data.fear_and_greed.score;
      let rating = "Neutral";

      // 점수에 따른 상태 결정
      if (score <= 25) rating = "Extreme Fear";
      else if (score <= 45) rating = "Fear";
      else if (score <= 55) rating = "Neutral";
      else if (score <= 75) rating = "Greed";
      else rating = "Extreme Greed";

      const fng = {
        symbol: "FEAR.GREED",
        name: "Fear & Greed",
        type: "INDEX",
        price: score,
        change: 0,
        changePercent: 0,
        lastUpdated: new Date(),
        rating,
      };

      chrome.storage.local.set({ "FEAR.GREED": fng });
    }
  } catch (error) {
    console.error("Failed to fetch Fear & Greed index:", error);
  }
}

export async function fetchHistoricalData(symbol: string, type: MarketType) {
  if (!symbol || !type) {
    return [];
  }

  // FEAR.GREED와 BTC.D는 차트 데이터를 표시하지 않음
  if (symbol === "FEAR.GREED" || symbol === "BTC.D") {
    return [];
  }

  try {
    // 암호화폐는 바이낸스 API 사용
    if (type === "CRYPTO") {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol.replace(
            "-USD",
            "USDT"
          )}&interval=5m&limit=288`
        );
        if (!response.ok) return [];

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((item: BinanceKline) => ({
          time: new Date(item[0]).toISOString(),
          value: parseFloat(item[4]),
        }));
      } catch {
        return [];
      }
    }

    // 야후 파이낸스 API로 과거 데이터 가져오기 시도
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d&includePrePost=true`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const result = data?.chart?.result?.[0];

      if (result?.timestamp && result?.indicators?.quote?.[0]?.close) {
        return result.timestamp.map((timestamp: number, index: number) => ({
          time: new Date(timestamp * 1000).toISOString(),
          value: result.indicators.quote[0].close[index] || result.meta.regularMarketPrice,
        }));
      }
    } catch (error) {
      console.debug(`Failed to fetch historical data for ${symbol}, falling back to flat line`);
    }

    // 과거 데이터를 가져오지 못한 경우 현재 가격으로 flat line 생성
    const market = await fetchYahooData(symbol);
    if (!market?.price) return [];

    const now = new Date();
    return Array(288)
      .fill(null)
      .map((_, i) => ({
        time: new Date(now.getTime() - (287 - i) * 5 * 60 * 1000).toISOString(),
        value: market.price,
      }));
  } catch {
    return [];
  }
}

interface BinanceKline {
  0: number; // Open time
  4: string; // Close price
}

// Binance WebSocket 연결
const connectBinanceWebSocket = () => {
  if (!isPopupOpen) return null;

  // 기존 재연결 타이머 제거
  if (wsReconnectTimeout) {
    clearTimeout(wsReconnectTimeout);
    wsReconnectTimeout = null;
  }

  // 웹소켓 연결 해제 시 정리 로직 추가
  const ws = new WebSocket(BINANCE_WS_URL);

  ws.onclose = (event) => {
    // 연결이 종료되기 전에 모든 리스너 제거
    ws.onmessage = null;
    ws.onerror = null;
    ws.onopen = null;

    if (isPopupOpen && !event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      wsReconnectTimeout = setTimeout(() => {
        if (isPopupOpen) {
          connectBinanceWebSocket();
        }
      }, RECONNECT_DELAY);
    }
  };

  // 에러 핸들링 개선
  ws.onerror = (error) => {
    console.error("Binance WebSocket error:", error);
    ws.close();
  };

  let isSubscribed = false;
  let reconnectAttempts = 0;

  ws.onopen = () => {
    reconnectAttempts = 0;

    if (!isSubscribed) {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const cryptoSymbols = Object.entries(ALL_SYMBOLS)
            .filter(([symbol, info]) => info.type === "CRYPTO" && !symbol.includes("BTC.D"))
            .map(([symbol]) => symbol.toLowerCase().replace("-usd", "usdt"));

          if (cryptoSymbols.length > 0) {
            ws.send(
              JSON.stringify({
                method: "SUBSCRIBE",
                params: cryptoSymbols.map((symbol) => `${symbol}@ticker`),
                id: 1,
              })
            );
            isSubscribed = true;
          }
        }
      }, 1000);
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.e === "24hrTicker") {
        const symbol = data.s.replace("USDT", "-USD");
        if (ALL_SYMBOLS[symbol]) {
          const marketData = {
            symbol,
            price: parseFloat(data.c),
            dayStartPrice: parseFloat(data.o),
            change: parseFloat(data.c) - parseFloat(data.o),
            changePercent: ((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o)) * 100,
            lastUpdated: new Date(),
            name: ALL_SYMBOLS[symbol].name,
            type: ALL_SYMBOLS[symbol].type as MarketType,
          };
          chrome.storage.local.set({ [symbol]: marketData });
        }
      }
    } catch (error) {
      console.error("Failed to process message:", error);
    }
  };

  return ws;
};

// 웹소켓 연결 상태 체크 및 재연결 함수 수정
function checkConnections() {
  if (isPopupOpen) {
    if (!binanceWs || binanceWs.readyState !== WebSocket.OPEN) {
      connectBinanceWebSocket();
    }
    updateYahooMarkets(); // REST API 폴링만 유지
    fetchBTCDominance();
  }
}

function getETDate() {
  const now = new Date();
  const isDSTActive = isDST();
  const offset = isDSTActive ? -4 : -5; // ET는 UTC-4 (서머타임) 또는 UTC-5
  return new Date(now.getTime() + offset * 60 * 60 * 1000).getDate();
}

// initialize 함수 수정
async function initialize() {
  await updateYahooMarkets();
  await fetchBTCDominance();
  await fetchFearAndGreedIndex();
  lastFearGreedUpdate = new Date();
  connectBinanceWebSocket();

  updateInterval = setInterval(async () => {
    await updateYahooMarkets();
    await fetchBTCDominance();

    const etDate = getETDate();
    if (!lastFearGreedUpdate || etDate !== new Date(lastFearGreedUpdate.getTime()).getDate()) {
      await fetchFearAndGreedIndex();
      lastFearGreedUpdate = new Date();
    }

    checkConnections();
  }, 10000); // 10초로 변경
}

// 팝업 상태 모니터링 수정
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    isPopupOpen = true;
    binanceWs = connectBinanceWebSocket();

    port.onMessage.addListener((message) => {
      if (message.type === "CHECK_CONNECTIONS") {
        checkConnections();
      }
    });

    port.onDisconnect.addListener(() => {
      isPopupOpen = false;
      if (binanceWs) {
        binanceWs.onclose = null;
        binanceWs.close();
        binanceWs = null;
      }
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
      if (wsReconnectTimeout) {
        clearTimeout(wsReconnectTimeout);
        wsReconnectTimeout = null;
      }
    });
  }
});

// 주기적인 연결 상태 체크
setInterval(() => {
  if (isPopupOpen) {
    checkConnections();
  }
}, 30000); // 30초마다 체크

// 시작
initialize();
