"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/lib/types";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let globalSocket: TypedSocket | null = null;

export function useSocket(): TypedSocket | null {
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io({
        transports: ["websocket", "polling"],
      }) as TypedSocket;
    }

    socketRef.current = globalSocket;

    return () => {
      // Don't disconnect on unmount — keep the connection alive
    };
  }, []);

  return socketRef.current || globalSocket;
}
