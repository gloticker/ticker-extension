/// <reference types="chrome"/>
import { ALL_SYMBOLS } from "./constants/websocket";
import type { MarketData, MarketType } from "./types/market";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";

let binanceWs: WebSocket | null = null;
const reconnectAttempts = { binance: 0 };

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
    console.log(`Fetching data for ${symbol}...`);
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
    console.log(`Raw data for ${symbol}:`, data); // 디버깅을 위한 로그 추가

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

    console.log(`Processed data for ${symbol}:`, marketData); // 디버깅을 위한 로그 추가

    if (symbol === "^KS11") {
      console.log("KOSPI Raw Data:", {
        meta,
        quotes,
        marketState,
        currentPrice,
        regularMarketPrice: meta.regularMarketPrice,
        previousClose: meta.previousClose,
        timestamp: new Date().toISOString(),
      });
      // 장 시간 외에는 항상 최근 장의 종가(regularMarketPrice)를 현재가로 사용
      if (marketState === "CLOSED") {
        marketData.price = marketData.regularMarketPrice;
      }

      // 변화율은 항상 최근 장 종가와 이전 장 종가의 비교
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

// Yahoo WebSocket 연결
const connectYahooWebSocket = () => {
  const ws = new WebSocket("wss://streamer.finance.yahoo.com/");

  ws.onopen = () => {
    const yahooSymbols = Object.entries(ALL_SYMBOLS)
      .filter(([, info]) => info.type === "INDEX" || info.type === "STOCK" || info.type === "FOREX")
      .map(([symbol]) => symbol);

    ws.send(
      JSON.stringify({
        subscribe: yahooSymbols.map((symbol) => ({
          symbol,
          fields: [
            "regularMarketPrice",
            "preMarketPrice",
            "postMarketPrice",
            "price",
            "change",
            "changePercent",
          ],
        })),
      })
    );
  };

  ws.onmessage = async (event) => {
    try {
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        if (data && data.symbol && ALL_SYMBOLS[data.symbol]) {
          const marketData = await fetchYahooData(data.symbol);
          if (marketData) {
            // KS11(코스피)의 경우 한국 시간 기준으로 처리
            if (data.symbol === "^KS11") {
              const krTime = new Date(Date.now() + 9 * 60 * 60 * 1000);
              const krHour = krTime.getUTCHours();
              const krMinute = krTime.getUTCMinutes();

              // 장 시간 외에는 당일 종가 사용
              if (krHour < 9 || (krHour === 15 && krMinute > 30) || krHour > 15) {
                marketData.price = marketData.regularMarketPrice || marketData.price;
              }

              // 전일 종가 대비 변화율 계산
              if (marketData.previousClose) {
                // 장 중에는 실시간 가격, 장 외에는 당일 종가로 계산
                marketData.change = marketData.price - marketData.previousClose;
                marketData.changePercent = (marketData.change / marketData.previousClose) * 100;
              }
            }
            chrome.storage.local.set({ [data.symbol]: marketData });
          }
        }
      }
    } catch (error) {
      console.error("Failed to process Yahoo message:", error);
    }
  };

  ws.onclose = () => setTimeout(connectYahooWebSocket, 5000);
  ws.onerror = (error) => console.error("Yahoo WebSocket Error:", error);
};

// 주식/지수/환율 데이터 업데이트
async function updateYahooMarkets() {
  try {
    const yahooSymbols = Object.entries(ALL_SYMBOLS)
      .filter(([, info]) => info.type === "INDEX" || info.type === "STOCK" || info.type === "FOREX")
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

    // BTC.D 데이터 구조 확인 및 처리
    if (data && data.data && data.data.btcDominance) {
      const btcDominance = {
        symbol: "BTC.D",
        price: data.data.btcDominance,
        change: 0, // 변화량은 별도로 계산 필요
        changePercent: 0,
        lastUpdated: new Date().toISOString(),
      };

      chrome.storage.local.set({ "BTC.D": btcDominance });
    }
  } catch (error) {
    console.error("Failed to fetch BTC dominance:", error);
  }
}

export async function fetchHistoricalData(symbol: string, type: MarketType) {
  try {
    if (type === "CRYPTO") {
      if (symbol === "BTC.D") {
        return [];
      }

      return (
        await (
          await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol.replace(
              "-USD",
              "USDT"
            )}&interval=5m&limit=288`
          )
        ).json()
      ).map((data: BinanceKline) => ({
        time: new Date(data[0]).toISOString(),
        value: parseFloat(data[4]),
      }));
    }

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d&includePrePost=true`
    );
    const data = await response.json();
    const timestamps = data.chart.result[0].timestamp;
    const prices = data.chart.result[0].indicators.quote[0].close;

    return timestamps.map((time: number, i: number) => ({
      time: new Date(time * 1000).toISOString(),
      value: prices[i] || prices[i - 1],
    }));
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    return [];
  }
}

interface BinanceKline {
  0: number; // Open time
  4: string; // Close price
}

// Binance WebSocket 연결
const connectBinanceWebSocket = () => {
  binanceWs = new WebSocket(BINANCE_WS_URL);

  binanceWs.onopen = () => {
    reconnectAttempts.binance = 0;

    const cryptoSymbols = Object.entries(ALL_SYMBOLS)
      .filter(([symbol, info]) => info.type === "CRYPTO" && !symbol.includes("BTC.D")) // BTC.D 제외
      .map(([symbol]) => symbol.toLowerCase().replace("-usd", "usdt"));

    if (binanceWs && cryptoSymbols.length > 0) {
      binanceWs.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: cryptoSymbols.map((symbol) => `${symbol}@ticker`),
          id: 1,
        })
      );
    }
  };

  binanceWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.e === "24hrTicker") {
        const symbol = data.s.replace("USDT", "-USD");
        if (ALL_SYMBOLS[symbol]) {
          const marketData: Partial<MarketData> = {
            symbol,
            price: parseFloat(data.c), // 현재가
            dayStartPrice: parseFloat(data.o), // UTC 00:00 기준 시작가
            change: parseFloat(data.c) - parseFloat(data.o), // UTC 00:00 대비 변화량
            changePercent: ((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o)) * 100, // UTC 00:00 대비 변화율
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
};

// 업데이트 주기 설정
async function initialize() {
  await updateYahooMarkets();
  await fetchBTCDominance(); // 초기 BTC.D 데이터 가져오기
  connectYahooWebSocket();
  connectBinanceWebSocket();

  // 1분마다 업데이트
  setInterval(async () => {
    await updateYahooMarkets();
    await fetchBTCDominance(); // BTC.D 업데이트
  }, 60000); // 60000ms = 1분
}

// 시작
initialize();
