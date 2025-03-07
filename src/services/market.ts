import { API_BASE_URL, API_ENDPOINTS } from "./api";

class MarketService {
  async getSnapshot() {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARKET_SNAPSHOT}`);
    if (!response.ok) throw new Error("Failed to fetch snapshot");
    return response.json();
  }

  async getChart(params: { symbol: string; interval: string }) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARKET_CHART}?${queryString}`);
    if (!response.ok) throw new Error("Failed to fetch chart");
    return response.json();
  }

  async getChartData(signal?: AbortSignal) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MARKET_CHART}`, { signal });
      if (!response.ok) throw new Error("Failed to fetch chart data");
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
      console.error("Error fetching chart data:", error);
      return [];
    }
  }
}

export const marketService = new MarketService();
