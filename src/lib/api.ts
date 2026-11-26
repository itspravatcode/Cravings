import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useSession } from './session';

/**
 * Resolves the backend origin:
 * 1. EXPO_PUBLIC_API_URL, 2. the Metro host's LAN IP (physical devices / Expo Go), 3. emulator defaults.
 */
function apiOrigin(): string {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, '');
  const port = process.env.EXPO_PUBLIC_API_PORT ?? '8080';
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') return `http://${host}:${port}`;
  return Platform.OS === 'android' ? `http://10.0.2.2:${port}` : `http://localhost:${port}`;
}

export const API_ORIGIN = apiOrigin();
export const API_URL = `${API_ORIGIN}/api`;

/** Public pages served by the backend (store requirements). */
export const LEGAL_URLS = {
  terms: `${API_ORIGIN}/terms`,
  privacy: `${API_ORIGIN}/privacy`,
  deleteAccount: `${API_ORIGIN}/account/delete`,
};

/** An error returned by the backend, with its stable machine-readable `code`. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined | null | (string | number)[]>;

function buildUrl(path: string, query?: Query) {
  const params: string[] = [];
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue;
    for (const v of Array.isArray(value) ? value : [value]) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return `${API_URL}${path}${params.length ? `?${params.join('&')}` : ''}`;
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const token = useSession.getState().token;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e: unknown) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    throw new ApiError(0, 'NETWORK', aborted
      ? 'The server is taking a while to respond. If it was asleep it can take up to 2 minutes to wake up. Please try again shortly.'
      : "Can't reach the server. Check your connection.");
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    // An expired or invalid token on an authenticated call means the session is over.
    if (res.status === 401 && token) void useSession.getState().signOut();
    const problem = (data ?? {}) as { code?: string; detail?: string; errors?: Record<string, string> };
    throw new ApiError(res.status, problem.code ?? `HTTP_${res.status}`, problem.detail ?? 'Something went wrong', problem.errors);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? undefined),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
};

/** Human message for any thrown value. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Something went wrong';
}
