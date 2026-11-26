import { AppState } from 'react-native';
import { create } from 'zustand';
import { API_URL } from './api';
import type { ChatMessage, Id } from './types';

export type ServerFrame =
  | { type: 'ready'; userId: Id }
  | { type: 'message'; message: ChatMessage }
  | { type: 'deleted'; groupId: Id; messageId: Id }
  | { type: 'pong' }
  | { type: 'error'; code: string; message: string };

type Status = 'idle' | 'connecting' | 'open' | 'closed';

export const useSocketStatus = create<{ status: Status }>(() => ({ status: 'idle' }));

const WS_URL = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws');
const UNAUTHORIZED = 4401;
const PING_EVERY_MS = 25_000;
const MAX_BACKOFF_MS = 30_000;

/**
 * One socket for the whole app. It authenticates with the session token in its first frame,
 * reconnects with exponential backoff, and closes while the app is in the background.
 */
class ChatSocket {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private attempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(f: ServerFrame) => void>();
  private appStateSub: { remove(): void } | null = null;

  start(token: string) {
    if (this.token === token && this.ws) return;
    this.stop();
    this.token = token;
    this.appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') this.open();
      else if (state === 'background') this.close();
    });
    this.open();
  }

  stop() {
    this.token = null;
    this.appStateSub?.remove();
    this.appStateSub = null;
    this.close();
    useSocketStatus.setState({ status: 'idle' });
  }

  subscribe(listener: (f: ServerFrame) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private open() {
    if (!this.token || this.ws) return;
    this.clearRetry();
    useSocketStatus.setState({ status: 'connecting' });
    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token: this.token }));
    };
    ws.onmessage = (e) => {
      let frame: ServerFrame;
      try {
        frame = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (frame.type === 'ready') {
        this.attempt = 0;
        useSocketStatus.setState({ status: 'open' });
        this.pingTimer = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send('{"type":"ping"}'), PING_EVERY_MS);
      }
      this.listeners.forEach((l) => l(frame));
    };
    ws.onclose = (e) => {
      if (this.ws !== ws) return; // an older socket we already replaced
      this.ws = null;
      this.clearPing();
      useSocketStatus.setState({ status: 'closed' });
      // 4401: the token was rejected or expired. Don't hammer the server; a new login restarts us.
      if (e.code !== UNAUTHORIZED && this.token && AppState.currentState === 'active') this.scheduleRetry();
    };
    ws.onerror = () => {
      // onclose always follows and handles the retry.
    };
  }

  private close() {
    this.clearRetry();
    this.clearPing();
    const ws = this.ws;
    this.ws = null;
    ws?.close();
  }

  private scheduleRetry() {
    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** this.attempt) * (0.75 + Math.random() * 0.5);
    this.attempt++;
    this.retryTimer = setTimeout(() => this.open(), delay);
  }

  private clearRetry() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private clearPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }
}

export const chatSocket = new ChatSocket();
