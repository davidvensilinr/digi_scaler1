'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

// Use NEXT_PUBLIC_APP_URL from environment or default to current origin
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return window.location.origin;
};

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || getSocketUrl();

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Initialize WebSocket connection
    const socketInstance = io(SOCKET_URL, {
      path: '/api/socket/io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
    });

    const onConnect = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    const onDisconnect = (reason: string) => {
      console.log('Disconnected from WebSocket server:', reason);
      setIsConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    };

    const onReconnectAttempt = (attempt: number) => {
      console.log(`Attempting to reconnect (${attempt})...`);
    };

    const onReconnect = (attempt: number) => {
      console.log(`Reconnected after ${attempt} attempts`);
      setIsConnected(true);
    };

    const onReconnectError = (error: Error) => {
      console.error('WebSocket reconnection error:', error);
    };

    const onReconnectFailed = () => {
      console.error('WebSocket reconnection failed after maximum attempts');
      setIsConnected(false);
    };

    // Set up event listeners
    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.io.on('reconnect_attempt', onReconnectAttempt);
    socketInstance.io.on('reconnect', onReconnect);
    socketInstance.io.on('reconnect_error', onReconnectError);
    socketInstance.io.on('reconnect_failed', onReconnectFailed);

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.io.off('reconnect_attempt', onReconnectAttempt);
      socketInstance.io.off('reconnect', onReconnect);
      socketInstance.io.off('reconnect_error', onReconnectError);
      socketInstance.io.off('reconnect_failed', onReconnectFailed);
      
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
      
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
