/**
 * Frontend API Client
 * - No credentials stored here
 * - All auth via httpOnly cookie (set by backend, never readable by JS)
 * - Backend URL from environment variable (set in Netlify)
 */

import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

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

  replyToMessage: (id, text) =>
    request('POST', `/api/messages/${id}/reply`, { text }),

  deleteMessage: (id) =>
    request('DELETE', `/api/messages/${id}`),

  // ── Ticket (Public) ────────────────────────────────────────────────────────
  getTicket: (id) =>
    request('GET', `/api/messages/ticket/${id}`),

  replyToTicket: (id, text) =>
    request('POST', `/api/messages/ticket/${id}/reply`, { text }),

  // ── Newsletter ────────────────────────────────────────────────────────────
  getSubscribers: () =>
    request('GET', '/api/newsletter'),

  getNewsletterSubscribers: () => 
    request('GET', '/api/newsletter'),

  subscribe: (email) =>
    request('POST', '/api/newsletter', { email }),

  deleteSubscriber: (id) =>
    request('DELETE', `/api/newsletter/${id}`),

  sendNewsletter: (subject, message) =>
    request('POST', '/api/newsletter/send', { subject, message }),

  unsubscribeFromNewsletter: (email) =>
    request('POST', '/api/newsletter/unsubscribe', { email }),

  // ── Upload ────────────────────────────────────────────────────────────────
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const options = {
      method: 'POST',
      credentials: 'include',
      body: formData,
    };

    const res = await fetch(`${BASE_URL}/api/upload`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    return data.url;
  },

  // ── Database (Raw JSON Editor) ────────────────────────────────────────────
  getDatabaseFiles: () =>
    request('GET', '/api/database/files'),

  getDatabaseFile: (filename) =>
    request('GET', `/api/database/file/${filename}`),

  updateDatabaseFile: (filename, content) =>
    request('PUT', `/api/database/file/${filename}`, { content }),

  // ── Analytics ─────────────────────────────────────────────────────────────
  recordAnalyticsHit: (path) =>
    request('POST', '/api/analytics/hit', { path }),

  getAnalyticsStats: () =>
    request('GET', '/api/analytics/stats'),

  // ── Project Tracking ───────────────────────────────────────────────────────
  getTrackings: () =>
    request('GET', '/api/tracking'),

  getTrackingBySlug: (slug) =>
    request('GET', `/api/tracking/public/${slug}?t=${Date.now()}`),

  createTracking: (data) =>
    request('POST', '/api/tracking', data),

  updateTracking: (id, data) =>
    request('PUT', `/api/tracking/${id}`, data),

  deleteTracking: (id) =>
    request('DELETE', `/api/tracking/${id}`),
};
