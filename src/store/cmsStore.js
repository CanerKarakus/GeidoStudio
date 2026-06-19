import { create } from 'zustand';
import { api, socket } from '../api/db';

const useCmsStore = create((set) => ({
  cms: null,
  messages: [],
  subscribers: [],
  analytics: null,
  isAdmin: false,
  isLoading: true,
  isBanned: false,
  error: null,

  init: async () => {
    set({ isLoading: true, isBanned: false });
    try {
      // Fetch CMS data (public) and auth status in parallel
      const [cmsData, authStatus] = await Promise.all([
        api.getCMS(),
        api.checkAuth(),
      ]);

      let msgs = [];
      let subs = [];
      if (authStatus) {
        socket.connect();
        socket.on('messages_updated', (newMsgs) => {
          set({ messages: newMsgs });
        });
        [msgs, subs] = await Promise.all([
          api.getMessages(),
          api.getSubscribers()
        ]);
      }

      set({ cms: cmsData, isAdmin: authStatus, messages: msgs, subscribers: subs, isLoading: false });
    } catch (err) {
      if (err.message.includes('403') || err.message.includes('Access Denied') || err.message.includes('Failed to fetch')) {
        set({ isBanned: true, isLoading: false });
      } else {
        set({ error: err.message, isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    await api.login(email, password);
    socket.connect();
    socket.on('messages_updated', (newMsgs) => {
      set({ messages: newMsgs });
    });
    const [msgs, subs] = await Promise.all([
      api.getMessages(),
      api.getSubscribers()
    ]);
    set({ isAdmin: true, messages: msgs, subscribers: subs });
  },

  telegramLogin: async (socketId) => {
    await api.telegramLogin(socketId);
    socket.connect();
    socket.on('messages_updated', (newMsgs) => {
      set({ messages: newMsgs });
    });
    const [msgs, subs] = await Promise.all([
      api.getMessages(),
      api.getSubscribers()
    ]);
    set({ isAdmin: true, messages: msgs, subscribers: subs });
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      socket.disconnect();
      set({ isAdmin: false, messages: [], subscribers: [] });
    }
  },

  updateCMS: async (newData) => {
    const result = await api.updateCMS(newData);
    set({ cms: result.data || newData });
  },

  addMessage: async (msg) => {
    await api.addMessage(msg);
  },

  deleteMessage: async (id) => {
    await api.deleteMessage(id);
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    }));
  },

  replyToMessage: async (id, text) => {
    await api.replyToMessage(id, text);
    try {
      const msgs = await api.getMessages();
      set({ messages: msgs });
    } catch { /* ignore */ }
  },

  refreshMessages: async () => {
    try {
      const msgs = await api.getMessages();
      set({ messages: msgs });
    } catch { /* silent */ }
  },

  // Newsletter
  subscribeNewsletter: async (email) => {
    return await api.subscribe(email);
  },

  deleteSubscriber: async (id) => {
    await api.deleteSubscriber(id);
    set((state) => ({
      subscribers: state.subscribers.filter((s) => s.id !== id),
    }));
  },

  refreshSubscribers: async () => {
    try {
      const subs = await api.getSubscribers();
      set({ subscribers: subs });
    } catch { /* silent */ }
  },

  // Analytics
  fetchAnalytics: async () => {
    try {
      const stats = await api.getAnalyticsStats();
      set({ analytics: stats });
    } catch (err) {
      console.error('Analitik alınamadı:', err);
    }
  },
}));

socket.on('force_logout', async () => {
  try {
    await useCmsStore.getState().logout();
  } finally {
    window.location.href = '/admin/login?error=revoked';
  }
});

export default useCmsStore;
