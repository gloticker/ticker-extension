import { API_BASE_URL, API_ENDPOINTS } from "./api";
import { MarketData } from "../types/market";
import { storage } from "../utils/storage";

class MarketService {
  private readonly CHART_CACHE_KEY = "market_chart_cache";
  private readonly CHART_CACHE_TIMESTAMP_KEY = "market_chart_cache_timestamp";
  private readonly SNAPSHOT_CACHE_KEY = "market_snapshot_cache";
  private readonly SNAPSHOT_CACHE_TIMESTAMP_KEY = "market_snapshot_timestamp";
  private readonly SNAPSHOT_CACHE_DURATION = 20000; // 20초
  private readonly NY_MARKET_CLOSE_HOUR = 16; // 뉴욕 시간 오후 4시

  private async isMarketClosedSinceLastCache(): Promise<boolean> {
    const nyTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    const cachedTimestamp = await storage.get<string>(this.CHART_CACHE_TIMESTAMP_KEY);

    if (!cachedTimestamp) return true;

    const cachedDate = new Date(Number(cachedTimestamp));
    const cachedNYDate = new Date(
      cachedDate.toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    // 현재 날짜가 다르고, 현재 시간이 장 마감 시간 이후인 경우
    return (
      nyTime.getDate() !== cachedNYDate.getDate() && nyTime.getHours() >= this.NY_MARKET_CLOSE_HOUR
    );
  }

  async getSnapshot() {
    try {
      // 캐시된 데이터 확인
      const cachedData = await storage.get<string>(this.SNAPSHOT_CACHE_KEY);
      const cachedTimestamp = await storage.get<string>(this.SNAPSHOT_CACHE_TIMESTAMP_KEY);

      // 20초 이내의 캐시된 데이터가 있으면 사용
      if (cachedData && cachedTimestamp) {
        const now = Date.now();
        if (now - Number(cachedTimestamp) < this.SNAPSHOT_CACHE_DURATION) {
          const data = JSON.parse(cachedData);
          // 객체인 경우 배열로 변환
          return Array.isArray(data) ? data : [data];
        }
      }

      // 새로운 데이터 fetch
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARKET_SNAPSHOT}`);
      if (!response.ok) throw new Error("Failed to fetch snapshot");
      const data = await response.json();

      // 데이터를 배열 형태로 저장
      const dataToStore = Array.isArray(data) ? data : [data];
      await storage.set(this.SNAPSHOT_CACHE_KEY, JSON.stringify(dataToStore));
      await storage.set(this.SNAPSHOT_CACHE_TIMESTAMP_KEY, Date.now().toString());

      return dataToStore;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      const cachedData = await storage.get<string>(this.SNAPSHOT_CACHE_KEY);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        return Array.isArray(data) ? data : [data];
      }
      return []; // 빈 배열 반환
    }
  }

  // 캐시된 스냅샷 데이터를 가져오는 메서드
  async getSnapshotFromCache() {
    const cachedData = await storage.get<string>(this.SNAPSHOT_CACHE_KEY);
    const cachedTimestamp = await storage.get<string>(this.SNAPSHOT_CACHE_TIMESTAMP_KEY);

    if (cachedData && cachedTimestamp) {
      const now = Date.now();
      if (now - Number(cachedTimestamp) < this.SNAPSHOT_CACHE_DURATION) {
        const data = JSON.parse(cachedData);
        return Array.isArray(data) ? data : [data];
      }
    }
    return null;
  }

  async getChart(params: { symbol: string; interval: string }) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARKET_CHART}?${queryString}`);
    if (!response.ok) throw new Error("Failed to fetch chart");
    return response.json();
  }

  async getChartData(signal?: AbortSignal) {
    try {
      const cachedData = await storage.get<string>(this.CHART_CACHE_KEY);

      // 캐시 데이터가 있고 유효하면 사용
      if (cachedData && !(await this.isMarketClosedSinceLastCache())) {
        return JSON.parse(cachedData);
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARKET_CHART}`, { signal });
      if (!response.ok) throw new Error("Failed to fetch chart data");
      const data = await response.json();

      await storage.set(this.CHART_CACHE_KEY, JSON.stringify(data));
      await storage.set(this.CHART_CACHE_TIMESTAMP_KEY, Date.now().toString());

      return data;
    } catch (error) {
      console.error("Error fetching chart data:", error);
      // 캐시된 데이터 반환 시도
      const cachedData = await storage.get<string>(this.CHART_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return []; // 빈 배열 반환
    }
  }

  // SSE로 받은 데이터로 스냅샷 캐시 업데이트하는 메서드
  async updateSnapshotCache(newData: Record<string, MarketData>) {
    try {
      // 기존 캐시 데이터 가져오기
      const cachedData = await storage.get<string>(this.SNAPSHOT_CACHE_KEY);
      if (!cachedData) return;

      // 기존 데이터 파싱
      const existingData = JSON.parse(cachedData);

      // 배열인지 확인
      if (!Array.isArray(existingData)) {
        console.error("Cached snapshot data is not an array");
        return;
      }

      // 마지막 스냅샷 업데이트
      const lastSnapshot = { ...existingData[existingData.length - 1], ...newData };
      const updatedData = [...existingData.slice(0, -1), lastSnapshot];

      // 데이터와 타임스탬프 모두 업데이트
      await storage.set(this.SNAPSHOT_CACHE_KEY, JSON.stringify(updatedData));
      await storage.set(this.SNAPSHOT_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error updating snapshot cache:", error);
    }
  }
}

export const marketService = new MarketService();
