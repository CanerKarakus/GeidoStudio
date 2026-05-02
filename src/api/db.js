/**
 * Frontend API Client
 * - No credentials stored here
 * - All auth via httpOnly cookie (set by backend, never readable by JS)
 * - Backend URL from environment variable (set in Netlify)
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const request = async (method, endpoint, body = null) => {
  const options = {
    method,
    credentials: 'include', // Send httpOnly cookies automatically
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
};

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (email, password) =>
    request('POST', '/api/auth/login', { email, password }),

  logout: () =>
    request('POST', '/api/auth/logout'),

  checkAuth: async () => {
    try {
      await request('GET', '/api/auth/me');
      return true;
    } catch {
      return false;
    }
  },

  // ── CMS ───────────────────────────────────────────────────────────────────
  getCMS: () =>
    request('GET', '/api/cms'),

  updateCMS: (data) =>
    request('PUT', '/api/cms', data),

  // ── Messages ──────────────────────────────────────────────────────────────
  getMessages: () =>
    request('GET', '/api/messages'),

  addMessage: (msg) =>
    request('POST', '/api/messages', msg),

  deleteMessage: (id) =>
    request('DELETE', `/api/messages/${id}`),
};
