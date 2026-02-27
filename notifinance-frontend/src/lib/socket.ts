import { io } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "http://localhost:3000";

export function createMarketSocket() {
  return io(`${socketUrl}/market`, {
    transports: ["websocket"],
    reconnection: true,
  });
}

export function createNotificationSocket(token: string) {
  return io(`${socketUrl}/notifications`, {
    transports: ["websocket"],
    reconnection: true,
    auth: { token },
  });
}