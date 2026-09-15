/**
 * Thin client for the darsislam PHP API.
 * Session token is stored in localStorage and sent on every request.
 */

const API_BASE    = '/api';
const SESSION_KEY = 'darsislam:session';

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token: string): void {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(SESSION_KEY);
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token   = getSessionToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('X-Session-Token', token);
  return fetch(API_BASE + path, { ...init, headers });
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json() as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data;
}

export const api = {
  async get<T = unknown>(path: string): Promise<T> {
    return parseResponse<T>(await apiFetch(path));
  },

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return parseResponse<T>(await apiFetch(path, {
      method: 'POST',
      body:   body !== undefined ? JSON.stringify(body) : undefined,
    }));
  },
};
