import { useEffect, useRef } from "react";
import { API_BASE_URL, API_ENDPOINTS } from "../services/api";

type MarketData = {
  current_price?: string;
  current_value?: string;
  market_cap?: string;
  change: string;
  change_percent: string;
  rate?: string;
  score?: string;
  rating?: string;
  value?: string;
  otc_price?: string | null;
};

export const useMarketStream = (onMessage: (data: Record<string, MarketData>) => void) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (eventSourceRef.current) return;

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`${API_BASE_URL}${API_ENDPOINTS.MARKET_SUBSCRIBE}`);

      eventSource.onmessage = (event) => {
        // console.log("SSE data:", event.data);
        if (event.data === ":connected") return;
        if (event.data.startsWith("ping")) return;

        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        setTimeout(connectSSE, 3000);
      };

      eventSourceRef.current = eventSource;
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [onMessage]);
};
