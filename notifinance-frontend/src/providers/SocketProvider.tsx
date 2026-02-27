"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";

interface SocketContextValue {
  marketSocket: Socket;
  notificationSocket: Socket;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const value = useMemo(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "http://localhost:3000";

    const marketSocket = io(`${socketUrl}/market`, {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket"],
    });

    const notificationSocket = io(`${socketUrl}/notifications`, {
      autoConnect: Boolean(accessToken),
      reconnection: true,
      transports: ["websocket"],
      auth: accessToken ? { token: accessToken } : undefined,
    });

    return {
      marketSocket,
      notificationSocket,
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }

  return context;
}