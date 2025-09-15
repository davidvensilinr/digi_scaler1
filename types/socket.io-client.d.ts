import { EventEmitter } from 'events';

declare class SocketIOClient extends EventEmitter {
  id: string;
  connected: boolean;
  disconnected: boolean;
  io: {
    uri: string;
    opts: any;
    reconnection(): boolean;
    reconnection(v: boolean): this;
    reconnectionAttempts(): number;
    reconnectionAttempts(v: number): this;
    reconnectionDelay(): number;
    reconnectionDelay(v: number): this;
    reconnectionDelayMax(): number;
    reconnectionDelayMax(v: number): this;
    timeout(): number;
    timeout(v: number): this;
    secure: boolean;
    connect(): void;
    disconnect(): this;
  };
  
  connect(): this;
  disconnect(): this;
  close(): this;
  
  on(event: string, fn: (...args: any[]) => void): this;
  off(event: string, fn?: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): this;
}

interface SocketIOClientOptions {
  path?: string;
  transports?: string[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  autoConnect?: boolean;
  forceNew?: boolean;
  secure?: boolean;
  withCredentials?: boolean;
  rejectUnauthorized?: boolean;
}

declare function io(uri?: string, opts?: SocketIOClientOptions): SocketIOClient;

export = io;
export as namespace io;

export type Socket = SocketIOClient;
