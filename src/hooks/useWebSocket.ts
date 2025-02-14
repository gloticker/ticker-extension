import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage } from '../types/market';

export const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (event) => {
      setError('WebSocket 연결 에러');
      console.error('WebSocket error:', event);
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    error,
    sendMessage,
    socket: ws.current,
  };
};
