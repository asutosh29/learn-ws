import type WebSocket from "ws";

interface User {
  socket: WebSocket;
  id: string;
}

interface BasePayload {
  toId: string;
  message: string;
}

interface PubSubPayload {
  fromId: string;
  toId: string;
  message: string;
}


export type { User, PubSubPayload, BasePayload };
